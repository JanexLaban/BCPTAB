const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance));

    // First deploy the Utils library
    console.log("Deploying Utils library...");
    const Utils = await ethers.getContractFactory("Utils");
    const utils = await Utils.deploy();
    await utils.waitForDeployment();
    const utilsAddress = await utils.getAddress();
    console.log("Utils library deployed to:", utilsAddress);

    // Deploy Arbitrage with library linking
    const Arbitrage = await ethers.getContractFactory("Arbitrage", {
        libraries: {
            Utils: utilsAddress
        }
    });
    
    const gasPrice = (await ethers.provider.getGasPrice()) * BigInt(120) / BigInt(100);

    // Day 3: Add token addresses for swapping
    const tokens = [
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
        "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2", // WETH
        "0xA0b86991C6218B36c1d19D4a2e9Eb0cE3606eB48", // USDC
    ];

    console.log("Deploying Arbitrage contract...");
    const arbitrage = await Arbitrage.deploy(
        "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        tokens,
        { 
            gasLimit: 3000000, 
            gasPrice: gasPrice 
        }
    );

    await arbitrage.waitForDeployment();
    console.log("Arbitrage contract deployed to:", await arbitrage.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });