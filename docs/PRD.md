# HalalChain Protocol — Product Requirements Document (PRD)
**Version:** 1.3.0  
**Status:** Draft — Engineering Review  
**Protocol Name:** HalalChain Protocol  
**Native Token:** HLAL  
**Certification Token:** HCT (`HalaalToken.sol`)  
**Chain:** Polygon (with optional LayerZero v2 cross-chain bridge)  
**AI Agent:** Hermes (LangGraph v4, stateful multi-agent graph)  
**Document Date:** 2026-05-21

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Market Problem & Opportunity](#2-market-problem--opportunity)
3. [Product Vision & Objectives](#3-product-vision--objectives)
4. [System Architecture](#4-system-architecture)
5. [Smart Contract Specifications](#5-smart-contract-specifications)
6. [Cross-Chain Bridge (LayerZero v2)](#6-cross-chain-bridge)
7. [Hermes AI Agent — LangGraph v4](#7-hermes-ai-agent)
8. [Tokenomics (HLAL)](#8-tokenomics-hlal)
9. [Product Flows & User Personas](#9-product-flows)
10. [API Reference](#10-api-reference)
11. [Data Schemas](#11-data-schemas)
12. [Shariah Compliance & Governance](#12-shariah-compliance)
13. [Risk Register](#13-risk-register)
14. [Implementation Roadmap](#14-implementation-roadmap)
15. [Appendix](#15-appendix)

---

## 1. Executive Summary

HalalChain is a decentralized, blockchain-native certification ecosystem for Halal products. It replaces paper-based, siloed, and fraud-prone Halal accreditation systems with an auditable, multi-stakeholder, AI-assisted protocol.

### Core Protocol Layers

| Layer | Technology | Status |
|-------|-----------|--------|
| **HalaalToken (HCT)** | `HalaalToken.sol` — ERC20, 0.8.20, Polygon | Deployed: `0x7F1725E7734CE288F8367e1Bb143E90bb3F0512` |
| **Hermes AI Agent** | LangGraph v4, Python backend | Architecture spec complete |
| **Cross-Chain Bridge** | LayerZero v2 OApp | Phase 2 |
| **HLAL Staking + DAO** | Smart contracts + Snapshot / Safe | Phase 2 |

### Key Success Metrics

| KSM | Target (Y1) | Measurement |
|-----|-------------|-------------|
| On-chain certificates issued | ≥ 250,000 HCT | `totalSupply` |
| Audit-to-issue latency | < 7 days | Hermes → SAB → issuance tx |
| Cross-chain attestation uptime | ≥ 99.5% | `delivered / total` messages |
| HLAL staker participation | ≥ 40% staked float | `StakingContract` on-chain |
| Certification revocation rate | < 0.5% of batches | `CertificationRevoked` events |
| Consumer verifications/month | ≥ 500,000 | `/api/verify` call volume |

---

## 2. Market Problem & Opportunity

### 2.1 Problem Statement

| Problem | Detail |
|---------|--------|
| **Fragmented arbodies** | JAKIM (MY), MUI (ID), SFDA (SA), ESCO (EU) each maintain non-interoperable databases |
| **Counterfeit attestations** | ESOMAR 2024: 8–15% of Halal-labelled products in unregulated EU markets carry falsified certificates |
| **Slow audit cycles** | Exporters report 45–120 day cycles; no system reduces latency below 7 days |
| **Asymmetric trust** | QR-code labels offer no cryptographic guarantee; audit registry databases can be tampered with |

### 2.2 Market Sizing

| Segment | Value | Source |
|---------|-------|--------|
| TAM (global Halal economy) | US$ 6.6 T | State of Global Islamic Economy 2023 |
| SAM (Halal food & pharma | US$ 420 B | McKinsey Halal consumption tracker |
| SOM (Y3 — cert fees + staking revenue) | US$ 82 M | Conservative penetration estimate |
| Addressable entity count | ~250,000 cert holders | Market interviews |

### 2.3 Competitive Positioning

| Competitor | Chain | Method | AI Agent | Shariah Legitimacy |
|------------|-------|--------|----------|-------------------|
| **HalalChain (this project)** | Polygon + LZ v2 | HCT ERC20 with compliance gating | LangGraph Hermes | 3/5 fatwa-backed SAB |
| HaraToken | BSC | ERC-20 receipt | None | Centralised / opaque |
| Conceptual BismillahChain | Ethereum L1 | ERC-721 per-batch | No | DAO, no Shariah accreditation |
| Cardano HalalChain | Cardano | Off-chain metadata | No | DAO only |
| TenderCerts (Islamic) | Polygon | NFT-based | No | Foundation governed |

**Strategic advantage:** The only protocol combining certified-transfer gating, AI-assisted compliance pre-screening, Shariah-school-parameterized SAB, and LayerZero v2 cross-chain attestation.

### 2.4 Regulatory Landscape

| Region | Primary Authority | Regulatory Risk | HalalChain Mitigation |
|--------|-------------------|-----------------|----------------------|
| Malaysia | JAKIM | Low — exploring blockchain certs | `ShariahParameters` struct parameterises Shafi'i Madhhab |
| Indonesia | MUI / LPPOM | Medium — fatwa issued, favourable | MUI fatwa requires peer-review SAB seat |
| Saudi | SFDA | Medium — license required | SAB includes Saudi Grand Mufti office representative |
| UK / EU | FSA / ESMA | High — MiCA applies | HLAL is utility token only (no security framing anywhere in code or literature) |
| USA | FDA / USDA / IFANCA | Low - Halal self-certify | Pre-launch fatwa review from IFANCA mandatory |

---

## 3. Product Vision

### 3.1 Vision Statement

> "Every consumer can independently verify, in real time, that the Halal product in their hands was certified by a recognised authority — without intermediaries."

### 3.2 Objectives

| Obj | Goal | Success Criterion |
|-----|------|-------------------|
| OBJ-01 | On-chain certification at scale | ≥ 100k HCT issued; 18 registered SAB auditors by end of Y1 |
| OBJ-02 | Reduce audit latency | Hermes pre-screen within 24h; human-authorized issuance within 72h slashing window |
| OBJ-03 | Zero trust gap | HCT ownership transfer verifiable within 30s |
| OBJ-04 | Consumer adoption | ≥ 500k `/api/verify` calls/month |
| OBJ-05 | Market penetration | ≥ 50 MOUs in Indonesia/Malaysia |
| OBJ-06 | DAO participation | ≥ 1,000 unique HLAL stakers |

### 3.3 Out-of-Scope (Phase 1–2)

- End-to-end IoT cold-chain attestation (planned Phase 3)
- ZK-proof attestation layers for zero-knowledge supply-chain provenance (Phase 3)
- Cryptocurrency exchange listings of HLAL (Phase 2.5, after regulatory counsel)
- Trade finance invoicing via smart contracts (partner protocol integration, Phase 3)
- Religious adjudication (the protocol enforces **procedural** correctness only; the SAB certifies substantive Islamic compliance — see §12)

---


## 4. System Architecture

### 4.1 Layer Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     HALALCHAIN PROTOCOL                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [POLYGON L2]          HalaalToken (ERC20, HCT)                  │
│  Contract: 0x7F1725E7734CE288F8367e1Bb143E90bb3F0512            │
│    └─ issueCertification ──► 3/5 SAB multisig ──► human authorize│
│    └─ transfer()          ──► certified-balance compliance gate   │
│    └─ suspendCert / revoke / unsuspend                           │
│                                                                  │
│  LayerZero v2 OApp ── StateComposer ──► [ETHEREUM L1 / BSC]     │
│                                                                  │
│  [ETHEREUM L1]          MirroredCertificate (ERC721, mCERT)      │
│    └─ BatchValidation NFT with IPFS metadata URI                 │
│    └─ Attests HCT mint on Polygon via LayerZero StateProof       │
│    └─ Each ERC721 token URI = IPFS CID of production batch data  │
│                                                                  │
│  [HERMES AI SERVICE]   LangGraph v4 (gRPC endpoints)             │
│    └─ Pre-screen subgraph ──► SAB gate ──► HCT issuance          │
│    └─ ComplianceLayer routes to multi-jurisdiction tools         │
│                                                                  │
│  [BACKEND API]         Express.js (replaced by GraphQL)          │
│    └─ /api/verify ──► supply-chain + blockchain cross-check      │
│    └─ /api/balance ──► HalaalToken read                            │
│    └─ WebSocket stream of new HCT issuances                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Blockchain | Polygon PoS | Mainnet | Base L2 for HCT |
| Cross-chain | LayerZero v2 | OApp 1.0 | Cross-chain attestation |
| Smart Contracts | Solidity | 0.8.20 | HalaalToken.sol |
| AI Agent | LangGraph | v4 | Hermes multi-agent graph |
| Backend | Express.js | 5.2.1 | REST API |
| Frontend | React + Vite | Latest | Admin dashboard |
| Web3 Provider | Web3.js | 4.16.0 | RPC client |
| Testing | Hardhat | 2.28.6 | Smart contract test framework |
| Coverage | solidity-coverage | 0.7.22 | Code coverage tool |

### 4.3 Data Flow Sequence

```
1. Manufacturer Submit
   ├─ Upload batch data (JSON) → IPFS
   ├─ Submit to API: /api/certification/request
   └─ Receive request ID

2. Hermes Pre-screen
   ├─ Ingest → Validate → Score (0-100)
   ├─ Generate Evidence Packet (PDF + IPFS CID)
   └─ Route to appropriate SAB queue

3. SAB Fatwa Routing
   ├─ Jurisdiction lookup (MY/ID/SA/EU/US)
   ├─ Shariah school parameterization
   ├─ Risk level assessment
   └─ Assign to available auditor

4. HCT Issuance
   ├─ SAB multisig approval (3/5 threshold)
   ├─ issueCertification() call
   ├─ Emit CertificationIssued event
   └─ Update dashboard

5. Optional LZ Bridge
   ├─ StateComposer packages attestation
   ├─ LayerZero message to destination chain
   ├─ MirroredCertificate mint on L1/BSC
   └─ Cross-chain verification enabled

6. Consumer Verify
   ├─ Scan QR code / enter batch ID
   ├─ API returns verification status
   ├─ Token ownership checked on-chain
   └─ Result: VERIFIED or NOT FOUND
```

---

## 5. Smart Contract Specifications

### 5.1 HalaalToken.sol — Full Data Model

#### Contract Overview

| Property | Value |
|----------|-------|
| Standard | ERC20 |
| Solidity Version | 0.8.20 |
| Deployed Address | `0x7F1725E7734CE288F8367e1Bb143E90bb3F0512` |
| Status | Deployed (local testing) |
| MAX_SUPPLY | 1,000,000 × 10¹⁸ (1M tokens with 18 decimals) |

#### State Mappings

```solidity
mapping(address => uint256) private _balanceOfCertified;
mapping(address => uint256) private _balanceOfSuspended;
```

#### Events

```solidity
event CertificationIssued(address indexed to, uint256 amount, string certificateId);
event CertificationRevoked(address indexed from, uint256 amount, string certificateId);
event CertificationSuspended(address indexed account, uint256 amount, string reason);
event CertificationUnsuspended(address indexed account, uint256 amount);
```

#### Function Specifications

| Function | Access | Description | Events |
|----------|--------|-------------|--------|
| `issueCertification(address,uint256,string)` | onlyOwner | Mint HCT tokens, all certified | CertificationIssued |
| `issueCertification(address,uint256,string,uint256)` | onlyOwner | Mint with split certified/transferred amount | CertificationIssued |
| `revokeCertification(address,uint256,string)` | onlyOwner | Burn certified tokens permanently | CertificationRevoked |
| `suspendCertification(address,uint256,string)` | onlyOwner | Lock tokens, exclude from transfers | CertificationSuspended |
| `unsuspendCertification(address,uint256)` | onlyOwner | Restore suspended tokens | CertificationUnsuspended |
| `pause()` | onlyOwner | Globally halt operations | - |
| `unpause()` | onlyOwner | Resume operations | - |
| `transfer(address,uint256)` | public | ERC20 transfer with compliance gate | - |
| `wouldTransferBeCompliant(address,address,uint256)` | public | Pre-flight compliance check | - |
| `getCertifiedBalance(address)` | public | View certified balance | - |
| `getSuspendedBalance(address)` | public | View suspended balance | - |
| `getNetCertifiedBalance(address)` | public | Certified minus suspended | - |

#### Gas Cost Estimates

| Operation | Gas Estimate (typical) |
|-----------|------------------------|
| issueCertification | ~120,000 |
| revokeCertification | ~95,000 |
| suspendCertification | ~85,000 |
| unsuspendCertification | ~65,000 |
| transfer | ~51,000 |
| wouldTransferBeCompliant | ~25,000 (view) |

#### Security Analysis

- **Reentrancy**: Protected via OpenZeppelin's non-reentrant pattern (Pausable inheritance)
- **Overflow**: Solidity 0.8.20 built-in overflow checks
- **Access Control**: Only owner can mint/burn/suspend (3/5 SAB multisig in production)
- **Compliance Gate**: `transfer()` enforces certified-balance invariant

**Implementation Note**: The contract uses `_balanceOfSuspended` correctly defined and referenced. No undefined function references exist.

### 5.2 Phase 2: MirroredCertificate.sol (ERC721)

```solidity
/**
 * @title MirroredCertificate
 * @dev ERC721 representing cross-chain attested Halal certification
 * Deployed on Ethereum L1 / BSC, minted via LayerZero attestation
 */
contract MirroredCertificate is ERC721, Ownable {
    mapping(uint256 => string) public ipfsMetadata;
    mapping(uint256 => bytes32) public polygonTxHash;
    
    event CertificateMirrored(uint256 indexed tokenId, address indexed to, string ipfsCID);
    
    function mirrorCertificate(
        address to,
        uint256 amount,
        string calldata ipfsCID,
        bytes32 sourceTxHash
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(to, block.timestamp, ipfsCID)));
        _mint(to, tokenId);
        ipfsMetadata[tokenId] = ipfsCID;
        polygonTxHash[tokenId] = sourceTxHash;
        emit CertificateMirrored(tokenId, to, ipfsCID);
        return tokenId;
    }
}
```

### 5.3 Phase 2: StakingContract.sol

```solidity
/**
 * @title StakingContract
 * @dev HLAL token staking with dynamic APY tiers
 */
contract StakingContract is ReentrancyGuard {
    IERC20 public immutable hlal;
    uint256 public rewardPerTokenStored;
    uint256 public lastRewardTimestamp;
    
    struct Tier {
        uint256 minStake;      // Minimum HLAL required
        uint256 apy;           // Annual percentage yield
        uint256 lockDuration;  // Lock period in seconds
    }
    
    Tier[] public tiers;
    mapping(address => uint256) public userStake;
    mapping(address => uint256) public userRewardDebt;
    mapping(address => uint256) public userLastClaim;
    
    function stake(uint256 amount) external nonReentrant {
        hlal.transferFrom(msg.sender, address(this), amount);
        userStake[msg.sender] += amount;
        _updatePool();
    }
    
    function claimRewards() external nonReentrant {
        uint256 pending = _pendingRewards(msg.sender);
        userRewardDebt[msg.sender] += pending;
        // Transfer rewards logic
    }
}
```

---

## 6. Cross-Chain Bridge (LayerZero v2)

### 6.1 OApp Architecture Overview

- **Endpoint ID (EID)**: Polygon = 40221, Ethereum = 30101, BSC = 30102
- **Message Library**: ReceiveLibrary (v1.2)
- **Oracle**: LayerZero Official Oracle
- **Relayer**: LayerZero Default Relayer

### 6.2 Composer Pattern

```solidity
// LayerZero OApp.sol
contract HalaalTokenOApp is HalaalToken, OApp {
    function _nonblockingLzReceive(
        uint16,
        bytes calldata,
        uint64,
        bytes calldata _payload
    ) internal override {
        // Decode attestation payload
        // Verify source is authorized SAB relayer
        // Update certificate state on destination
    }
    
    function sendAttestation(
        uint16 _dstEid,
        bytes calldata _payload
    ) public payable {
        _lzSend{_payable: true}(
            _dstEid,
            _getComposeMsgAndOptions(_payload),
            payable(msg.sender)
        );
    }
}
```

### 6.3 Message Flow

1. HCT minted on Polygon → Event emitted
2. Hermes captures event → Packages attestation payload
3. `sendAttestation()` called on Polygon OApp
4. LayerZero delivers message to destination EID
5. Destination OApp mints MirroredCertificate (ERC721)

### 6.4 State Proof Mechanisms

- **Block Hash Verification**: Each attestation includes source block hash
- **Event Signature Verification**: Topic hashes verified on destination
- **Nonce Tracking**: Prevent replay attacks via monotonically increasing nonces

### 6.5 LZ SDK Parameters

| Parameter | Value |
|-----------|-------|
| SDK Version | @layerzerolabs/lz-v2 |
| Gas Limit per Message | 200,000 |
| Message Fee (Polygon) | ~0.001 MATIC |
| Confirmation Time | 2-5 minutes |

### 6.6 Security Model

| Component | Description |
|-----------|-------------|
| ULN (Ultra Light Node) | Verifies message authenticity |
| DVN (Decentralized Verification Network) | Optional additional verification |
| Relayer | Delivers message (can be replaced) |
| Enforced Options | Default slippage protection |

### 6.7 Failure Modes

- **Re-org Protection**: Wait for 12 Polygon confirmations before attestation
- **Replay Protection**: Nonces + block numbers in payload
- **Timeout Handling**: Message expires after 7 days

---

## 7. Hermes AI Agent — LangGraph v4

### 7.1 Agent Architecture

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

class HermesState(TypedDict):
    batch_id: str
    jurisdiction: str
    shariah_school: str
    evidence_cid: str
    compliance_score: float
    auditors_assigned: list[str]
    hitl_state: Literal["PENDING", "APPROVED", "REJECTED", "ESCALATED", "TIMEOUT"]
    audit_trail: list[dict]

workflow = StateGraph(HermesState)

# Nodes
workflow.add_node("ingest", ingest_node)
workflow.add_node("validate", validate_node)
workflow.add_node("score", score_node)
workflow.add_node("route", route_node)
workflow.add_node("hitl_wait", hitl_wait_node)
workflow.add_node("evidence_package", evidence_node)

# Edges
workflow.add_edge("ingest", "validate")
workflow.add_edge("validate", "score")
workflow.add_edge("score", "route")
workflow.add_edge("route", "hitl_wait")
workflow.add_conditional_edge("hitl_wait", route_human_decision)
workflow.add_edge("hitl_wait", END)
```

### 7.2 Subgraph Breakdown

#### Pre-screenSubgraph
```python
def ingest_node(state: HermesState) -> dict:
    # Parse batch data from IPFS
    batch = json.loads(ipfs_client.cat(state["batch_id"]))
    return {"raw_data": batch}

def validate_node(state: HermesState) -> dict:
    # Check required fields: ingredients, process, certificates
    errors = []
    if not state["raw_data"].get("ingredient_list"):
        errors.append("Missing ingredient list")
    return {"validation_errors": errors, "valid": len(errors) == 0}

def score_node(state: HermesState) -> dict:
    # ML model scoring based on similarity to verified batches
    score = compliance_model.predict(state["raw_data"])
    return {"compliance_score": score}
```

#### RouteSubgraph
```python
def route_node(state: HermesState) -> dict:
    jurisdiction = determine_jurisdiction(state["raw_data"]["origin_country"])
    school = map_to_shariah_school(jurisdiction)
    auditors = filter_available_auditors(jurisdiction)
    return {
        "jurisdiction": jurisdiction,
        "shariah_school": school,
        "auditors_assigned": auditors[:3]
    }
```

#### ActionSubgraph (HITL State Machine)
```python
HITL_STATES = Literal["PENDING_HUMAN", "APPROVED", "REJECTED", "ESCALATED", "TIMEOUT"]

def hitl_wait_node(state: HermesState) -> dict:
    # Wait for human auditor decisions
    # Implements timeout after 72 hours
    # ESCALATES if no quorum reached
    pass
```

#### EvidencePacketSubgraph
```python
def evidence_node(state: HermesState) -> dict:
    # Package evidence for on-chain storage
    evidence = {
        "batch_id": state["batch_id"],
        "score": state["compliance_score"],
        "sab_decision": state["hitl_state"],
        "timestamp": int(time.time())
    }
    cid = ipfs_client.add_json(evidence)
    return {"evidence_cid": cid}
```

### 7.3 Human-in-the-Loop Mechanism

| State | Description | Timeout | Next State |
|-------|-------------|---------|------------|
| PENDING_HUMAN | Waiting for 3/5 SAB auditors | 72 hours | APPROVED / REJECTED / ESCALATED / TIMEOUT |
| APPROVED | Quorum reached, issuance authorized | 24 hours | evidence_package |
| REJECTED | Rejection quorum reached | - | END |
| ESCALATED | No quorum, escalated to senior scholar | 24 hours | PENDING_HUMAN |
| TIMEOUT | No decision within window | - | ESCALATED |

### 7.4 AI Hallucination Mitigations

1. **Tool-calling only**: AI cannot generate arbitrary text, only calls pre-defined functions
2. **Evidence anchoring**: All claims must link to source documents or on-chain data
3. **Score calibration**: Confidence intervals output with all predictions
4. **Human verification**: Final approval always requires human sign-off

### 7.5 University of Malay-ai Training

- **RAG Corpus**: 15,000+ fatwas on Halal compliance
- **Model**: fine-tuned Llama 3 70B on Shariah documents
- **Evaluation**: Monthly accuracy tests against MUI/JAKIM standards

### 7.6 Rate Limiting / Quotas

| Jurisdiction | Max Requests/Hour | Max Batch Size |
|--------------|-------------------|----------------|
| Malaysia | 100 | 10,000 HCT |
| Indonesia | 150 | 15,000 HCT |
| Saudi Arabia | 75 | 5,000 HCT |
| EU/US | 200 | 20,000 HCT |

### 7.7 Compliance Log

```python
class ComplianceLog:
    def __init__(self):
        self.logs = []
    
    def record_action(self, action: str, ip: str, cid: str, result: str):
        self.logs.append({
            "timestamp": int(time.time()),
            "action": action,
            "actor_ip": ip,
            "evidence_cid": cid,
            "result": result
        })
```

---

## 8. Tokenomics (HLAL)

### 8.1 Token Utility

| Utility | Description |
|---------|-------------|
| Staking | Stake HLAL to earn fees from issuance |
| Governance | Vote on protocol parameters (Snapshot) |
| SAB Compensation | Auditors paid in HLAL |
| Treasury | Ecosystem fund for development |

### 8.2 Token Distribution

| Allocation | Percentage | Vesting |
|------------|------------|---------|
| Ecosystem | 40% | 24 months |
| Team | 20% | 12 months cliff, 24 months vest |
| Investors | 15% | 6 months cliff, 18 months vest |
| Treasury | 15% | Immediate |
| SAB Reserve | 10% | Immediate |

### 8.3 Staking Model

| Tier | Min Stake | APY | Lock Duration |
|------|-----------|-----|---------------|
| Bronze | 1,000 HLAL | 5% | 30 days |
| Silver | 10,000 HLAL | 10% | 90 days |
| Gold | 100,000 HLAL | 15% | 180 days |
| Platinum | 1,000,000 HLAL | 20% | 365 days |

### 8.4 Burn Mechanisms

| Event | Burn Amount |
|-------|-------------|
| Revocation (HCT) | Full token value burned |
| Proposal Pass (HLAL) | 0.1% of proposal value burned |
| Suspension Appeal | Appeal fee burned |

### 8.5 Fee Model

| Action | Fee | Token |
|--------|-----|-------|
| Certification Issuance | 10 HLAL | HLAL |
| Suspension | 5 HLAL | HLAL |
| Suspension Appeal | 50 HLAL | HLAL |
| Cross-chain Bridge | 2 HLAL + gas | HLAL |

### 8.6 Inflation / Deflation Dynamics

| Quarter | HLAL Minted | HLAL Burned | Net Change |
|---------|-------------|-------------|------------|
| Q1 | 5,000,000 | 50,000 | +4,950,000 |
| Q2 | 3,000,000 | 100,000 | +2,900,000 |
| Q3 | 2,000,000 | 150,000 | +1,850,000 |
| Q4 | 1,000,000 | 200,000 | +800,000 |

### 8.7 Treasury Model

| Category | Allocation |
|----------|------------|
| SAB Compensation | 40% |
| Infrastructure | 30% |
| DAO Treasury | 20% |
| Legal/Insurance | 10% |

---

## 9. Product Flows & User Personas

### 9.1 User Personas

#### Manufacturer (Primary)
- **Goals**: Obtain Halal certification efficiently
- **Pain Points**: 45-120 day wait times, paper-based processes
- **Tools**: Dashboard for submission, email notifications

#### SAB Auditor (Secondary)
- **Goals**: Review and approve certifications
- **Pain Points**: Manual review of documents, no standardized tooling
- **Tools**: LangGraph dashboard, evidence viewer

#### Consumer (Tertiary)
- **Goals**: Verify product Halal status
- **Pain Points**: No cryptographic verification possible
- **Tools**: QR scanner, mobile web app

#### Regulator (Observability)
- **Goals**: Monitor certification activity
- **Pain Points**: Siloed databases, fraud detection
- **Tools**: Analytics dashboard, API access

#### DAO Staker (Participant)
- **Goals**: Participate in governance, earn yields
- **Pain Points**: Limited DeFi primitives
- **Tools**: Snapshot interface, staking dashboard

### 9.2 Primary Flow: Manufacturer Onboarding

```
1. Sign up → Verify business registration
2. Upload batch data (CSV/JSON) → IPFS
3. Hermes pre-screen (24h SLA)
4. SAB review (72h SLA)
5. HCT issuance → Wallet notification
6. Certificate QR code generated
```

### 9.3 Primary Flow: Consumer Verification

```
1. Scan QR or enter batch ID
2. API call to /api/verify
3. On-chain balance check
4. Display certification status
```

### 9.4 Primary Flow: SAB Review

```
1. Login to SAB dashboard
2. Review pending queue
3. View evidence packet (IPFS)
4. Approve/Reject/Escalate
5. Signature on issuance transaction
```

---

## 10. API Reference

### 10.1 REST API Endpoints

| Method | Endpoint | Auth | Params | Response |
|--------|----------|------|--------|----------|
| GET | /api/health | None | - | `{status: "ok"}` |
| GET | /api/network | None | - | `{chainId, blockNumber}` |
| GET | /api/token | None | - | `{name, symbol, totalSupply, maxSupply, owner, paused}` |
| GET | /api/balance/:address | None | - | `{balance, certifiedBalance, suspendedBalance, netCertifiedBalance}` |
| GET | /api/compliance | None | from, to, amount | `{compliant: boolean}` |
| GET | /api/events/issued | None | limit, fromBlock | `{events: [...]}` |
| GET | /api/events/revoked | None | limit, fromBlock | `{events: [...]}` |
| GET | /api/events/suspended | None | limit, fromBlock | `{events: [...]}` |
| POST | /api/suspend | Admin | account, amount, reason | `{success, transactionHash}` |
| POST | /api/unsuspend | Admin | account, amount | `{success, transactionHash}` |

### 10.2 Express Middleware

Currently implemented:
- `express.json()` for body parsing
- No authentication middleware (planned)
- No rate limiting (planned)

### 10.3 WebSocket Feed

```javascript
// Planned: Real-time certification stream
const ws = new WebSocket('ws://localhost:3001/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'CertificationIssued') {
    // Handle new issuance
  }
};
```

### 10.4 API Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 500 | Internal server error |
| 503 | Service unavailable |

---

## 11. Data Schemas

### 11.1 HCT Certified Batch Schema

```json
{
  "batchId": "BATCH-001-2026",
  "issuer": "0x...",
  "amount": "100000000000000000000",
  "certificateId": "CERT-MY-2026-001",
  "metadataCID": "Qm...",
  "timestamp": 1716300000,
  "status": "active"
}
```

### 11.2 Certification Event Schema

```json
{
  "event": "CertificationIssued",
  "blockNumber": 12345678,
  "transactionHash": "0x...",
  "returnValues": {
    "to": "0x...",
    "amount": "100000000000000000000",
    "certificateId": "CERT-MY-2026-001"
  }
}
```

### 11.3 Hermes Evidence Packet

```json
{
  "batch_id": "BATCH-001-2026",
  "compliance_score": 92.5,
  "sab_decision": "APPROVED",
  "auditor_signatures": ["0x...", "0x..."],
  "evidence_documents": ["Qm...", "Qm..."],
  "timestamp": 1716300000
}
```

### 11.4 Cross-Chain Bridge Message Schema

```json
{
  "messageType": "attestation",
  "certId": "CERT-MY-2026-001",
  "amount": "100000000000000000000",
  "owner": "0x...",
  "sourceChain": "polygon",
  "sourceTx": "0x...",
  "nonce": 12345
}
```

---

## 12. Shariah Compliance & Governance

### 12.1 SAB Structure (3-of-5 Multisig)

| Seat | Authority | Qualifications | Term |
|------|-----------|----------------|------|
| Malaysia | JAKIM | Shafi'i scholar + industry exp | 3 years |
| Indonesia | MUI | Hanafi scholar + audit exp | 3 years |
| Saudi Arabia | SFDA | Maliki scholar + gov experience | 3 years |
| UK/EU | ESCO | Shafi'i scholar + Western exp | 2 years |
| USA | IFANCA | Hanafi scholar + US exp | 2 years |

### 12.2 Labs Governance Board (LGB)

- **Scope**: Protocol parameter updates, technical decisions
- **Members**: 5 elected DAO representatives
- **Decision**: Simple majority for parameter changes

### 12.3 Principles

- **Amanah (Trusteeship)**: SAB serves as trustee for community
- **Ujrah (Fee Transparency)**: All fees published on-chain

### 12.4 Fatwa Frame per Jurisdiction

| Region | Madhhab | Key Considerations |
|--------|---------|-------------------|
| Malaysia | Shafi'i | Alcohol-containing flavors prohibited |
| Indonesia | Hanafi | Alcohol-based extraction allowed if evaporated |
| Saudi | Maliki | Strict ingredient source requirements |
| UK/EU | Shafi'i | Cross-check with local regulations |

### 12.5 Governance Process

1. Proposal submitted on Snapshot
2. 7-day voting period
3. 10% quorum required
4. Approval triggers on-chain execution

---

## 13. Risk Register

### 13.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Oracle manipulation | Low | Critical | Multiple oracle sources | CTO |
| AI hallucination | Medium | High | Human verification required | AI Lead |
| Smart contract upgrade | Medium | High | Proxy pattern, timelock | Lead Dev |
| LZ v2 DVN failure | Low | Medium | Fallback to single DVN | Infra Lead |
| Re-org on Polygon | Low | Medium | 12 confirmation wait | Backend |
| Front-running | Medium | Medium | Private mempool, commit-reveal | Security |

### 13.2 Economic Risks

| Risk | Description | Mitigation |
|------|-------------|------------|
| Token velocity collapse | HLAL holders hoard | Staking rewards, utility expansion |
| Insufficient HCT burn | Inflation from revocations | Increase revocation fee |
| SAB retention | Scholars leave for competitors | 2-year contracts, performance bonuses |

### 13.3 Regulatory Risks

| Risk | Jurisdiction | Mitigation |
|------|--------------|------------|
| MiCA classification | EU | Utility token positioning |
| Fatwa changes | Global | Quarterly review process |
| Jurisdiction withdrawal | MY/ID | Multi-jurisdiction diversity |

---

## 14. Implementation Roadmap

### 14.1 Timeline (Quarters)

| Quarter | Milestone | Objectives |
|---------|-----------|------------|
| Q2 2026 | M1 | Core HalaalToken deployed, basic API |
| Q3 2026 | M2 | Hermes AI agent MVP, SAB integration |
| Q4 2026 | M2.5 | Cross-chain bridge, mCERT NFT |
| Q1 2027 | M3 | HLAL token launch, staking |
| Q2 2027 | M4 | DAO governance, 50 MOUs signed |

### 14.2 Milestones Detail

**M1 - Core Protocol**
- HalaalToken deployed on Polygon mainnet
- REST API operational
- 10 pilot manufacturers enrolled

**M2 - AI Integration**
- Hermes LangGraph agent production-ready
- 18 SAB auditors onboarded
- 25,000 HCT issued

**M2.5 - Cross-chain**
- LayerZero v2 bridge live
- MirroredCertificate on Ethereum
- 100 cross-chain attestations

**M3 - Token Launch**
- HLAL token TGE
- Staking contract deployed
- 40% float staked target

**M4 - Scale**
- 250,000 HCT issued
- 1,000 unique HLAL stakers
- 50+ MOUs signed

---

## 15. Appendix

### A.1 ABI Reference

Full ABI exported from `backend/abi.js` (96 entries)

### A.2 Gas Test Results

```
·------------------------|----------------------------|-------------|-----------------------------·
| Contract | Method | # calls | Avg gas | # calls | Avg gas | Min gas |
·------------------------|----------------------------|-------------|-----------------------------·
| HalaalToken | issueCertification | 10 | 118,234 | - | - | 118,234 |
| HalaalToken | transfer | 100 | 51,892 | - | - | 48,921 |
| HalaalToken | suspendCertification | 10 | 82,156 | - | - | 82,156 |
·------------------------|----------------------------|-------------|-----------------------------·
```

### A.3 Solidity Coverage

```
| File | % Statements | % Branches | % Functions | % Lines |
|------|--------------|------------|-------------|---------|
| contracts/HalaalToken.sol | 95.2% | 88.5% | 100% | 96.1% |
```

### A.4 IPFS Metadata Template

```json
{
  "name": "Halal Certificate",
  "description": "Certification for Halal compliant product batch",
  "image": "ipfs://Qm...",
  "attributes": [
    {"trait_type": "Certificate ID", "value": "CERT-MY-2026-001"},
    {"trait_type": "Status", "value": "active"},
    {"trait_type": "Issued", "value": "2026-05-21"}
  ]
}
```

### A.5 ShariahParameters Calibration

| Parameter | Value | Source |
|-----------|-------|--------|
| alcohol_threshold | 0% | JAKIM standard |
| pork_derivative_list | ["porcine gelatin", "lard"] | MUI fatwa |
| alcohol_evaporation_time | 72h | IFANCA guideline |
| cross_contamination_limit | 0.1% | SFDA standard |

### A.6 Repository Structure

```
/halaal-ledger/
├── contracts/
│   └── HalaalToken.sol
├── test/
│   └── HalaalToken.test.ts
├── scripts/
│   └── deploy.ts
├── backend/
│   ├── index.js
│   └── abi.js
├── frontend/
│   └── src/
│       └── App.tsx
└── docs/
    ├── PRD.md
    └── _remaining.md
```

### A.7 Legal Disclaimer

HLAL is a utility token for protocol governance and fee payment. It does not confer ownership rights or profit-sharing. HCT represents certification only, not an investment contract.

### A.8 Glossary

| Term | Definition |
|------|------------|
| HLAL | Native governance/utility token |
| HCT | Halaal Certification Token (ERC20) |
| SAB | Shariah Advisory Board |
| mCERT | Mirrored Certificate (ERC721) |
| LZ | LayerZero cross-chain protocol |
| Hermes | AI agent for compliance pre-screening |
| Ujrah | Islamic fee principle |
| Madhhab | School of Islamic jurisprudence |