/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from "react";
import Web3 from "web3";
import { toast } from "react-hot-toast";
import { ContractFunction } from "../types";
import { Code2, PlayCircle, FileSignature } from "lucide-react";
import { getWeb3Instance } from "../utils/web3";

interface Props {
  abi: any[];
  contractAddress: string;
  account: string;
}

const ContractInteraction: React.FC<Props> = ({
  abi,
  contractAddress,
  account,
}) => {
  const [selectedFunction, setSelectedFunction] =
    useState<ContractFunction | null>(null);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<string>("");
  const [messageToSign, setMessageToSign] = useState<string>("");
  const [signature, setSignature] = useState<string>("");

  const functions = abi.filter(
    (item) => item.type === "function"
  ) as ContractFunction[];

  const getContract = useCallback(
    (web3: Web3) => {
      return new web3.eth.Contract(abi, contractAddress);
    },
    [abi, contractAddress]
  );

  const handleInputChange = (name: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const formatParameter = (value: string, type: string, web3: Web3) => {
    try {
      if (type.includes("[]")) {
        return JSON.parse(value);
      } else if (type.startsWith("uint") || type.startsWith("int")) {
        return BigInt(value).toString();
      } else if (type === "bool") {
        return value.toLowerCase() === "true";
      } else if (type === "address") {
        if (!web3.utils.isAddress(value)) {
          throw new Error(`Invalid address format for parameter`);
        }
        return value;
      } else if (type.startsWith("bytes")) {
        if (value.startsWith("0x")) {
          return value;
        }
        return web3.utils.asciiToHex(value);
      }
      return value;
    } catch {
      throw new Error(`Invalid parameter format for type ${type}`);
    }
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

  const serializeResult = (result: any): any => {
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

  const executeFunction = async () => {
    try {
      const web3 = getWeb3Instance();
      if (!selectedFunction) return;
      if (!validateInputs(web3)) return;

      const params = selectedFunction.inputs.map((input) =>
        formatParameter(inputValues[input.name], input.type, web3)
      );

      setResult("Processing...");
      const contract = getContract(web3);

      if (
        selectedFunction.stateMutability === "view" ||
        selectedFunction.stateMutability === "pure"
      ) {
        const result = await contract.methods[selectedFunction.name](
          ...params
        ).call();
        const serializedResult = serializeResult(result);
        setResult(JSON.stringify(serializedResult, null, 2));
        toast.success("Function executed successfully!");
      } else {
        if (!account) {
          toast.error("Please connect your wallet first");
          return;
        }

        const gasEstimate = await contract.methods[selectedFunction.name](
          ...params
        ).estimateGas({ from: account });

        const tx = await contract.methods[selectedFunction.name](
          ...params
        ).send({
          from: account,
          gas: Math.floor(Number(gasEstimate) * 1.2).toString(),
        });

        const serializedTx = serializeResult(tx);
        setResult(JSON.stringify(serializedTx, null, 2));
        toast.success("Transaction successful!");
      }
    } catch (error: any) {
      const errorMessage = error.message.includes("execution reverted")
        ? "Transaction failed: Contract execution reverted"
        : error.message;
      toast.error(errorMessage);
      setResult(errorMessage);
    }
  };

  const signMessage = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!messageToSign) {
      toast.error("Please enter a message to sign");
      return;
    }

    try {
      const web3 = getWeb3Instance();
      const signature = await web3.eth.personal.sign(
        messageToSign,
        account,
        ""
      );
      setSignature(signature);
      toast.success("Message signed successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getInputPlaceholder = (type: string) => {
    if (type.includes("[]")) return "Enter JSON array [...]";
    if (type.startsWith("uint") || type.startsWith("int"))
      return "Enter number";
    if (type === "bool") return "Enter true or false";
    if (type === "address") return "Enter 0x...";
    if (type.startsWith("bytes")) return "Enter hex (0x...) or text";
    return `Enter ${type}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contract Functions</h3>
          <div className="grid grid-cols-1 gap-2">
            {functions.map((func) => (
              <button
                key={func.name}
                onClick={() => {
                  setSelectedFunction(func);
                  setInputValues({});
                  setResult("");
                }}
                className={`p-3 rounded-lg text-left ${
                  selectedFunction?.name === func.name
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "bg-gray-50 hover:bg-gray-100 border-2 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  <span className="font-medium">{func.name}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {func.stateMutability === "view" ||
                  func.stateMutability === "pure"
                    ? "🔍 Read Function"
                    : "✏️ Write Function"}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Function Parameters */}
          {selectedFunction && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Function Parameters</h3>
              <div className="space-y-4">
                {selectedFunction.inputs.map((input) => (
                  <div key={input.name} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {input.name} ({input.type})
                    </label>
                    <input
                      type="text"
                      value={inputValues[input.name] || ""}
                      onChange={(e) =>
                        handleInputChange(input.name, e.target.value)
                      }
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={getInputPlaceholder(input.type)}
                    />
                    <p className="text-xs text-gray-500">
                      {input.type.includes("[]") &&
                        'Format: ["item1", "item2"] or [1, 2, 3]'}
                    </p>
                  </div>
                ))}
                <button
                  onClick={executeFunction}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlayCircle className="w-5 h-5" />
                  Execute Function
                </button>
              </div>
            </div>
          )}

          {/* Message Signing Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Message Signing</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message to Sign
                </label>
                <textarea
                  value={messageToSign}
                  onChange={(e) => setMessageToSign(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter message to sign..."
                />
              </div>
              <button
                onClick={signMessage}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                disabled={!account}
              >
                <FileSignature className="w-5 h-5" />
                Sign Message
              </button>
              {signature && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Signature
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md break-all font-mono text-sm">
                    {signature}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Result</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ContractInteraction;
