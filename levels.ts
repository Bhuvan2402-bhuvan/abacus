export interface Problem {
  question: string;
  answer: number;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  category: string;
  problems: Problem[];
}

export interface LevelCategory {
  name: string;
  levels: Level[];
}

const PROBLEM_COUNT = 50;
const MAX_ATTEMPTS_MULTIPLIER = 200; // Allow 200 attempts per problem needed. Ample for even the tightest constraints.

// --- UTILITY FUNCTIONS ---
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- PROBLEM GENERATORS ---

const generateAdditionProblems = (level: number): Problem[] => {
  const problems: Problem[] = [];
  const uniqueQuestions = new Set<string>();
  let attempts = 0;
  const maxAttempts = PROBLEM_COUNT * MAX_ATTEMPTS_MULTIPLIER;
  
  while (problems.length < PROBLEM_COUNT) {
    if (attempts++ > maxAttempts) {
        console.error(`Exceeded max attempts for Addition Level ${level}. Generated ${problems.length} problems.`);
        break;
    }

    let num1: number, num2: number;
    switch (level) {
      case 1: // Single digit + Single digit
        num1 = rand(1, 9);
        num2 = rand(1, 9);
        break;
      case 2: { // Double digit + Single digit (no carry)
        const ones1 = rand(0, 8);
        num1 = rand(1, 9) * 10 + ones1;
        num2 = rand(1, 9 - ones1);
        break;
      }
      case 3: { // Double digit + Double digit (no carry)
        const tens1 = rand(1, 8);
        const ones1 = rand(0, 9);
        num1 = tens1 * 10 + ones1;

        const tens2 = rand(1, 9 - tens1);
        const ones2 = rand(0, 9 - ones1);
        num2 = tens2 * 10 + ones2;
        break;
      }
      case 4: { // Double digit + Double digit (with carry)
        const ones1 = rand(1, 9);
        const tens1 = rand(1, 8); // Keep it to 8 to simplify carry logic
        num1 = tens1 * 10 + ones1;

        const ones2 = rand(10 - ones1, 9); // Ensures a carry in the ones place
        const tens2 = rand(1, 9 - tens1); // Ensures sum of tens is < 9 before carry
        num2 = tens2 * 10 + ones2;
        break;
      }
      case 5: // Triple digit + Double/Triple digit
        num1 = rand(100, 999);
        num2 = rand(50, 999);
        break;
      default:
        console.error(`Invalid addition level provided: ${level}`);
        continue; // Skip this iteration to prevent getting stuck
    }
    const question = `${num1} + ${num2}`;
    if (!uniqueQuestions.has(question)) {
      uniqueQuestions.add(question);
      problems.push({ question, answer: num1 + num2 });
    }
  }
  return problems;
};

const generateSubtractionProblems = (level: number): Problem[] => {
    const problems: Problem[] = [];
    const uniqueQuestions = new Set<string>();
    let attempts = 0;
    const maxAttempts = PROBLEM_COUNT * MAX_ATTEMPTS_MULTIPLIER;

    while (problems.length < PROBLEM_COUNT) {
        if (attempts++ > maxAttempts) {
            console.error(`Exceeded max attempts for Subtraction Level ${level}. Generated ${problems.length} problems.`);
            break;
        }
        let num1: number, num2: number;
        switch(level) {
            case 1: // Single digit - Single digit
                num1 = rand(1, 9);
                num2 = rand(0, num1);
                break;
            case 2: { // Double digit - Single digit (no borrow)
                const ones1 = rand(1, 9);
                num1 = rand(1, 9) * 10 + ones1;
                num2 = rand(1, ones1);
                break;
            }
            case 3: { // Double digit - Double digit (no borrow)
                const tens1 = rand(2, 9);
                const ones1 = rand(0, 9);
                num1 = tens1 * 10 + ones1;

                const tens2 = rand(1, tens1 - 1);
                const ones2 = rand(0, ones1);
                num2 = tens2 * 10 + ones2;
                break;
            }
            case 4: { // Double digit - Double digit (with borrow)
                const tens1 = rand(2, 9);
                const ones1 = rand(0, 8);
                num1 = tens1 * 10 + ones1;

                const tens2 = rand(1, tens1 - 1); // Ensures result is positive
                const ones2 = rand(ones1 + 1, 9); // Ensures a borrow is needed
                num2 = tens2 * 10 + ones2;
                break;
            }
            case 5: // Triple digit - Double/Triple digit
                num1 = rand(100, 999);
                num2 = rand(11, num1 - 1);
                break;
            default:
              console.error(`Invalid subtraction level provided: ${level}`);
              continue; // Skip this iteration
        }
        const question = `${num1} - ${num2}`;
        if (!uniqueQuestions.has(question)) {
          uniqueQuestions.add(question);
          problems.push({ question, answer: num1 - num2 });
        }
    }
    return problems;
};

const generateMultiplicationProblems = (level: number): Problem[] => {
    const problems: Problem[] = [];
    const uniqueQuestions = new Set<string>();
    let attempts = 0;
    const maxAttempts = PROBLEM_COUNT * MAX_ATTEMPTS_MULTIPLIER;

    while (problems.length < PROBLEM_COUNT) {
        if (attempts++ > maxAttempts) {
            console.error(`Exceeded max attempts for Multiplication Level ${level}. Generated ${problems.length} problems.`);
            break;
        }
        let num1: number, num2: number;
        switch(level) {
            case 1: // Single digit * Single digit
                num1 = rand(2, 9);
                num2 = rand(2, 9);
                break;
            case 2: // Double digit * Single digit
                num1 = rand(10, 99);
                num2 = rand(2, 9);
                break;
            case 3: // Double digit * Double digit (small)
                num1 = rand(10, 25);
                num2 = rand(10, 25);
                break;
            case 4: // Double digit * Double digit (large)
                num1 = rand(20, 99);
                num2 = rand(10, 50);
                break;
            case 5: // Triple digit * Single digit
                num1 = rand(100, 999);
                num2 = rand(2, 9);
                break;
             default:
              console.error(`Invalid multiplication level provided: ${level}`);
              continue; // Skip this iteration
        }
        const question = `${num1} * ${num2}`;
        if (!uniqueQuestions.has(question)) {
          uniqueQuestions.add(question);
          problems.push({ question, answer: num1 * num2 });
        }
    }
    return problems;
};

