import { SavedContract } from '../types';

const CONTRACTS_KEY = 'saved_contracts';

export const getSavedContracts = (): SavedContract[] => {
  const saved = localStorage.getItem(CONTRACTS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const saveContract = (contract: Omit<SavedContract, 'id' | 'createdAt'>) => {
  const contracts = getSavedContracts();
  const newContract: SavedContract = {
    ...contract,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  contracts.push(newContract);
  localStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts));
  return newContract;
};

export const deleteContract = (id: string) => {
  const contracts = getSavedContracts();
  const filtered = contracts.filter(c => c.id !== id);
  localStorage.setItem(CONTRACTS_KEY, JSON.stringify(filtered));
};