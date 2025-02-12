import React from "react";

import { Eye, EyeOff, X } from "lucide-react";

type PrivacyLevel = "public" | "private" | null;

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedPrivacy: PrivacyLevel;
  setSelectedPrivacy: (value: PrivacyLevel) => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedPrivacy,
  setSelectedPrivacy,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Select Privacy Level
        </h3>

        <div className="space-y-4">
          {["public", "private"].map((privacy) => (
            <button
              key={privacy}
              onClick={() => setSelectedPrivacy(privacy as PrivacyLevel)}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                selectedPrivacy === privacy
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 hover:border-indigo-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                {privacy === "public" ? (
                  <Eye
                    className={`w-5 h-5 ${
                      selectedPrivacy === "public"
                        ? "text-indigo-600"
                        : "text-gray-400"
                    }`}
                  />
                ) : (
                  <EyeOff
                    className={`w-5 h-5 ${
                      selectedPrivacy === "private"
                        ? "text-indigo-600"
                        : "text-gray-400"
                    }`}
                  />
                )}
                <div className="text-left">
                  <p className="font-medium text-gray-900">
                    {privacy.charAt(0).toUpperCase() + privacy.slice(1)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {privacy === "public"
                      ? "Visible to everyone on the network"
                      : "Only visible to you"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onConfirm}
          disabled={!selectedPrivacy}
          className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Registration
        </button>
      </div>
    </div>
  );
};

export default PrivacyModal;
