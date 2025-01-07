// Day 4: Initiating Flashloan
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const arbitrageAddress = "Your_Arbitrage_Contract_Address"; // Replace with deployed contract address
    const Arbitrage = await hre.ethers.getContractAt("Arbitrage", arbitrageAddress);

    // WETH token address and loan amount
    const token = "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2"; // WETH
    const amount = hre.ethers.utils.parseUnits("1", 18); // 1 WETH

    const tx = await Arbitrage.startFlashloan(token, amount);
    console.log("Flashloan initiated:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction receipt:", receipt);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
