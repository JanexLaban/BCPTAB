// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import external interfaces
import "./Interfaces.sol";

contract Arbitrage {
    // Day 1: State variables for storing protocol addresses
    address public lendingPool; // Address of the lending pool (e.g., Aave)
    address public router1;     // Address of the first DEX router (e.g., Uniswap)
    address public router2;     // Address of the second DEX router (e.g., Sushiswap)

    // Constructor to initialize addresses
    constructor(address _lendingPool, address _router1, address _router2) {
        lendingPool = _lendingPool; // Initialize lending pool address
        router1 = _router1;         // Initialize first DEX router address
        router2 = _router2;         // Initialize second DEX router address
    }

    // Function to initiate a flash loan
    function startFlashloan(address token, uint256 amount) external {
        ILendingPool(lendingPool).flashLoan(
            address(this), // Contract address as the receiver
            token,         // Token to borrow
            amount,        // Amount to borrow
            ""             // Data parameter (to be used in later days)
        );
    }
}
