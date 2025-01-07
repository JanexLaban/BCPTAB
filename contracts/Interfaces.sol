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

interface IUniswapV2Router02 {
    function WETH() external pure returns (address);
    
    function getAmountsOut(uint amountIn, address[] calldata path) 
        external 
        view 
        returns (uint[] memory amounts);
        
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    }

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


