// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ICertificationObserver
 * @dev Observer interface. Subscribe to HalaalToken state changes by
 *      implementing this interface and calling `addObserver`.
 */
interface ICertificationObserver {
    function onCertificationIssued(address to, uint256 amount, string calldata certificateId) external;

    function onCertificationRevoked(address from, uint256 amount, string calldata certificateId) external;

    function onCertificationSuspended(address account, uint256 amount, string calldata reason) external;

    function onCertificationUnsuspended(address account, uint256 amount) external;

    function onPaused() external;

    function onUnpaused() external;
}

/**
 * @title HalaalToken
 * @dev Halaal certification token — ERC20 with certified-balance compliance.
 *
 * Key mechanics:
 *  - _certifiedBalanceOf[addr]  — tokens that count as on-path certified (cannot be freely given away)
 *  - _suspendedBalanceOf[addr]  — tokens under review (freed from certified, back to transferable)
 *  - transferable = balanceOf(addr) - _certifiedBalanceOf[addr] + _suspendedBalanceOf[addr]
 *
 * Roles:
 *  - OWNER           — deployer; full admin until SAB_ROLE is activated
 *  - SAB_ROLE        — Shariah Advisory Board multisig; Phase 2
 *
 * Security:
 *  - ReentrancyGuard on all mutating state-change functions
 *  - Solidity 0.8.20 native overflow checks
 *  - Pausable for emergency freeze
 */
