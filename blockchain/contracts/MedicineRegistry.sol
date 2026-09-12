// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MedicineRegistry {

    struct Medicine {
        string id;
        string name;
        string batchNumber;
        string manufacturer;
        string manufacturingDate;
        string expiryDate;
        address registeredBy;
        bool exists;
    }

    mapping(string => Medicine) private medicines;

    event MedicineRegistered(
        string id,
        string name,
        string batchNumber,
        address registeredBy
    );

    function addMedicine(
        string memory _id,
        string memory _name,
        string memory _batchNumber,
        string memory _manufacturer,
        string memory _manufacturingDate,
        string memory _expiryDate
    ) public {
        require(!medicines[_id].exists, "Medicine already registered");

        medicines[_id] = Medicine(
            _id,
            _name,
            _batchNumber,
            _manufacturer,
            _manufacturingDate,
            _expiryDate,
            msg.sender,
            true
        );

        emit MedicineRegistered(
            _id,
            _name,
            _batchNumber,
            msg.sender
        );
    }

    function verifyMedicine(string memory _id)
        public
        view
        returns (bool)
    {
        return medicines[_id].exists;
    }

    function getMedicine(string memory _id)
        public
        view
        returns (Medicine memory)
    {
        require(medicines[_id].exists, "Medicine not found");

        return medicines[_id];
    }
}