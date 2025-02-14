/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Web3 from "web3";
import { CheckCircle2, FileSignature, XCircle } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import { getWalletWeb3Provider } from "../utils/web3";

const SignMessage = () => {
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [signerAddress, setSignerAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null
  );

  const { account } = useOutletContext<{ account: string }>();

  const handleSignMessage = async () => {
    try {
      if (!account) {
        toast.error("Please connect your wallet first");
        return;
      }
      setLoading(true);
      const web3 = await getWalletWeb3Provider("ethereum_testnet");

      const signatureResult = await web3.eth.personal.sign(
        message,
        account,
        ""
      );

      setSignature(signatureResult);
      setSignerAddress(account);
      setVerificationResult(null);
    } catch (error) {
      console.error("Error signing message:", error);
      alert("Error signing message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifySignature = async () => {
    try {
      if (!signature || !message) {
        alert("Please sign a message first");
        return;
      }

      setLoading(true);
      const web3 = new Web3(); // Instantiate Web3 without a provider for local computation
      const recovered = web3.eth.accounts.recover(message, signature);
      const isValid = recovered.toLowerCase() === signerAddress.toLowerCase();
      setVerificationResult(isValid);
    } catch (error) {
      console.error("Error verifying signature:", error);
      alert("Error verifying signature. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message to Sign
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          rows={4}
          placeholder="Enter your message here..."
        />
      </div>

      <button
        onClick={handleSignMessage}
        disabled={!message || loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <FileSignature className="w-5 h-5" />
        {loading ? "Signing..." : "Sign Message"}
      </button>

      {signature && (
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Signature
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg break-all font-mono text-sm">
              {signature}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Signer Address
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg break-all font-mono text-sm">
              {signerAddress}
            </div>
          </div>

          <button
            onClick={verifySignature}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              "Verifying..."
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Verify Signature
              </>
            )}
          </button>

          {verificationResult !== null && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
                verificationResult
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {verificationResult ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Signature is valid!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span>Invalid signature!</span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SignMessage;
