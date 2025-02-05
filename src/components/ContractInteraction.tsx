/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { ContractFunction } from "../types";
import FunctionList from "./FunctionList.tsx";
import EventList from "./EventList.tsx";
import { Code2 } from "lucide-react";
import EventResult from "./EventResult.tsx";
import FunctionResult from "./FunctionResult.tsx";
interface Props {
  abi: any[];
  contractAddress: string;
  account: string;
  chain: string;
}

const ContractInteraction: React.FC<Props> = ({...props }) => {
  const [selectedFunction, setSelectedFunction] = useState<ContractFunction | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ContractFunction | null>(null);

  const functions = props.abi.filter((item) => item.type === "function") as ContractFunction[];
  const events = props.abi.filter((item) => item.type === "event") as ContractFunction[];

  return (
    <div className="h-[calc(100vh-2rem)] mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Left Panel - Function & Event Lists */}
        <div className="h-full overflow-hidden flex flex-col bg-gray-50 rounded-xl">
          <div className="flex-1 flex flex-col overflow-y-auto px-4 gap-3">
            <FunctionList 
              title="Read Functions" 
              functions={functions.filter(f => f.stateMutability === "view" || f.stateMutability === "pure")}
              selectedFunction={selectedFunction}
              onSelect={setSelectedFunction}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
            />
            <FunctionList 
              title="Write Functions" 
              functions={functions.filter(f => f.stateMutability !== "view" && f.stateMutability !== "pure")}
              selectedFunction={selectedFunction}
              onSelect={setSelectedFunction}
              iconColor="text-purple-600"
              bgColor="bg-purple-50"
            />
            <EventList 
              events={events} 
              selectedEvent={selectedEvent}
              onSelect={setSelectedEvent}
            />
          </div>
        </div>

        {/* Right Panel - Function/Event Result */}
        <div className="h-full overflow-hidden flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex-1 overflow-y-auto p-6">
            {selectedFunction && (
              <FunctionResult {...props} selectedFunction={selectedFunction} />
            )}
            {selectedEvent && (
              <EventResult {...props} selectedEvent={selectedEvent} />
            )}
            {!selectedFunction && !selectedEvent && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Code2 className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Function or Event
                </h3>
                <p className="text-gray-500">
                  Choose from the list on the left to interact with the contract
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractInteraction;
