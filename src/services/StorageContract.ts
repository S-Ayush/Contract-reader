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
      { internalType: "bool", name: "_isPublic", type: "bool" },
    ],
    name: "registerSmartContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "identifier", type: "bytes32" }],
    name: "getMySmartContract",
    outputs: [
      {
        components: [
          { internalType: "string", name: "contract_name", type: "string" },
          { internalType: "address", name: "contract_address", type: "address" },
          { internalType: "string", name: "contract_abi", type: "string" },
          { internalType: "string", name: "contract_chain", type: "string" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "bool", name: "isPublic", type: "bool" },
        ],
        internalType: "struct SmartContractRegistry.SmartContractDetails",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "identifier", type: "bytes32" }],
    name: "getPublicSmartContract",
    outputs: [
      {
        components: [
          { internalType: "string", name: "contract_name", type: "string" },
          { internalType: "address", name: "contract_address", type: "address" },
          { internalType: "string", name: "contract_abi", type: "string" },
          { internalType: "string", name: "contract_chain", type: "string" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "bool", name: "isPublic", type: "bool" },
        ],
        internalType: "struct SmartContractRegistry.SmartContractDetails",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "page", type: "uint256" }],
    name: "getPublicSmartContracts",
    outputs: [
      {
        components: [
          { internalType: "string", name: "contract_name", type: "string" },
          { internalType: "address", name: "contract_address", type: "address" },
          { internalType: "string", name: "contract_abi", type: "string" },
          { internalType: "string", name: "contract_chain", type: "string" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "bool", name: "isPublic", type: "bool" },
        ],
        internalType: "struct SmartContractRegistry.SmartContractDetails[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSmartContractsByCreator",
    outputs: [
      {
        components: [
          { internalType: "string", name: "contract_name", type: "string" },
          { internalType: "address", name: "contract_address", type: "address" },
          { internalType: "string", name: "contract_abi", type: "string" },
          { internalType: "string", name: "contract_chain", type: "string" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "bool", name: "isPublic", type: "bool" },
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
  private readonly contractAddress: string = "0x32c574de9459f4581f13a6544b8995cdf99aca93";
  private readonly contractInstance: any;

  constructor() {
    if (!StorageContract.web3) {
      StorageContract.web3 = getWeb3Instance();
    }

    this.contractInstance = new StorageContract.web3.eth.Contract(contractAbi, this.contractAddress);
  }

  async getCreatorContracts(): Promise<any[]> {
    try {
      return await this.contractInstance.methods.getSmartContractsByCreator().call();
    } catch (error) {
      console.error("Error fetching creator contracts:", error);
      throw error;
    }
  }

  async getMySmartContract(identifier: string): Promise<any> {
    try {
      return await this.contractInstance.methods.getMySmartContract(identifier).call();
    } catch (error) {
      console.error("Error fetching my smart contract:", error);
      throw error;
    }
  }

  async getPublicSmartContract(identifier: string): Promise<any> {
    try {
      return await this.contractInstance.methods.getPublicSmartContract(identifier).call();
    } catch (error) {
      console.error("Error fetching public smart contract:", error);
      throw error;
    }
  }

  async getPublicSmartContracts(page: number): Promise<any[]> {
    try {
      return await this.contractInstance.methods.getPublicSmartContracts(page).call();
    } catch (error) {
      console.error("Error fetching public smart contracts:", error);
      throw error;
    }
  }

  async registerSmartContract(
    savedContract: SavedContract,
    creatorAddress: string,
    web3: Web3
  ): Promise<string> {
    try {
      const contract = new web3.eth.Contract(contractAbi, this.contractAddress);

      const tx = await contract.methods
        .registerSmartContract(
          savedContract.address,
          savedContract.name,
          savedContract.abi.toString(),
          savedContract.chain,
          savedContract.isPublic === true
        )
        .send({ from: creatorAddress });

      console.log("Contract Registered. Transaction Hash:", tx.transactionHash);
      return tx.transactionHash;
    } catch (error) {
      console.error("Error registering contract:", error);
      throw error;
    }
  }
}

export default new StorageContract();
