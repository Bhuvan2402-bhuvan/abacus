import React, { useState, useEffect } from 'react';
import { RodState, SavedState } from '../types';
import { calculateAbacusValue } from '../utils';

interface SaveLoadStateProps {
  onClose: () => void;
  savedStates: SavedState[];
  currentRods: RodState[];
  onSave: (name: string) => { success: boolean, message: string };
  onLoad: (rods: RodState[]) => void;
  onDelete: (name: string) => void;
}

const SaveLoadState: React.FC<SaveLoadStateProps> = ({ onClose, savedStates, currentRods, onSave, onLoad, onDelete }) => {
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleSaveClick = () => {
    const result = onSave(name);
    setFeedback({ message: result.message, type: result.success ? 'success' : 'error' });
    if (result.success) {
      setName('');
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-load-title"
    >
      <div
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 sm:p-8 z-10 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
                <h2 id="save-load-title" className="text-2xl sm:text-3xl font-bold text-amber-800 dark:text-amber-300">
                    Save & Load State
                </h2>
                <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white text-3xl font-bold" aria-label="Close">&times;</button>
            </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
            <section aria-labelledby="save-section-title">
                <h3 id="save-section-title" className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">Save Current State</h3>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-grow">
                            <label htmlFor="state-name" className="block text-sm font-medium text-gray-600 dark:text-gray-400">State Name</label>
                            <input
                                type="text"
                                id="state-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Practice Problem 1"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-amber-500"
                            />
                        </div>
                        <div className="text-center">
                             <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Value</p>
                             <p className="font-mono text-2xl text-green-600 dark:text-green-400">{calculateAbacusValue(currentRods).toLocaleString()}</p>
                        </div>
                        <button
                            onClick={handleSaveClick}
                            disabled={!name.trim()}
                            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save
                        </button>
                    </div>
                    {feedback && (
                        <p className={`text-sm text-center font-semibold p-2 rounded-md ${feedback.type === 'success' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>
                            {feedback.message}
                        </p>
                    )}
                </div>
            </section>

            <section aria-labelledby="load-section-title">
                 <h3 id="load-section-title" className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">Load Saved State</h3>
                 <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    {savedStates.length > 0 ? (
                        <ul className="space-y-3">
                            {savedStates.map(state => (
                                <li key={state.name} className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="flex-grow text-center sm:text-left">
                                        <p className="font-bold text-gray-800 dark:text-gray-200">{state.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                            Value: {calculateAbacusValue(state.rods).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => onLoad(state.rods)} className="px-4 py-1.5 text-sm bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors">Load</button>
                                        <button onClick={() => onDelete(state.name)} className="px-4 py-1.5 text-sm bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors">Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">You have no saved states.</p>
                    )}
                 </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default SaveLoadState;
