// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TipJarOwnable is Ownable {

    struct Tip {
        address sender;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    Tip[] public tips;

    event TipReceived(address indexed sender, uint256 amount, string message);

    event Withdraw(address indexed owner, uint256 amount);

    constructor() Ownable(msg.sender) {
        // msg.sender becomes the owner
    }

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

    function getAllTips() external view returns (Tip[] memory) {
        return tips;
    }

    receive() external payable {
        tips.push(Tip(msg.sender, msg.value, "No message", block.timestamp));
        emit TipReceived(msg.sender, msg.value, "No message");
    }

    fallback() external payable {
        tips.push(Tip(msg.sender, msg.value, "No message", block.timestamp));
        emit TipReceived(msg.sender, msg.value, "No message");
    }

    function getTotalTips() external view returns (uint256) {
        return tips.length;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available");

        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdraw failed");

        emit Withdraw(owner(), balance);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
