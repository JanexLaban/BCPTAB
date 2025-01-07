// Day 4: Initiating Flashloan
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer Address:", deployer.address); // Day 4: Log deployer's address

    const arbitrageAddress = "Your_Arbitrage_Contract_Address"; // Replace with deployed contract address
    const Arbitrage = await hre.ethers.getContractAt("Arbitrage", arbitrageAddress);

    // Day 4: Define token (WETH) and loan amount
    const token = "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2"; // WETH
    const amount = hre.ethers.utils.parseUnits("1", 18); // 1 WETH

    console.log("Initiating flashloan...");
    const tx = await Arbitrage.startFlashloan(token, amount); // Trigger flashloan
    console.log("Flashloan transaction hash:", tx.hash); // Day 4: Log transaction hash

    const receipt = await tx.wait(); // Wait for confirmation
    console.log("Transaction mined with status:", receipt.status); // Day 4: Log transaction status

    console.log("Flashloan initiated successfully!");
}

main().catch((error) => {
    console.error("Error initiating flashloan:", error); // Day 4: Enhanced error logging
    process.exitCode = 1;
});
