const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying FlashLoanReceiver...");
    
    const FlashLoanReceiver = await ethers.getContractFactory("FlashLoanReceiver");
    const receiver = await FlashLoanReceiver.deploy();
    
    await receiver.deployed();
    console.log(`FlashLoanReceiver deployed to: ${receiver.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
      console.error(error);
      process.exit(1);
  });
