// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SmartContractRegistry {
    // Struct to store the details of each contract
    struct SmartContractDetails {
        bytes32 identifier;
        string contract_name;
        address contract_address;
        string contract_abi;
        string contract_chain;
        address creator;
        bool isPublic; // Flag to indicate if the contract is public or private
    }

    // Mapping to store smart contract details by a unique identifier (creator_hash + contract_address)
    mapping(bytes32 => SmartContractDetails) public smartContracts;

    // Mapping to store all contract identifiers by the creator's address
    mapping(address => bytes32[]) private creatorContracts;

    // Array to store public contract identifiers
    bytes32[] private publicContractIdentifiers;

    // Function to register a smart contract
    function registerSmartContract(
        address _address,
        string memory _name,
        string memory _abi,
        string memory _chain,
        bool _isPublic
    ) public {
        // Create a unique identifier by hashing the creator address and the contract address
        bytes32 identifier = keccak256(abi.encodePacked(msg.sender, _address));

        // Store the contract details
        smartContracts[identifier] = SmartContractDetails({
            identifier: identifier,
            contract_name: _name,
            contract_address: _address,
            contract_abi: _abi,
            contract_chain: _chain,
            creator: msg.sender,
            isPublic: _isPublic
        });

        // Add the identifier to the creator's list of contracts
        creatorContracts[msg.sender].push(identifier);

        // Add the identifier to the creator's list of contracts
        if (_isPublic) {
            publicContractIdentifiers.push(identifier);
        }
    }

    // Function to get private or public smart contract details
    function getSmartContract(
        bytes32 identifier
    ) public view returns (SmartContractDetails memory) {
        return smartContracts[identifier];
    }

    // Function to get all the smart contracts (public & private) created by a specific creator (only accessible by the creator)
    function getSmartContractsByCreator(
        address creator
    ) public view returns (SmartContractDetails[] memory) {
        bytes32[] memory contractIdentifiers = creatorContracts[creator];
        SmartContractDetails[] memory contracts = new SmartContractDetails[](
            contractIdentifiers.length
        );

        for (uint256 i = 0; i < contractIdentifiers.length; i++) {
            contracts[i] = smartContracts[contractIdentifiers[i]];
        }

        return contracts;
    }

    // Function to get all public smart contracts
    function getPublicSmartContracts(
        uint256 page
    ) public view returns (SmartContractDetails[] memory) {
        uint16 limit = 20;
        uint256 totalPublic = publicContractIdentifiers.length;
        uint256 offset = page * limit;

        // Ensure offset does not exceed totalPublic
        if (offset >= totalPublic) {
            return new SmartContractDetails[](0);
        }

        // Determine fetch size properly
        uint256 fetchSize = (offset + limit > totalPublic)
            ? totalPublic - offset
            : limit;
        SmartContractDetails[]
            memory publicContracts = new SmartContractDetails[](fetchSize);

        for (uint256 i = 0; i < fetchSize; i++) {
            publicContracts[i] = smartContracts[
                publicContractIdentifiers[offset + i]
            ];
        }

        return publicContracts;
    }
}
