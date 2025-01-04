// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interface for lending pools
interface ILendingPool {
    function flashLoan(
        address receiverAddress,
        address asset,
        uint256 amount,
        bytes calldata params
    ) external;
}

// Interface for ERC-20 tokens
interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}
