import Web3 from "web3"

const ETHEREUM_RPC =
  "https://eth-sepolia.g.alchemy.com/v2/-0kvC2T8jXtU7tcws_2_C5loJbiqlBtt";

export const getWeb3Instance = () => {
   return new Web3(ETHEREUM_RPC);
}