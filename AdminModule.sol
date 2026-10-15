// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal admin register for approved supply-chain participants and reports.
/// @dev This is a new standalone module; it does not edit the existing project contracts.
contract AdminModule {
    address public owner;
    enum Role { None, Manufacturer, Distributor, Pharmacy }
    struct Participant { Role role; bool active; }
    struct Report { string medicineId; address reporter; string reason; uint256 timestamp; bool reviewed; }

    mapping(address => Participant) public participants;
    Report[] private reports;

    event ParticipantUpdated(address indexed account, Role role, bool active);
    event SuspiciousMedicineReported(uint256 indexed reportId, string medicineId, address indexed reporter);
    event ReportReviewed(uint256 indexed reportId);

    modifier onlyOwner() { require(msg.sender == owner, "Owner only"); _; }
    constructor() { owner = msg.sender; }

    function setParticipant(address account, Role role, bool active) external onlyOwner {
        require(account != address(0), "Invalid address");
        require(role != Role.None || !active, "Active participant needs a role");
        participants[account] = Participant(role, active);
        emit ParticipantUpdated(account, role, active);
    }

    function reportSuspiciousMedicine(string calldata medicineId, string calldata reason) external {
        require(bytes(medicineId).length > 0, "Medicine ID required");
        require(bytes(reason).length > 0, "Reason required");
        uint256 reportId = reports.length;
        reports.push(Report(medicineId, msg.sender, reason, block.timestamp, false));
        emit SuspiciousMedicineReported(reportId, medicineId, msg.sender);
    }

    function reviewReport(uint256 reportId) external onlyOwner {
        require(reportId < reports.length, "Invalid report ID");
        require(!reports[reportId].reviewed, "Already reviewed");
        reports[reportId].reviewed = true;
        emit ReportReviewed(reportId);
    }

    function getReportCount() external view returns (uint256) { return reports.length; }
    function getReport(uint256 reportId) external view returns (Report memory) {
        require(reportId < reports.length, "Invalid report ID");
        return reports[reportId];
    }
}
