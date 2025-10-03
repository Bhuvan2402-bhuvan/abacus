import React, { useState } from 'react';
import { RodState } from '../types';
import Bead from './Bead';

interface RodProps {
  rodState: RodState;
  onBeadClick: (beadType: 'heavenly' | 'earthly', beadIndex: number) => void;
}

// This interface helps track which bead is being dragged.
interface DraggingInfo {
  beadType: 'heavenly' | 'earthly';
  beadIndex: number;
}

const Rod: React.FC<RodProps> = ({ rodState, onBeadClick }) => {
  const { heavenlyBeadActive, earthlyBeadsActive } = rodState;
  const [draggingBead, setDraggingBead] = useState<DraggingInfo | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (beadType: 'heavenly' | 'earthly', beadIndex: number) => {
    // Set which bead is being dragged
    setDraggingBead({ beadType, beadIndex });
  };

  const handleDragEnd = () => {
    // Clear the dragging state when the drag operation ends
    setDraggingBead(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggingBead) {
      // Re-use the existing click logic. Dropping a bead on its rod has the
      // same effect as clicking the bead you started dragging.
      onBeadClick(draggingBead.beadType, draggingBead.beadIndex);
    }
    // Reset visual state
    setIsDragOver(false);
    setDraggingBead(null);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // This is necessary to allow a drop event to fire.
    e.preventDefault();
    setIsDragOver(true);
  };
    
  const handleDragLeave = () => {
    // Remove the drop zone highlight when the dragged bead leaves the rod.
    setIsDragOver(false);
  }
  
  // Style for the drop zone overlay
  const rodDropZoneClasses = `absolute inset-0 z-20 transition-colors duration-200 rounded-full ${isDragOver ? 'bg-black/20' : ''}`;

  return (
    <div 
        className="w-6 sm:w-8 h-64 bg-yellow-600 rounded-full relative flex flex-col justify-between py-2 shadow-inner"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
    >
      {/* Show the drop zone highlight only when a bead is being dragged over this rod */}
      {draggingBead && <div className={rodDropZoneClasses}></div>}

      {/* Heavenly Bead Section */}
      <div className="h-1/3 flex flex-col items-center justify-start pt-1 px-1">
          <div className={`w-full transform transition-transform duration-300 ease-out ${heavenlyBeadActive ? 'translate-y-8 sm:translate-y-10' : 'translate-y-0'}`}>
               <Bead 
                    onClick={() => onBeadClick('heavenly', 0)} 
                    onDragStart={() => handleDragStart('heavenly', 0)}
                    onDragEnd={handleDragEnd}
                    isActive={heavenlyBeadActive} 
                    isDragging={draggingBead?.beadType === 'heavenly'}
                />
          </div>
      </div>
      
      {/* Earthly Beads Section */}
      <div className="h-2/3 flex flex-col items-center justify-end pb-1 px-1 gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`w-full transform transition-transform duration-300 ease-out ${i < earthlyBeadsActive ? '-translate-y-8 sm:-translate-y-10' : 'translate-y-0'}`}>
            <Bead 
                onClick={() => onBeadClick('earthly', i)} 
                onDragStart={() => handleDragStart('earthly', i)}
                onDragEnd={handleDragEnd}
                isActive={i < earthlyBeadsActive} 
                isDragging={draggingBead?.beadType === 'earthly' && draggingBead?.beadIndex === i}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rod;