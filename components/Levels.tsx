import React, { useState } from 'react';
import { LEVEL_CATEGORIES, Level, LevelCategory } from '../levels';

interface LevelsProps {
  onStartLevel: (level: Level) => void;
  completedLevels: string[];
}

const Levels: React.FC<LevelsProps> = ({ onStartLevel, completedLevels }) => {
  const [selectedCategory, setSelectedCategory] = useState<LevelCategory | null>(null);
  
  const handleLevelSelect = (level: Level) => {
    onStartLevel(level);
  }

  const CheckmarkIcon = () => (
    <svg className="w-5 h-5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div
      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-2xl max-w-3xl w-full p-6 sm:p-8 mx-auto"
      aria-labelledby="levels-title"
    >
      <div className="flex items-center mb-6">
        {selectedCategory && (
            <button onClick={() => setSelectedCategory(null)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl font-bold mr-4" aria-label="Back to categories">
                &larr;
            </button>
        )}
        <h2 id="levels-title" className="text-2xl sm:text-3xl font-bold text-amber-800 dark:text-amber-300">
            {selectedCategory ? `${selectedCategory.name} Levels` : 'Select a Category'}
        </h2>
      </div>

      {!selectedCategory ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LEVEL_CATEGORIES.map(category => (
                  <button 
                      key={category.name}
                      onClick={() => setSelectedCategory(category)}
                      className="p-8 bg-gray-50 dark:bg-gray-700 rounded-lg text-center hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                      <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-400">{category.name}</h3>
                  </button>
              ))}
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedCategory.levels.map(level => {
                  const levelId = `${selectedCategory.name}-${level.id}`;
                  const isCompleted = completedLevels.includes(levelId);
                  
                  return (
                      <button 
                          key={level.id}
                          onClick={() => handleLevelSelect(level)}
                          className={`p-6 rounded-lg text-left transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                              isCompleted
                              ? 'bg-green-50 dark:bg-green-900/30 opacity-80 hover:opacity-100'
                              : 'bg-gray-50 dark:bg-gray-700 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                          }`}
                          title={isCompleted ? "Completed!" : level.description}
                      >
                          <div className="flex items-center justify-between">
                              <h3 className="text-xl font-bold text-amber-700 dark:text-amber-400">{level.title}</h3>
                              {isCompleted && <CheckmarkIcon />}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{level.description}</p>
                          {isCompleted && <span className="sr-only">(Completed)</span>}
                      </button>
                  );
              })}
          </div>
      )}
    </div>
  );
};

export default Levels;