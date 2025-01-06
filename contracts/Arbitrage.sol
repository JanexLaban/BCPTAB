// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Interfaces.sol";

contract Arbitrage {
    address public lendingPool;
    address public router1;
    address public router2;

    constructor(address _lendingPool, address _router1, address _router2) {
        lendingPool = _lendingPool;
        router1 = _router1;
        router2 = _router2;
    }

    function startFlashloan(address token, uint256 amount) external {
        ILendingPool(lendingPool).flashLoan(
            address(this),
            token,
            amount,
            abi.encode("triangular_arbitrage")
        );
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        // address initiator,
        bytes calldata params
    ) external returns (bool) {
        require(msg.sender == lendingPool, "Unauthorized");

        string memory operation = abi.decode(params, (string));

        if (keccak256(bytes(operation)) == keccak256(bytes("triangular_arbitrage"))) {
            uint256 balanceBefore = IERC20(asset).balanceOf(address(this));
            
            swap(router1, asset, amount / 2);
            swap(router2, asset, amount / 2);

            uint256 balanceAfter = IERC20(asset).balanceOf(address(this));
            require(balanceAfter > balanceBefore + premium, "No profit");
        }

        IERC20(asset).approve(lendingPool, amount + premium);
        return true;
    }

    function swap(address router, address token, uint256 amount) internal {
        IERC20(token).approve(router, amount);

        // Properly declare and initialize the path array
        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = IUniswapV2Router02(router).WETH();

        IUniswapV2Router02(router).swapExactTokensForTokens(
            amount,
            1,
            path,
            address(this),
            block.timestamp
        );
    }
}