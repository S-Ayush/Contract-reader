import Web3 from "web3"
import { availableChains } from "./helpers";

export const getWeb3Instance = (chain:string = 'ethereum_testnet') => {
    const rpcUrl = availableChains[chain as keyof typeof availableChains].https_rpc;
   return new Web3(rpcUrl);
}