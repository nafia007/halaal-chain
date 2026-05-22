import 'dotenv/config';
import express from 'express';
import { Web3 } from 'web3';
import { HALAAL_TOKEN_ABI } from './abi.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Web3 setup
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const web3 = new Web3(RPC_URL);

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';

let contractInstance = null;

async function getContract() {
  if (!CONTRACT_ADDRESS) return null;
  if (!contractInstance) {
    contractInstance = new web3.eth.Contract(HALAAL_TOKEN_ABI, CONTRACT_ADDRESS);
  }
  return contractInstance;
}

function shortAddr(a) {
  if (!a) return '-';
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

// ---- Health check --------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---- Network info --------------------------------------------------------
app.get('/api/network', async (_req, res) => {
  try {
    const [chainId, blockNumber] = await Promise.all([
      web3.eth.getChainId(),
      web3.eth.getBlockNumber(),
    ]);
    console.log('chainId type:', typeof chainId, chainId);
    console.log('blockNumber type:', typeof blockNumber, blockNumber);
    res.json({ 
      chainId: chainId.toString(), 
      blockNumber: blockNumber.toString(), 
      rpcUrl: RPC_URL 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Token metadata ------------------------------------------------------
app.get('/api/token', async (_req, res) => {
  try {
    const contract = await getContract();
    if (!contract) {
      return res.status(503).json({ error: 'CONTRACT_ADDRESS not configured' });
    }
    const [name, symbol, totalSupply, maxSupply, owner, paused] = await Promise.all([
      contract.methods.name().call(),
      contract.methods.symbol().call(),
      contract.methods.totalSupply().call(),
      contract.methods.MAX_SUPPLY().call(),
      contract.methods.owner().call(),
      contract.methods.paused().call(),
    ]);
    res.json({ 
      name, 
      symbol, 
      totalSupply: totalSupply.toString(), 
      maxSupply: maxSupply.toString(), 
      owner, 
      paused 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Balance of an address -----------------------------------------------
app.get('/api/balance/:address', async (req, res) => {
  try {
    const contract = await getContract();
    if (!contract) {
      return res.status(503).json({ error: 'CONTRACT_ADDRESS not configured' });
    }
    const [balance, certified, suspended, netCertified] = await Promise.all([
      contract.methods.balanceOf(req.params.address).call(),
      contract.methods.getCertifiedBalance(req.params.address).call(),
      contract.methods.getSuspendedBalance(req.params.address).call(),
      contract.methods.getNetCertifiedBalance(req.params.address).call(),
    ]);
    res.json({
      address: req.params.address,
      balance: balance.toString(),
      certifiedBalance: certified.toString(),
      suspendedBalance: suspended.toString(),
      netCertifiedBalance: netCertified.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Compliance check ----------------------------------------------------
app.get('/api/compliance', async (req, res) => {
  try {
    const contract = await getContract();
    if (!contract) {
      return res.status(503).json({ error: 'CONTRACT_ADDRESS not configured' });
    }
    const { from, to, amount } = req.query;
    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'from, to, and amount query params are required' });
    }
    const compliant = await contract.methods
      .wouldTransferBeCompliant(from, to, amount)
      .call();
    res.json({ 
      from, 
      to, 
      amount, 
      compliant 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Suspend certification ------------------------------------------------
app.post('/api/suspend', async (req, res) => {
  try {
    const contract = await getContract();
    if (!contract) {
      return res.status(503).json({ error: 'CONTRACT_ADDRESS not configured' });
    }
    const { account, amount, reason } = req.body;
    if (!account || !amount || !reason) {
      return res.status(400).json({ error: 'account, amount, and reason are required in the request body' });
    }
    const tx = await contract.methods.suspendCertification(account, amount, reason).send({ from: process.env.ADMIN_ADDRESS });
    res.json({ success: true, transactionHash: tx.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Unsuspend certification ----------------------------------------------
app.post('/api/unsuspend', async (req, res) => {
  try {
    const contract = await getContract();
    if (!contract) {
      return res.status(503).json({ error: 'CONTRACT_ADDRESS not configured' });
    }
    const { account, amount } = req.body;
    if (!account || !amount) {
      return res.status(400).json({ error: 'account and amount are required in the request body' });
    }
    const tx = await contract.methods.unsuspendCertification(account, amount).send({ from: process.env.ADMIN_ADDRESS });
    res.json({ success: true, transactionHash: tx.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Recent events — CertificationIssued ---------------------------------
app.get('/api/events/issued', async (req, res) => {
  try {
    const contract = await getContract();
    if (!contract) {
      return res.status(503).json({ error: 'CONTRACT_ADDRESS not configured' });
    }
    const limit = parseInt(String(req.query.limit)) || 50;
    const fromBlock = parseInt(String(req.query.fromBlock)) || 0;
    const latestBlock = await web3.eth.getBlockNumber();
    const events = await contract.getPastEvents('CertificationIssued', {
      fromBlock,
      toBlock: latestBlock,
    });
    const sliced = events.slice(0, limit).map((e) => ({
      blockNumber: e.blockNumber,
      transactionHash: e.transactionHash,
      returnValues: JSON.parse(JSON.stringify(e.returnValues, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      ))
    }));
    res.json({ events: sliced, count: sliced.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Recent events — CertificationRevoked --------------------------------
app.get('/api/events/revoked', async (req, res) => {
  try {
    const contract = await getContract();
    if (!contract) {
      return res.status(503).json({ error: 'CONTRACT_ADDRESS not configured' });
    }
    const limit = parseInt(String(req.query.limit)) || 50;
    const fromBlock = parseInt(String(req.query.fromBlock)) || 0;
    const latestBlock = await web3.eth.getBlockNumber();
    const events = await contract.getPastEvents('CertificationRevoked', {
      fromBlock,
      toBlock: latestBlock,
    });
    const sliced = events.slice(0, limit).map((e) => ({
      blockNumber: e.blockNumber,
      transactionHash: e.transactionHash,
      returnValues: JSON.parse(JSON.stringify(e.returnValues, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      ))
    }));
    res.json({ events: sliced, count: sliced.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Recent events — CertificationSuspended -------------------------------
app.get('/api/events/suspended', async (req, res) => {
  try {
    const contract = await getContract();
    if (!contract) {
      return res.status(503).json({ error: 'CONTRACT_ADDRESS not configured' });
    }
    const limit = parseInt(String(req.query.limit)) || 50;
    const fromBlock = parseInt(String(req.query.fromBlock)) || 0;
    const latestBlock = await web3.eth.getBlockNumber();
    const events = await contract.getPastEvents('CertificationSuspended', {
      fromBlock,
      toBlock: latestBlock,
    });
    const sliced = events.slice(0, limit).map((e) => ({
      blockNumber: e.blockNumber,
      transactionHash: e.transactionHash,
      returnValues: JSON.parse(JSON.stringify(e.returnValues, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      ))
    }));
    res.json({ events: sliced, count: sliced.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Error handler --------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[backend] Halaal Ledger API running on http://localhost:${PORT}`);
  console.log(`[backend] RPC: ${RPC_URL}`);
  if (!CONTRACT_ADDRESS) {
    console.warn('[backend] CONTRACT_ADDRESS not set — /api/token and /api/balance will return 503');
  }
});
