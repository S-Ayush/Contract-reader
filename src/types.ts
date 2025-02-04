export interface AbiInput {
  name: string;
  type: string;
  internalType?: string;
}

export interface AbiOutput {
  name: string;
  type: string;
  internalType?: string;
}

export interface AbiFunction {
  name: string;
  type: string;
  inputs: AbiInput[];
  outputs: AbiOutput[];
  stateMutability: string;
}

export interface ContractFunction {
  name: string;
  inputs: AbiInput[];
  outputs: AbiOutput[];
  stateMutability: string;
}