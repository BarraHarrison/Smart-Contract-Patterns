// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TipJarOwnable is Ownable {

    // Struct to store each tip
    struct Tip {
        address sender;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    // All tips
    Tip[] public tips;

    // Event for when someone sends a tip
    event TipReceived(address indexed sender, uint256 amount, string message);

    // Event for withdrawals
    event Withdraw(address indexed owner, uint256 amount);

    constructor() Ownable(msg.sender) {
        // msg.sender becomes the owner
    }

    /**
     * @notice Send a tip to the contract with an optional message.
     */
    function sendTip(string calldata _message) external payable {
        require(msg.value > 0, "Tip must be greater than 0");

        tips.push(
            Tip({
                sender: msg.sender,
                amount: msg.value,
                message: _message,
                timestamp: block.timestamp
            })
        );

        emit TipReceived(msg.sender, msg.value, _message);
    }

    /**
     * @notice Get total number of tips ever sent.
     */
    function getTotalTips() external view returns (uint256) {
        return tips.length;
    }

    /**
     * @notice Withdraw all funds in the contract to the owner.
     * Only the owner can call this.
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available");

        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdraw failed");

        emit Withdraw(owner(), balance);
    }

    /**
     * @notice Check the current ETH balance in the tip jar.
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
