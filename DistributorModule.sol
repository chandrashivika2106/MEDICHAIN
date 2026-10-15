// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Standalone supply-chain handoff log for the MediChain project.
/// @dev This is an additive module. It does not modify or replace MedicineRegistry.sol.
contract DistributorModule {
    address public owner;

    struct Handoff {
        string medicineId;
        address from;
        address to;
        uint256 timestamp;
        string note;
    }

    mapping(address => bool) public approvedDistributors;
    mapping(address => bool) public approvedPharmacies;
    Handoff[] private handoffs;
    mapping(string => uint256[]) private handoffsByMedicine;

    event DistributorApprovalChanged(address indexed distributor, bool approved);
    event PharmacyApprovalChanged(address indexed pharmacy, bool approved);
    event MedicineHandedOff(string indexed medicineId, address indexed from, address indexed to, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Owner only");
        _;
    }

    constructor() { owner = msg.sender; }

    function approveDistributor(address account, bool approved) external onlyOwner {
        require(account != address(0), "Invalid address");
        approvedDistributors[account] = approved;
        emit DistributorApprovalChanged(account, approved);
    }

    function approvePharmacy(address account, bool approved) external onlyOwner {
        require(account != address(0), "Invalid address");
        approvedPharmacies[account] = approved;
        emit PharmacyApprovalChanged(account, approved);
    }

    function handoffToDistributor(string calldata medicineId, address recipient, string calldata note) external {
        require(bytes(medicineId).length > 0, "Medicine ID required");
        require(approvedDistributors[msg.sender], "Sender is not an approved distributor");
        require(approvedDistributors[recipient], "Recipient is not an approved distributor");
        _recordHandoff(medicineId, recipient, note);
    }

    function handoffToPharmacy(string calldata medicineId, address recipient, string calldata note) external {
        require(bytes(medicineId).length > 0, "Medicine ID required");
        require(approvedDistributors[msg.sender], "Sender is not an approved distributor");
        require(approvedPharmacies[recipient], "Recipient is not an approved pharmacy");
        _recordHandoff(medicineId, recipient, note);
    }

    function _recordHandoff(string calldata medicineId, address recipient, string calldata note) private {
        uint256 index = handoffs.length;
        handoffs.push(Handoff(medicineId, msg.sender, recipient, block.timestamp, note));
        handoffsByMedicine[medicineId].push(index);
        emit MedicineHandedOff(medicineId, msg.sender, recipient, block.timestamp);
    }

    function getHandoffCount() external view returns (uint256) { return handoffs.length; }

    function getHandoff(uint256 index) external view returns (Handoff memory) {
        require(index < handoffs.length, "Invalid index");
        return handoffs[index];
    }

    function getMedicineHandoffIndices(string calldata medicineId) external view returns (uint256[] memory) {
        return handoffsByMedicine[medicineId];
    }
}
