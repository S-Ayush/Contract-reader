import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Code } from "lucide-react";
import { saveContract } from "../utils/storage.ts";
import toast from "react-hot-toast";
import { availableChains } from "../utils/helpers.ts";

export default function Register() {
  const [name, setName] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [abi, setAbi] = useState("");
  const [chain, setChain] = useState<string>("");
  const [isValidAbi, setIsValidAbi] = useState(false);
  const navigate = useNavigate();

  const handleAbiChange = (value: string) => {
    setAbi(value);
    try {
      const parsed = JSON.parse(value);
      setIsValidAbi(Array.isArray(parsed));
    } catch {
      setIsValidAbi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a contract name");
      return;
    }

    if (!contractAddress.trim()) {
      toast.error("Please enter a contract address");
      return;
    }

    if (!isValidAbi) {
      toast.error("Please enter a valid ABI");
      return;
    }

    if (!chain) {
      toast.error("Please select a valid chain");
      return;
    }

    try {
      const parsedAbi = JSON.parse(abi);
      saveContract({
        name: name.trim(),
        address: contractAddress.trim(),
        abi: parsedAbi,
        chain,
      });
      toast.success("Contract saved successfully");
      navigate("/");
    } catch {
      toast.error("Failed to save contract");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Code className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Register New Contract
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contract Name*
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="My Token Contract"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contract Address*
            </label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0x..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contract ABI*
            </label>
            <textarea
              value={abi}
              onChange={(e) => handleAbiChange(e.target.value)}
              rows={10}
              className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="[{...}]"
            />
            {abi && !isValidAbi && (
              <p className="mt-1 text-sm text-red-600">
                Please enter a valid JSON ABI array
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Chain*
            </label>
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option disabled={!!chain}>Select Chain</option>
              {Object.entries(availableChains).map(([key, { name }]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Contract
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
