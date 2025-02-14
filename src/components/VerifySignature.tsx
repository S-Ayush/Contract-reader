import React, { useState } from "react";
import Web3 from "web3";
import { CheckCircle2, SplitSquareVertical, XCircle } from "lucide-react";

const VerifySignature = () => {
  const [recoveredAddress, setRecoveredAddress] = useState("");
  const [existingMessage, setExistingMessage] = useState("");
  const [existingSignature, setExistingSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

  const verifyExistingSignature = async () => {
    try {
      if (!existingSignature || !existingMessage) {
        alert("Please enter both message and signature");
        return;
      }

      setLoading(true);
      const web3 = new Web3();

      // Recover the signer address
      const recovered = web3.eth.accounts.recover(existingMessage, existingSignature);
      
      setRecoveredAddress(recovered);
      setVerificationResult(true);
    } catch (error) {
      console.error("Error verifying signature:", error);
      setVerificationResult(false);
      setRecoveredAddress("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message
        </label>
        <textarea
          value={existingMessage}
          onChange={(e) => setExistingMessage(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          rows={4}
          placeholder="Enter the original message..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Signature
        </label>
        <textarea
          value={existingSignature}
          onChange={(e) => setExistingSignature(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          rows={4}
          placeholder="Enter the signature..."
        />
      </div>

      <button
        onClick={verifyExistingSignature}
        disabled={!existingMessage || !existingSignature || loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <SplitSquareVertical className="w-5 h-5" />
        {loading ? "Verifying..." : "Verify Signature"}
      </button>

      {verificationResult !== null && (
        <div
          className={`mt-4 space-y-4 ${
            verificationResult ? "text-green-800" : "text-red-800"
          }`}
        >
          <div
            className={`p-4 rounded-lg flex items-center gap-2 ${
              verificationResult ? "bg-green-50" : "bg-red-50"
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

          {verificationResult && recoveredAddress && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Recovered Signer Address
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg break-all font-mono text-sm text-gray-900">
                {recoveredAddress}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifySignature;
