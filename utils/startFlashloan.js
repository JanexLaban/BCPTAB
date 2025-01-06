const { ethers } = require("hardhat");

async function startFlashloan(contractAddress, token, amount) {
    const arbitrage = await ethers.getContractAt("Arbitrage", contractAddress);

    await arbitrage.startFlashloan(token, ethers.utils.parseEther(amount));
    console.log("Flashloan started for", amount, "of token", token);
}

startFlashloan("0xContractAddress", "0xTokenAddress", "1000").catch((err) =>
    console.error(err)
);
