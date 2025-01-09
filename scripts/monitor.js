const hre = require("hardhat");
const { ethers } = require("hardhat");
const chalk = require("chalk"); // Add this to your package.json if not present

// Configuration - replace with your deployed contract address
const ARBITRAGE_ADDRESS = "0x1bddf2572d7084cc9e13f101b6a4f8d6694e2e0c2cddf41ef11d15c01669c34c";
const TOKENS = {
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "WBTC",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "WETH",
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "USDC"
};

const formatAmount = (amount, token) => {
    const decimals = {
        "WBTC": 8,
        "WETH": 18,
        "USDC": 6
    };
    const tokenSymbol = TOKENS[token] || "WETH";
    return ethers.formatUnits(amount, decimals[tokenSymbol] || 18);
};

async function monitorArbitrage() {
    const arbitrage = await ethers.getContractAt("Arbitrage", ARBITRAGE_ADDRESS);
    
    console.log(chalk.blue("\n🔍 Starting Arbitrage Monitor..."));
    console.log(chalk.blue("================================"));
    
    // Print initial stats
    const stats = await arbitrage.getStats();
    printStats(stats);

    // Monitor FlashloanInitiated events
    arbitrage.on("FlashloanInitiated", 
        (token, amount, timestamp, expectedProfit) => {
        console.log(chalk.yellow("\n⚡ Flashloan Initiated:"));
        console.log(`Token: ${TOKENS[token] || token}`);
        console.log(`Amount: ${formatAmount(amount, token)}`);
        console.log(`Expected Profit: ${formatAmount(expectedProfit, token)}`);
        console.log(`Time: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
    });

    // Monitor SwapExecuted events
    arbitrage.on("SwapExecuted", 
        (router, tokenIn, tokenOut, amountIn, amountOut, timestamp) => {
        console.log(chalk.green("\n💱 Swap Executed:"));
        console.log(`Router: ${router}`);
        console.log(`Token In: ${TOKENS[tokenIn] || tokenIn}`);
        console.log(`Token Out: ${TOKENS[tokenOut] || tokenOut}`);
        console.log(`Amount In: ${ethers.formatEther(amountIn)} ETH`);
        console.log(`Amount Out: ${ethers.formatEther(amountOut)} ETH`);
        console.log(`Time: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
    });

    // Monitor ArbitrageCompleted events
    arbitrage.on("ArbitrageCompleted", 
        (profit, gasUsed, successful, timestamp) => {
        if (successful) {
            console.log(chalk.green("\n✅ Arbitrage Completed Successfully:"));
            console.log(`Profit: ${ethers.formatEther(profit)} ETH`);
        } else {
            console.log(chalk.red("\n❌ Arbitrage Failed:"));
        }
        console.log(`Gas Used: ${gasUsed}`);
        console.log(`Time: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
    });

    // Monitor OpportunityFound events
    arbitrage.on("OpportunityFound", 
        (token, expectedProfit, timestamp) => {
        console.log(chalk.cyan("\n🎯 Opportunity Found:"));
        console.log(`Token: ${TOKENS[token] || token}`);
        console.log(`Expected Profit: ${ethers.formatEther(expectedProfit)} ETH`);
        console.log(`Time: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
    });

    // Monitor OpportunityNotProfitable events
    arbitrage.on("OpportunityNotProfitable", 
        (token, expectedProfit, requiredProfit, timestamp) => {
        console.log(chalk.yellow("\n⚠️ Opportunity Below Threshold:"));
        console.log(`Token: ${TOKENS[token] || token}`);
        console.log(`Expected Profit: ${ethers.formatEther(expectedProfit)} ETH`);
        console.log(`Required Profit: ${ethers.formatEther(requiredProfit)} ETH`);
        console.log(`Time: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
    });

    // Check stats periodically
    setInterval(async () => {
        try {
            const stats = await arbitrage.getStats();
            printStats(stats);
        } catch (error) {
            console.error(chalk.red("Error fetching stats:", error.message));
        }
    }, 60000); // Every minute
}

function printStats([isSearching, lastSearchTimestamp, totalFlashLoans, successfulSwaps, failedSwaps]) {
    console.log(chalk.blue("\n📊 Current Stats:"));
    console.log("--------------------------------");
    console.log(`Status: ${isSearching ? "🔍 Searching" : "⏸️ Idle"}`);
    console.log(`Last Search: ${new Date(Number(lastSearchTimestamp) * 1000).toLocaleString()}`);
    console.log(`Total Flash Loans: ${totalFlashLoans}`);
    console.log(`Successful Swaps: ${successfulSwaps}`);
    console.log(`Failed Swaps: ${failedSwaps}`);
    console.log(`Success Rate: ${successfulSwaps > 0 ? 
        ((successfulSwaps / (successfulSwaps + failedSwaps)) * 100).toFixed(2) : 0}%`);
}

// Add error handling for the main monitoring function
async function startMonitoring() {
    try {
        await monitorArbitrage();
        console.log(chalk.green("Monitoring started successfully"));
    } catch (error) {
        console.error(chalk.red("Error starting monitor:", error.message));
        process.exit(1);
    }
}

// Add these to your package.json if not present:
// "dependencies": {
//   "chalk": "^4.1.2"
// }

// Run the monitor
startMonitoring().catch(console.error);
// Add this function at the bottom of your monitor.js
async function testConnection() {
    const arbitrage = await ethers.getContractAt("Arbitrage", ARBITRAGE_ADDRESS);
    const stats = await arbitrage.getStats();
    console.log("Connection test successful:", stats);
}

// Run this before starting the monitor
await testConnection();