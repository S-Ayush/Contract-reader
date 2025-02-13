import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { deleteContract, getSavedContracts } from "../utils/storage.ts";
import ContractInteraction from "../components/ContractInteraction";
import { SavedContract } from "../types";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import StorageContract from "../services/StorageContract.ts";
import { getWalletWeb3Provider } from "../utils/web3.ts";
import PrivacyModal from "../components/PrivacyModal.tsx";

export default function Interact() {
  const { id, visibility } = useParams<{ id: string; visibility: "local" }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<SavedContract | null>(null);
  const { account } = useOutletContext<{ account: string }>();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [selectedPrivacy, setSelectedPrivacy] = useState<
    "public" | "private" | null
  >(null);

  const getContract = async () => {
    let _contract: SavedContract;
    if (visibility === "local") {
      const contracts = getSavedContracts();
      _contract = contracts.find((c) => c.id === id) as SavedContract;
    } else {
      _contract = await StorageContract.getSmartContract(id as string);
    }
    if (_contract) {
      setContract(_contract);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    if (id) {
      getContract();
    }
  }, [id, visibility]);

  const handleRegisterOnChain = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }
    setShowPrivacyModal(true);
  };

  const handleConfirmRegistration = async () => {
    if (!selectedPrivacy) {
      toast.error("Please select a privacy option");
      return;
    }
    setIsRegistering(true);
    setShowPrivacyModal(false);

    try {
      if (contract) {
        const web3 = await getWalletWeb3Provider("ethereum_testnet");
        const txHash = await StorageContract.registerSmartContract(
          { ...contract, isPublic: selectedPrivacy === "public" },
          account,
          web3
        );
        deleteContract(contract.id);
        toast.success(`Contract registered successfully: ${txHash}`);
        navigate(`/interact/${contract.id}`);
      }
    } catch (error) {
      console.error("Failed to register contract:", error);
      toast.error(`Failed to register contract: ${error.message || error}`);
    } finally {
      setIsRegistering(false);
      setSelectedPrivacy(null);
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
        {visibility === "local" ? (
          <button
            onClick={handleRegisterOnChain}
            disabled={isRegistering}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isRegistering ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Register on Chain
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">On-Chain</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md">
        {contract && (
          <ContractInteraction
            abi={contract.abi}
            contractAddress={contract.address}
            account={account}
            chain={contract.chain}
          />
        )}
      </div>

      {/* Privacy Selection Modal */}
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => {
          setShowPrivacyModal(false);
          setSelectedPrivacy(null);
        }}
        onConfirm={handleConfirmRegistration}
        selectedPrivacy={selectedPrivacy}
        setSelectedPrivacy={setSelectedPrivacy}
      />
    </div>
  );
}
