import React from 'react';
import { RodState } from '../types';
import Rod from './Rod';

interface AbacusProps {
  rods: RodState[];
  onBeadClick: (rodIndex: number, beadType: 'heavenly' | 'earthly', beadIndex: number) => void;
  disabled?: boolean;
  isCorrect?: boolean;
}

const Abacus: React.FC<AbacusProps> = ({ rods, onBeadClick, disabled = false, isCorrect = false }) => {
  const containerClasses = `bg-yellow-800 p-4 sm:p-6 border-4 border-yellow-900 rounded-2xl shadow-lg relative select-none transition-all duration-300`;
  const correctGlow = isCorrect ? 'ring-4 ring-green-500 dark:ring-green-400' : '';

  return (
    <div className={`${containerClasses} ${correctGlow}`}>
      {/* Overlay when disabled */}
      {disabled && <div className="absolute inset-0 bg-black/30 z-20 rounded-xl cursor-not-allowed"></div>}

      {/* Reckoning Bar */}
      <div className="absolute top-1/3 left-0 right-0 h-2 bg-yellow-900/80 -translate-y-1/2 z-10 rounded-full"></div>

      <div className="flex justify-around items-center gap-1 sm:gap-2">
        {rods.map((rod, index) => (
          <Rod
            key={rod.id}
            rodState={rod}
            onBeadClick={disabled ? () => {} : (beadType, beadIndex) => onBeadClick(index, beadType, beadIndex)}
          />
        ))}
      </div>
    </div>
  );
};

export default Abacus;