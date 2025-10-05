import React, { useState, useEffect, useCallback } from 'react';
import { RodState, CurrentUser, UserRole, SavedState } from './types';
import Abacus from './components/Abacus';
import HelpTutorial from './components/HelpTutorial';
import Levels from './components/Levels';
import Training from './components/Training';
import AdminView from './components/AdminView';
import Auth from './components/Auth';
import ChangePassword from './components/ChangePassword';
import SaveLoadState from './components/SaveLoadState';
import { Level } from './levels';
import { calculateAbacusValue } from './utils';

const NUM_RODS = 13;
const COMPLETED_LEVELS_STORAGE_KEY_PREFIX = 'abacusCompletedLevels_';
const SAVED_STATES_STORAGE_KEY_PREFIX = 'abacusSavedStates_';
const CURRENT_USER_STORAGE_KEY = 'abacusCurrentUser';

// --- User Data ---
const INITIAL_USERS = [
  { username: 'admin1', password: 'Bhuvan@1122', role: 'admin' },
  { username: 'admin2', password: 'Vani@1122', role: 'admin' },
  // Programmatically generate 50 student users
  ...Array.from({ length: 50 }, (_, i) => ({
    username: `student ${i + 1}`,
    password: `student ${i + 1}`,
    role: 'user',
  })),
];


type Theme = 'light' | 'dark';
type AppMode = 'free' | 'calculating' | 'level';
type FeedbackType = 'success' | 'error' | 'info';
type MainView = 'simulator' | 'levels' | 'training' | 'admin';