const generateDivisionProblems = (level: number): Problem[] => {
    const problems: Problem[] = [];
    const uniqueQuestions = new Set<string>();
    let attempts = 0;
    const maxAttempts = PROBLEM_COUNT * MAX_ATTEMPTS_MULTIPLIER;
    
    while (problems.length < PROBLEM_COUNT) {
        if (attempts++ > maxAttempts) {
            console.error(`Exceeded max attempts for Division Level ${level}. Generated ${problems.length} problems.`);
            break;
        }
        let dividend: number, divisor: number;
        switch(level) {
            case 1: // Result is single digit
                divisor = rand(2, 9);
                dividend = divisor * rand(2, 9);
                break;
            case 2: // Dividend up to 100
                divisor = rand(2, 9);
                dividend = divisor * rand(2, 15);
                break;
            case 3: // Double digit / Single digit
                divisor = rand(2, 9);
                dividend = divisor * rand(10, 50);
                break;
            case 4: // Double digit / Double digit
                divisor = rand(11, 20);
                dividend = divisor * rand(2, 9);
                break;
            case 5: // Triple digit / Single digit
                divisor = rand(2, 9);
                dividend = divisor * rand(20, 99);
                break;
            default:
              console.error(`Invalid division level provided: ${level}`);
              continue; // Skip this iteration
        }
        const question = `${dividend} / ${divisor}`;
        if (!uniqueQuestions.has(question)) {
            uniqueQuestions.add(question);
            problems.push({ question, answer: dividend / divisor });
        }
    }
    return problems;
};

const ADDITION_LEVELS: Level[] = [
    { id: 1, category: 'Addition', title: 'Level 1', description: 'Single digit sums.', problems: generateAdditionProblems(1) },
    { id: 2, category: 'Addition', title: 'Level 2', description: '2-digit + 1-digit (no carry).', problems: generateAdditionProblems(2) },
    { id: 3, category: 'Addition', title: 'Level 3', description: '2-digit + 2-digit (no carry).', problems: generateAdditionProblems(3) },
    { id: 4, category: 'Addition', title: 'Level 4', description: '2-digit + 2-digit (with carry).', problems: generateAdditionProblems(4) },
    { id: 5, category: 'Addition', title: 'Level 5', description: '3-digit addition.', problems: generateAdditionProblems(5) },
];

const SUBTRACTION_LEVELS: Level[] = [
    { id: 1, category: 'Subtraction', title: 'Level 1', description: 'Single digit subtraction.', problems: generateSubtractionProblems(1) },
    { id: 2, category: 'Subtraction', title: 'Level 2', description: '2-digit - 1-digit (no borrow).', problems: generateSubtractionProblems(2) },
    { id: 3, category: 'Subtraction', title: 'Level 3', description: '2-digit - 2-digit (no borrow).', problems: generateSubtractionProblems(3) },
    { id: 4, category: 'Subtraction', title: 'Level 4', description: '2-digit - 2-digit (with borrow).', problems: generateSubtractionProblems(4) },
    { id: 5, category: 'Subtraction', title: 'Level 5', description: '3-digit subtraction.', problems: generateSubtractionProblems(5) },
];

const MULTIPLICATION_LEVELS: Level[] = [
    { id: 1, category: 'Multiplication', title: 'Level 1', description: 'Single digit times tables.', problems: generateMultiplicationProblems(1) },
    { id: 2, category: 'Multiplication', title: 'Level 2', description: '2-digit * 1-digit.', problems: generateMultiplicationProblems(2) },
    { id: 3, category: 'Multiplication', title: 'Level 3', description: '2-digit * 2-digit (small).', problems: generateMultiplicationProblems(3) },
    { id: 4, category: 'Multiplication', title: 'Level 4', description: '2-digit * 2-digit (large).', problems: generateMultiplicationProblems(4) },
    { id: 5, category: 'Multiplication', title: 'Level 5', description: '3-digit * 1-digit.', problems: generateMultiplicationProblems(5) },
];

const DIVISION_LEVELS: Level[] = [
    { id: 1, category: 'Division', title: 'Level 1', description: 'Simple division, single digit answers.', problems: generateDivisionProblems(1) },
    { id: 2, category: 'Division', title: 'Level 2', description: 'Division with dividends up to 100.', problems: generateDivisionProblems(2) },
    { id: 3, category: 'Division', title: 'Level 3', description: '2-digit divided by 1-digit.', problems: generateDivisionProblems(3) },
    { id: 4, category: 'Division', title: 'Level 4', description: '2-digit divided by 2-digit.', problems: generateDivisionProblems(4) },
    { id: 5, category: 'Division', title: 'Level 5', description: '3-digit divided by 1-digit.', problems: generateDivisionProblems(5) },
];

export const LEVEL_CATEGORIES: LevelCategory[] = [
    { name: 'Addition', levels: ADDITION_LEVELS },
    { name: 'Subtraction', levels: SUBTRACTION_LEVELS },
    { name: 'Multiplication', levels: MULTIPLICATION_LEVELS },
    { name: 'Division', levels: DIVISION_LEVELS },
];