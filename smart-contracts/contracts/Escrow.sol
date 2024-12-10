// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Escrow {
    address public employer;
    address public freelancer;
    uint256 public amount;
    bool public funded;
    bool public released;

    constructor(address _freelancer) payable {
        employer = msg.sender;
        freelancer = _freelancer;
        amount = msg.value;
        funded = msg.value > 0;
    }

    function release() external {
        require(msg.sender == employer, "Only employer can release funds");
        require(funded, "Contract not funded");
        require(!released, "Funds already released");

        released = true;
        payable(freelancer).transfer(amount);
    }

    function refund() external {
        require(msg.sender == employer, "Only employer can refund");
        require(funded, "Contract not funded");
        require(!released, "Funds already released");

        released = true;
        payable(employer).transfer(amount);
    }
}
