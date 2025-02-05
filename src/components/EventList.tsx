import React from "react";
import { ContractFunction } from "../types";
import { Code2, ChevronDown, Bell } from "lucide-react";

interface Props {
  events: ContractFunction[];
  selectedEvent: ContractFunction | null;
  onSelect: (event: ContractFunction) => void;
}

const EventList: React.FC<Props> = ({ events, selectedEvent, onSelect }) => {
  return (
    <details className="group bg-white rounded-xl shadow-sm">
      <summary className="flex items-center cursor-pointer list-none p-4 border border-gray-100 rounded-t-xl sticky top-0 z-10 bg-white">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Events</h3>
          <span className="px-2 py-1 bg-amber-50 text-amber-600 text-xs font-medium rounded-full">
            {events.length}
          </span>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="border-x border-b border-gray-100 rounded-b-xl bg-white">
        <div className="divide-y divide-gray-100">
          {events.map((event) => (
            <button
              key={event.name}
              onClick={() => onSelect(event)}
              className={`w-full p-4 text-left transition-all duration-200 ${
                selectedEvent?.name === event.name ? "bg-amber-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Code2 className={`w-4 h-4 ${selectedEvent?.name === event.name ? "text-amber-600" : "text-gray-400"}`} />
                <span className="font-medium text-gray-700">{event.name}</span>
              </div>
              <div className="mt-2 text-sm text-gray-500 pl-7">
                {event.inputs.length > 0 ? (
                  <span>{event.inputs.length} parameter{event.inputs.length !== 1 ? "s" : ""}</span>
                ) : (
                  <span>No parameters</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </details>
  );
};

export default EventList;
