import React, { useState, useEffect } from 'react';
import Abacus from './Abacus';
import { RodState, TrainingLevel } from '../types';
import { trainingCategories } from '../trainingLevels';

type Feedback = 'idle' | 'correct' | 'incorrect';

const areRodsEqual = (rods1: RodState[], rods2: RodState[]): boolean => {
    return JSON.stringify(rods1) === JSON.stringify(rods2);
};

const Training: React.FC = () => {
    const [activeLevel, setActiveLevel] = useState<TrainingLevel | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [userRods, setUserRods] = useState<RodState[]>([]);
    const [feedback, setFeedback] = useState<Feedback>('idle');

    const currentStep = activeLevel ? activeLevel.steps[currentStepIndex] : null;

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

    if (!activeLevel) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full p-6 sm:p-8 mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-amber-800 dark:text-amber-300 mb-6 text-center">
                    Interactive Training Center
                </h2>
                {trainingCategories.map(category => (
                    <div key={category.name} className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">{category.name}</h3>
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