import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { getSavedContracts } from '../utils/storage.ts';
import ContractInteraction from '../components/ContractInteraction';
import { SavedContract } from '../types';
import { ArrowLeft } from 'lucide-react';

export default function Interact() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<SavedContract | null>(null);
  const { account } = useOutletContext<{ account: string }>();

  useEffect(() => {
    const contracts = getSavedContracts();
    const found = contracts.find(c => c.id === id);
    if (found) {
      setContract(found);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  if (!contract) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{contract.name}</h2>
            <p className="text-sm text-gray-500 font-mono">{contract.address}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <ContractInteraction
          abi={contract.abi}
          contractAddress={contract.address}
          account={account}
          chain={contract.chain}
        />
      </div>
    </div>
  );
}