import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { getSavedContracts } from "../utils/storage.ts";
import ContractInteraction from "../components/ContractInteraction";
import { SavedContract } from "../types";
import { ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import StorageContract from "../services/StorageContract.ts";
import { getWalletWeb3Provider } from "../utils/web3.ts";

export default function Interact() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<SavedContract | null>(null);
  const { account } = useOutletContext<{ account: string }>();
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const contracts = getSavedContracts();
    const found = contracts.find((c) => c.id === id);
    if (found) {
      setContract(found);
    } else {
      navigate("/");
    }
  }, [id, navigate]);

  const handleRegisterOnChain = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      setIsRegistering(false);
      return;
    }
    setIsRegistering(true);
    
    try {
      if (contract) {
        const web3 = await getWalletWeb3Provider(contract?.chain);
        const txHash = await StorageContract.registerSmartContract(
          contract,
          account,
          web3
        );
        toast.success(`Contract registered successfully: ${txHash}`);
      }
    } catch (error) {
      console.error("Failed to register contract:", error);
      toast.error(`Failed to register contract: ${error.message || error}`);
    } finally {
      setIsRegistering(false);
    }
  };

  if (!contract) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {contract.name}
            </h2>
            <p className="text-sm text-gray-500 font-mono">
              {contract.address}
            </p>
          </div>
        </div>
        <button
          onClick={handleRegisterOnChain}
          disabled={isRegistering}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            isRegistering ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {isRegistering ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registering...
            </>
          ) : (
            "Register on Chain"
          )}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <ContractInteraction
          abi={contract.abi}
          contractAddress={contract.address}
          account={account}
          chain={contract.chain}
        />
      </div>
    </div>
  );
}
