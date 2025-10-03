import { RodState, TrainingCategory } from './types';

const NUM_TRAINING_RODS = 7;

/**
 * Creates an array of RodState objects representing a number on the abacus, right-aligned.
 * @param numStr The number to represent, as a string.
 * @param numRods The total number of rods for this training abacus.
 * @returns An array of RodState.
 */
const createRodsState = (numStr: string, numRods: number = NUM_TRAINING_RODS): RodState[] => {
  const rods: RodState[] = Array.from({ length: numRods }, (_, i) => ({
    id: i,
    heavenlyBeadActive: false,
    earthlyBeadsActive: 0,
  }));
  
  if (!numStr.match(/^\d+$/)) return rods;
  
  const numDigits = numStr.split('');

  for (let i = 0; i < numDigits.length; i++) {
    const rodIndex = numRods - numDigits.length + i;
    if (rodIndex < 0) continue;
    
    const digit = parseInt(numDigits[i], 10);
    rods[rodIndex].heavenlyBeadActive = digit >= 5;
    rods[rodIndex].earthlyBeadsActive = digit % 5;
  }
  return rods;
};

/**
 * Creates a custom abacus state by setting specific values on given rod indices.
 * @param values A dictionary where the key is the rod index and the value is the number for that rod.
 * @param numRods The total number of rods.
 * @returns An array of RodState.
 */
const createCustomRodsState = (values: { [rodIndex: number]: number }, numRods: number = NUM_TRAINING_RODS): RodState[] => {
    const rods: RodState[] = Array.from({ length: numRods }, (_, i) => ({
        id: i,
        heavenlyBeadActive: false,
        earthlyBeadsActive: 0,
    }));

    for (const rodIndexStr in values) {
        const rodIndex = parseInt(rodIndexStr, 10);
        if (rodIndex >= 0 && rodIndex < numRods) {
            const digit = values[rodIndex];
            rods[rodIndex].heavenlyBeadActive = digit >= 5;
            rods[rodIndex].earthlyBeadsActive = digit % 5;
        }
    }
    return rods;
};


