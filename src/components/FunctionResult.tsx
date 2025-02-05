/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from "react";
import { ContractFunction } from "../types";
import toast from "react-hot-toast";
import {
  formatParameter,
  getInputPlaceholder,
  getWeb3Instance,
  serializeResult,
} from "../utils/web3";
import Web3 from "web3";
import {
  PlayCircle,
  Settings2,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { availableChains } from "../utils/helpers";

interface Props {
  abi: any[];
  contractAddress: string;
  selectedFunction: ContractFunction;
  chain: string;
  account: string;
}

const FunctionResult: React.FC<Props> = ({
  abi,
  contractAddress,
  chain,
  account,
  selectedFunction,
}) => {
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");

  const getContract = useCallback(
    (web3: Web3) => {
      return new web3.eth.Contract(abi, contractAddress);
    },
    [abi, contractAddress]
  );

  const handleInputChange = (name: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const validateInputs = (web3: Web3) => {
    if (!selectedFunction) return false;

    try {
      selectedFunction.inputs.forEach((input) => {
        const value = inputValues[input.name];
        if (value === undefined || value === "") {
          throw new Error(`Parameter ${input.name} is required`);
        }
        formatParameter(value, input.type, web3);
      });
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const executeFunction = async () => {
    try {
      setIsProcessing(true);
      setStatus("processing");
      let web3 = getWeb3Instance(chain);
      if (!selectedFunction) return;
      if (!validateInputs(web3)) {
        setIsProcessing(false);
        setStatus("error");
        return;
      }

      const params = selectedFunction.inputs.map((input) =>
        formatParameter(inputValues[input.name], input.type, web3)
      );

      setResult("Processing...");

      if (
        selectedFunction.stateMutability === "view" ||
        selectedFunction.stateMutability === "pure"
      ) {
        const contract = getContract(web3);
        const result = await contract.methods[selectedFunction.name](
          ...params
        ).call();
        const serializedResult = serializeResult(result);
        setResult(JSON.stringify(serializedResult, null, 2));
        toast.success("Function executed successfully!");
        setStatus("success");
      } else {
        if (!account) {
          toast.error("Please connect your wallet first");
          setStatus("error");
          setIsProcessing(false);
          return;
        }

        const provider = (window as any).ethereum;
        web3 = new Web3(provider);
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
                    availableChains[chain as keyof typeof availableChains]
                      .chainId,
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
        }

        const contract = getContract(web3);

        const tx = await contract.methods[selectedFunction.name](
          ...params
        ).send({
          from: account,
        });

        const serializedTx = serializeResult(tx);
        setResult(JSON.stringify(serializedTx, null, 2));
        toast.success("Transaction successful!");
        setStatus("success");
      }
    } catch (error: any) {
      console.error("error", error);
      const errorMessage = error.message.includes("execution reverted")
        ? "Transaction failed: Contract execution reverted"
        : error.message;
      toast.error(errorMessage);
      setResult(errorMessage);
      setStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <PlayCircle className="w-5 h-5" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "processing":
        return "Processing...";
      case "success":
        return "Execute Again";
      case "error":
        return "Try Again";
      default:
        return "Execute Function";
    }
  };

  useEffect(() => {
    setStatus("idle");
  }, [selectedFunction.name]);

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-lg p-6">
      {/* Function Info */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-purple-100">
            <Settings2 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{selectedFunction.name}</h3>
            <p className="text-sm text-gray-600">
              {selectedFunction.stateMutability} function
              {selectedFunction.inputs.length > 0 &&
                ` with ${selectedFunction.inputs.length} parameter${
                  selectedFunction.inputs.length === 1 ? "" : "s"
                }`}
            </p>
          </div>
        </div>
        {!selectedFunction.stateMutability.includes("view") &&
          !selectedFunction.stateMutability.includes("pure") && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
              <ArrowRight className="w-4 h-4" />
              Requires wallet
            </div>
          )}
      </div>

      {/* Function Parameters */}
      {selectedFunction.inputs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-semibold">Function Parameters</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedFunction.inputs.map((input) => (
              <div key={input.name} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {input.name}{" "}
                  <span className="text-gray-500">({input.type})</span>
                </label>
                <input
                  type="text"
                  value={inputValues[input.name] || ""}
                  onChange={(e) =>
                    handleInputChange(input.name, e.target.value)
                  }
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder={getInputPlaceholder(input.type)}
                  disabled={isProcessing}
                />
                {input.type.includes("[]") && (
                  <p className="text-xs text-gray-500">
                    Format: ["item1", "item2"] or [1, 2, 3]
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execute Button */}
      <button
        onClick={executeFunction}
        disabled={isProcessing}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
          isProcessing
            ? "bg-gray-400 cursor-not-allowed"
            : status === "error"
            ? "bg-red-600 hover:bg-red-700"
            : "bg-purple-600 hover:bg-purple-700"
        } text-white`}
      >
        {getStatusIcon()}
        {getStatusText()}
      </button>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Result
              <span
                className={`px-2 py-1 text-sm rounded-full ${
                  status === "success"
                    ? "bg-green-100 text-green-800"
                    : status === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {status === "success"
                  ? "Success"
                  : status === "error"
                  ? "Error"
                  : "Processing"}
              </span>
            </h3>
          </div>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96 relative">
            <pre className="text-sm">{result}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionResult;
