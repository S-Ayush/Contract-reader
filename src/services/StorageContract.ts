/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from "web3";
import { getWeb3Instance } from "../utils/web3";
import { SavedContract } from "../types";

const contractAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_abi",
        type: "string",
      },
      {
        internalType: "string",
        name: "_chain",
        type: "string",
      },
      {
        internalType: "bool",
        name: "_isPublic",
        type: "bool",
      },
    ],
    name: "registerSmartContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "page",
        type: "uint256",
      },
    ],
    name: "getPublicSmartContracts",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "identifier",
            type: "bytes32",
          },
          {
            internalType: "string",
            name: "contract_name",
            type: "string",
          },
          {
            internalType: "address",
            name: "contract_address",
            type: "address",
          },
          {
            internalType: "string",
            name: "contract_abi",
            type: "string",
          },
          {
            internalType: "string",
            name: "contract_chain",
            type: "string",
          },
          {
            internalType: "address",
            name: "creator",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isPublic",
            type: "bool",
          },
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
    inputs: [
      {
        internalType: "bytes32",
        name: "identifier",
        type: "bytes32",
      },
    ],
    name: "getSmartContract",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "identifier",
            type: "bytes32",
          },
          {
            internalType: "string",
            name: "contract_name",
            type: "string",
          },
          {
            internalType: "address",
            name: "contract_address",
            type: "address",
          },
          {
            internalType: "string",
            name: "contract_abi",
            type: "string",
          },
          {
            internalType: "string",
            name: "contract_chain",
            type: "string",
          },
          {
            internalType: "address",
            name: "creator",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isPublic",
            type: "bool",
          },
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
    inputs: [
      {
        internalType: "address",
        name: "creator",
        type: "address",
      },
    ],
    name: "getSmartContractsByCreator",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "identifier",
            type: "bytes32",
          },
          {
            internalType: "string",
            name: "contract_name",
            type: "string",
          },
          {
            internalType: "address",
            name: "contract_address",
            type: "address",
          },
          {
            internalType: "string",
            name: "contract_abi",
            type: "string",
          },
          {
            internalType: "string",
            name: "contract_chain",
            type: "string",
          },
          {
            internalType: "address",
            name: "creator",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isPublic",
            type: "bool",
          },
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
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "smartContracts",
    outputs: [
      {
        internalType: "bytes32",
        name: "identifier",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "contract_name",
        type: "string",
      },
      {
        internalType: "address",
        name: "contract_address",
        type: "address",
      },
      {
        internalType: "string",
        name: "contract_abi",
        type: "string",
      },
      {
        internalType: "string",
        name: "contract_chain",
        type: "string",
      },
      {
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isPublic",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

class StorageContract {
  private static web3: Web3;
  private readonly contractAddress: string =
    "0xa03fcbbe72ed1a1de989399de0a5f16c7d2e0c65";
  private readonly contractInstance: any;

  constructor() {
    if (!StorageContract.web3) {
      StorageContract.web3 = getWeb3Instance();
    }

    this.contractInstance = new StorageContract.web3.eth.Contract(
      contractAbi,
      this.contractAddress
    );
    (window as any).contract = this.contractInstance;
  }

  async getCreatorContracts(address: string): Promise<SavedContract[]> {
    try {
      const smartContracts = await this.contractInstance.methods
        .getSmartContractsByCreator(address)
        .call();
      return smartContracts?.map((sm: any) => {
        return {
          id: sm.identifier,
          name: sm.contract_name,
          address: sm.contract_address,
          abi: sm.contract_abi,
          chain: sm.contract_chain,
          isPublic: sm.isPublic,
        };
      });
    } catch (error) {
      console.error("Error fetching creator contracts:", error);
      throw error;
    }
  }

  async getSmartContract(identifier: string): Promise<SavedContract> {
    try {
      const contract = await this.contractInstance.methods
        .getSmartContract(identifier)
        .call();
      return {
        id: contract.identifier,
        name: contract.contract_name,
        address: contract.contract_address,
        abi: JSON.parse(contract.contract_abi),
        chain: contract.contract_chain,
        isPublic: contract.isPublic,
      };
    } catch (error) {
      console.error("Error fetching my smart contract:", error);
      throw error;
    }
  }

  async getPublicSmartContracts(page: number): Promise<SavedContract[]> {
    try {
      const smartContracts = await this.contractInstance.methods
        .getPublicSmartContracts(page)
        .call();

      return smartContracts?.map((sm: any) => {
        return {
          id: sm.identifier,
          name: sm.contract_name,
          address: sm.contract_address,
          abi: sm.contract_abi,
          chain: sm.contract_chain,
          isPublic: sm.isPublic,
        };
      });
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
          JSON.stringify(savedContract.abi),
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
