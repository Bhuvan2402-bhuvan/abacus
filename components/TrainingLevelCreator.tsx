import React, { useState } from 'react';
import Abacus from './Abacus';
import { RodState, TrainingLevel, TrainingStep } from '../types';

interface TrainingLevelCreatorProps {
  onSave: (level: TrainingLevel) => void;
  onCancel: () => void;
}

const NUM_RODS = 7;

const createInitialRods = (): RodState[] => {
  return Array.from({ length: NUM_RODS }, (_, i) => ({
    id: i,
    heavenlyBeadActive: false,
    earthlyBeadsActive: 0,
  }));
};

const TrainingLevelCreator: React.FC<TrainingLevelCreatorProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<TrainingStep[]>([]);
  const [isEditingStep, setIsEditingStep] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  // State for the step being created/edited
  const [stepTitle, setStepTitle] = useState('');
  const [stepInstruction, setStepInstruction] = useState('');
  const [stepExplanation, setStepExplanation] = useState('');
  const [stepInitialState, setStepInitialState] = useState<RodState[]>(createInitialRods());
  const [stepTargetState, setStepTargetState] = useState<RodState[]>(createInitialRods());
  
  const resetStepForm = () => {
    setStepTitle('');
    setStepInstruction('');
    setStepExplanation('');
    setStepInitialState(createInitialRods());
    setStepTargetState(createInitialRods());
    setIsEditingStep(false);
    setEditingStepIndex(null);
  };

  const handleBeadClick = (
    stateSetter: React.Dispatch<React.SetStateAction<RodState[]>>,
    rodIndex: number,
    beadType: 'heavenly' | 'earthly',
    beadIndex: number
  ) => {
    stateSetter(prevRods => {
      const newRods = JSON.parse(JSON.stringify(prevRods));
      const rod = newRods[rodIndex];
      if (beadType === 'heavenly') {
        rod.heavenlyBeadActive = !rod.heavenlyBeadActive;
      } else {
        rod.earthlyBeadsActive = beadIndex < rod.earthlyBeadsActive ? beadIndex : beadIndex + 1;
      }
      return newRods;
    });
  };

  const handleAddNewStep = () => {
    if (stepTitle.trim() === '' || stepInstruction.trim() === '' || stepExplanation.trim() === '') {
      alert('Please fill in all fields for the step.');
      return;
    }

    const newStep: TrainingStep = {
      title: stepTitle,
      instruction: stepInstruction,
      explanation: stepExplanation,
      initialState: stepInitialState,
      targetState: stepTargetState,
    };
    
    if (editingStepIndex !== null) {
      const updatedSteps = [...steps];
      updatedSteps[editingStepIndex] = newStep;
      setSteps(updatedSteps);
    } else {
      setSteps([...steps, newStep]);
    }
    resetStepForm();
  };

  const handleEditStep = (index: number) => {
    const step = steps[index];
    setEditingStepIndex(index);
    setStepTitle(step.title);
    setStepInstruction(step.instruction);
    setStepExplanation(step.explanation);
    setStepInitialState(step.initialState);
    setStepTargetState(step.targetState);
    setIsEditingStep(true);
  };

  const handleDeleteStep = (index: number) => {
    if (window.confirm('Are you sure you want to delete this step?')) {
        const updatedSteps = steps.filter((_, i) => i !== index);
        setSteps(updatedSteps);
        // If the deleted step was being edited, reset the form
        if (index === editingStepIndex) {
            resetStepForm();
        }
    }
  };

  const handleSaveLevel = () => {
    if (title.trim() === '' || steps.length === 0) {
      alert('A level must have a title and at least one step.');
      return;
    }
    const newLevel: TrainingLevel = {
      id: `custom-${Date.now()}`,
      title,
      description,
      category: 'Custom',
      steps,
    };
    onSave(newLevel);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full p-6 sm:p-8 mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-amber-800 dark:text-amber-300 mb-6">
        Create New Training Level
      </h2>

      <div className="space-y-4 mb-8">
        <div>
          <label htmlFor="level-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Level Title</label>
          <input type="text" id="level-title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-amber-500" />
        </div>
        <div>
          <label htmlFor="level-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Level Description</label>
          <input type="text" id="level-desc" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-amber-500" />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Level Steps</h3>
        {steps.length > 0 && (
          <ul className="space-y-2 mb-4">
            {steps.map((step, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                <span className="font-medium text-gray-800 dark:text-gray-200">Step {index + 1}: {step.title}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEditStep(index)} className="text-sm font-semibold text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDeleteStep(index)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!isEditingStep && (
            <button onClick={() => setIsEditingStep(true)} className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">
            + Add New Step
            </button>
        )}
      </div>

      {isEditingStep && (
        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <h3 className="text-lg font-bold text-amber-700 dark:text-amber-400 mb-4">{editingStepIndex !== null ? `Editing Step ${editingStepIndex + 1}` : 'Add a New Step'}</h3>
          <div className="space-y-4">
             <div>
              <label htmlFor="step-title" className="block text-sm font-medium">Step Title</label>
              <input type="text" id="step-title" value={stepTitle} onChange={e => setStepTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-amber-500" />
            </div>
             <div>
              <label htmlFor="step-instruction" className="block text-sm font-medium">Instruction for User</label>
              <textarea id="step-instruction" value={stepInstruction} onChange={e => setStepInstruction(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-amber-500" />
            </div>
             <div>
              <label htmlFor="step-explanation" className="block text-sm font-medium">Explanation (after success)</label>
              <textarea id="step-explanation" value={stepExplanation} onChange={e => setStepExplanation(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-amber-500" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
                <h4 className="font-semibold text-center mb-2">Initial Abacus State</h4>
                <Abacus rods={stepInitialState} onBeadClick={(rodIndex, beadType, beadIndex) => handleBeadClick(setStepInitialState, rodIndex, beadType, beadIndex)} />
                <button onClick={() => setStepInitialState(createInitialRods())} className="w-full mt-2 text-sm py-1 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Reset</button>
            </div>
            <div>
                <h4 className="font-semibold text-center mb-2">Target Abacus State</h4>
                <Abacus rods={stepTargetState} onBeadClick={(rodIndex, beadType, beadIndex) => handleBeadClick(setStepTargetState, rodIndex, beadType, beadIndex)} />
                 <button onClick={() => setStepTargetState(createInitialRods())} className="w-full mt-2 text-sm py-1 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Reset</button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={resetStepForm} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
            <button onClick={handleAddNewStep} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors">{editingStepIndex !== null ? 'Update Step' : 'Add Step to Level'}</button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <button onClick={onCancel} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors">Cancel</button>
        <button onClick={handleSaveLevel} className="px-6 py-2 bg-amber-700 text-white font-semibold rounded-md hover:bg-amber-800 transition-colors">Save Entire Level</button>
      </div>
    </div>
  );
};

export default TrainingLevelCreator;
