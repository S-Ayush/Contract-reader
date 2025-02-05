/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState, useEffect } from "react";
import Web3 from "web3";
import {
  formatParameter,
  getInputPlaceholder,
  getWeb3Instance,
  serializeResult,
} from "../utils/web3";
import toast from "react-hot-toast";
import { PlayCircle, WifiOff, Wifi, Clock, Filter, Radio } from "lucide-react";
import EventCard from "./EventCard";
import { v4 } from "uuid";

interface Props {
  abi: any[];
  contractAddress: string;
  chain: string;
  selectedEvent: any;
}

const EventResult: React.FC<Props> = ({
  abi,
  contractAddress,
  chain,
  selectedEvent,
}) => {
  const [listening, setListening] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [subscription, setSubscription] = useState<any>(null);
  const [subscribedEvent, setSubscribedEvent] = useState<any>(null);

  // Reset input values when selected event changes
  useEffect(() => {
    if (!listening) {
      setInputValues({});
    }
  }, [selectedEvent, listening]);

  const getContract = useCallback(
    (web3: Web3) => new web3.eth.Contract(abi, contractAddress),
    [abi, contractAddress]
  );

  const handleInputChange = (name: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const validateInputs = (web3: Web3) => {
    if (!selectedEvent) return false;
    try {
      selectedEvent.inputs.forEach((input: any) => {
        const value = inputValues[input.name];
        if (value) {
          formatParameter(value, input.type, web3);
        }
      });
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const subscribeToEvent = async () => {
    try {
      const web3 = getWeb3Instance(chain, "wss_rpc");
      if (!selectedEvent) return;
      if (selectedEvent.inputs.length && !validateInputs(web3)) return;

      const contract = getContract(web3);
      const params =
        selectedEvent.inputs.length > 0
          ? selectedEvent.inputs
              .filter((input: any) => inputValues[input.name])
              .map((input: any) =>
                formatParameter(inputValues[input.name], input.type, web3)
              )
          : [];

      setListening(true);
      setSubscribedEvent(selectedEvent);
      toast.success(`Subscribed to ${selectedEvent.name} event!`);

      const sub = contract.events[selectedEvent.name](
        ...(params.length ? [{ filter: params }] : [])
      );

      if (!sub) {
        toast.error("Failed to subscribe to the event.");
        setListening(false);
        setSubscribedEvent(null);
        return;
      }

      sub.on("data", (event: any) => {
        const serializeEvent = serializeResult(event);
        setEvents((prev) => {
          const updatedEvents = [...prev, {...serializeEvent, id: v4()}];
          return updatedEvents.length > 200
            ? updatedEvents.slice(-200)
            : updatedEvents;
        });
      });

      sub.on("error", (error: any) => {
        toast.error(`Event subscription error: ${error.message}`);
        setListening(false);
        setSubscribedEvent(null);
      });

      setSubscription(sub);
    } catch (error: any) {
      toast.error(error.message);
      setSubscribedEvent(null);
    }
  };

  const unsubscribeFromEvent = () => {
    if (subscription) {
      subscription.unsubscribe();
      toast.success(`Unsubscribed from ${subscribedEvent.name}`);
      setSubscription(null);
      setListening(false);
      setSubscribedEvent(null);
    }
  };

  const getActiveFilters = () => {
    return Object.entries(inputValues).filter(([, value]) => value !== "");
  };

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-lg p-6">
      {/* Selected Event */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-100">
            <Filter className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              Selected Event: {selectedEvent.name}
            </h3>
            <p className="text-sm text-gray-600">
              {subscribedEvent
                ? subscribedEvent.name === selectedEvent.name
                  ? "Currently subscribed"
                  : "Different event subscribed"
                : "Not subscribed"}
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      {subscribedEvent && (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                listening ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {listening ? (
                <Wifi className="w-6 h-6 text-green-600" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Subscribed to: {subscribedEvent.name}
              </h3>
              <p className="text-sm text-gray-600">
                {listening ? "Active subscription" : "Subscription inactive"}
              </p>
            </div>
          </div>
          {listening && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
            </div>
          )}
        </div>
      )}

      {/* Active Filters */}
      {listening && getActiveFilters().length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-blue-600">Active Filters</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {getActiveFilters().map(([name, value]) => (
              <div
                key={name}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {name}: {value}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Filters Input */}
      {selectedEvent.inputs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-semibold">Event Filters</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedEvent.inputs.map((input: any) => (
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
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={getInputPlaceholder(input.type)}
                  disabled={listening}
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

      {/* Subscribe/Unsubscribe Button */}
      <button
        onClick={listening ? unsubscribeFromEvent : subscribeToEvent}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
          listening
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
        disabled={listening && subscribedEvent?.name !== selectedEvent.name}
      >
        {listening ? (
          <>
            <Radio className="w-5 h-5 animate-pulse" />
            Unsubscribe
          </>
        ) : (
          <>
            <PlayCircle className="w-5 h-5" />
            Subscribe
          </>
        )}
      </button>

      {/* Events List */}
      {events.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Received Events
              <span className="text-sm text-gray-500">
                ({events.length} {events.length === 1 ? "event" : "events"})
              </span>
            </h3>
          </div>
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard
                event={event}
                key={event.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventResult;
