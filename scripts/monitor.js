const hre = require("hardhat");
const { ethers } = require("hardhat");
const chalk = require("chalk");

// Configuration - replace with your deployed contract address
const ARBITRAGE_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const TOKENS = {
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "WBTC",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "WETH",
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "USDC"
};

// Format amount based on token decimals
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
        console.log(`Amount In: ${formatAmount(amountIn, tokenIn)}`);
        console.log(`Amount Out: ${formatAmount(amountOut, tokenOut)}`);
        console.log(`Time: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
    });

    // Monitor ArbitrageCompleted events
    arbitrage.on("ArbitrageCompleted", 
        (profit, gasUsed, successful, timestamp) => {
        if (successful) {
            console.log(chalk.green("\n✅ Arbitrage Completed Successfully:"));
            console.log(`Profit: ${formatAmount(profit, "WETH")}`);
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
        console.log(`Expected Profit: ${formatAmount(expectedProfit, token)}`);
        console.log(`Time: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
    });

    // Monitor OpportunityNotProfitable events
    arbitrage.on("OpportunityNotProfitable", 
        (token, expectedProfit, requiredProfit, timestamp) => {
        console.log(chalk.yellow("\n⚠️ Opportunity Below Threshold:"));
        console.log(`Token: ${TOKENS[token] || token}`);
        console.log(`Expected Profit: ${formatAmount(expectedProfit, token)}`);
        console.log(`Required Profit: ${formatAmount(requiredProfit, token)}`);
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

async function testConnection() {
    try {
        const arbitrage = await ethers.getContractAt("Arbitrage", ARBITRAGE_ADDRESS);
        const stats = await arbitrage.getStats();
        console.log("Connection test successful:", stats);
        return true;
    } catch (error) {
        console.error(chalk.red("Connection test failed:", error.message));
        return false;
    }
}

// Main function to run everything
async function main() {
    try {
        // Test connection first
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error(chalk.red("Failed to connect to the contract. Please check your configuration."));
            process.exit(1);
        }
        
        // Start monitoring
        await monitorArbitrage();
        console.log(chalk.green("Monitoring started successfully"));
    } catch (error) {
        console.error(chalk.red("Error starting monitor:", error.message));
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}