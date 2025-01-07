
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./Interfaces.sol";
// Day 1: Utility Functions for Balances and Profit Calculations

library Utils {
    // Get token balance of a given account
    function getBalance(address token, address account) external view returns (uint256) {
        return IERC20(token).balanceOf(account);
    }

    // Calculate profit or loss
    function calculateProfit(uint256 startBalance, uint256 endBalance) external pure returns (int256) {
        return int256(endBalance) - int256(startBalance);
    }
}