interface CalculationData {
  num1: bigint;
  num2: bigint;
  operator: string;
  result: bigint;
}
type CalculationStep = 'idle' | 'num1Set' | 'operationShown' | 'resultShown';

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
  const logicalRods = history[currentStep];
  const [visualRods, setVisualRods] = useState<RodState[]>(logicalRods);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayValue, setDisplayValue] = useState<bigint>(0n);
  const [inputValue, setInputValue] = useState<string>('');
  
  const [mainView, setMainView] = useState<MainView>('levels');
  const [appMode, setAppMode] = useState<AppMode>('free');
  const [statusMessage, setStatusMessage] = useState('');
  const [feedback, setFeedback] = useState<{message: string, type: FeedbackType} | null>(null);

  const [calculationStep, setCalculationStep] = useState<CalculationStep>('idle');
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null);
  const [preCalculationState, setPreCalculationState] = useState<RodState[] | null>(null);

  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const [savedStates, setSavedStates] = useState<SavedState[]>([]);
  
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSaveLoadOpen, setIsSaveLoadOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [allUsersProgress, setAllUsersProgress] = useState<{ [username: string]: string[] }>({});

  const loadAllUsersProgress = useCallback(() => {
    const progressData: { [username: string]: string[] } = {};
    users.forEach(user => {
      if (user.role === 'user') { // Only load progress for students
        try {
          const savedLevels = localStorage.getItem(`${COMPLETED_LEVELS_STORAGE_KEY_PREFIX}${user.username}`);
          progressData[user.username] = savedLevels ? JSON.parse(savedLevels) : [];
        } catch (error) {
          console.error(`Could not load progress for ${user.username}`, error);
          progressData[user.username] = [];
        }
      }
    });
    setAllUsersProgress(progressData);
  }, [users]);

  // Load state from localStorage on initial render
  useEffect(() => {
    let initialUser: CurrentUser | null = null;
    try {
      const savedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (savedUser) {
        initialUser = JSON.parse(savedUser);
        setCurrentUser(initialUser);
        setIsAuthenticated(true);
        if (initialUser.role === 'admin') {
          setMainView('admin');
          loadAllUsersProgress();
        }
      }
    } catch (error) {
      console.error("Could not load user from localStorage", error);
    }

    // If a user was loaded, load their progress and saved states
    if (initialUser && initialUser.role === 'user') {
       try {
        const savedLevels = localStorage.getItem(`${COMPLETED_LEVELS_STORAGE_KEY_PREFIX}${initialUser.username}`);
        if (savedLevels) setCompletedLevels(JSON.parse(savedLevels));
        
        const savedSt = localStorage.getItem(`${SAVED_STATES_STORAGE_KEY_PREFIX}${initialUser.username}`);
        if (savedSt) setSavedStates(JSON.parse(savedSt));

      } catch (error) {
        console.error("Could not load user data from localStorage", error);
      }
    }
  }, [loadAllUsersProgress]);

  // Save data to localStorage whenever they change for the current user
  useEffect(() => {
    if (currentUser && currentUser.role === 'user') {
      try {
        localStorage.setItem(
          `${COMPLETED_LEVELS_STORAGE_KEY_PREFIX}${currentUser.username}`,
          JSON.stringify(completedLevels)
        );
        localStorage.setItem(
          `${SAVED_STATES_STORAGE_KEY_PREFIX}${currentUser.username}`,
          JSON.stringify(savedStates)
        );
      } catch (error) {
        console.error("Could not save data to localStorage", error);
      }
    }
  }, [completedLevels, savedStates, currentUser]);

  useEffect(() => {
    setVisualRods(logicalRods);
  }, [logicalRods]);

  useEffect(() => {
    window.document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const updateRodsState = (newRods: RodState[], resetHistory = false) => {
    const newHistory = resetHistory ? [] : history.slice(0, currentStep + 1);
    setHistory([...newHistory, newRods]);
    setCurrentStep(resetHistory ? 0 : newHistory.length);
  };

  const numberToRods = (num: bigint): RodState[] | null => {
    const newRods = createInitialState();
    let tempNum = num;
    if (num < 0) return null;
    for (let i = NUM_RODS - 1; i >= 0; i--) {
        if (tempNum === 0n) break;
        const digit = Number(tempNum % 10n);
        newRods[i].heavenlyBeadActive = digit >= 5;
        newRods[i].earthlyBeadsActive = digit % 5;
        tempNum /= 10n;
    }
    if (tempNum > 0n) return null;
    return newRods;
  };

  useEffect(() => {
    setDisplayValue(calculateAbacusValue(logicalRods));
  }, [logicalRods]);
  
  const animateStateTransition = useCallback(async (
    targetRods: RodState[], 
    options: { fromRods?: RodState[], updateHistory?: 'append' | 'reset' } = {}
  ) => {
    const { fromRods, updateHistory = 'append' } = options;
    setIsAnimating(true);
    const startRods = fromRods || logicalRods;
    let currentFrameRods = JSON.parse(JSON.stringify(startRods));
    for (let i = targetRods.length - 1; i >= 0; i--) {
        if (JSON.stringify(startRods[i]) !== JSON.stringify(targetRods[i])) {
            currentFrameRods[i] = targetRods[i];
            setVisualRods(JSON.parse(JSON.stringify(currentFrameRods)));
            await new Promise(resolve => setTimeout(resolve, 75));
        }
    }
    setVisualRods(targetRods);
    if (updateHistory === 'append') updateRodsState(targetRods);
    else if (updateHistory === 'reset') updateRodsState(targetRods, true);
    setTimeout(() => setIsAnimating(false), 200);
  }, [logicalRods]);

  const handleBeadClick = useCallback((rodIndex: number, beadType: 'heavenly' | 'earthly', beadIndex: number) => {
    if (isAnimating) return;
    const newRods = JSON.parse(JSON.stringify(logicalRods));
    const rod = newRods[rodIndex];
    if (beadType === 'heavenly') {
      rod.heavenlyBeadActive = !rod.heavenlyBeadActive;
    } else {
      rod.earthlyBeadsActive = beadIndex < rod.earthlyBeadsActive ? beadIndex : beadIndex + 1;
    }
    updateRodsState(newRods);
    if(feedback) setFeedback(null);
  }, [logicalRods, feedback, isAnimating]);

  const handleReset = () => {
    if (isAnimating) return;
    animateStateTransition(createInitialState(), { updateHistory: 'reset' });
    setInputValue('');
  };
  
  const handleUndo = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };
  const handleRedo = () => { if (currentStep < history.length - 1) setCurrentStep(s => s - 1); };
  
  const handleCalculate = () => {
    if (isAnimating) return;
    const match = inputValue.trim().match(/^(\d+)\s*([+\-*/])\s*(\d+)$/);
    if (!match) return alert("Invalid expression. Use format 'num op num'.");
    const [, num1Str, operator, num2Str] = match;
    const num1 = BigInt(num1Str);
    const num2 = BigInt(num2Str);
    let result: bigint;
    try {
        switch (operator) {
            case '+': result = num1 + num2; break;
            case '-': result = num1 - num2; break;
            case '*': result = num1 * num2; break;
            case '/': if (num2 === 0n) throw new Error("Div by zero."); result = num1 / num2; break;
            default: return;
        }
    } catch (error: any) { return alert(`Error: ${error.message}`); }
    if (result < 0n) return alert("Result is negative.");
    const rodsForNum1 = numberToRods(num1);
    const rodsForResult = numberToRods(result);
    if (!rodsForNum1 || !rodsForResult) return alert("Number too large for abacus.");
    setPreCalculationState(logicalRods);
    setAppMode('calculating');
    setCalculationData({ num1, num2, operator, result });
    setCalculationStep('num1Set');
    setStatusMessage(`Step 1: Setting abacus to ${num1}`);
    animateStateTransition(rodsForNum1, { fromRods: logicalRods });
  };

  const handleCalculationNextStep = () => {
    if (!calculationData || isAnimating) return;
    switch (calculationStep) {
        case 'num1Set':
            const opMap = {'+': 'Adding', '-': 'Subtracting', '*': 'Multiplying', '/': 'Dividing'};
            setStatusMessage(`Step 2: ${opMap[calculationData.operator]} ${calculationData.num2}...`);
            setCalculationStep('operationShown');
            break;
        case 'operationShown':
            const rodsForResult = numberToRods(calculationData.result);
            if (rodsForResult) {
                setStatusMessage(`Step 3: The result is ${calculationData.result}.`);
                animateStateTransition(rodsForResult);
                setCalculationStep('resultShown');
            }
            break;
    }
  };
  
  const handleCalculationFinish = () => {
    if (isAnimating) return;
    if (calculationData) setInputValue(calculationData.result.toString());
    setAppMode('free');
    setCalculationStep('idle');
    setCalculationData(null);
    setStatusMessage('');
    setPreCalculationState(null);
  };

  const handleCalculationCancel = () => {
    if (isAnimating) return;
    if (preCalculationState) updateRodsState(preCalculationState, true);
    setAppMode('free');
    setCalculationStep('idle');
    setCalculationData(null);
    setStatusMessage('');
    setPreCalculationState(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.replace(/[^0-9+\-*/\s]/g, ''));
  }

  const handleStartLevel = (level: Level) => {
    setActiveLevel(level);
    setCurrentProblemIndex(0);
    setAppMode('level');
    setFeedback(null);
    updateRodsState(createInitialState(), true);
    setMainView('simulator');
  };
  
  const handleCheckAnswer = () => {
    if (!activeLevel || isAnimating) return;
    const problem = activeLevel.problems[currentProblemIndex];
    if (displayValue === BigInt(problem.answer)) {
      const isLastProblem = currentProblemIndex === activeLevel.problems.length - 1;
      if (isLastProblem) {
        setFeedback({ message: "Correct! Level Complete!", type: 'success' });
        const levelId = `${activeLevel.category}-${activeLevel.id}`;
        if (!completedLevels.includes(levelId)) {
          setCompletedLevels(prev => [...prev, levelId]);
        }
        setTimeout(handleExitLevel, 2000);
      } else {
        setFeedback({ message: "Correct!", type: 'success' });
        setTimeout(() => {
          setCurrentProblemIndex(prev => prev + 1);
          setFeedback(null);
          updateRodsState(createInitialState(), true);
        }, 1000);
      }
    } else {
      setFeedback({ message: "Not quite, try again!", type: 'error' });
    }
  };

  const handleExitLevel = () => {
    if (isAnimating) return;
    setAppMode('free');
    setActiveLevel(null);
    setCurrentProblemIndex(0);
    setFeedback(null);
    setMainView('levels');
  };

  const handleLogin = (user: string, pass: string): CurrentUser | null => {
    const foundUser = users.find(u => u.username === user && u.password === pass);
    if (foundUser) {
        return { username: foundUser.username, role: foundUser.role as UserRole };
    }
    return null;
  };

  const handleLoginAttempt = (user: string, pass: string) => {
    const loggedInUser = handleLogin(user, pass);
    if (loggedInUser) {
      try {
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(loggedInUser));
        if (loggedInUser.role === 'user') {
          const savedLevels = localStorage.getItem(`${COMPLETED_LEVELS_STORAGE_KEY_PREFIX}${loggedInUser.username}`);
          setCompletedLevels(savedLevels ? JSON.parse(savedLevels) : []);
          const savedSt = localStorage.getItem(`${SAVED_STATES_STORAGE_KEY_PREFIX}${loggedInUser.username}`);
          setSavedStates(savedSt ? JSON.parse(savedSt) : []);
        }
      } catch (error) {
        console.error("Could not access localStorage", error);
        setCompletedLevels([]);
        setSavedStates([]);
      }
      setCurrentUser(loggedInUser);
      setIsAuthenticated(true);
      setLoginError(null);
      if (loggedInUser.role === 'admin') {
        setMainView('admin');
        loadAllUsersProgress();
      } else {
        setMainView('levels');
      }
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setLoginError(null);
    setCompletedLevels([]);
    setSavedStates([]);
    setAllUsersProgress({});
    setMainView('levels');
    try {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    } catch (error) {
      console.error("Could not remove current user from localStorage", error);
    }
  };

  const handleChangePassword = (oldPass: string, newPass: string): { success: boolean; message: string } => {
    if (!currentUser) {
        return { success: false, message: 'No user is currently logged in.' };
    }
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex === -1) {
        return { success: false, message: 'Current user not found in the user list.' };
    }
    if (users[userIndex].password !== oldPass) {
        return { success: false, message: 'The current password you entered is incorrect.' };
    }
    const updatedUsers = [...users];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPass };
    setUsers(updatedUsers);
    return { success: true, message: 'Password successfully updated!' };
  };

  const handleAdminPasswordReset = (username: string): string => {
    const newPass = Math.random().toString(36).slice(2, 10); 
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex !== -1) {
        const updatedUsers = [...users];
        updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPass };
        setUsers(updatedUsers);
    }
    return newPass;
  };

  const handleSaveState = (name: string): { success: boolean; message: string } => {
    if (!name.trim()) {
      return { success: false, message: "State name cannot be empty." };
    }
    const existingIndex = savedStates.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
    if (existingIndex !== -1) {
      if (!window.confirm(`A state named "${name}" already exists. Do you want to overwrite it?`)) {
        return { success: false, message: "Save operation cancelled." };
      }
    }
    const newState: SavedState = { name, rods: logicalRods };
    let newStates = [...savedStates];
    if (existingIndex !== -1) {
      newStates[existingIndex] = newState;
    } else {
      newStates.push(newState);
    }
    newStates.sort((a, b) => a.name.localeCompare(b.name));
    setSavedStates(newStates);
    return { success: true, message: `State "${name}" saved successfully.` };
  };

  const handleLoadState = (rods: RodState[]) => {
    animateStateTransition(rods, { updateHistory: 'reset' });
    setFeedback({ message: 'State loaded successfully!', type: 'info' });
    setTimeout(() => setFeedback(null), 2000);
    setIsSaveLoadOpen(false);
  };
  
  const handleDeleteState = (name: string) => {
    if (window.confirm(`Are you sure you want to delete the state named "${name}"? This action cannot be undone.`)) {
      setSavedStates(prevStates => prevStates.filter(s => s.name !== name));
    }
  };

  const isInteractive = (appMode === 'free' || appMode === 'level') && !isAnimating;
  const canUndo = currentStep > 0;
  const canRedo = currentStep < history.length - 1;

  const getFeedbackColorClasses = () => {
    if (!feedback) return 'bg-transparent';
    switch (feedback.type) {
        case 'success': return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
        case 'error': return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
        case 'info': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200';
        default: return 'bg-gray-100 dark:bg-gray-700';
    }
  }
  
  const tabClasses = (view: MainView) => {
    const base = "px-4 py-3 text-base md:text-lg font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 focus:ring-amber-500";
    if (mainView === view) return `${base} bg-white dark:bg-gray-900 text-amber-700 dark:text-amber-400`;
    return `${base} bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50`;
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLoginAttempt} error={loginError} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex flex-col items-center p-4 font-sans">
        <div className="w-full max-w-5xl mx-auto">
          <header className="flex justify-between items-center mb-4">
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-amber-800 dark:text-amber-300">Abacus Simulator</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">A digital Soroban for modern calculations</p>
            </div>
            {currentUser && (
              <div className="text-right">
                <p className="text-gray-700 dark:text-gray-300">
                  Welcome, <strong className="font-semibold capitalize">{currentUser.username}</strong>!
                </p>
                <div className="flex gap-3 justify-end mt-1">
                  <button 
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    Change Password
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </header>
          
          <nav className="flex justify-center border-b border-gray-300 dark:border-gray-600 mb-6 flex-wrap">
            {currentUser?.role === 'admin' ? (
              <button onClick={() => setMainView('admin')} className={tabClasses('admin')}>Admin Dashboard</button>
            ) : (
              <>
                <button onClick={() => setMainView('levels')} className={tabClasses('levels')}>Practice Levels</button>
                <button onClick={() => setMainView('simulator')} className={tabClasses('simulator')}>Simulator</button>
                <button onClick={() => setMainView('training')} className={tabClasses('training')}>Training</button>
              </>
            )}
          </nav>
          
          {mainView === 'simulator' && (
            <>
              <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 mb-6">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-right overflow-x-auto">
                  <span className="text-5xl font-mono tracking-wider text-green-600 dark:text-green-400">
                    {displayValue.toLocaleString()}
                  </span>
                </div>
              </div>

              <Abacus rods={visualRods} onBeadClick={handleBeadClick} disabled={!isInteractive} />

              <div className="min-h-[84px] flex items-center justify-center my-4">
                  {appMode === 'calculating' && (
                      <div className="bg-blue-100 dark:bg-gray-700 p-4 rounded-lg shadow-inner w-full max-w-2xl mx-auto text-center">
                          <p className="text-lg font-medium text-blue-800 dark:text-blue-200" role="status" aria-live="polite">
                              {statusMessage}
                          </p>
                      </div>
                  )}
                  {appMode === 'level' && activeLevel && (
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-inner w-full max-w-2xl mx-auto text-center">
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">{activeLevel.category} - {activeLevel.title}</p>
                        <div className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-2 mb-2">
                            Problem {currentProblemIndex + 1}/{activeLevel.problems.length}:{' '}
                            <strong className="font-bold text-xl">
                              {activeLevel.problems[currentProblemIndex].question}
                            </strong>
                        </div>
                        {feedback && <p className={`text-lg font-semibold p-2 rounded-md transition-colors ${getFeedbackColorClasses()}`} role="alert">{feedback.message}</p>}
                    </div>
                  )}
                  {appMode === 'free' && feedback?.type === 'info' && (
                     <div className="bg-blue-100 dark:bg-gray-700 p-4 rounded-lg shadow-inner w-full max-w-2xl mx-auto text-center">
                        <p className="text-lg font-medium text-blue-800 dark:text-blue-200" role="alert">
                            {feedback.message}
                        </p>
                     </div>
                  )}
              </div>

               <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700/50 shadow-2xl rounded-full p-3 w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex-grow w-full sm:w-auto flex items-center gap-2">
                      {appMode === 'free' && (
                        <>
                          <input type="text" value={inputValue} onChange={handleInputChange} placeholder="e.g., 25 + 10" className="w-full px-5 py-2.5 border-none rounded-full bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-shadow" aria-label="Equation Input"/>
                          <button onClick={handleCalculate} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0" disabled={!inputValue.trim() || isAnimating}>Calculate</button>
                        </>
                      )}
                      {appMode === 'calculating' && (
                        <div className="flex items-center gap-2">
                            <button onClick={handleCalculationNextStep} className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors duration-200 shadow-md disabled:opacity-50" disabled={calculationStep === 'resultShown' || isAnimating}>Next Step</button>
                            {calculationStep === 'resultShown' && <button onClick={handleCalculationFinish} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 shadow-md" disabled={isAnimating}>Finish</button>}
                            <button onClick={handleCalculationCancel} className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 shadow-md" disabled={isAnimating}>Cancel</button>
                        </div>
                      )}
                      {appMode === 'level' && (
                        <div className="flex items-center gap-2">
                          <button onClick={handleCheckAnswer} className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 shadow-md" disabled={!!feedback || isAnimating}>Check Answer</button>
                          <button onClick={handleExitLevel} className="px-6 py-2.5 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 shadow-md" disabled={isAnimating}>Exit Level</button>
                        </div>
                      )}
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-full">
                          <button onClick={handleUndo} disabled={!isInteractive || !canUndo} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 shadow-sm disabled:opacity-50" title="Undo"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg></button>
                          <button onClick={handleRedo} disabled={!isInteractive || !canRedo} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 shadow-sm disabled:opacity-50" title="Redo"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" /></svg></button>
                      </div>
                      <button onClick={() => setIsSaveLoadOpen(true)} className="w-11 h-11 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm" title="Save / Load State" disabled={!isInteractive}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm3 0a1 1 0 00-1 1v1a1 1 0 102 0V5a1 1 0 00-1-1z" /><path d="M3 9a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg></button>
                      <button onClick={toggleTheme} className="w-11 h-11 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg></button>
                      <button onClick={() => setIsHelpOpen(true)} className="w-11 h-11 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 shadow-sm" title="Help"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg></button>
                      <button onClick={handleReset} className="w-11 h-11 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm" title="Reset" disabled={!isInteractive}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M4 4l7 7M20 20v-5h-5M20 20l-7-7" /></svg></button>
                  </div>
              </div>
            </>
          )}

          {mainView === 'levels' && <Levels onStartLevel={handleStartLevel} completedLevels={completedLevels} />}
          {mainView === 'training' && <Training />}
          {mainView === 'admin' && (
            <AdminView
              currentUser={currentUser}
              allUsersProgress={allUsersProgress}
              onResetPassword={handleAdminPasswordReset}
            />
          )}

          <footer className="text-center mt-8 text-gray-500 dark:text-gray-400">
              <p>&copy; {new Date().getFullYear()} Abacus Simulator. All rights reserved.</p>
              <p className="mt-2">Designed By Bhuvana Mohan Chowdary</p>
          </footer>
        </div>
      </div>
      {isHelpOpen && <HelpTutorial onClose={() => setIsHelpOpen(false)} />}
      {isChangePasswordOpen && <ChangePassword onClose={() => setIsChangePasswordOpen(false)} onChangePassword={handleChangePassword} />}
      {isSaveLoadOpen && <SaveLoadState 
          onClose={() => setIsSaveLoadOpen(false)} 
          savedStates={savedStates}
          currentRods={logicalRods}
          onSave={handleSaveState}
          onLoad={handleLoadState}
          onDelete={handleDeleteState}
        />}
    </>
  );
};

export default App;