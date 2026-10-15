// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Standalone pharmacy receipt and sale-status log for MediChain.
/// @dev Additive only; it does not modify the existing medicine registry.
contract PharmacyModule {
    address public owner;
    mapping(address => bool) public approvedPharmacies;

    enum Status { Received, Sold, Recalled }
    struct PharmacyRecord {
        string medicineId;
        address pharmacy;
        uint256 receivedAt;
        uint256 soldAt;
        Status status;
    }

    mapping(bytes32 => PharmacyRecord) private records;
    event PharmacyApproved(address indexed pharmacy, bool approved);
    event MedicineReceived(string indexed medicineId, address indexed pharmacy);
    event MedicineSold(string indexed medicineId, address indexed pharmacy);
    event MedicineRecallFlagged(string indexed medicineId, address indexed pharmacy);

    modifier onlyOwner() { require(msg.sender == owner, "Owner only"); _; }
    modifier onlyPharmacy() { require(approvedPharmacies[msg.sender], "Approved pharmacy only"); _; }

    constructor() { owner = msg.sender; }

    function approvePharmacy(address pharmacy, bool approved) external onlyOwner {
        require(pharmacy != address(0), "Invalid address");
        approvedPharmacies[pharmacy] = approved;
        emit PharmacyApproved(pharmacy, approved);
    }

    function receiveMedicine(string calldata medicineId) external onlyPharmacy {
        require(bytes(medicineId).length > 0, "Medicine ID required");
        bytes32 key = _key(medicineId);
        require(records[key].receivedAt == 0, "Already received by a pharmacy");
        records[key] = PharmacyRecord(medicineId, msg.sender, block.timestamp, 0, Status.Received);
        emit MedicineReceived(medicineId, msg.sender);
    }

    function markSold(string calldata medicineId) external onlyPharmacy {
        PharmacyRecord storage record = records[_key(medicineId)];
        require(record.receivedAt != 0, "Medicine not received");
        require(record.pharmacy == msg.sender, "Not the receiving pharmacy");
        require(record.status == Status.Received, "Not available for sale");
        record.status = Status.Sold;
        record.soldAt = block.timestamp;
        emit MedicineSold(medicineId, msg.sender);
    }

    function flagRecall(string calldata medicineId) external onlyOwner {
        PharmacyRecord storage record = records[_key(medicineId)];
        require(record.receivedAt != 0, "Medicine not received");
        require(record.status != Status.Sold, "Already sold; handle via recall notice");
        record.status = Status.Recalled;
        emit MedicineRecallFlagged(medicineId, record.pharmacy);
    }

    function getRecord(string calldata medicineId) external view returns (PharmacyRecord memory) {
        return records[_key(medicineId)];
    }

    function _key(string calldata medicineId) private pure returns (bytes32) {
        return keccak256(bytes(medicineId));
    }
}
