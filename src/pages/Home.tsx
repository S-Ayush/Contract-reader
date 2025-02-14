import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Code2, Blocks, Globe } from "lucide-react";
import { SavedContract } from "../types";
import { getSavedContracts, deleteContract } from "../utils/storage.ts";
import toast from "react-hot-toast";
import StorageContract from "../services/StorageContract.ts";
import ContractCard from "../components/ContractCard.tsx";

export default function Home() {
  const [publicContracts, setPublicContracts] = useState<SavedContract[]>([]);
  const [localContracts, setLocalContracts] = useState<SavedContract[]>([]);
  const [onChainContracts, setOnChainContracts] = useState<SavedContract[]>([]);
  const { account } = useOutletContext<{ account: string }>();

  const [activeTab, setActiveTab] = useState<"public" | "local" | "onchain">(
    "local"
  );
  const navigate = useNavigate();

  const contracts = useMemo(() => {
    if (activeTab === "local") {
      return localContracts;
    }
    if (activeTab === "onchain") {
      return onChainContracts;
    }
    if (activeTab === "public") {
      return publicContracts;
    }
    return [];
  }, [activeTab, localContracts, onChainContracts, publicContracts]);

  const handleDelete = (id?: string) => {
    if (
      id &&
      window.confirm("Are you sure you want to delete this contract?")
    ) {
      deleteContract(id);
      setLocalContracts(getSavedContracts());
      toast.success("Contract deleted successfully");
    }
  };

  const handleTabChange = async (tab: "public" | "local" | "onchain") => {
    setActiveTab(tab);
    if (tab === "local") {
      setLocalContracts(getSavedContracts());
    }
    if (tab === "public" && !publicContracts.length) {
      const _publicContracts = await StorageContract.getPublicSmartContracts(0);
      setPublicContracts(_publicContracts);
    }
    if (tab === "onchain" && !onChainContracts.length) {
      const _onChainContracts = await StorageContract.getCreatorContracts(
        account
      );
      setOnChainContracts(_onChainContracts);
    }
  };

  useEffect(() => {
    handleTabChange("local");
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Saved Contracts</h2>
        <button
          onClick={() => navigate("/register")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Register New Contract
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => handleTabChange("public")}
            className={`${
              activeTab === "public"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            <Globe className="w-5 h-5 mr-2" />
            Public Contracts
          </button>
          <button
            onClick={() => handleTabChange("local")}
            className={`${
              activeTab === "local"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            <Code2 className="w-5 h-5 mr-2" />
            My Local Contracts
          </button>
          <button
            onClick={() => handleTabChange("onchain")}
            className={`${
              activeTab === "onchain"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            <Blocks className="w-5 h-5 mr-2" />
            My On-chain Contracts
          </button>
        </nav>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Code2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No {activeTab === "local" ? "local" : "on-chain"} contracts
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by registering a new smart contract.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" key={activeTab}>
          {contracts.map((contract) => (
            <ContractCard
              contract={contract}
              navigate={navigate}
              handleDelete={activeTab === "local" ? handleDelete : undefined}
              key={contract.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
