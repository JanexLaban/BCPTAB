const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance));

    // Get basic gas price instead of EIP-1559 fees
    const gasPrice = await ethers.provider.getGasPrice();
    console.log("Gas Settings:");
    console.log("Gas Price (gwei):", ethers.formatUnits(gasPrice, "gwei"));

    const deploymentOptions = {
        gasPrice: gasPrice // Use regular gas price instead of EIP-1559 fees
    };

    // Deploy Utils library
    console.log("Deploying Utils library...");
    const Utils = await ethers.getContractFactory("Utils");
    const utils = await Utils.deploy(deploymentOptions);
    await utils.waitForDeployment();
    const utilsAddress = await utils.getAddress();
    console.log("Utils library deployed to:", utilsAddress);

    // Deploy Arbitrage with library linking
    const Arbitrage = await ethers.getContractFactory("Arbitrage", {
        libraries: {
            Utils: utilsAddress
        }
    });

    // Use ethers.getAddress to ensure proper checksum
    const tokens = [
        await ethers.getAddress("0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"), // WBTC
        await ethers.getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"), // WETH
        await ethers.getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")  // USDC
    ];

    // Set profit threshold (e.g., 0.5%)
    const profitThreshold = 50; // 0.5% = 50 basis points

    console.log("Deploying Arbitrage contract...");
    const arbitrage = await Arbitrage.deploy(
        await ethers.getAddress("0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951"), // lending pool
        await ethers.getAddress("0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"), // router1
        await ethers.getAddress("0xE592427A0AEce92De3Edee1F18E0157C05861564"), // router2
        tokens,
        profitThreshold,
        deploymentOptions
    );

    await arbitrage.waitForDeployment();
    const arbitrageAddress = await arbitrage.getAddress();
    console.log("Arbitrage contract deployed to:", arbitrageAddress);
    
    // Log deployment details for monitoring
    console.log("\nDeployment Summary:");
    console.log("--------------------");
    console.log("Utils Library:", utilsAddress);
    console.log("Arbitrage Contract:", arbitrageAddress);
    console.log("Profit Threshold:", profitThreshold/100, "%");
    console.log("Monitored Tokens:");
    tokens.forEach((token, index) => {
        console.log(`  ${index + 1}. ${token}`);
    });
    
    // Verify contract on etherscan (if on mainnet or testnet)
    if (network.name !== "hardhat") {
        console.log("\nVerifying contracts on Etherscan...");
        try {
            await hre.run("verify:verify", {
                address: arbitrageAddress,
                constructorArguments: [
                    "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
                    "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
                    "0xE592427A0AEce92De3Edee1F18E0157C05861564",
                    tokens,
                    profitThreshold
                ],
            });
        } catch (error) {
            console.log("Error verifying contract:", error);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });