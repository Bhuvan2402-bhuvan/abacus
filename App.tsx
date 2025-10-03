import React, { useState, useEffect, useCallback } from 'react';
import { RodState } from './types';
import Abacus from './components/Abacus';
import HelpTutorial from './components/HelpTutorial';

const NUM_RODS = 13;
type Theme = 'light' | 'dark';
type CalculationStep = 'idle' | 'num1Set' | 'operationShown' | 'resultShown';

interface CalculationData {
  num1: bigint;
  num2: bigint;
  operator: string;
  result: bigint;
}

const App: React.FC = () => {
  const createInitialState = (): RodState[] => {
    return Array.from({ length: NUM_RODS }, (_, i) => ({
      id: i,
      heavenlyBeadActive: false,
      earthlyBeadsActive: 0,
    }));
  };

  const [history, setHistory] = useState<RodState[][]>([createInitialState()]);
  const [currentStep, setCurrentStep] = useState(0);
  const rods = history[currentStep];

  const [displayValue, setDisplayValue] = useState<bigint>(0n);
  const [inputValue, setInputValue] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationMessage, setCalculationMessage] = useState('');
  const [calculationStep, setCalculationStep] = useState<CalculationStep>('idle');
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null);
  const [preCalculationState, setPreCalculationState] = useState<RodState[] | null>(null);
  
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme || (userPrefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const updateRodsState = (newRods: RodState[]) => {
    const newHistory = history.slice(0, currentStep + 1);
    setHistory([...newHistory, newRods]);
    setCurrentStep(newHistory.length);
  };
  
  const numberToRods = (num: bigint): RodState[] | null => {
    const newRods = createInitialState();
    let tempNum = num;

    for (let i = NUM_RODS - 1; i >= 0; i--) {
        if (tempNum === 0n) break;
        const digit = Number(tempNum % 10n);
        
        newRods[i].heavenlyBeadActive = digit >= 5;
        newRods[i].earthlyBeadsActive = digit % 5;

        tempNum /= 10n;
    }
    
    if (tempNum > 0n) {
        return null; // Number is too large
    }
    return newRods;
  };


  const calculateValue = useCallback((): bigint => {
    if (!rods) return 0n;
    let total = 0n;
    let placeValue = 1n;
    for (let i = rods.length - 1; i >= 0; i--) {
      const rod = rods[i];
      const rodValue = BigInt((rod.heavenlyBeadActive ? 5 : 0) + rod.earthlyBeadsActive);
      total += rodValue * placeValue;
      placeValue *= 10n;
    }
    return total;
  }, [rods]);

  useEffect(() => {
    setDisplayValue(calculateValue());
  }, [rods, calculateValue]);

  const handleBeadClick = useCallback((rodIndex: number, beadType: 'heavenly' | 'earthly', beadIndex: number) => {
    const newRods = JSON.parse(JSON.stringify(rods));
    const rod = newRods[rodIndex];

    if (beadType === 'heavenly') {
      rod.heavenlyBeadActive = !rod.heavenlyBeadActive;
    } else { // earthly
      const isCurrentlyActive = beadIndex < rod.earthlyBeadsActive;
      if (isCurrentlyActive) {
        rod.earthlyBeadsActive = beadIndex;
      } else {
        rod.earthlyBeadsActive = beadIndex + 1;
      }
    }
    updateRodsState(newRods);
  }, [rods]);

  const handleReset = () => {
    updateRodsState(createInitialState());
    setInputValue('');
  };
  
  const handleUndo = () => {
    if (currentStep > 0) {
      setCurrentStep(step => step - 1);
    }
  };
  
  const handleRedo = () => {
    if (currentStep < history.length - 1) {
      setCurrentStep(step => step + 1);
    }
  };
  
  const handleCalculate = () => {
    const expression = inputValue.trim();
    const match = expression.match(/^(\d+)\s*([+\-*/])\s*(\d+)$/);

    if (!match) {
        alert("Invalid expression. Please use the format 'number operator number', e.g., '123 + 456'.");
        return;
    }
    
    const [, num1Str, operator, num2Str] = match;
    const num1 = BigInt(num1Str);
    const num2 = BigInt(num2Str);
    let result: bigint;

    switch (operator) {
        case '+': result = num1 + num2; break;
        case '-': result = num1 - num2; break;
        case '*': result = num1 * num2; break;
        case '/':
            if (num2 === 0n) {
                alert("Error: Division by zero is not allowed.");
                return;
            }
            result = num1 / num2;
            break;
        default: return;
    }

    if (result < 0n) {
        alert("The result is negative. The abacus can only represent non-negative numbers.");
        return;
    }

    const rodsForNum1 = numberToRods(num1);
    const rodsForResult = numberToRods(result);

    if (!rodsForNum1 || !rodsForResult) {
        alert("A number in the calculation is too large for this abacus.");
        return;
    }
    
    setPreCalculationState(rods);
    setIsCalculating(true);
    setCalculationData({ num1, num2, operator, result });
    setCalculationStep('num1Set');
    setCalculationMessage(`Step 1: Setting abacus to the first number: ${num1}`);
    updateRodsState(rodsForNum1);
  };

  const handleCalculationNextStep = () => {
    if (!calculationData) return;

    switch (calculationStep) {
        case 'num1Set': {
            const { num2, operator } = calculationData;
            let operationText = '';
            switch (operator) {
                case '+': operationText = `Adding ${num2}...`; break;
                case '-': operationText = `Subtracting ${num2}...`; break;
                case '*': operationText = `Multiplying by ${num2}...`; break;
                case '/': operationText = `Dividing by ${num2}...`; break;
            }
            setCalculationMessage(`Step 2: ${operationText}`);
            setCalculationStep('operationShown');
            break;
        }
        case 'operationShown': {
            const { result } = calculationData;
            const rodsForResult = numberToRods(result);
            if (rodsForResult) {
                setCalculationMessage(`Step 3: The result is ${result}.`);
                updateRodsState(rodsForResult);
                setCalculationStep('resultShown');
            }
            break;
        }
    }
  };
  
  const handleCalculationPreviousStep = () => {
    if (!calculationData) return;

    switch (calculationStep) {
      case 'resultShown': {
        const { num1, num2, operator } = calculationData;
        const rodsForNum1 = numberToRods(num1);
        if (rodsForNum1) {
            let operationText = '';
            switch (operator) {
                case '+': operationText = `Adding ${num2}...`; break;
                case '-': operationText = `Subtracting ${num2}...`; break;
                case '*': operationText = `Multiplying by ${num2}...`; break;
                case '/': operationText = `Dividing by ${num2}...`; break;
            }
            setCalculationMessage(`Step 2: ${operationText}`);
            updateRodsState(rodsForNum1); // Revert abacus to num1 state
            setCalculationStep('operationShown');
        }
        break;
      }
      case 'operationShown': {
        const { num1 } = calculationData;
        setCalculationMessage(`Step 1: Setting abacus to the first number: ${num1}`);
        // Abacus state is already showing num1, so no need to update it
        setCalculationStep('num1Set');
        break;
      }
      case 'num1Set': {
        // Going back from the first step is the same as canceling.
        handleCalculationCancel();
        break;
      }
    }
  };

  const handleCalculationFinish = () => {
    if (calculationData) {
        setInputValue(calculationData.result.toString());
    }
    setIsCalculating(false);
    setCalculationStep('idle');
    setCalculationData(null);
    setCalculationMessage('');
    setPreCalculationState(null);
  };

  const handleCalculationCancel = () => {
    if (preCalculationState) {
        updateRodsState(preCalculationState);
    }
    setIsCalculating(false);
    setCalculationStep('idle');
    setCalculationData(null);
    setCalculationMessage('');
    setPreCalculationState(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9+\-*/\s]/g, '');
    setInputValue(value);
  }
  
  const canUndo = currentStep > 0;
  const canRedo = currentStep < history.length - 1;

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-5xl mx-auto">
          <header className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-amber-800 dark:text-amber-300">Interactive Abacus</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">A digital Soroban for modern calculations</p>
          </header>
          
          <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 mb-6">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-right overflow-x-auto">
              <span className="text-5xl font-mono tracking-wider text-green-600 dark:text-green-400">
                {displayValue.toLocaleString()}
              </span>
            </div>
          </div>

          <Abacus rods={rods} onBeadClick={handleBeadClick} disabled={isCalculating} />

          <div className="min-h-[68px] flex items-center justify-center my-4">
              {isCalculating && (
                  <div className="bg-blue-100 dark:bg-gray-700 p-4 rounded-lg shadow-inner w-full max-w-2xl mx-auto text-center">
                      <p className="text-lg font-medium text-blue-800 dark:text-blue-200" role="status" aria-live="polite">
                          {calculationMessage}
                      </p>
                  </div>
              )}
          </div>

          <div className="bg-white dark:bg-gray-900 shadow-xl rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-grow w-full md:w-auto flex items-center gap-2">
                  <input 
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      placeholder="Enter an equation (e.g., 25 + 10)"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:opacity-50"
                      aria-label="Equation Input"
                      disabled={isCalculating}
                  />
                {!isCalculating ? (
                    <button 
                        onClick={handleCalculate}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!inputValue.trim()}
                    >
                        Calculate
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCalculationPreviousStep}
                            className="px-6 py-2 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Previous calculation step"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleCalculationNextStep}
                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={calculationStep === 'resultShown'}
                            aria-label="Next calculation step"
                        >
                            Next Step
                        </button>
                        
                        {calculationStep === 'resultShown' && (
                            <button
                                onClick={handleCalculationFinish}
                                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md"
                                aria-label="Finish calculation"
                            >
                                Finish
                            </button>
                        )}
                        <button
                            onClick={handleCalculationCancel}
                            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors duration-200 shadow-md"
                            aria-label="Cancel calculation"
                        >
                            Cancel
                        </button>
                    </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                  <button
                      onClick={toggleTheme}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 shadow-md flex items-center justify-center"
                      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                      disabled={isCalculating}
                  >
                      {theme === 'light' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" /></svg>
                      )}
                  </button>
                   <button 
                      onClick={() => setIsHelpOpen(true)}
                      className="px-5 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Open help tutorial"
                      disabled={isCalculating}
                  >
                      Help
                  </button>
                  <button 
                      onClick={handleUndo}
                      disabled={isCalculating || !canUndo}
                      className="px-5 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Undo last action"
                  >
                      Undo
                  </button>
                   <button 
                      onClick={handleRedo}
                      disabled={isCalculating || !canRedo}
                      className="px-5 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Redo last action"
                  >
                      Redo
                  </button>
                  <button 
                      onClick={handleReset}
                      className="px-5 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Reset the abacus to zero"
                      disabled={isCalculating}
                  >
                      Reset
                  </button>
              </div>
          </div>
           <footer className="text-center mt-8 text-gray-500 dark:text-gray-400">
              <p>Drag a bead or click it to move it. Earthly beads (bottom) are worth 1, heavenly beads (top) are worth 5.</p>
          </footer>
        </div>
      </div>
      {isHelpOpen && <HelpTutorial onClose={() => setIsHelpOpen(false)} />}
    </>
  );
};

export default App;