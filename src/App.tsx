import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Toaster } from 'react-hot-toast';
import ContractInteraction from './components/ContractInteraction';
import { Code, Wallet, Link } from 'lucide-react';
import toast from 'react-hot-toast';

const ETHEREUM_RPC = 'https://sepolia.infura.io';

function App() {
  const [web3Instance, setWeb3Instance] = useState<Web3>(new Web3(ETHEREUM_RPC));
  const [contractAddress, setContractAddress] = useState('');
  const [abi, setAbi] = useState('');
  const [isValidAbi, setIsValidAbi] = useState(false);
  const [parsedAbi, setParsedAbi] = useState<any[]>([]);
  const [account, setAccount] = useState<string>('');

  useEffect(() => {
    // Check if MetaMask is already connected
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setWeb3Instance(new Web3(window.ethereum));
          }
        })
        .catch(console.error);
    }
  }, []);

  const handleAbiChange = (value: string) => {
    setAbi(value);
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setParsedAbi(parsed);
        setIsValidAbi(true);
      } else {
        setIsValidAbi(false);
      }
    } catch {
      setIsValidAbi(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAccount(accounts[0]);
        const newWeb3 = new Web3(window.ethereum);
        setWeb3Instance(newWeb3);
        toast.success('Wallet connected successfully!');
      } catch (error: any) {
        toast.error(error.message || 'Failed to connect wallet');
      }
    } else {
      toast.error('Please install MetaMask or another Web3 wallet');
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setWeb3Instance(new Web3(ETHEREUM_RPC));
    toast.success('Wallet disconnected');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Smart Contract Interface</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Connected to Ethereum Mainnet
              </div>
              {!account ? (
                <button
                  onClick={connectWallet}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Link className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {`${account.slice(0, 6)}...${account.slice(-4)}`}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Contract Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contract Address</label>
              <div className="mt-1">
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0x..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contract ABI</label>
              <div className="mt-1">
                <textarea
                  value={abi}
                  onChange={(e) => handleAbiChange(e.target.value)}
                  rows={5}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="[{...}]"
                />
              </div>
              {abi && !isValidAbi && (
                <p className="mt-1 text-sm text-red-600">Please enter a valid JSON ABI array</p>
              )}
            </div>
          </div>

          {/* Contract Interaction Section */}
          {isValidAbi && contractAddress && (
            <ContractInteraction
              abi={parsedAbi}
              contractAddress={contractAddress}
              web3={web3Instance}
              account={account}
            />
          )}

          {/* Empty State */}
          {(!isValidAbi || !contractAddress) && (
            <div className="text-center py-12">
              <Code className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Contract Connected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter a contract address and ABI to start interacting with the smart contract.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;