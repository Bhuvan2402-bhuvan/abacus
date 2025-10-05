import React, { useState, useEffect } from 'react';
import Abacus from './Abacus';
import { RodState, TrainingLevel } from '../types';
import { trainingCategories } from '../trainingLevels';
import TrainingLevelCreator from './TrainingLevelCreator';

type Feedback = 'idle' | 'correct' | 'incorrect';

const CUSTOM_LEVELS_STORAGE_KEY = 'abacus_custom_training_levels';

const areRodsEqual = (rods1: RodState[], rods2: RodState[]): boolean => {
    return JSON.stringify(rods1) === JSON.stringify(rods2);
};

const Training: React.FC = () => {
    const [activeLevel, setActiveLevel] = useState<TrainingLevel | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [userRods, setUserRods] = useState<RodState[]>([]);
    const [feedback, setFeedback] = useState<Feedback>('idle');

    const [isCreating, setIsCreating] = useState(false);
    const [customLevels, setCustomLevels] = useState<TrainingLevel[]>([]);

    const currentStep = activeLevel ? activeLevel.steps[currentStepIndex] : null;

    useEffect(() => {
        try {
            const savedLevels = localStorage.getItem(CUSTOM_LEVELS_STORAGE_KEY);
            if (savedLevels) {
                setCustomLevels(JSON.parse(savedLevels));
            }
        } catch (error) {
            console.error("Could not load custom training levels from localStorage", error);
        }
    }, []);

    useEffect(() => {
        if (currentStep) {
            setUserRods(JSON.parse(JSON.stringify(currentStep.initialState)));
            setFeedback('idle');
        }
    }, [currentStep]);

    const handleBeadClick = (rodIndex: number, beadType: 'heavenly' | 'earthly', beadIndex: number) => {
        const newRods = JSON.parse(JSON.stringify(userRods));
        const rod = newRods[rodIndex];

        if (beadType === 'heavenly') {
            rod.heavenlyBeadActive = !rod.heavenlyBeadActive;
        } else {
            const isCurrentlyActive = beadIndex < rod.earthlyBeadsActive;
            if (isCurrentlyActive) {
                rod.earthlyBeadsActive = beadIndex;
            } else {
                rod.earthlyBeadsActive = beadIndex + 1;
            }
        }
        setUserRods(newRods);

        if (areRodsEqual(newRods, currentStep!.targetState)) {
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
    };
    
    const handleNextStep = () => {
        if (!activeLevel) return;
        if (currentStepIndex < activeLevel.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            alert("Congratulations! You've completed this training level.");
            handleExitLevel();
        }
    };

    const handleResetStep = () => {
        if (currentStep) {
            setUserRods(JSON.parse(JSON.stringify(currentStep.initialState)));
            setFeedback('idle');
        }
    };

    const handleStartLevel = (level: TrainingLevel) => {
        setActiveLevel(level);
        setCurrentStepIndex(0);
    };
    
    const handleExitLevel = () => {
        setActiveLevel(null);
        setCurrentStepIndex(0);
        setUserRods([]);
        setFeedback('idle');
    };

    const handleSaveCustomLevel = (newLevel: TrainingLevel) => {
        const updatedLevels = [...customLevels, newLevel];
        setCustomLevels(updatedLevels);
        try {
            localStorage.setItem(CUSTOM_LEVELS_STORAGE_KEY, JSON.stringify(updatedLevels));
        } catch (error) {
            console.error("Could not save custom training levels to localStorage", error);
        }
        setIsCreating(false);
    };

    const handleDeleteCustomLevel = (levelId: number | string) => {
        if (window.confirm("Are you sure you want to delete this custom level? This cannot be undone.")) {
            const updatedLevels = customLevels.filter(level => level.id !== levelId);
            setCustomLevels(updatedLevels);
            try {
                localStorage.setItem(CUSTOM_LEVELS_STORAGE_KEY, JSON.stringify(updatedLevels));
            } catch (error) {
                console.error("Could not update custom training levels in localStorage", error);
            }
        }
    };

    if (isCreating) {
        return <TrainingLevelCreator onSave={handleSaveCustomLevel} onCancel={() => setIsCreating(false)} />;
    }

    if (!activeLevel) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full p-6 sm:p-8 mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-amber-800 dark:text-amber-300 mb-6 text-center">
                    Interactive Training Center
                </h2>
                
                {/* Custom Levels Section */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-300 dark:border-gray-600 pb-2">My Custom Levels</h3>
                    {customLevels.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {customLevels.map(level => (
                                <div key={level.id} className="relative group">
                                    <button
                                        onClick={() => handleStartLevel(level)}
                                        className="w-full h-full p-6 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-left hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <h4 className="text-lg font-bold text-purple-700 dark:text-purple-400">{level.title}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{level.description}</p>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteCustomLevel(level.id)}
                                        className="absolute top-2 right-2 p-1 bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-300 dark:hover:bg-red-700"
                                        aria-label={`Delete ${level.title}`}
                                        title="Delete Level"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">You haven't created any training levels yet.</p>
                    )}
                    <button
                        onClick={() => setIsCreating(true)}
                        className="mt-4 w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        + Create a New Training Level
                    </button>
                </div>

                {/* Built-in Levels */}
                {trainingCategories.map(category => (
                    <div key={category.name} className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-300 dark:border-gray-600 pb-2">{category.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {category.levels.map(level => (
                                <button
                                    key={level.id}
                                    onClick={() => handleStartLevel(level)}
                                    className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-left hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <h4 className="text-lg font-bold text-amber-700 dark:text-amber-400">{level.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{level.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (currentStep) {
        const isCorrect = feedback === 'correct';
        return (
            <div className="max-w-3xl w-full mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-amber-800 dark:text-amber-300">{activeLevel.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400">Step {currentStepIndex + 1} of {activeLevel.steps.length}: {currentStep.title}</p>
                        </div>
                        <button onClick={handleExitLevel} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            Exit
                        </button>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-lg font-medium text-center text-gray-800 dark:text-gray-200">{currentStep.instruction}</p>
                    </div>
                </div>

                <div className="mb-6">
                   <Abacus rods={userRods} onBeadClick={handleBeadClick} disabled={isCorrect} isCorrect={isCorrect} />
                </div>
                
                <div className="min-h-[120px] bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col items-center justify-center text-center">
                    {feedback === 'idle' && (
                        <p className="text-gray-500 dark:text-gray-400">Move the beads to match the instruction.</p>
                    )}
                    {feedback === 'incorrect' && (
                         <p className="text-lg font-semibold text-red-600 dark:text-red-400">Not quite, try again. Use the 'Reset Step' button if you're stuck.</p>
                    )}
                    {isCorrect && (
                        <div className="w-full">
                            <p className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">Correct!</p>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">{currentStep.explanation}</p>
                            <button 
                                onClick={handleNextStep}
                                className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                {currentStepIndex < activeLevel.steps.length - 1 ? 'Next Step' : 'Finish Level'}
                            </button>
                        </div>
                    )}
                    
                    {feedback !== 'correct' && (
                         <button
                            onClick={handleResetStep}
                            className="mt-4 px-5 py-2.5 bg-yellow-500 text-white font-semibold rounded-full hover:bg-yellow-600 transition-colors duration-200 shadow-sm"
                            aria-label="Reset the current step"
                        >
                            Reset Step
                        </button>
                    )}
                </div>
            </div>
        );
    }
    
    return null;
};

export default Training;