import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Code2, Trash2, Blocks, Globe } from "lucide-react";
import { SavedContract } from "../types";
import { getSavedContracts, deleteContract } from "../utils/storage.ts";
import toast from "react-hot-toast";

export default function Home() {
  const [contracts, setContracts] = useState<SavedContract[]>([]);
  const [activeTab, setActiveTab] = useState<"public" | "local" | "onchain">(
    "public"
  );
  const navigate = useNavigate();

  useEffect(() => {
    setContracts(getSavedContracts());
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this contract?")) {
      deleteContract(id);
      setContracts(getSavedContracts());
      toast.success("Contract deleted successfully");
    }
  };

  const filteredContracts = contracts;
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
            onClick={() => setActiveTab("public")}
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
            onClick={() => setActiveTab("local")}
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
            onClick={() => setActiveTab("onchain")}
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

      {filteredContracts.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    {contract ? (
                      <Blocks className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Code2 className="w-5 h-5 text-blue-600" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {contract.name}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(contract.id);
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600 font-mono break-all">
                  {contract.address}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Added {new Date(contract.createdAt).toLocaleDateString()}
                </p>
                <button
                  onClick={() => navigate(`/interact/${contract.id}`)}
                  className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                >
                  Interact
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
