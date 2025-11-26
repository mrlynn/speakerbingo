// Test script to verify trivia answer validation logic
const { triviaQuestions } = require('./lib/triviaQuestions.js');

console.log('🧪 Testing Trivia Answer Validation\n');
console.log('='.repeat(60));

// Test with first 3 questions
const testQuestions = triviaQuestions.slice(0, 3);

testQuestions.forEach((question, qIndex) => {
  console.log(`\n📝 Question ${qIndex + 1}: ${question.question.substring(0, 60)}...`);
  console.log(`   Category: ${question.category}`);
  console.log(`   Options: ${question.options.length}`);
  console.log(`   Correct Index: ${question.correctIndex} (${typeof question.correctIndex})`);
  console.log(`   Correct Answer: "${question.options[question.correctIndex]}"`);

  // Test each option
  console.log('\n   Testing validation:');
  question.options.forEach((option, index) => {
    // Simulate the API comparison logic
    const answerIndex = index; // This would come from the frontend
    const correctIndex = question.correctIndex; // From the database

    // This is the exact comparison from the API
    const isAnswerCorrect = parseInt(answerIndex, 10) === parseInt(correctIndex, 10);

    const symbol = isAnswerCorrect ? '✅' : '❌';
    const status = isAnswerCorrect ? 'CORRECT' : 'WRONG';

    console.log(`   ${symbol} Option ${index} (${option.substring(0, 30)}...) -> ${status}`);
  });

  console.log('');
  console.log('-'.repeat(60));
});

// Test with string vs number comparison (potential issue)
console.log('\n🔍 Testing Type Coercion:\n');

const testCases = [
  { answer: 0, correct: 0, expected: true },
  { answer: '0', correct: 0, expected: true },
  { answer: 0, correct: '0', expected: true },
  { answer: '1', correct: '1', expected: true },
  { answer: 1, correct: 2, expected: false },
  { answer: '1', correct: 2, expected: false },
];

testCases.forEach(({ answer, correct, expected }) => {
  const result = parseInt(answer, 10) === parseInt(correct, 10);
  const symbol = result === expected ? '✅' : '❌';
  console.log(`${symbol} answer=${answer} (${typeof answer}), correct=${correct} (${typeof correct}) => ${result} (expected: ${expected})`);
});

console.log('\n' + '='.repeat(60));
console.log('✅ Test Complete!\n');
