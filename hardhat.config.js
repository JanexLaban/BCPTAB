require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers"); // Plugin for ethers.js
require("dotenv").config(); // To load environment variables

module.exports = {
  solidity: "0.8.0", // Specify the Solidity version
  networks: {
    hardhat: {
      // Default local network for testing
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL, // Sepolia RPC URL
      accounts: [process.env.PRIVATE_KEY], // Your private key
    },
  },
};
