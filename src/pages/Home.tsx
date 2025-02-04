import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Trash2 } from 'lucide-react';
import { SavedContract } from '../types';
import { getSavedContracts, deleteContract } from '../utils/storage.ts';
import toast from 'react-hot-toast';

export default function Home() {
  const [contracts, setContracts] = useState<SavedContract[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setContracts(getSavedContracts());
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      deleteContract(id);
      setContracts(getSavedContracts());
      toast.success('Contract deleted successfully');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Saved Contracts</h2>
        <button
          onClick={() => navigate('/register')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Register New Contract
        </button>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Code2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No contracts</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by registering a new smart contract.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Code2 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {contract.name}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(contract.id);
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600 font-mono break-all">
                  {contract.address}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Added {new Date(contract.createdAt).toLocaleDateString()}
                </p>
                <button
                  onClick={() => navigate(`/interact/${contract.id}`)}
                  className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                >
                  Interact
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}