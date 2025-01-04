const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners(); // Get deployer's address
    console.log("Deploying contracts with the account:", deployer.address);

    // Compile and deploy the Arbitrage contract
    const Arbitrage = await ethers.getContractFactory("Arbitrage");
    const arbitrage = await Arbitrage.deploy(
        "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", // ethereum sepolia v3 market
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",    // sushiswap router address
        "0xE592427A0AEce92De3Edee1F18E0157C05861564"     // uniswap router address 
    );

    // Log deployed contract address
    console.log("Arbitrage contract deployed to:", arbitrage.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
