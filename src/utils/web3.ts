/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from "web3";
import { availableChains } from "./helpers";
import toast from "react-hot-toast";

export const getWeb3Instance = (
  chain: string = "ethereum_testnet",
  provider: "https_rpc" | "wss_rpc" = "https_rpc"
) => {
  const rpcUrl =
    availableChains[chain as keyof typeof availableChains][provider];
  if (provider === "wss_rpc") {
    return new Web3(new Web3.providers.WebsocketProvider(rpcUrl));
  }
  return new Web3(new Web3.providers.HttpProvider(rpcUrl));
};

export const getInputPlaceholder = (type: string) => {
  if (type.includes("[]")) return "Enter JSON array [...]";
  if (type.startsWith("uint") || type.startsWith("int")) return "Enter number";
  if (type === "bool") return "Enter true or false";
  if (type === "address") return "Enter 0x...";
  if (type === "bytes32") return "Enter text or hex (0x...)";
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
    if (type === "bytes32") {
      if (value.startsWith("0x")) {
        // Ensure it's exactly 32 bytes
        if (web3.utils.hexToBytes(value).length !== 32)
          throw new Error("Invalid bytes32 value, must be 32 bytes long");
        return value;
      }
      // Convert to bytes32
      const hexValue = web3.utils.utf8ToHex(value);
      if (web3.utils.hexToBytes(hexValue).length > 32)
        throw new Error("String is too long for bytes32 (max 32 bytes)");
      return web3.utils.padRight(hexValue, 64); // Ensures it's 32 bytes
    }
    if (type.startsWith("bytes")) return web3.utils.asciiToHex(value);
    return value;
  } catch (error) {
    throw new Error(
      `Invalid parameter format for type ${type}: ${error.message}`
    );
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

export const getWalletWeb3Provider = async (chain: string) => {
  const provider = (window as any).ethereum;
  const web3 = new Web3(provider);
  const currentChainId = await provider.request({
    method: "eth_chainId",
  });
  if (
    currentChainId !==
    availableChains[chain as keyof typeof availableChains].chainId
  ) {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId:
              availableChains[chain as keyof typeof availableChains].chainId,
          },
        ],
      });
      toast.success(
        `Switched to the ${
          availableChains[chain as keyof typeof availableChains].name
        } network.`
      );
    } catch {
      toast.error(
        `Failed to switch to the ${
          availableChains[chain as keyof typeof availableChains].name
        } network.`
      );
    }
    return web3;
  }
  return web3;
};
