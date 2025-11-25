// Script to convert CSV trivia questions to the format needed by triviaQuestions.js
const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, '..', 'aa_trivia_questions.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvContent.split('\n').filter(line => line.trim());
const headers = lines[0].split(',');

const questions = [];

// Skip header row
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];

  // Handle quoted fields with commas
  const regex = /(?:,|^)(?:"([^"]*)"|([^",]*))/g;
  const fields = [];
  let match;

  while ((match = regex.exec(line)) !== null) {
    fields.push(match[1] || match[2] || '');
  }

  // Skip empty lines
  if (fields.length < 7 || !fields[0].trim()) continue;

  const [question, answerA, answerB, answerC, answerD, answerE, correctAnswer] = fields;

  // Build options array (5 choices)
  const options = [answerA, answerB, answerC, answerD, answerE].filter(opt => opt && opt.trim());

  // Find correct index (A=0, B=1, C=2, D=3, E=4)
  const correctIndex = correctAnswer.trim().toUpperCase().charCodeAt(0) - 65; // 'A' = 65

  // Generate ID from question
  const id = `q-${i}`;

  // Determine category based on question content
  let category = 'AA Knowledge';
  if (question.includes('Step') || question.includes('Steps')) {
    category = '12 Steps';
  } else if (question.includes('Tradition')) {
    category = '12 Traditions';
  } else if (question.includes('Big Book') || question.includes('Doctor\'s Opinion')) {
    category = 'Big Book';
  } else if (question.includes('founded') || question.includes('year') || question.includes('Bill') || question.includes('Dr. Bob')) {
    category = 'AA History';
  }

  // Assign points based on number of options and difficulty
  let points = 50;
  let difficulty = 'medium';

  if (options.length === 5) {
    points = 75;
    difficulty = 'hard';
  } else if (options.length === 4) {
    points = 50;
    difficulty = 'medium';
  }

  questions.push({
    id,
    question: question.trim(),
    options,
    correctIndex,
    category,
    points,
    difficulty
  });
}

// Generate JavaScript file content
const jsContent = `// AA-based trivia questions for the game
// Each question has: question text, options array, correctIndex, category, points, difficulty
// Generated from aa_trivia_questions.csv

export const triviaQuestions = ${JSON.stringify(questions, null, 2)};

// Configuration defaults
export const triviaConfig = {
  defaultIntervalMinutes: 3,  // How often questions appear
  pointsMultiplier: 1,        // Multiply all point values
  maxQuestionsPerGame: 10,    // Maximum questions per game session
};

// Helper to get a random question (excluding already used ones)
export function getRandomQuestion(excludeIds = []) {
  const available = triviaQuestions.filter(q => !excludeIds.includes(q.id));
  if (available.length === 0) {
    // If all questions used, reset and pick any
    return triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

// Helper to get questions by category
export function getQuestionsByCategory(category) {
  return triviaQuestions.filter(q => q.category === category);
}

// Get all unique categories
export function getCategories() {
  return [...new Set(triviaQuestions.map(q => q.category))];
}
`;

// Write to file
const outputPath = path.join(__dirname, '..', 'lib', 'triviaQuestions.js');
fs.writeFileSync(outputPath, jsContent, 'utf-8');

console.log(`✅ Successfully converted ${questions.length} questions!`);
console.log(`📝 Written to: ${outputPath}`);
console.log('\nCategories found:');
const categories = [...new Set(questions.map(q => q.category))];
categories.forEach(cat => {
  const count = questions.filter(q => q.category === cat).length;
  console.log(`  - ${cat}: ${count} questions`);
});
