// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FreelanceMarketplace is Ownable {
    struct Project {
        address payable client;
        address payable freelancer;
        uint256 amount;
        bool funded;
        bool completed;
        bool disputed;
    }

    mapping(bytes32 => Project) public projects;
    uint256 public platformFee = 1;

    constructor() Ownable(msg.sender) {}

    event ProjectCreated(
        bytes32 projectId,
        address client,
        address freelancer,
        uint256 amount
    );
    event ProjectFunded(bytes32 projectId, uint256 amount);
    event ProjectCompleted(bytes32 projectId);
    event ProjectDisputed(bytes32 projectId);
    event FundsReleased(bytes32 projectId, address to, uint256 amount);

    function createProject(
        bytes32 _projectId,
        address payable _freelancer
    ) external {
        require(
            projects[_projectId].client == address(0),
            "Project already exists"
        );

        projects[_projectId] = Project({
            client: payable(msg.sender),
            freelancer: _freelancer,
            amount: 0,
            funded: false,
            completed: false,
            disputed: false
        });

        emit ProjectCreated(_projectId, msg.sender, _freelancer, 0);
    }

    function fundProject(bytes32 _projectId) external payable {
        Project storage project = projects[_projectId];
        require(msg.sender == project.client, "Only client can fund");
        require(!project.funded, "Project already funded");
        require(msg.value > 0, "Amount must be greater than 0");

        project.amount = msg.value;
        project.funded = true;

        emit ProjectFunded(_projectId, msg.value);
    }

    function releasePayment(bytes32 _projectId) external {
        Project storage project = projects[_projectId];
        require(
            msg.sender == project.client,
            "Only client can release payment"
        );
        require(project.funded, "Project not funded");
        require(!project.completed, "Project already completed");
        require(!project.disputed, "Project is disputed");

        uint256 fee = (project.amount * platformFee) / 100;
        uint256 freelancerAmount = project.amount - fee;

        project.completed = true;
        project.freelancer.transfer(freelancerAmount);
        payable(owner()).transfer(fee);

        emit ProjectCompleted(_projectId);
        emit FundsReleased(_projectId, project.freelancer, freelancerAmount);
    }

    function initiateDispute(bytes32 _projectId) external {
        Project storage project = projects[_projectId];
        require(
            msg.sender == project.client || msg.sender == project.freelancer,
            "Unauthorized"
        );
        require(project.funded, "Project not funded");
        require(!project.completed, "Project already completed");

        project.disputed = true;
        emit ProjectDisputed(_projectId);
    }

    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 100, "Fee cannot exceed 100%");
        platformFee = _newFee;
    }
}
