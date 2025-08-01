export const PHRASE_CATEGORIES = {
  'sunrise-regulars': {
    name: 'Sunrise Regulars',
    description: 'The original collection of meeting favorites',
    phrases: [
      'Pittsburgh or Tuesday', 'Who knew?', "I'm an alcoholic", 'Shine Bright', 'Anyways', 'Zoomaholic', 'You know',
      'Purposeful Life', 'Darkness', 'Prostitutes', 'Husband in Prison', "Let's have ourselves a ___day.",
      'I have more time than ____.', 'Bill W. was a philanderer', 'I dunno.', "y'know", 'Pre-teen Diabetic',
      'Um', 'Like', 'At the end of the day', 'Just saying', 'Right?', "If I'm being honest", "For what it's worth",
      'That being said', 'You get the picture', 'Honestly', 'Kind of', 'Sort of', 'So', 'Basically', 'Moving on', 'Gonna',
      "I'm not gonna lie", 'To be fair', 'Bottom line', 'Long story short', 'The thing is', 'Actually', 'Obviously',
      'Literally', 'Totally', 'Whatever', 'Seriously', 'Absolutely', 'Definitely', 'Probably', 'Certainly',
      'Apparently', 'Hopefully', 'Unfortunately', 'Interestingly', 'Surprisingly', 'Frankly', 'Honestly speaking'
    ]
  },
  
  'steps-traditions': {
    name: 'Steps & Traditions',
    description: 'AA Steps, Traditions, and key recovery concepts',
    phrases: [
      'Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5', 'Step 6', 'Step 7', 'Step 8', 'Step 9', 'Step 10', 'Step 11', 'Step 12',
      'Tradition 1', 'Tradition 2', 'Tradition 3', 'Tradition 4', 'Tradition 5', 'Tradition 6', 'Tradition 7', 'Tradition 8', 'Tradition 9', 'Tradition 10', 'Tradition 11', 'Tradition 12',
      'Powerless', 'Unmanageable', 'Sanity', 'Higher Power', 'God as we understand Him', 'Turn our will over',
      'Moral inventory', 'Exact nature of our wrongs', 'Entirely ready', 'Humbly asked', 'Made amends',
      'Continued to take personal inventory', 'Prayer and meditation', 'Spiritual awakening',
      'Common welfare', 'Group conscience', 'Ultimate authority', 'Self-supporting', 'Primary purpose',
      'Singleness of purpose', 'Principles before personalities', 'Anonymity', 'Attraction rather than promotion',
      'Outside issues', 'Public controversy', 'Professional class', 'Special worker', 'Spiritual foundation',
      'Big Book', 'Twelve and Twelve', 'Daily Reflections', 'Sponsorship', 'Home group', 'Service work',
      'Character defects', 'Shortcomings', 'Resentments', 'Amends', 'Spiritual principles', 'Fellowship'
    ]
  },
  
  'aa-sayings': {
    name: 'AA Sayings',
    description: 'Classic AA slogans and wisdom',
    phrases: [
      'One day at a time', 'Keep it simple', 'First things first', 'Let it begin with me', 'This too shall pass',
      'Easy does it', 'But for the grace of God', 'Think, think, think', 'Live and let live', 'Keep coming back',
      'It works if you work it', 'Progress not perfection', 'Turn it over', 'Let go and let God', 'HALT',
      'Hungry, angry, lonely, tired', 'Keep it in the day', 'One drink away from a drunk', 'Cunning, baffling, powerful',
      'Rarely have we seen a person fail', 'Rigorous honesty', 'Willing to go to any length', 'Constitutionally incapable',
      'Hopeless state of mind and body', 'Spiritual malady', 'Bedevilments', 'Irritable, restless, and discontented',
      'Pitiful and incomprehensible demoralization', 'Phenomenon of craving', 'Mental obsession', 'Physical allergy',
      'Rule 62', 'Never take yourself too seriously', 'Keep an open mind', 'Surrender to win', 'Fake it till you make it',
      'Stick with the winners', 'Take what you like and leave the rest', 'Principles before personalities',
      'When all else fails, follow directions', 'Meeting makers make it', 'Call your sponsor', 'Read the book',
      'Get a sponsor', 'Work the steps', 'Help another alcoholic', 'Attitude of gratitude', 'Act as if',
      'First drink, first drunk', 'Stinking thinking', 'Dry drunk', 'White knuckle sobriety', 'Geographic cure',
      'Slip vs relapse', 'Bottom line', 'Rock bottom', 'Gift of desperation'
    ]
  },
  
  'clutter-words': {
    name: 'Clutter Words',
    description: 'Filler words and speech patterns we all use',
    phrases: [
      'Um', 'Uh', 'Ah', 'Er', 'Like', 'You know', "Y'know", 'I mean', 'Well', 'So', 'Okay', 'Alright',
      'Right?', 'Yeah', 'Yes', 'No', 'Maybe', 'Actually', 'Basically', 'Literally', 'Totally', 'Really',
      'Very', 'Pretty much', 'Kind of', 'Sort of', 'More or less', 'I guess', 'I think', 'I believe',
      'I feel like', 'It seems like', 'You see', 'Look', 'Listen', 'Here\'s the thing', 'The thing is',
      'What I mean is', 'What I\'m saying is', 'Know what I mean?', 'Know what I\'m saying?', 'You feel me?',
      'If that makes sense', 'Does that make sense?', 'Am I making sense?', 'If you will', 'So to speak',
      'As it were', 'Per se', 'In a way', 'In a sense', 'To be honest', 'To tell you the truth', 'Honestly',
      'Frankly', 'Obviously', 'Clearly', 'Certainly', 'Definitely', 'Absolutely', 'Exactly', 'Precisely',
      'Indeed', 'Of course', 'Naturally', 'Sure', 'Fine', 'Whatever', 'Anyway', 'Anyways', 'Anyhow',
      'Moving on', 'Next', 'Also', 'Plus', 'And then', 'But then', 'However', 'Although', 'Though',
      'Still', 'Yet', 'Nevertheless', 'Nonetheless', 'Furthermore', 'Moreover', 'Besides', 'In addition'
    ]
  }
}

export function getRandomPhrasesFromCategory(categoryKey, count = 24) {
  const category = PHRASE_CATEGORIES[categoryKey]
  if (!category) {
    throw new Error(`Category "${categoryKey}" not found`)
  }
  
  const phrases = [...category.phrases]
  const shuffled = shuffleArray(phrases)
  return shuffled.slice(0, count)
}

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}