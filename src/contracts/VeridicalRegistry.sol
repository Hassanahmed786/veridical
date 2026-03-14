// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VeridicalRegistry {

    struct CrimeRecord {
        string  eventId;        // matches crimes.json id
        string  contentHash;    // keccak256 of the full JSON entry
        address submittedBy;
        uint256 submittedAt;    // block.timestamp
        uint256 upvotes;
        bool    exists;
    }

    mapping(string => CrimeRecord) public records;
    mapping(string => mapping(address => bool)) public hasUpvoted;

    string[] public allRecordIds;

    event RecordSubmitted(string indexed eventId, address indexed submitter, uint256 timestamp);
    event RecordUpvoted(string indexed eventId, address indexed voter, uint256 newTotal);

    function submitRecord(string calldata eventId, string calldata contentHash) external {
        require(!records[eventId].exists, "Record already exists");
        records[eventId] = CrimeRecord({
            eventId:     eventId,
            contentHash: contentHash,
            submittedBy: msg.sender,
            submittedAt: block.timestamp,
            upvotes:     0,
            exists:      true
        });
        allRecordIds.push(eventId);
        emit RecordSubmitted(eventId, msg.sender, block.timestamp);
    }

    function upvoteRecord(string calldata eventId) external {
        require(records[eventId].exists, "Record not found");
        require(!hasUpvoted[eventId][msg.sender], "Already upvoted");
        hasUpvoted[eventId][msg.sender] = true;
        records[eventId].upvotes++;
        emit RecordUpvoted(eventId, msg.sender, records[eventId].upvotes);
    }

    function getRecord(string calldata eventId) external view
        returns (CrimeRecord memory) {
        return records[eventId];
    }

    function getTotalRecords() external view returns (uint256) {
        return allRecordIds.length;
    }
}