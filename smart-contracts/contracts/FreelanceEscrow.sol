// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FreelanceEscrow {
    struct Project {
        uint256 projectId;
        address employer;
        address freelancer;
        uint256 amount;
        uint256 deadline;
        bool isCompleted;
        bool employerApproved;
        bool freelancerApproved;
        bool isFunded;
    }

    mapping(uint256 => Project) public projects;

    event ProjectCreated(
        uint256 indexed projectId,
        address employer,
        address freelancer,
        uint256 amount
    );
    event ProjectFunded(uint256 indexed projectId, uint256 amount);
    event ProjectApproved(uint256 indexed projectId, address approver);
    event PaymentReleased(
        uint256 indexed projectId,
        address freelancer,
        uint256 amount
    );
    event DeadlineReached(uint256 indexed projectId);

    function createProject(
        uint256 _projectId,
        address _freelancer,
        uint256 _deadline
    ) external payable {
        require(_freelancer != address(0), "Invalid freelancer address");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(msg.value > 0, "Amount must be greater than 0");

        Project storage project = projects[_projectId];
        require(project.employer == address(0), "Project already exists");

        project.projectId = _projectId;
        project.employer = msg.sender;
        project.freelancer = _freelancer;
        project.amount = msg.value;
        project.deadline = _deadline;
        project.isFunded = true;

        emit ProjectCreated(_projectId, msg.sender, _freelancer, msg.value);
        emit ProjectFunded(_projectId, msg.value);
    }

    function approveCompletion(uint256 _projectId) external {
        Project storage project = projects[_projectId];
        require(project.isFunded, "Project not funded");
        require(!project.isCompleted, "Project already completed");
        require(
            msg.sender == project.employer || msg.sender == project.freelancer,
            "Unauthorized"
        );

        if (msg.sender == project.employer) {
            project.employerApproved = true;
        } else {
            project.freelancerApproved = true;
        }

        emit ProjectApproved(_projectId, msg.sender);

        if (project.employerApproved && project.freelancerApproved) {
            _releasePayment(_projectId);
        }
    }

    function releasePaymentAfterDeadline(uint256 _projectId) external {
        Project storage project = projects[_projectId];
        require(project.isFunded, "Project not funded");
        require(!project.isCompleted, "Project already completed");
        require(block.timestamp >= project.deadline, "Deadline not reached");

        emit DeadlineReached(_projectId);
        _releasePayment(_projectId);
    }

    function _releasePayment(uint256 _projectId) internal {
        Project storage project = projects[_projectId];
        project.isCompleted = true;

        (bool success, ) = project.freelancer.call{value: project.amount}("");
        require(success, "Transfer failed");

        emit PaymentReleased(_projectId, project.freelancer, project.amount);
    }

    function getProject(
        uint256 _projectId
    )
        external
        view
        returns (
            address employer,
            address freelancer,
            uint256 amount,
            uint256 deadline,
            bool isCompleted,
            bool employerApproved,
            bool freelancerApproved,
            bool isFunded
        )
    {
        Project storage project = projects[_projectId];
        return (
            project.employer,
            project.freelancer,
            project.amount,
            project.deadline,
            project.isCompleted,
            project.employerApproved,
            project.freelancerApproved,
            project.isFunded
        );
    }
}
