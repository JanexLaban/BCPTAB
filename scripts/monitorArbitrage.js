const { ethers } = require("hardhat");

// Import your contract ABI and address
const arbitrageABI = require("../artifacts/contracts/Arbitrage.sol/Arbitrage.json").abi;
const ARBITRAGE_ADDRESS = "0xB59e5Af16044073f2103F21A2bc9C565F57B6afC"; // Your deployed contract address

async function monitorArbitrage() {
    // Get signer
    const [signer] = await ethers.getSigners();
    
    // Create contract instance
    const arbitrageContract = new ethers.Contract(
        ARBITRAGE_ADDRESS,
        arbitrageABI,
        signer
    );

    // Listen for ArbitrageExecuted events
    arbitrageContract.on("ArbitrageExecuted", 
        (tradeId, token0, token1, flashLoanAmount, profit, successful, timestamp) => {
            console.log("\nNew Trade Executed:");
            console.log("------------------------");
            console.log(`Trade ID: ${tradeId}`);
            console.log(`Flash Loan Amount: ${ethers.formatEther(flashLoanAmount)} ETH`);
            console.log(`Profit: ${ethers.formatEther(profit)} ETH`);
            console.log(`Successful: ${successful}`);
            console.log(`Timestamp: ${new Date(timestamp * 1000).toLocaleString()}`);
    });

    // Listen for FlashLoanTaken events
    arbitrageContract.on("FlashLoanTaken", 
        (token, amount, timestamp) => {
            console.log("\nFlash Loan Taken:");
            console.log("------------------------");
            console.log(`Token: ${token}`);
            console.log(`Amount: ${ethers.formatEther(amount)} ETH`);
            console.log(`Timestamp: ${new Date(timestamp * 1000).toLocaleString()}`);
    });

    // Function to get and display current statistics
    async function displayStats() {
        try {
            const stats = await arbitrageContract.getOverallStats();
            console.log("\nOverall Statistics:");
            console.log("------------------------");
            console.log(`Total Trades: ${stats._totalTrades}`);
            console.log(`Successful Trades: ${stats._successfulTrades}`);
            console.log(`Success Rate: ${(stats._successfulTrades / stats._totalTrades * 100).toFixed(2)}%`);
            console.log(`Total Profit: ${ethers.formatEther(stats._totalProfit)} ETH`);
            console.log(`Last Trade: ${new Date(stats._lastTradeTimestamp * 1000).toLocaleString()}`);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }

    // Display initial stats
    await displayStats();

    // Update stats every 5 minutes
    setInterval(displayStats, 300000);

    console.log("\nMonitoring started. Waiting for events...");
}

// Execute monitoring
monitorArbitrage()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });