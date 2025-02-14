/* eslint-disable @typescript-eslint/no-explicit-any */
import { Wallet } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import React, { useEffect, useState } from "react";

export default function Layout() {
  const [account, setAccount] = useState<string>("");

  useEffect(() => {
    if (typeof (window as any).ethereum !== "undefined") {
      (window as any).ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        })
        .catch(console.error);
    }
  }, []);

  const connectWallet = async () => {
    if (typeof (window as any).ethereum !== "undefined") {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        toast.success("Wallet connected successfully!");
      } catch (error) {
        toast.error(
          (error as { message: string }).message || "Failed to connect wallet"
        );
      }
    } else {
      toast.error("Please install MetaMask or another Web3 wallet");
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    toast.success("Wallet disconnected");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <Wallet className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Smart Contract Hub
                </h1>
              </Link>
              <nav className="flex space-x-4">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Contracts
                </Link>
                <Link
                  to="/signature"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Signature
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {!account ? (
                <button
                  onClick={connectWallet}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {`${account.slice(0, 6)}...${account.slice(-4)}`}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ account }} />
      </main>
    </div>
  );
}
