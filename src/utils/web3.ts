/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from "web3";
import { availableChains } from "./helpers";

export const getWeb3Instance = (
  chain: string = "ethereum_testnet",
  provider: "https_rpc" | "wss_rpc" = "https_rpc"
) => {
  const rpcUrl =
    availableChains[chain as keyof typeof availableChains][provider];
  if(provider === 'wss_rpc'){
    return new Web3(new Web3.providers.WebsocketProvider(rpcUrl));
  }
  return new Web3(new Web3.providers.HttpProvider(rpcUrl));
};

export const getInputPlaceholder = (type: string) => {
  if (type.includes("[]")) return "Enter JSON array [...]";
  if (type.startsWith("uint") || type.startsWith("int")) return "Enter number";
  if (type === "bool") return "Enter true or false";
  if (type === "address") return "Enter 0x...";
  if (type.startsWith("bytes")) return "Enter hex (0x...) or text";
  return `Enter ${type}`;
};

export const formatParameter = (value: string, type: string, web3: Web3) => {
  try {
    if (type.includes("[]")) return JSON.parse(value);
    if (type.startsWith("uint") || type.startsWith("int"))
      return BigInt(value).toString();
    if (type === "bool") return value.toLowerCase() === "true";
    if (type === "address") {
      if (!web3.utils.isAddress(value))
        throw new Error(`Invalid address format`);
      return value;
    }
    if (type.startsWith("bytes"))
      return value.startsWith("0x") ? value : web3.utils.asciiToHex(value);
    return value;
  } catch {
    throw new Error(`Invalid parameter format for type ${type}`);
  }
};

export const serializeResult = (result: any): any => {
  if (result === null || result === undefined) {
    return result;
  }

  if (typeof result === "bigint") {
    return result.toString();
  }

  if (Array.isArray(result)) {
    return result.map((item) => serializeResult(item));
  }

  if (typeof result === "object") {
    const serialized: { [key: string]: any } = {};
    for (const key in result) {
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        serialized[key] = serializeResult(result[key]);
      }
    }
    return serialized;
  }

  return result;
};
