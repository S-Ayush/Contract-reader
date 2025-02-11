/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from "web3";
import { getWeb3Instance } from "../utils/web3";
import { SavedContract } from "../types";

const contractAbi = [
  {
    inputs: [
      { internalType: "address", name: "_address", type: "address" },
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_abi", type: "string" },
      { internalType: "string", name: "_chain", type: "string" },
    ],
    name: "registerSmartContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_creator", type: "address" }],
    name: "getSmartContractsByCreator",
    outputs: [
      {
        components: [
          { internalType: "string", name: "contract_name", type: "string" },
          {
            internalType: "address",
            name: "contract_address",
            type: "address",
          },
          { internalType: "string", name: "contract_abi", type: "string" },
          { internalType: "string", name: "contract_chain", type: "string" },
          { internalType: "address", name: "creator", type: "address" },
        ],
        internalType: "struct SmartContractRegistry.SmartContractDetails[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

class StorageContract {
  private static web3: Web3;
  private readonly contractAddress: string =
    "0x7aa76d39df4132975dbbf23c9bfe9cd6638ba721";
  private readonly contractInstance: any;

  constructor() {
    // Initialize Web3 only once for read operations
    if (!StorageContract.web3) {
      StorageContract.web3 = getWeb3Instance();
    }

    // Initialize the contract instance
    this.contractInstance = new StorageContract.web3.eth.Contract(
      contractAbi,
      this.contractAddress
    );
  }

  /**
   * Fetch all smart contracts created by a specific creator
   * @param creatorAddress - The Ethereum address of the creator
   * @returns {Promise<any[]>} - Array of smart contracts
   */
  async getCreatorContracts(creatorAddress: string): Promise<any[]> {
    try {
      const contracts = await this.contractInstance.methods
        .getSmartContractsByCreator(creatorAddress)
        .call();
      console.log("Fetched Contracts:", contracts);
      return contracts;
    } catch (error) {
      console.error("Error fetching contracts:", error);
      throw error;
    }
  }

  /**
   * Registers a new smart contract on the blockchain
   * @param contract - Contract to be deployed
   * @param creatorAddress - address of the creator
   * @param web3 - web3 instance of wallet
   * @returns {Promise<string>} - Transaction hash of the operation
   */
  async registerSmartContract(
    savedContract: SavedContract,
    creatorAddress: string,
    web3: Web3
  ): Promise<string> {
    try {
      // Create contract instance with MetaMask provider
      const contract = new web3.eth.Contract(contractAbi, this.contractAddress);

      // Send transaction
      const tx = await contract.methods
        .registerSmartContract(
          savedContract.address,
          savedContract.name,
          savedContract.abi.toString(),
          savedContract.chain
        )
        .send({
          from: creatorAddress,
        });

      console.log("Contract Registered. Transaction Hash:", tx.transactionHash);
      return tx.transactionHash;
    } catch (error) {
      console.error("Error registering contract:", error);
      throw error;
    }
  }
}

export default new StorageContract();
