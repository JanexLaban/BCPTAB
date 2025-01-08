require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Validate environment variables
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

console.log("Loading configuration...");
if (!process.env.PRIVATE_KEY) {
  console.error("⚠️ Private key not found in .env file");
}
if (!process.env.SEPOLIA_RPC_URL) {
  console.error("⚠️ Sepolia RPC URL not found in .env file");
}


module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
      gas: 3000000,
      allowUnlimitedContractSize: true
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};