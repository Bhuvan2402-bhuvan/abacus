import React, { useState } from 'react';
import { triggerHapticFeedback } from '../utils';

interface BeadProps {
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isActive: boolean;
  isDragging: boolean;
}

const Bead: React.FC<BeadProps> = ({ onClick, onDragStart, onDragEnd, isActive, isDragging }) => {
  // State to trigger a brief visual effect on interaction.
  const [isActivated, setIsActivated] = useState(false);

  // A helper to flash the activation effect (glow and scale).
  const triggerActivationEffect = () => {
    setIsActivated(true);
    // Reset the effect after the animation duration.
    setTimeout(() => setIsActivated(false), 300);
  };

  const handleClick = () => {
    onClick(); // Propagate the click to the parent component to update state.
    triggerActivationEffect();
    triggerHapticFeedback(); // Trigger haptic feedback on click
  };

  const handleInternalDragEnd = () => {
    onDragEnd(); // Propagate the event to the parent.
    // We provide feedback for the drag action ending. This will fire
    // whether the drop was on a valid target or not, giving consistent feedback.
    triggerActivationEffect();
    triggerHapticFeedback(); // Trigger haptic feedback on drag end (drop)
  };

  // Base classes for the bead. The transition duration is set to 300ms for a snappier feel.
  const beadClasses = "w-full h-6 sm:h-8 rounded-full cursor-pointer transition-all duration-300 ease-out shadow-inner hover:brightness-110 active:scale-95";
  const beadStyle = "bg-amber-600 border-2 border-amber-800";
  
  // Visual cue for beads that are "active" (touching the reckoning bar).
  const activeStyle = isActive ? "border-amber-400" : "";
  
  // Make the bead semi-transparent while it's being dragged.
  const draggingStyle = isDragging ? "opacity-30" : "opacity-100";
  
  // The "glow" and "pop" effect for when a bead is clicked or dropped.
  // This applies a ring and slightly scales up the bead.
  const activationStyle = isActivated ? 'ring-4 ring-amber-400/80 scale-105' : 'ring-0 ring-transparent scale-100';

  return (
    <div 
        draggable={true}
        onDragStart={onDragStart}
        onDragEnd={handleInternalDragEnd}
        onClick={handleClick}
        // The activationStyle contains a transform (scale), so it's applied here.
        className={`${beadClasses} ${beadStyle} ${activeStyle} ${draggingStyle} ${activationStyle}`}
    />
  );
};

export default Bead;
