import React from "react";
import { ContractFunction } from "../types";
import { Code2, ChevronDown, BookOpen, Pencil } from "lucide-react";

interface Props {
  title: string;
  functions: ContractFunction[];
  selectedFunction: ContractFunction | null;
  onSelect: (func: ContractFunction) => void;
  iconColor: string;
  bgColor: string;
}

const FunctionList: React.FC<Props> = ({ title, functions, selectedFunction, onSelect, iconColor, bgColor }) => {
  return (
    <details className="group bg-white rounded-xl shadow-sm">
      <summary className="flex items-center cursor-pointer list-none p-4 border border-gray-100 rounded-t-xl sticky top-0 z-10 bg-white">
        <div className="flex items-center gap-3 flex-1">
          <div className={`p-2 ${bgColor} rounded-lg`}>
            {title.includes("Read") ? <BookOpen className={`w-5 h-5 ${iconColor}`} /> : <Pencil className={`w-5 h-5 ${iconColor}`} />}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <span className={`px-2 py-1 ${bgColor} ${iconColor} text-xs font-medium rounded-full`}>
            {functions.length}
          </span>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="border-x border-b border-gray-100 rounded-b-xl bg-white">
        <div className="divide-y divide-gray-100">
          {functions.map((func) => (
            <button
              key={func.name}
              onClick={() => onSelect(func)}
              className={`w-full p-4 text-left transition-all duration-200 ${
                selectedFunction?.name === func.name ? bgColor : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Code2 className={`w-4 h-4 ${selectedFunction?.name === func.name ? iconColor : "text-gray-400"}`} />
                <span className="font-medium text-gray-700">{func.name}</span>
              </div>
              <div className="mt-2 text-sm text-gray-500 pl-7">
                {func.inputs.length > 0 ? (
                  <span>Takes {func.inputs.length} parameter{func.inputs.length !== 1 ? "s" : ""}</span>
                ) : (
                  <span>No parameters required</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </details>
  );
};

export default FunctionList;
