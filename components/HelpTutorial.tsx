import React, { useEffect } from 'react';

interface HelpTutorialProps {
  onClose: () => void;
}

const HelpTutorial: React.FC<HelpTutorialProps> = ({ onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="help-title" className="text-2xl sm:text-3xl font-bold text-amber-800 dark:text-amber-300">
            How to Use the Abacus
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white text-3xl font-bold"
            aria-label="Close tutorial"
          >
            &times;
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">1. Understanding the Abacus</h3>
            <p className="text-base text-gray-600 dark:text-gray-400">
              This digital abacus is a Soroban. Each vertical rod represents a place value (ones, tens, hundreds, etc.), from right to left.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-400">
              <li><strong className="font-semibold">Heavenly Bead (Top):</strong> The single bead above the horizontal bar is worth <strong>5</strong>.</li>
              <li><strong className="font-semibold">Earthly Beads (Bottom):</strong> Each of the four beads below the bar is worth <strong>1</strong>.</li>
              <li><strong className="font-semibold">Reckoning Bar:</strong> Beads are only counted when they are moved towards this central bar.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">2. Reading a Number</h3>
            <p className="text-gray-600 dark:text-gray-400">
              To read the value on a rod, add up the values of the beads touching the reckoning bar. For example, if the heavenly bead (5) and two earthly beads (1+1) are active, the rod's value is 7. The total number is read across all rods.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">3. Moving the Beads</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You can manipulate the beads in two ways:
            </p>
             <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-400">
              <li><strong className="font-semibold">Click:</strong> Simply click on any bead to move it towards or away from the reckoning bar.</li>
              <li><strong className="font-semibold">Drag and Drop:</strong> You can also drag a bead on its rod and release it. This has the same effect as clicking the bead.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">4. Using the Calculator</h3>
            <p className="text-gray-600 dark:text-gray-400">
              The input field below the abacus allows you to perform calculations.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                <li>Enter a simple equation with two numbers and one operator (e.g., <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">123 + 45</code>). Supported operators are +, -, *, and /.</li>
                <li>Click <strong>Calculate</strong>.</li>
                <li>Watch as the abacus animates the calculation, first showing the initial number, then performing the operation, and finally displaying the result.</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">5. Undo & Redo</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Made a mistake? No problem.
            </p>
             <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-400">
              <li><strong className="font-semibold">Undo:</strong> Reverts the last action, whether it was a bead movement or a calculation step.</li>
              <li><strong className="font-semibold">Redo:</strong> Re-applies an action that you just undid.</li>
            </ul>
          </section>
        </div>

        <div className="mt-8 text-right">
            <button
                onClick={onClose}
                className="px-6 py-2 bg-amber-700 text-white font-semibold rounded-md hover:bg-amber-800 transition-colors duration-200 shadow-md"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default HelpTutorial;