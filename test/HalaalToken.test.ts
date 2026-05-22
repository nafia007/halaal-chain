import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("HalaalToken", function () {
  let halaalToken: any;
  let owner: any;
  let user1: any;
  let user2: any;

  const TOKEN_NAME = "Halaal Certification";
  const TOKEN_SYMBOL = "HCT";
  const CERTIFICATE_ID = "BATCH-001-2026";
  const INITIAL_CERT_AMOUNT = ethers.utils.parseUnits("100", 18);

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const HalaalTokenFactory = await ethers.getContractFactory("HalaalToken");
    halaalToken = await HalaalTokenFactory.deploy(TOKEN_NAME, TOKEN_SYMBOL);
  });

  // ─────────────────────────────────────────────
  // 1. DEPLOYMENT
  // ─────────────────────────────────────────────
  describe("Deployment", function () {
    it("should set the correct token name and symbol", async function () {
      expect(await halaalToken.name()).to.equal(TOKEN_NAME);
      expect(await halaalToken.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("should assign the deployer as owner", async function () {
      expect(await halaalToken.owner()).to.equal(await owner.getAddress());
    });

    it("should set initial total supply to zero", async function () {
      expect(await halaalToken.totalSupply()).to.equal(0n);
    });

    it("should expose MAX_SUPPLY constant", async function () {
      const MAX = 1_000_000n * 10n ** 18n;
      expect(await halaalToken.MAX_SUPPLY()).to.equal(MAX);
    });
  });

  // ─────────────────────────────────────────────
  // 2. CERTIFICATION ISSUANCE
  // ─────────────────────────────────────────────
  describe("Certification Issuance", function () {
    it("should allow owner to issue certification tokens", async function () {
      await halaalToken.functions["issueCertification(address,uint256,string)"](user1.address, INITIAL_CERT_AMOUNT, CERTIFICATE_ID);

      expect(await halaalToken.balanceOf(user1.address)).to.equal(INITIAL_CERT_AMOUNT);
      expect(await halaalToken.getCertifiedBalance(user1.address)).to.equal(INITIAL_CERT_AMOUNT);
      expect(await halaalToken.totalSupply()).to.equal(INITIAL_CERT_AMOUNT);
    });

    it("should emit CertificationIssued event", async function () {
      await expect(
        halaalToken.functions["issueCertification(address,uint256,string)"](user1.address, INITIAL_CERT_AMOUNT, CERTIFICATE_ID)
      )
        .to.emit(halaalToken, "CertificationIssued")
        .withArgs(user1.address, INITIAL_CERT_AMOUNT, CERTIFICATE_ID);
    });

    it("should not allow non-owner to issue certification", async function () {
      await expect(
        halaalToken.connect(user1).functions["issueCertification(address,uint256,string)"](user2.address, INITIAL_CERT_AMOUNT, CERTIFICATE_ID)
      ).to.be.reverted;
    });

    it("should not allow minting to zero address", async function () {
      await expect(
        halaalToken.functions["issueCertification(address,uint256,string)"](ethers.constants.AddressZero, INITIAL_CERT_AMOUNT, CERTIFICATE_ID)
      ).to.be.revertedWith("HalaalToken: mint to zero address");
    });

    it("should not allow zero-amount certification", async function () {
      await expect(
        halaalToken.functions["issueCertification(address,uint256,string)"](user1.address, 0n, CERTIFICATE_ID)
      ).to.be.revertedWith("HalaalToken: mint amount must be positive");
    });

    it("should not allow supply to exceed MAX_SUPPLY", async function () {
      const MAX_SUPPLY = 1_000_000n * 10n ** 18n;
      await expect(
        halaalToken.functions["issueCertification(address,uint256,string)"](user1.address, MAX_SUPPLY + 1n, CERTIFICATE_ID)
      ).to.be.revertedWith("HalaalToken: supply exceeds max");
    });
  });

  // ─────────────────────────────────────────────
  // 3. CERTIFICATION REVOCATION
  // ─────────────────────────────────────────────
  describe("Certification Revocation", function () {
    beforeEach(async function () {
      await halaalToken.functions["issueCertification(address,uint256,string)"](
        user1.address,
        INITIAL_CERT_AMOUNT,
        CERTIFICATE_ID
      );
    });

    it("should allow owner to revoke certification tokens", async function () {
      const revokeAmount = ethers.utils.parseUnits("50", 18);
      const revokeId = "REVOKED-BATCH-001";
      await halaalToken.revokeCertification(user1.address, revokeAmount, revokeId);

      const afterBal     = await halaalToken.balanceOf(user1.address);
      const afterCertBal = await halaalToken.getCertifiedBalance(user1.address);
      const afterSupply  = await halaalToken.totalSupply();
      const expected     = INITIAL_CERT_AMOUNT.sub(revokeAmount);
      expect(expected.eq(afterBal)).to.equal(true);
      expect(expected.eq(afterCertBal)).to.equal(true);
      expect(expected.eq(afterSupply)).to.equal(true);
    });

    it("should emit CertificationRevoked event", async function () {
      const revokeAmount = ethers.utils.parseUnits("50", 18);
      const revokeId = "REVOKED-BATCH-001";
      await expect(
        halaalToken.revokeCertification(user1.address, revokeAmount, revokeId)
      )
        .to.emit(halaalToken, "CertificationRevoked");
    });

    it("should not allow non-owner to revoke certification", async function () {
      await expect(
        halaalToken.connect(user1).revokeCertification(user2.address, INITIAL_CERT_AMOUNT, CERTIFICATE_ID)
      ).to.be.reverted;
    });

    it("should not allow revoking from zero address", async function () {
      await expect(
        halaalToken.revokeCertification(ethers.constants.AddressZero, INITIAL_CERT_AMOUNT, CERTIFICATE_ID)
      ).to.be.revertedWith("HalaalToken: burn from zero address");
    });

    it("should not allow revoking more than certified balance", async function () {
      await expect(
        halaalToken.revokeCertification(user1.address, INITIAL_CERT_AMOUNT + 1n, CERTIFICATE_ID)
      ).to.be.revertedWith("HalaalToken: insufficient certified balance");
    });

    it("should not allow zero-amount revocation", async function () {
      await expect(
        halaalToken.revokeCertification(user1.address, 0n, CERTIFICATE_ID)
      ).to.be.revertedWith("HalaalToken: burn amount must be positive");
    });
  });

  // ─────────────────────────────────────────────
  // 4. SUSPEND / UNSUSPEND
  // ─────────────────────────────────────────────
  describe("Certification Suspension", function () {
    const suspendAmount = ethers.utils.parseUnits("50", 18);
    const suspendReason = "Pending quality review Q2-2026";

    beforeEach(async function () {
      await halaalToken.functions["issueCertification(address,uint256,string)"](
        user1.address,
        INITIAL_CERT_AMOUNT,
        CERTIFICATE_ID
      );
    });

    it("should allow owner to suspend a portion of an address's tokens", async function () {
      await halaalToken.suspendCertification(user1.address, suspendAmount, suspendReason);

      expect(await halaalToken.balanceOf(user1.address)).to.equal(INITIAL_CERT_AMOUNT);

      const expectedCertified = INITIAL_CERT_AMOUNT.sub(suspendAmount);
      expect(await halaalToken.getCertifiedBalance(user1.address)).to.equal(expectedCertified);

      expect(await halaalToken.getSuspendedBalance(user1.address)).to.equal(suspendAmount);

      const netCertified = await halaalToken.getNetCertifiedBalance(user1.address);
      expect(netCertified).to.equal(0n);
    });

    it("should emit CertificationSuspended event", async function () {
      await expect(
        halaalToken.suspendCertification(user1.address, suspendAmount, suspendReason)
      )
        .to.emit(halaalToken, "CertificationSuspended")
        .withArgs(user1.address, suspendAmount, suspendReason);
    });

    it("should not allow non-owner to suspend", async function () {
      await expect(
        halaalToken
          .connect(user1)
          .suspendCertification(user2.address, suspendAmount, suspendReason)
      ).to.be.reverted;
    });

    it("should not allow suspending more than certified tokens", async function () {
      await expect(
        halaalToken.suspendCertification(
          user1.address,
          INITIAL_CERT_AMOUNT.add(ethers.utils.parseUnits("1", 18)),
          suspendReason
        )
      ).to.be.revertedWith("HalaalToken: cannot suspend more than certified tokens");
    });

    it("should not allow suspending from zero address", async function () {
      await expect(
        halaalToken.suspendCertification(
          ethers.constants.AddressZero,
          suspendAmount,
          suspendReason
        )
      ).to.be.revertedWith("HalaalToken: suspend zero address");
    });

    it("should not allow zero-amount suspension", async function () {
      await expect(
        halaalToken.suspendCertification(user1.address, 0n, suspendReason)
      ).to.be.revertedWith("HalaalToken: suspend amount must be positive");
    });

    it("should not allow suspending twice beyond total balance", async function () {
      await halaalToken.suspendCertification(user1.address, suspendAmount, suspendReason);
      const remaining = INITIAL_CERT_AMOUNT.sub(suspendAmount);
      await expect(
        halaalToken.suspendCertification(user1.address, remaining + 1n, "twice")
      ).to.be.revertedWith("HalaalToken: cannot suspend more than certified tokens");
    });
  });

  describe("Certification Unsuspension", function () {
    const suspendAmount = ethers.utils.parseUnits("50", 18);
    const suspendReason = "Pending quality review Q2-2026";

    beforeEach(async function () {
      await halaalToken.functions["issueCertification(address,uint256,string)"](
        user1.address,
        INITIAL_CERT_AMOUNT,
        CERTIFICATE_ID
      );
      await halaalToken.suspendCertification(user1.address, suspendAmount, suspendReason);
    });

    it("should allow owner to unsuspend tokens", async function () {
      await halaalToken.unsuspendCertification(user1.address, suspendAmount);

      expect(await halaalToken.balanceOf(user1.address)).to.equal(INITIAL_CERT_AMOUNT);
      expect(await halaalToken.getCertifiedBalance(user1.address)).to.equal(INITIAL_CERT_AMOUNT);
      expect(await halaalToken.getSuspendedBalance(user1.address)).to.equal(0n);
    });

    it("should emit CertificationUnsuspended event", async function () {
      await expect(
        halaalToken.unsuspendCertification(user1.address, suspendAmount)
      )
        .to.emit(halaalToken, "CertificationUnsuspended")
        .withArgs(user1.address, suspendAmount);
    });

    it("should allow partial unsuspension", async function () {
      const partial = ethers.utils.parseUnits("25", 18);
      await halaalToken.unsuspendCertification(user1.address, partial);

      const certified = await halaalToken.getCertifiedBalance(user1.address);
      const suspended = await halaalToken.getSuspendedBalance(user1.address);
      const expectedCertified = INITIAL_CERT_AMOUNT.sub(suspendAmount).add(partial);
      expect(certified).to.equal(expectedCertified);
      expect(suspended).to.equal(suspendAmount.sub(partial));
    });

    it("should not allow unsuspending more than the suspended amount", async function () {
      await expect(
        halaalToken.unsuspendCertification(
          user1.address,
          suspendAmount + 1n
        )
      ).to.be.revertedWith("HalaalToken: cannot unsuspend more than suspended tokens");
    });

    it("should not allow unsuspending from zero address", async function () {
      await expect(
        halaalToken.unsuspendCertification(ethers.constants.AddressZero, suspendAmount)
      ).to.be.revertedWith("HalaalToken: unsuspend zero address");
    });

    it("should not allow non-owner to unsuspend", async function () {
      await expect(
        halaalToken
          .connect(user1)
          .unsuspendCertification(user2.address, suspendAmount)
      ).to.be.reverted;
    });
  });

  // ─────────────────────────────────────────────
  // 5. TRANSFERS — compliance gating
  // ─────────────────────────────────────────────
  describe("Transfers", function () {
    it("should allow a compliant transfer within surplus (50 of 100 free tokens)", async function () {
      // Issue 100 total, 30 certified → free surplus = 70; transfer 50 allowed
      await halaalToken.functions["issueCertification(address,uint256,string,uint256)"](
        user1.address,
        ethers.utils.parseUnits("100", 18),
        "PARTIAL-CERT",
        ethers.utils.parseUnits("30", 18)
      );
      const amount = ethers.utils.parseUnits("50", 18);
      await halaalToken.connect(user1).transfer(user2.address, amount);

      expect(await halaalToken.balanceOf(user2.address)).to.equal(amount);
      expect(await halaalToken.balanceOf(user1.address)).to.equal(ethers.utils.parseUnits("50", 18));
    });

    it("should not allow transfer to zero address", async function () {
      await halaalToken.functions["issueCertification(address,uint256,string)"](user1.address, INITIAL_CERT_AMOUNT, CERTIFICATE_ID);
      await expect(
        halaalToken.connect(user1).transfer(ethers.constants.AddressZero, INITIAL_CERT_AMOUNT)
      ).to.be.revertedWith("ERC20: transfer to the zero address");
    });

    it("should revert when transfer amount breaches certified-surplus ceiling", async function () {
      // 100 total, 30 certified → surplus = 70; 71 > 70 → revert
      await halaalToken.functions["issueCertification(address,uint256,string,uint256)"](
        user1.address,
        ethers.utils.parseUnits("100", 18),
        "PARTIAL-CERT-2",
        ethers.utils.parseUnits("30", 18)
      );
      const tooMuch = ethers.utils.parseUnits("71", 18);
      await expect(
        halaalToken.connect(user1).transfer(user2.address, tooMuch)
      ).to.be.revertedWith("HalaalToken: transfer would breach certified balance");
    });

    it("should revert when transfer exceeds token balance", async function () {
      await halaalToken.functions["issueCertification(address,uint256,string)"](user1.address, INITIAL_CERT_AMOUNT, CERTIFICATE_ID);
      const tooMuch = INITIAL_CERT_AMOUNT.add(1n);
      await expect(
        halaalToken.connect(user1).transfer(user2.address, tooMuch)
      ).to.be.revertedWith("HalaalToken: transfer would breach certified balance");
    });

    it("should revert transfer when sender is suspended below transfer ceiling", async function () {
      // 100 total, 70 certified; suspend 30 → cert=70, susp=30, surplus = 100-70+30=60; 61 > 60 → revert
      await halaalToken.functions["issueCertification(address,uint256,string)"](user1.address, INITIAL_CERT_AMOUNT, CERTIFICATE_ID);
      await halaalToken.suspendCertification(user1.address, ethers.utils.parseUnits("30", 18), "s0");
      const tooMuch = ethers.utils.parseUnits("61", 18);
      await expect(
        halaalToken.connect(user1).transfer(user2.address, tooMuch)
      ).to.be.revertedWith("HalaalToken: transfer would breach certified balance");
    });

    it("should allow transfer of only surplus tokens when partially suspended", async function () {
      // 100 total, 80 certified; suspend 60 → cert=20, susp=60, surplus = 100-20+60=140; transfer 50 allowed
      await halaalToken.functions["issueCertification(address,uint256,string,uint256)"](
        user1.address,
        ethers.utils.parseUnits("100", 18),
        "SURPLUS-TEST",
        ethers.utils.parseUnits("80", 18)
      );
      await halaalToken.suspendCertification(
        user1.address,
        ethers.utils.parseUnits("60", 18),
        "s1"
      );
      const surplus = ethers.utils.parseUnits("50", 18);
      await halaalToken.connect(user1).transfer(user2.address, surplus);

      expect(await halaalToken.balanceOf(user2.address)).to.equal(surplus);
      expect(await halaalToken.balanceOf(user1.address)).to.equal(ethers.utils.parseUnits("50", 18));
      expect(await halaalToken.getCertifiedBalance(user1.address)).to.equal(ethers.utils.parseUnits("20", 18));
    });

    it("should return a valid tx hash on successful transfer", async function () {
      await halaalToken.functions["issueCertification(address,uint256,string,uint256)"](
        user1.address,
        ethers.utils.parseUnits("100", 18),
        "TRANSFER-TEST",
        ethers.utils.parseUnits("30", 18)
      );
      const amount = ethers.utils.parseUnits("50", 18);
      const txHash = await (await halaalToken.connect(user1).transfer(user2.address, amount)).hash;
      expect(txHash).to.be.a("string");

      expect(await halaalToken.balanceOf(user2.address)).to.equal(amount);
    });
  });

  // ─────────────────────────────────────────────
  // 6. PAUSABLE
  // ─────────────────────────────────────────────
  describe("Pausable", function () {
    beforeEach(async function () {
      await halaalToken.functions["issueCertification(address,uint256,string)"](
        user1.address,
        INITIAL_CERT_AMOUNT,
        CERTIFICATE_ID
      );
    });

    it("should not allow issuing new certifications when paused", async function () {
      await halaalToken.pause();
      await expect(
        halaalToken.functions["issueCertification(address,uint256,string)"](
          user2.address,
          ethers.utils.parseUnits("10", 18),
          "BATCH-PAUSED"
        )
      ).to.be.reverted;
    });

    it("should not allow revocation when paused", async function () {
      await halaalToken.pause();
      await expect(
        halaalToken.revokeCertification(
          user1.address,
          ethers.utils.parseUnits("10", 18),
          "BATCH-PAUSED"
        )
      ).to.be.reverted;
    });

    it("should not allow transfers when paused", async function () {
      await halaalToken.pause();
      await expect(
        halaalToken.connect(user1).transfer(user2.address, ethers.utils.parseUnits("1", 18))
      ).to.be.reverted;
    });

    it("should resume operations after unpausing", async function () {
      await halaalToken.functions["issueCertification(address,uint256,string,uint256)"](
        user1.address,
        ethers.utils.parseUnits("100", 18),
        "UNPAUSE-CERT",
        ethers.utils.parseUnits("30", 18)
      );
      await halaalToken.pause();
      await halaalToken.unpause();

      const transferAmount = ethers.utils.parseUnits("1", 18);
      await halaalToken.connect(user1).transfer(user2.address, transferAmount);
      expect(await halaalToken.balanceOf(user2.address)).to.equal(transferAmount);
    });
  });

  // ─────────────────────────────────────────────
  // 7. COMPLIANCE CHECK — wouldTransferBeCompliant
  // ─────────────────────────────────────────────
  describe("Compliance Check", function () {
    beforeEach(async function () {
      // Issue 100 HCT fully certified to user2 so user2 starts with 100/100
      await halaalToken.functions["issueCertification(address,uint256,string)"](
        user2.address,
        INITIAL_CERT_AMOUNT,
        CERTIFICATE_ID
      );
    });

    it("should return false when transfer amount exceeds the sender surplus", async function () {
      // HCT transferable = balance - _certified + _suspended
      // 100 - 60 + 0 = 40 surplus; 50 > 40 so non-compliant
      await halaalToken.functions["issueCertification(address,uint256,string,uint256)"](user1.address, ethers.utils.parseUnits("100", 18), "CMP-TEST", ethers.utils.parseUnits("60", 18));
      expect(
        await halaalToken.wouldTransferBeCompliant(user1.address, user2.address, ethers.utils.parseUnits("50", 18))
      ).to.equal(false);
    });

    it("should return false if amount exceeds token balance", async function () {
      const amount = INITIAL_CERT_AMOUNT.add(ethers.utils.parseUnits("1", 18));
      expect(
        await halaalToken.wouldTransferBeCompliant(user2.address, user1.address, amount)
      ).to.equal(false);
    });

    it("should return true at the surplus edge — amount equals full free balance", async function () {
      // balance=100, cert=30 → free=70; amount=70 hits ceiling
      await halaalToken.functions["issueCertification(address,uint256,string,uint256)"](user1.address, ethers.utils.parseUnits("100", 18), "EDGE-TEST", ethers.utils.parseUnits("30", 18));
      expect(
        await halaalToken.wouldTransferBeCompliant(user1.address, user2.address, ethers.utils.parseUnits("70", 18))
      ).to.equal(true);
    });

    it("should return true when sufficient surplus exists after partial suspension", async function () {
      // user2=100 certified; suspend 60 → cert=40, susp=60; surplus=100-40+60=120 >= 50
      await halaalToken.suspendCertification(
        user2.address, ethers.utils.parseUnits("60", 18), "cmp-test"
      );
      expect(
        await halaalToken.wouldTransferBeCompliant(user2.address, user1.address, ethers.utils.parseUnits("50", 18))
      ).to.equal(true);
    });

    it("should return true for zero amount regardless of state", async function () {
      expect(
        await halaalToken.wouldTransferBeCompliant(user2.address, user1.address, 0n)
      ).to.equal(true);
    });
  });

  // ─────────────────────────────────────────────
  // 8. GET CERTIFIED BALANCE
  // ─────────────────────────────────────────────
  describe("Get Certified Balance", function () {
    it("should return 0 for address with no certification", async function () {
      expect(await halaalToken.getCertifiedBalance(user1.address)).to.equal(0n);
    });

    it("should return correct certified balance after issuance", async function () {
      await halaalToken.functions["issueCertification(address,uint256,string)"](user1.address, INITIAL_CERT_AMOUNT, CERTIFICATE_ID);
      expect(await halaalToken.getCertifiedBalance(user1.address)).to.equal(INITIAL_CERT_AMOUNT);
    });

    it("should decrease certified balance after partial suspension", async function () {
      await halaalToken.functions["issueCertification(address,uint256,string)"](user1.address, INITIAL_CERT_AMOUNT, CERTIFICATE_ID);
      const suspended = ethers.utils.parseUnits("25", 18);
      await halaalToken.suspendCertification(user1.address, suspended, "q-test");
      const expected = INITIAL_CERT_AMOUNT.sub(suspended);
      expect(await halaalToken.getCertifiedBalance(user1.address)).to.equal(expected);
    });

    it("should return correct net certified balance via getNetCertifiedBalance", async function () {
      await halaalToken.functions["issueCertification(address,uint256,string)"](user1.address, INITIAL_CERT_AMOUNT, CERTIFICATE_ID);
      const suspended = ethers.utils.parseUnits("40", 18);
      await halaalToken.suspendCertification(user1.address, suspended, "q-test");
      const netCertified = await halaalToken.getNetCertifiedBalance(user1.address);
      expect(netCertified).to.equal(ethers.utils.parseUnits("20", 18));
    });
  });
});