export const trainingCategories: TrainingCategory[] = [
    {
        name: 'Basics',
        levels: [
            {
                id: 1,
                title: 'Reading Numbers',
                description: 'Learn how to set and read single-digit numbers.',
                category: 'Basics',
                steps: [
                    {
                        title: 'Setting the number 3',
                        instruction: 'Set the number 3 on the rightmost rod.',
                        explanation: 'Correct! You moved three earthly beads up. Each is worth 1, so the total is 3.',
                        initialState: createRodsState('0'),
                        targetState: createRodsState('3'),
                    },
                    {
                        title: 'Setting the number 7',
                        instruction: 'Now, set the number 7 on the rightmost rod.',
                        explanation: 'Excellent! You moved the heavenly bead (worth 5) down and two earthly beads (worth 2) up. 5 + 2 = 7.',
                        initialState: createRodsState('0'),
                        targetState: createRodsState('7'),
                    },
                    {
                        title: 'Setting the number 12',
                        instruction: 'Set the number 12 using two rods.',
                        explanation: 'Perfect! You set 1 on the tens rod and 2 on the ones rod.',
                        initialState: createRodsState('0'),
                        targetState: createRodsState('12'),
                    }
                ]
            }
        ]
    },
    {
        name: 'Addition',
        levels: [
            {
                id: 1,
                title: 'Direct Addition',
                description: 'Learn to add when you have enough beads.',
                category: 'Addition',
                steps: [
                    {
                        title: 'Calculate 1 + 3',
                        instruction: 'First, set the number 1 on the abacus.',
                        explanation: 'Good. The abacus is set to 1.',
                        initialState: createRodsState('0'),
                        targetState: createRodsState('1'),
                    },
                    {
                        title: 'Calculate 1 + 3',
                        instruction: 'Now, add 3 by moving three more earthly beads up.',
                        explanation: 'Correct! You added 3 directly. The result is 4.',
                        initialState: createRodsState('1'),
                        targetState: createRodsState('4'),
                    },
                     {
                        title: 'Calculate 5 + 2',
                        instruction: 'Start over. Set the number 5.',
                        explanation: 'Right. The heavenly bead is active, representing 5.',
                        initialState: createRodsState('0'),
                        targetState: createRodsState('5'),
                    },
                    {
                        title: 'Calculate 5 + 2',
                        instruction: 'Now, add 2 by moving two earthly beads up.',
                        explanation: 'Great! 5 + 2 = 7. You added the beads directly.',
                        initialState: createRodsState('5'),
                        targetState: createRodsState('7'),
                    }
                ]
            },
            {
                id: 2,
                title: 'Addition with 5-Complements',
                description: 'Learn to add using the heavenly bead (5).',
                category: 'Addition',
                steps: [
                    {
                        title: 'Calculate 4 + 3',
                        instruction: 'First, set the number 4.',
                        explanation: 'The abacus is set to 4.',
                        initialState: createRodsState('0'),
                        targetState: createRodsState('4'),
                    },
                    {
                        title: 'Use the Complement',
                        instruction: 'You can\'t add 3 directly. The rule is +3 = +5, -2. First, add 5.',
                        explanation: 'Good. You\'ve added 5 by moving the heavenly bead down.',
                        initialState: createRodsState('4'),
                        targetState: createRodsState('9'),
                    },
                    {
                        title: 'Finish the Calculation',
                        instruction: 'Now, complete the rule (+5, -2) by subtracting 2.',
                        explanation: 'Excellent! You subtracted 2. The final result of 4 + 3 is 7.',
                        initialState: createRodsState('9'),
                        targetState: createRodsState('7'),
                    }
                ]
            }
        ]
    },
    {
        name: 'Subtraction',
        levels: [
            {
                id: 1,
                title: 'Direct Subtraction',
                description: 'Learn to subtract when you have enough beads.',
                category: 'Subtraction',
                steps: [
                    {
                        title: 'Calculate 4 - 3',
                        instruction: 'First, set the number 4 on the abacus.',
                        explanation: 'Good. The abacus is set to 4.',
                        initialState: createRodsState('0'),
                        targetState: createRodsState('4'),
                    },
                    {
                        title: 'Calculate 4 - 3',
                        instruction: 'Now, subtract 3 by moving three earthly beads down.',
                        explanation: 'Correct! You subtracted 3 directly. The result is 1.',
                        initialState: createRodsState('4'),
                        targetState: createRodsState('1'),
                    },
                     {
                        title: 'Calculate 8 - 2',
                        instruction: 'Start over. Set the number 8.',
                        explanation: 'Right. The abacus is set to 8 (heavenly bead is 5, plus 3 earthly beads).',
                        initialState: createRodsState('0'),
                        targetState: createRodsState('8'),
                    },
                    {
                        title: 'Calculate 8 - 2',
                        instruction: 'Now, subtract 2 by moving two earthly beads down.',
                        explanation: 'Great! 8 - 2 = 6. You subtracted the beads directly.',
                        initialState: createRodsState('8'),
                        targetState: createRodsState('6'),
                    }
                ]
            },
            {
                id: 2,
                title: 'Subtraction with 5-Complements',
                description: 'Learn to subtract using the heavenly bead (5).',
                category: 'Subtraction',
                steps: [
                    {
                        title: 'Calculate 7 - 3',
                        instruction: 'First, set the number 7.',
                        explanation: 'The abacus is set to 7.',
                        initialState: createRodsState('0'),
                        targetState: createRodsState('7'),
                    },
                    {
                        title: 'Use the Complement',
                        instruction: 'You can\'t subtract 3 earthly beads directly. The rule is -3 = -5, +2. First, subtract 5.',
                        explanation: 'Good. You\'ve subtracted 5 by moving the heavenly bead up.',
                        initialState: createRodsState('7'),
                        targetState: createRodsState('2'),
                    },
                    {
                        title: 'Finish the Calculation',
                        instruction: 'Now, complete the rule (-5, +2) by adding 2.',
                        explanation: 'Excellent! You added 2. The final result of 7 - 3 is 4.',
                        initialState: createRodsState('2'),
                        targetState: createRodsState('4'),
                    }
                ]
            }
        ]
    },
    {
        name: 'Multiplication',
        levels: [
            {
                id: 1,
                title: 'Simple Multiplication',
                description: 'Learn the setup for multiplying two numbers.',
                category: 'Multiplication',
                steps: [
                    {
                        title: 'Calculate 4 x 2',
                        instruction: 'We will calculate 4 x 2. First, set the multiplier, 4, on the leftmost rod.',
                        explanation: 'Good. The multiplier is set on the left.',
                        initialState: createCustomRodsState({}),
                        targetState: createCustomRodsState({0: 4}),
                    },
                    {
                        title: 'Calculate 4 x 2',
                        instruction: 'Next, set the multiplicand, 2, on the rod next to the multiplier.',
                        explanation: 'Perfect. The problem 4 x 2 is now set up.',
                        initialState: createCustomRodsState({0: 4}),
                        targetState: createCustomRodsState({0: 4, 1: 2}),
                    },
                    {
                        title: 'Calculate 4 x 2',
                        instruction: 'Now, multiply 4 by 2, which equals 8. Set the result, 8, on the rightmost rod.',
                        explanation: 'Great! The result of the multiplication is placed on the right side of the abacus.',
                        initialState: createCustomRodsState({0: 4, 1: 2}),
                        targetState: createCustomRodsState({0: 4, 1: 2, 6: 8}),
                    },
                    {
                        title: 'Final Result',
                        instruction: 'Finally, clear the multiplier and multiplicand on the left to show the final answer.',
                        explanation: 'Excellent! The abacus now shows the final answer, 8.',
                        initialState: createCustomRodsState({0: 4, 1: 2, 6: 8}),
                        targetState: createCustomRodsState({6: 8}),
                    },
                ]
            }
        ]
    },
    {
        name: 'Division',
        levels: [
            {
                id: 1,
                title: 'Simple Division',
                description: 'Learn the setup for dividing two numbers.',
                category: 'Division',
                steps: [
                    {
                        title: 'Calculate 8 / 4',
                        instruction: 'We will calculate 8 / 4. First, set the divisor, 4, on the leftmost rod.',
                        explanation: 'Good. The divisor is set on the far left.',
                        initialState: createCustomRodsState({}),
                        targetState: createCustomRodsState({0: 4}),
                    },
                    {
                        title: 'Calculate 8 / 4',
                        instruction: 'Next, set the dividend, 8, on the rightmost rod.',
                        explanation: 'Perfect. The problem 8 / 4 is now set up with the divisor on the left and dividend on the right.',
                        initialState: createCustomRodsState({0: 4}),
                        targetState: createCustomRodsState({0: 4, 6: 8}),
                    },
                    {
                        title: 'Calculate 8 / 4',
                        instruction: 'How many times does 4 go into 8? The answer is 2. Place the quotient, 2, on a middle rod.',
                        explanation: 'Correct. The quotient (the answer) is placed in the middle, between the divisor and dividend.',
                        initialState: createCustomRodsState({0: 4, 6: 8}),
                        targetState: createCustomRodsState({0: 4, 3: 2, 6: 8}),
                    },
                    {
                        title: 'Subtract the Product',
                        instruction: 'Now, subtract the product of the quotient (2) and divisor (4), which is 8, from the dividend.',
                        explanation: 'Great! Subtracting 8 from the dividend leaves 0, which means there is no remainder.',
                        initialState: createCustomRodsState({0: 4, 3: 2, 6: 8}),
                        targetState: createCustomRodsState({0: 4, 3: 2}),
                    },
                     {
                        title: 'Final Result',
                        instruction: 'Finally, clear the divisor on the left to show the final answer.',
                        explanation: 'Excellent! The abacus now shows the final answer, 2.',
                        initialState: createCustomRodsState({0: 4, 3: 2}),
                        targetState: createCustomRodsState({3: 2}),
                    },
                ]
            }
        ]
    }
];