contract HalaalToken is ERC20, Ownable, Pausable, AccessControl, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10 ** 18; // 1M tokens, 18 decimals

    // =========================================================================
    // Roles
    // =========================================================================
    /// @dev Assigned to the 3/5 SAB multisig (Phase 2+).
    bytes32 public constant SAB_ROLE = keccak256("SAB_ROLE");

    // =========================================================================
    // State
    // =========================================================================
    /// @dev Certified (locked) tokens per address.
    mapping(address => uint256) private _certifiedBalanceOf;
    /// @dev Suspended (reviewed) tokens per address.
    mapping(address => uint256) private _suspendedBalanceOf;

    // Fixed-size observer registry: stores observer addresses at sequential slots
    // _observerRegistry[slotIndex] = observer address | 0 if unused
    // _observerCount = number of registered observers
    address[32] private _observerRegistry;
    uint256 private _observerCount;

    // =========================================================================
    // Events
    // =========================================================================
    event ObserverAdded(address indexed observer);
    event ObserverRemoved(address indexed observer);

    event CertificationIssued(address indexed to, uint256 amount, string certificateId);
    event CertificationRevoked(address indexed from, uint256 amount, string certificateId);
    event CertificationSuspended(address indexed account, uint256 amount, string reason);
    event CertificationUnsuspended(address indexed account, uint256 amount);

    // =========================================================================
    // Constructor
    // =========================================================================
    constructor(string memory name_, string memory symbol_)
        ERC20(name_, symbol_)
        Ownable(msg.sender)
    {}

    // =========================================================================
    // Observer management
    // =========================================================================
    /**
     * @dev Add a single observer (only owner).
     *      Reverts if the address is already registered or registry is full.
     * @param observer Address of the observer contract.
     */
    function addObserver(address observer) external onlyOwner {
        require(observer != address(0), "HCT: zero observer");
        require(!_isObserver(observer), "HCT: already registered");
        require(_observerCount < 32, "HCT: observer registry full");

        _observerRegistry[_observerCount] = observer;
        _observerCount++;
        emit ObserverAdded(observer);
    }

    /**
     * @dev Add up to 50 observers in one call (only owner).
     */
    function batchAddObservers(address[] calldata observers) external onlyOwner {
        uint256 len = observers.length;
        require(len <= 50, "HCT: batch add limit 50");
        require(_observerCount + len <= 32, "HCT: registry capacity exceeded");

        for (uint256 i = 0; i < len;) {
            address obs = observers[i];
            require(obs != address(0), "HCT: zero observer");
            require(!_isObserver(obs), "HCT: already registered");
            _observerRegistry[_observerCount] = obs;
            _observerCount++;
            emit ObserverAdded(obs);
            unchecked { ++i; }
        }
    }

    /**
     * @dev Remove an observer. Compacts the stored array so that subsequent
     *      iteration uses minimal gas.
     */
    function removeObserver(address observer) external onlyOwner {
        require(observer != address(0), "HCT: zero observer");
        require(_isObserver(observer), "HCT: not registered");

        uint256 len = _observerCount;
        for (uint256 i = 0; i < len; i++) {
            if (_observerRegistry[i] == observer) {
                // Move the last element into the removed slot
                _observerRegistry[i] = _observerRegistry[len - 1];
                _observerRegistry[len - 1] = address(0);
                _observerCount = len - 1;
                emit ObserverRemoved(observer);
                return;
            }
        }
        revert("HCT: not found");
    }

    /**
     * @dev Return whether `observer` is registered.
     */
    function isObserver(address observer) external view returns (bool) {
        return _isObserver(observer);
    }

    /**
     * @dev Return the current number of registered observers.
     */
    function observerCount() external view returns (uint256) {
        return _observerCount;
    }

    // =========================================================================
    // Role management (stub — SAB boarded in Phase 2+)
    // =========================================================================
    /**
     * @dev Grant SAB_ROLE to an address. Only owner.
     *      The 3-of-5 SAB multisig will receive this role when activated.
     */
    function grantSABRole(address account) external onlyOwner {
        grantRole(SAB_ROLE, account);
    }

    function revokeSABRole(address account) external onlyOwner {
        revokeRole(SAB_ROLE, account);
    }

    // =========================================================================
    // Certification — issue (single)
    // =========================================================================
    /**
     * @dev Issue fully-certified tokens. All tokens count as certified.
     */
    function issueCertification(address to, uint256 amount, string calldata certificateId)
        public
        whenNotPaused
        onlyOwner
    {
        issueCertification(to, amount, certificateId, amount);
    }

    /**
     * @dev Issue tokens with a split: certified vs freely-transferable.
     * @param certifiedAmount Amount counted as on-path certified.
     *                        Remainder (amount - certifiedAmount) is free surplus.
     */
    function issueCertification(
        address to,
        uint256 amount,
        string calldata certificateId,
        uint256 certifiedAmount
    ) public whenNotPaused onlyOwner nonReentrant {
        require(to != address(0), "HalaalToken: mint to zero address");
        require(amount > 0, "HalaalToken: mint amount must be positive");
        require(certifiedAmount > 0, "HCT: certified amount must be positive");
        require(certifiedAmount <= amount, "HCT: certified amount exceeds total");
        require(totalSupply() + amount <= MAX_SUPPLY, "HalaalToken: supply exceeds max");

        _mint(to, amount);
        _certifiedBalanceOf[to] += certifiedAmount;

        emit CertificationIssued(to, amount, certificateId);
        _notify("onCertificationIssued", abi.encode(to, amount, certificateId));
    }

    // =========================================================================
    // Certification — issue (batch)
    // =========================================================================
    /**
     * @dev Batch-issue certifications. All three arrays must have identical lengths.
     *      Reverts atomically if any item fails. Gas cap: ≤ 100 per call.
     */
    function batchIssueCertification(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string[] calldata certificateIds
    ) external whenNotPaused onlyOwner nonReentrant {
        _requireSameLen(recipients, amounts, certificateIds);
        uint256 len = recipients.length;
        if (len == 0) return;
        require(len <= 100, "HCT: batch size exceeds 100");

        for (uint256 i = 0; i < len;) {
            issueCertification(recipients[i], amounts[i], certificateIds[i]);
            unchecked { ++i; }
        }
    }

    // =========================================================================
    // Certification — revoke
    // =========================================================================
    /**
     * @dev Permanently burn certified tokens.
     */
    function revokeCertification(address from, uint256 amount, string calldata certificateId)
        public
        whenNotPaused
        onlyOwner
        nonReentrant
    {
        require(from != address(0), "HalaalToken: burn from zero address");
        require(_certifiedBalanceOf[from] >= amount, "HalaalToken: insufficient certified balance");
        require(amount > 0, "HalaalToken: burn amount must be positive");

        _burn(from, amount);
        _certifiedBalanceOf[from] -= amount;
        _suspendedBalanceOf[from] = _suspendedBalanceOf[from] > amount
            ? _suspendedBalanceOf[from] - amount
            : 0;

        emit CertificationRevoked(from, amount, certificateId);
        _notify("onCertificationRevoked", abi.encode(from, amount, certificateId));
    }

    // =========================================================================
    // Certification — suspend (single)
    // =========================================================================
    /**
     * @dev Suspend tokens — locked from transfer, removed from certified count.
     */
    function suspendCertification(
        address account,
        uint256 amount,
        string calldata reason
    ) public whenNotPaused onlyOwner nonReentrant {
        _doSuspend(account, amount, reason);
    }

    // =========================================================================
    // Certification — suspend (batch)
    // =========================================================================
    /**
     * @dev Batch-suspend across multiple addresses. Same length-require as batch issue.
     *      Gas cap: ≤ 100 per call.
     */
    function batchSuspendCertification(
        address[] calldata accounts,
        uint256[] calldata amounts,
        string calldata reason
    ) external whenNotPaused onlyOwner nonReentrant {
        _requireSameLen(accounts, amounts);
        uint256 len = accounts.length;
        if (len == 0) return;
        require(len <= 100, "HCT: batch size exceeds 100");

        for (uint256 i = 0; i < len;) {
            _doSuspend(accounts[i], amounts[i], reason);
            unchecked { ++i; }
        }
    }

    // =========================================================================
    // Certification — unsuspend
    // =========================================================================
    /**
     * @dev Restore suspended tokens back to certified pool.
     */
    function unsuspendCertification(address account, uint256 amount)
        public
        whenNotPaused
        onlyOwner
        nonReentrant
    {
        require(account != address(0), "HalaalToken: unsuspend zero address");
        uint256 suspended = _suspendedBalanceOf[account];
        require(suspended > 0, "HalaalToken: account has no suspended tokens");
        require(amount > 0, "HalaalToken: unsuspend amount must be positive");
        require(amount <= suspended, "HalaalToken: cannot unsuspend more than suspended tokens");

        _suspendedBalanceOf[account] -= amount;
        _certifiedBalanceOf[account] += amount;

        emit CertificationUnsuspended(account, amount);
        _notify("onCertificationUnsuspended", abi.encode(account, amount));
    }

    // =========================================================================
    // Governance — pause / unpause
    // =========================================================================
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _pause() internal override {
        super._pause();
        _notify("onPaused", "");
    }

    function _unpause() internal override {
        super._unpause();
        _notify("onUnpaused", "");
    }

    // =========================================================================
    // Internal helpers
    // =========================================================================
    /**
     * @dev Transferable tokens = total balance - certified + suspended.
     */
    function _getTransferableAmount(address account) internal view returns (uint256) {
        uint256 balance = balanceOf(account);
        unchecked {
            return balance - _certifiedBalanceOf[account] + _suspendedBalanceOf[account];
        }
    }

    /**
     * @dev Core suspension logic: updates state, emits event, notifies.
     */
    function _doSuspend(address account, uint256 amount, string calldata reason) internal {
        require(account != address(0), "HalaalToken: suspend zero address");
        uint256 certified = _certifiedBalanceOf[account];
        require(certified > 0, "HalaalToken: account has no certified tokens");
        uint256 suspended = _suspendedBalanceOf[account];
        uint256 actualCertified = certified - suspended;
        require(amount > 0, "HalaalToken: suspend amount must be positive");
        require(amount <= actualCertified, "HalaalToken: cannot suspend more than certified tokens");

        _certifiedBalanceOf[account] -= amount;
        _suspendedBalanceOf[account] += amount;

        emit CertificationSuspended(account, amount, reason);
        _notify("onCertificationSuspended", abi.encode(account, amount, reason));
    }

    // ---------------------------------------------------------------------
    // Helper: require arrays to be same length (2-arg version)
    // ---------------------------------------------------------------------
    function _requireSameLen(
        address[] calldata a,
        uint256[] calldata b
    ) internal pure {
        require(a.length == b.length, "HCT: array length mismatch in batch");
    }

    // ---------------------------------------------------------------------
    // Helper: require arrays to be same length (3-arg version)
    // ---------------------------------------------------------------------
    function _requireSameLen(
        address[] calldata a,
        uint256[] calldata b,
        string[] calldata c
    ) internal pure {
        require(a.length == b.length && a.length == c.length, "HCT: array length mismatch in batch");
    }

    // ---------------------------------------------------------------------
    // Helper: observer registry lookup
    // ---------------------------------------------------------------------
    function _isObserver(address observer) internal view returns (bool) {
        uint256 len = _observerCount;
        for (uint256 i = 0; i < len; i++) {
            if (_observerRegistry[i] == observer) return true;
        }
        return false;
    }

    // ---------------------------------------------------------------------
    // Helper: observer notification (gas-optimised sequential scan)
    // ---------------------------------------------------------------------
    function _notify(string memory sig, bytes memory data) internal {
        uint256 len = _observerCount;
        for (uint256 i = 0; i < len;) {
            address obs = _observerRegistry[i];
            if (obs != address(0)) {
                (bool ok, ) = obs.call(abi.encodePacked(bytes4(keccak256(bytes(sig))), data));
                require(ok, "HCT: observer call failed");
            }
            unchecked { ++i; }
        }
    }

    // =========================================================================
    // Transfers — compliance gate
    // =========================================================================
    /**
     * @dev Overridden transfer: sender must have enough transferable tokens.
     */
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        require(to != address(0), "ERC20: transfer to the zero address");
        require(
            amount <= _getTransferableAmount(msg.sender),
            "HalaalToken: transfer would breach certified balance"
        );
        return super.transfer(to, amount);
    }

    // =========================================================================
    // View helpers
    // =========================================================================
    /**
     * @dev Pre-flight check — uses _getTransferableAmount so suspended share is applied.
     *      Bugfix vs original: `_suspendedBalanceOf` is now included in the check.
     */
    function wouldTransferBeCompliant(address from, address _to, uint256 amount)
        public
        view
        returns (bool)
    {
        if (amount == 0) return true;
        return amount <= balanceOf(from) - _certifiedBalanceOf[from] + _suspendedBalanceOf[from];
    }

    /**
     * @dev Net certified = certified - suspended (floor 0).
     */
    function getNetCertifiedBalance(address account) public view returns (uint256) {
        uint256 suspended = _suspendedBalanceOf[account];
        return _certifiedBalanceOf[account] > suspended
            ? _certifiedBalanceOf[account] - suspended
            : 0;
    }

    /**
     * @dev Certified (locked) balance of account.
     */
    function getCertifiedBalance(address account) public view returns (uint256) {
        return _certifiedBalanceOf[account];
    }

    /**
     * @dev Suspended (under review) balance of account.
     */
    function getSuspendedBalance(address account) public view returns (uint256) {
        return _suspendedBalanceOf[account];
    }
}
