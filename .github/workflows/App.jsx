// src/App.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Minimal ERC-20 ABI
const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// Your token contract
const tokenContracts = [
  { address: "0x4e8c73e7f243d12b7a5571200609523a4890beff", name: "MyToken" }
];

// Default address for preload (your wallet)
const defaultAddress = "0x802ba6a112f4a7bbbc2d63c8ef4bc14dfcbe6245";

// Public Ethereum RPC (replace with your Infura/Alchemy key)
const rpcUrl = "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID";

export default function App() {
  const [account, setAccount] = useState(defaultAddress);
  const [blockBalances, setBlockBalances] = useState([]);
  const [chainId, setChainId] = useState("1"); // Ethereum mainnet default

  // Fetch balances for a given block range
  const fetchBlockBalances = async (address, provider) => {
    const latestBlock = await provider.getBlockNumber();
    const results = [];

    for (let block = latestBlock; block > latestBlock - 5; block--) {
      const ethBal = await provider.getBalance(address, block);
      const ethFormatted = Number(ethers.formatEther(ethBal)).toFixed(4);

      const tokenData = [];
      for (let token of tokenContracts) {
        try {
          const contract = new ethers.Contract(token.address, erc20Abi, provider);
          const rawBal = await contract.balanceOf(address, { blockTag: block });
          const decimals = await contract.decimals();
          const symbol = await contract.symbol();
          tokenData.push({
            symbol,
            balance: Number(ethers.formatUnits(rawBal, decimals)).toFixed(4)
          });
        } catch {
          tokenData.push({ symbol: token.name, balance: "0.0000" });
        }
      }

      results.push({ block, eth: ethFormatted, tokens: tokenData });
    }

    setBlockBalances(results);
  };

  const connectWallet = async () => {
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const selectedAccount = accounts[0] || defaultAddress;
    setAccount(selectedAccount);

    const network = await provider.getNetwork();
    setChainId(network.chainId.toString());

    await fetchBlockBalances(selectedAccount, provider);
  };

  // Preload balances for default wallet
  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    fetchBlockBalances(defaultAddress, provider);
  }, []);

  // Listen for MetaMask changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", connectWallet);
      window.ethereum.on("chainChanged", connectWallet);
    }
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Elparadisogonzalo dApp — Block Balances</h1>
      <p><strong>Account:</strong> {account}</p>
      <p><strong>Chain ID:</strong> {chainId}</p>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Block</th>
            <th>ETH Balance</th>
            {tokenContracts.map((t, i) => (
              <th key={i}>{t.name} Balance</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {blockBalances.map((b, idx) => (
            <tr key={idx}>
              <td>{b.block}</td>
              <td>{b.eth}</td>
              {b.tokens.map((t, i) => (
                <td key={i}>{t.balance}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={connectWallet} style={styles.button}>
        {account === defaultAddress ? "Connect MetaMask" : "Refresh"}
      </button>
    </div>
  );
}

const styles = {
  button: {
    padding: "0.6rem 1rem",
    background: "#ff9900",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    color: "#fff",
    marginTop: "1rem"
  },
  table: {
    borderCollapse: "collapse",
    width: "100%",
    marginTop: "1rem",
    border: "1px solid #ddd"
  }
};
