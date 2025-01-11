// Day 6: Dynamic Opportunity Scanning with Profit and Gas Tracking
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer Address:", deployer.address);

    const arbitrageAddress = "0xB59e5Af16044073f2103F21A2bc9C565F57B6afC"; // Your deployed address
    const Arbitrage = await hre.ethers.getContractAt("Arbitrage", arbitrageAddress);

    // Add event listeners for monitoring
    Arbitrage.on("FlashLoanTaken", (token, amount, timestamp) => {
        console.log("\nFlash Loan Initiated:");
        console.log("------------------------");
        console.log(`Token: ${token}`);
        console.log(`Amount: ${ethers.formatEther(amount)} ETH`);
        console.log(`Time: ${new Date(timestamp * 1000).toLocaleString()}`);
    });

    Arbitrage.on("ArbitrageExecuted", 
        (tradeId, token0, token1, flashLoanAmount, profit, successful, timestamp) => {
            console.log("\nArbitrage Execution Result:");
            console.log("------------------------");
            console.log(`Trade ID: ${tradeId}`);
            console.log(`Tokens: ${token0} -> ${token1}`);
            console.log(`Flash Loan Amount: ${ethers.formatEther(flashLoanAmount)} ETH`);
            console.log(`Profit: ${ethers.formatEther(profit)} ETH`);
            console.log(`Success: ${successful}`);
            console.log(`Time: ${new Date(timestamp * 1000).toLocaleString()}`);
    });

    const tokens = [
        "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2", // WETH
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"  // USDC
    ];
    const amount = ethers.parseUnits("1", 18);

    // Function to display statistics
    async function displayStats() {
        try {
            const stats = await Arbitrage.getOverallStats();
            console.log("\nCurrent Statistics:");
            console.log("------------------------");
            console.log(`Total Trades: ${stats._totalTrades}`);
            console.log(`Successful Trades: ${stats._successfulTrades}`);
            console.log(`Success Rate: ${(stats._successfulTrades / stats._totalTrades * 100).toFixed(2)}%`);
            console.log(`Total Profit: ${ethers.formatEther(stats._totalProfit)} ETH`);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }

    // Display initial stats
    await displayStats();

    for (const token of tokens) {
        try {
            console.log(`\nAttempting flashloan for token: ${token}`);

            // Get flash loan stats before execution
            const beforeStats = await Arbitrage.getFlashLoanStats(token);
            
            const tx = await Arbitrage.startFlashloan(token, amount);
            console.log(`Flashloan transaction sent for token ${token}:`, tx.hash);

            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;
            console.log(`Gas cost for transaction: ${ethers.formatEther(gasUsed)} ETH`);

            // Get flash loan stats after execution
            const afterStats = await Arbitrage.getFlashLoanStats(token);
            const profitForTrade = afterStats.totalProfitForToken - beforeStats.totalProfitForToken;
            
            console.log("\nTrade Summary:");
            console.log("------------------------");
            console.log(`Token: ${token}`);
            console.log(`Flash Loan Amount: ${ethers.formatEther(amount)} ETH`);
            console.log(`Profit: ${ethers.formatEther(profitForTrade)} ETH`);
            console.log(`Net Profit (after gas): ${ethers.formatEther(profitForTrade - gasUsed)} ETH`);

            // Log all events
            receipt.events.forEach(event => {
                if (event.event) { // Only log named events
                    console.log(`Event ${event.event}:`, event.args);
                }
            });

            // Update stats after each trade
            await displayStats();

        } catch (error) {
            console.error(`Error initiating flashloan for token ${token}:`, error.message);
        }
    }

    // Keep the script running to continue monitoring events
    console.log("\nMonitoring for additional events. Press Ctrl+C to stop.");
    await new Promise(() => {}); // Keep script running
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });