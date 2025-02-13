import React from "react";
import { SavedContract } from "../types";
import { Blocks, Code2, Trash2 } from "lucide-react";
import { NavigateFunction } from "react-router-dom";

const ContractCard = ({
  contract,
  handleDelete,
  navigate,
}: {
  contract: SavedContract;
  handleDelete?: (id?: string) => void;
  navigate: NavigateFunction;
}) => {
  return (
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
          {handleDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(contract?.id);
              }}
              className="text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-600 font-mono break-all">
          {contract.address}
        </p>
        {contract?.createdAt && (
          <p className="mt-2 text-xs text-gray-500">
            Added {new Date(contract.createdAt).toLocaleDateString()}
          </p>
        )}
        <button
          onClick={() =>
            navigate(`/interact/${contract.id}${handleDelete ? "/local" : ""}`)
          }
          className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
        >
          Interact
        </button>
      </div>
    </div>
  );
};

export default ContractCard;
