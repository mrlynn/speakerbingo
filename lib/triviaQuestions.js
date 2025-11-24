// AA-based trivia questions for the game
// Each question has: question text, options array, correctIndex, category, points, difficulty

export const triviaQuestions = [
  // The 12 Steps
  {
    id: 'step-1',
    question: 'What is the first of the 12 Steps?',
    options: [
      'We admitted we were powerless over alcohol—that our lives had become unmanageable',
      'Came to believe that a Power greater than ourselves could restore us to sanity',
      'Made a decision to turn our will and our lives over to the care of God',
      'Made a searching and fearless moral inventory of ourselves'
    ],
    correctIndex: 0,
    category: '12 Steps',
    points: 50,
    difficulty: 'easy'
  },
  {
    id: 'step-2',
    question: 'Which step involves "a Power greater than ourselves"?',
    options: [
      'Step 1',
      'Step 2',
      'Step 3',
      'Step 11'
    ],
    correctIndex: 1,
    category: '12 Steps',
    points: 50,
    difficulty: 'easy'
  },
  {
    id: 'step-3',
    question: 'Step 3 involves making a decision to turn our will over to whom?',
    options: [
      'Our sponsor',
      'The AA group',
      'God as we understood Him',
      'Our family'
    ],
    correctIndex: 2,
    category: '12 Steps',
    points: 50,
    difficulty: 'easy'
  },
  {
    id: 'step-4',
    question: 'What kind of inventory does Step 4 call for?',
    options: [
      'A financial inventory',
      'A searching and fearless moral inventory',
      'A relationship inventory',
      'A daily inventory'
    ],
    correctIndex: 1,
    category: '12 Steps',
    points: 50,
    difficulty: 'medium'
  },
  {
    id: 'step-5',
    question: 'In Step 5, we admit the exact nature of our wrongs to how many entities?',
    options: [
      'One - God only',
      'Two - God and ourselves',
      'Three - God, ourselves, and another human being',
      'Four - God, ourselves, our sponsor, and the group'
    ],
    correctIndex: 2,
    category: '12 Steps',
    points: 50,
    difficulty: 'medium'
  },
  {
    id: 'step-8',
    question: 'What does Step 8 ask us to make?',
    options: [
      'A list of all persons we had harmed',
      'A commitment to daily prayer',
      'A promise to attend meetings',
      'A financial plan'
    ],
    correctIndex: 0,
    category: '12 Steps',
    points: 50,
    difficulty: 'medium'
  },
  {
    id: 'step-9',
    question: 'When should we NOT make direct amends according to Step 9?',
    options: [
      'When it would be embarrassing',
      'When the person has moved away',
      'When to do so would injure them or others',
      'When we don\'t have enough money'
    ],
    correctIndex: 2,
    category: '12 Steps',
    points: 75,
    difficulty: 'medium'
  },
  {
    id: 'step-10',
    question: 'Step 10 calls for continued personal inventory and when wrong:',
    options: [
      'Wait until the next meeting to share',
      'Promptly admit it',
      'Write it in a journal',
      'Discuss it with your sponsor first'
    ],
    correctIndex: 1,
    category: '12 Steps',
    points: 50,
    difficulty: 'easy'
  },
  {
    id: 'step-11',
    question: 'What two practices does Step 11 emphasize?',
    options: [
      'Reading and writing',
      'Prayer and meditation',
      'Service and sponsorship',
      'Meetings and fellowship'
    ],
    correctIndex: 1,
    category: '12 Steps',
    points: 50,
    difficulty: 'easy'
  },
  {
    id: 'step-12',
    question: 'Step 12 mentions having had what kind of awakening?',
    options: [
      'A physical awakening',
      'A spiritual awakening',
      'An emotional awakening',
      'A mental awakening'
    ],
    correctIndex: 1,
    category: '12 Steps',
    points: 50,
    difficulty: 'easy'
  },

  // AA History
  {
    id: 'history-1',
    question: 'In what year was Alcoholics Anonymous founded?',
    options: [
      '1925',
      '1935',
      '1945',
      '1955'
    ],
    correctIndex: 1,
    category: 'AA History',
    points: 75,
    difficulty: 'medium'
  },
  {
    id: 'history-2',
    question: 'Who are considered the co-founders of AA?',
    options: [
      'Bill W. and Dr. Bob',
      'Bill W. and Father Ed',
      'Dr. Bob and Sister Ignatia',
      'Bill W. and Ebby T.'
    ],
    correctIndex: 0,
    category: 'AA History',
    points: 50,
    difficulty: 'easy'
  },
  {
    id: 'history-3',
    question: 'In which city was AA founded?',
    options: [
      'New York City',
      'Cleveland',
      'Akron, Ohio',
      'Detroit'
    ],
    correctIndex: 2,
    category: 'AA History',
    points: 75,
    difficulty: 'medium'
  },
  {
    id: 'history-4',
    question: 'What is the date celebrated as AA\'s founding date?',
    options: [
      'January 1, 1935',
      'June 10, 1935',
      'December 12, 1935',
      'April 1, 1935'
    ],
    correctIndex: 1,
    category: 'AA History',
    points: 100,
    difficulty: 'hard'
  },
  {
    id: 'history-5',
    question: 'What book, published in 1939, is central to AA?',
    options: [
      'The 12 Steps',
      'Alcoholics Anonymous (The Big Book)',
      'Living Sober',
      'Twelve Steps and Twelve Traditions'
    ],
    correctIndex: 1,
    category: 'AA History',
    points: 50,
    difficulty: 'easy'
  },
  {
    id: 'history-6',
    question: 'What organization influenced the early development of AA?',
    options: [
      'The Salvation Army',
      'The Oxford Group',
      'The Temperance Movement',
      'The YMCA'
    ],
    correctIndex: 1,
    category: 'AA History',
    points: 100,
    difficulty: 'hard'
  },

  // The 12 Traditions
  {
    id: 'tradition-1',
    question: 'According to Tradition 1, what should come first?',
    options: [
      'Personal recovery',
      'Common welfare',
      'Group autonomy',
      'Financial security'
    ],
    correctIndex: 1,
    category: '12 Traditions',
    points: 75,
    difficulty: 'medium'
  },
  {
    id: 'tradition-2',
    question: 'What is the ultimate authority in AA according to Tradition 2?',
    options: [
      'The General Service Office',
      'The group conscience',
      'A loving God as expressed in our group conscience',
      'The oldest members'
    ],
    correctIndex: 2,
    category: '12 Traditions',
    points: 75,
    difficulty: 'medium'
  },
  {
    id: 'tradition-3',
    question: 'What is the only requirement for AA membership?',
    options: [
      'Paying dues',
      'A desire to stop drinking',
      'Attending 90 meetings in 90 days',
      'Having a sponsor'
    ],
    correctIndex: 1,
    category: '12 Traditions',
    points: 50,
    difficulty: 'easy'
  },
  {
    id: 'tradition-7',
    question: 'According to Tradition 7, how should AA groups be supported?',
    options: [
      'Through government grants',
      'Through member donations only (self-supporting)',
      'Through fundraising events',
      'Through corporate sponsorship'
    ],
    correctIndex: 1,
    category: '12 Traditions',
    points: 75,
    difficulty: 'medium'
  },
  {
    id: 'tradition-11',
    question: 'What principle does Tradition 11 emphasize regarding public relations?',
    options: [
      'Active promotion',
      'Media campaigns',
      'Attraction rather than promotion',
      'Celebrity endorsements'
    ],
    correctIndex: 2,
    category: '12 Traditions',
    points: 75,
    difficulty: 'medium'
  },
  {
    id: 'tradition-12',
    question: 'Tradition 12 states that anonymity is the spiritual foundation of all our traditions, reminding us to place:',
    options: [
      'Personalities before principles',
      'Principles before personalities',
      'Recovery before service',
      'Service before recovery'
    ],
    correctIndex: 1,
    category: '12 Traditions',
    points: 75,
    difficulty: 'medium'
  },

  // Big Book & Literature
  {
    id: 'bigbook-1',
    question: 'What chapter of the Big Book is titled "How It Works"?',
    options: [
      'Chapter 3',
      'Chapter 4',
      'Chapter 5',
      'Chapter 6'
    ],
    correctIndex: 2,
    category: 'Big Book',
    points: 100,
    difficulty: 'hard'
  },
  {
    id: 'bigbook-2',
    question: 'The Big Book chapter "To Wives" was written for whom?',
    options: [
      'Women alcoholics',
      'Wives of alcoholics',
      'Both alcoholics and their wives',
      'Family members in general'
    ],
    correctIndex: 1,
    category: 'Big Book',
    points: 75,
    difficulty: 'medium'
  },
  {
    id: 'bigbook-3',
    question: 'What is the famous phrase that begins the reading of "How It Works"?',
    options: [
      '"We admitted we were powerless"',
      '"Rarely have we seen a person fail"',
      '"God grant me the serenity"',
      '"Keep coming back"'
    ],
    correctIndex: 1,
    category: 'Big Book',
    points: 50,
    difficulty: 'easy'
  },
  {
    id: 'bigbook-4',
    question: 'According to the Big Book, alcoholism is described as what kind of illness?',
    options: [
      'A moral failing',
      'A physical allergy and mental obsession',
      'A bad habit',
      'A lack of willpower'
    ],
    correctIndex: 1,
    category: 'Big Book',
    points: 75,
    difficulty: 'medium'
  },

  // Slogans & Sayings
  {
    id: 'slogan-1',
    question: 'Complete the slogan: "One day at a _____"',
    options: [
      'Meeting',
      'Step',
      'Time',
      'Goal'
    ],
    correctIndex: 2,
    category: 'Slogans',
    points: 25,
    difficulty: 'easy'
  },
  {
    id: 'slogan-2',
    question: 'What does the slogan "HALT" stand for?',
    options: [
      'Happy, Angry, Lonely, Tired',
      'Hungry, Angry, Lonely, Tired',
      'Hurt, Angry, Lost, Troubled',
      'Hopeless, Anxious, Lost, Tired'
    ],
    correctIndex: 1,
    category: 'Slogans',
    points: 50,
    difficulty: 'easy'
  },
  {
    id: 'slogan-3',
    question: 'What is the "Serenity Prayer" asking for the wisdom to know?',
    options: [
      'Right from wrong',
      'When to speak',
      'The difference between things we can and cannot change',
      'Who to trust'
    ],
    correctIndex: 2,
    category: 'Slogans',
    points: 50,
    difficulty: 'easy'
  },
  {
    id: 'slogan-4',
    question: 'Complete the phrase: "Progress, not _____"',
    options: [
      'Perfection',
      'Procrastination',
      'Problems',
      'Pressure'
    ],
    correctIndex: 0,
    category: 'Slogans',
    points: 25,
    difficulty: 'easy'
  },
  {
    id: 'slogan-5',
    question: 'What does "Keep It Simple" encourage members to do?',
    options: [
      'Avoid complex literature',
      'Focus on basic principles without overcomplicating recovery',
      'Only attend one meeting per week',
      'Simplify their work life'
    ],
    correctIndex: 1,
    category: 'Slogans',
    points: 50,
    difficulty: 'easy'
  },

  // Recovery Concepts
  {
    id: 'concept-1',
    question: 'What is a "sponsor" in AA?',
    options: [
      'Someone who pays for your meetings',
      'A professional therapist',
      'An experienced member who guides newcomers through the steps',
      'The group leader'
    ],
    correctIndex: 2,
    category: 'Recovery',
    points: 50,
    difficulty: 'easy'
  },
  {
    id: 'concept-2',
    question: 'What does "carrying the message" refer to in AA?',
    options: [
      'Reading literature aloud',
      'Sharing your experience to help other alcoholics',
      'Sending meeting announcements',
      'Writing your story for publication'
    ],
    correctIndex: 1,
    category: 'Recovery',
    points: 50,
    difficulty: 'easy'
  },
  {
    id: 'concept-3',
    question: 'What is a "home group"?',
    options: [
      'A meeting held at someone\'s house',
      'The first meeting you ever attended',
      'A regular meeting where a member commits to service',
      'A group for family members'
    ],
    correctIndex: 2,
    category: 'Recovery',
    points: 75,
    difficulty: 'medium'
  },
  {
    id: 'concept-4',
    question: 'What is typically given to celebrate sobriety milestones?',
    options: [
      'Certificates',
      'Chips or medallions',
      'Gift cards',
      'Books'
    ],
    correctIndex: 1,
    category: 'Recovery',
    points: 50,
    difficulty: 'easy'
  },
  {
    id: 'concept-5',
    question: 'What color chip is traditionally given to newcomers?',
    options: [
      'Red',
      'Blue',
      'White',
      'Gold'
    ],
    correctIndex: 2,
    category: 'Recovery',
    points: 75,
    difficulty: 'medium'
  }
];

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
