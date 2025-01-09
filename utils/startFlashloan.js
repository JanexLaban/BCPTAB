// Day 5: Dynamic Opportunity Scanning
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer Address:", deployer.address);

    const arbitrageAddress = "Your_Arbitrage_Contract_Address"; // Replace with deployed contract address
    const Arbitrage = await hre.ethers.getContractAt("Arbitrage", arbitrageAddress);

    // Tokens array and loan amount
    const tokens = [
        "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2", // WETH
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"  // USDC
    ];
    const amount = hre.ethers.utils.parseUnits("1", 18); // 1 WETH

    for (const token of tokens) {
        try {
            console.log(`Attempting flashloan for token: ${token}`);

            // Start flashloan
            const tx = await Arbitrage.startFlashloan(token, amount);
            console.log(`Flashloan transaction sent for token ${token}:`, tx.hash);

            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log(`Flashloan confirmed for token ${token}:`, receipt.transactionHash);

            // Check for emitted events in the transaction receipt
            if (receipt.events) {
                receipt.events.forEach(event => {
                    console.log(`Event ${event.event}:`, event.args);
                });
            }
        } catch (error) {
            console.error(`Error initiating flashloan for token ${token}:`, error.message);
        }
    }
}

main().catch((error) => {
    console.error("Error initiating flashloan:", error);
    process.exitCode = 1;
});
