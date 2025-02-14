import React, { useState } from "react";
import { PenLine, ShieldCheck } from "lucide-react";
import SignMessage from "../components/SignMessage";
import VerifySignature from "../components/VerifySignature";

const Signature = () => {
  const [mode, setMode] = useState<"sign" | "verify">("sign");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Message Signing</h2>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setMode("sign")}
            className={`${
              mode === "sign"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            <PenLine className="w-5 h-5 mr-2" />
            Sign New
          </button>
          <button
            onClick={() => setMode("verify")}
            className={`${
              mode === "verify"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            <ShieldCheck className="w-5 h-5 mr-2" />
            Verify Existing
          </button>
        </nav>
      </div>
      <div className={`space-y-6 ${mode === "verify" ? "hidden" : ""}`}>
        <SignMessage />
      </div>
      <div className={`space-y-6 ${mode === "sign" ? "hidden" : ""}`}>
        <VerifySignature />
      </div>
    </div>
  );
};

export default Signature;
