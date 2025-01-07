// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Day 1: Interfaces and Utilities
import "./Interfaces.sol";
import "./Utils.sol"; // Utility library for balance and profit calculations

// Day 2: Core Contract Implementation
contract Arbitrage {
    // Addresses for LendingPool and Routers
    address public lendingPool;
    address public router1;
    address public router2;
    address[] public tokens; // Dynamic token array for path selection

    // Constructor to initialize contract variables
    constructor(address _lendingPool, address _router1, address _router2, address[] memory _tokens) {
        lendingPool = _lendingPool;
        router1 = _router1;
        router2 = _router2;
        tokens = _tokens; // Tokens array for swapping paths
    }

    // Day 3: Starting the Flashloan
    function startFlashloan(address token, uint256 amount) external {
        int256 profit = analyzeProfit(amount, token);
        require(profit > 0, "Unprofitable arbitrage");

        ILendingPool(lendingPool).flashLoan(
            address(this),
            token,
            amount,
            abi.encode("triangular_arbitrage")
        );
    }

    // Callback function for flashloan execution
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        bytes calldata params
    ) external returns (bool) {
        require(msg.sender == lendingPool, "Unauthorized");

        string memory operation = abi.decode(params, (string));

        if (keccak256(bytes(operation)) == keccak256(bytes("triangular_arbitrage"))) {
            uint256 balanceBefore = IERC20(asset).balanceOf(address(this));
            
            // Execute swaps on both routers
            swap(router1, asset, amount / 2);
            swap(router2, asset, amount / 2);

            uint256 balanceAfter = IERC20(asset).balanceOf(address(this));
            require(balanceAfter > balanceBefore + premium, "No profit");
        }

        // Repay the flashloan
        IERC20(asset).approve(lendingPool, amount + premium);
        return true;
    }

    // Internal function to execute a token swap
    function swap(address router, address token, uint256 amount) internal {
        IERC20(token).approve(router, amount);

        // Dynamic path selection using random token
        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = tokens[block.timestamp % tokens.length]; // Random token selection

        // Perform the swap
        IUniswapV2Router02(router).swapExactTokensForTokens(
            amount,
            1,
            path,
            address(this),
            block.timestamp
        );
    }

    // Day 4: Profit Analysis
    function analyzeProfit(uint256 amount, address token) internal view returns (int256) {
        uint256 startBalance = Utils.getBalance(token, address(this));
        uint256 estimatedOutput = getEstimatedOutput(router1, token, amount);
        return Utils.calculateProfit(startBalance, startBalance + estimatedOutput);
    }

    // Get estimated output for swapping tokens
    function getEstimatedOutput(address router, address token, uint256 amount) internal view returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = IUniswapV2Router02(router).WETH();

        uint256[] memory amounts = IUniswapV2Router02(router).getAmountsOut(amount, path);
        return amounts[path.length - 1];
    }
}
