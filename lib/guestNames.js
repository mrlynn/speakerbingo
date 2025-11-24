// Random guest name generator
// Combines adjectives and nouns to create unique, friendly player names

const adjectives = [
  // Positive traits
  'Happy', 'Brave', 'Calm', 'Eager', 'Gentle', 'Kind', 'Proud', 'Wise',
  'Bright', 'Cheerful', 'Clever', 'Curious', 'Daring', 'Friendly', 'Grateful',
  'Hopeful', 'Joyful', 'Lively', 'Merry', 'Patient', 'Peaceful', 'Playful',
  'Serene', 'Sincere', 'Spirited', 'Steady', 'Sunny', 'Swift', 'Tender',
  'Thoughtful', 'Trusty', 'Warm', 'Witty', 'Zesty',

  // Colors
  'Azure', 'Coral', 'Crimson', 'Golden', 'Jade', 'Ruby', 'Silver', 'Violet',

  // Nature-inspired
  'Misty', 'Breezy', 'Cloudy', 'Dewy', 'Frosty', 'Rainy', 'Snowy', 'Stormy',
  'Starry', 'Moonlit', 'Sunny', 'Twilight',

  // Fun/whimsical
  'Bouncy', 'Bubbly', 'Cozy', 'Dreamy', 'Fizzy', 'Fluffy', 'Giggly', 'Jazzy',
  'Perky', 'Quirky', 'Silly', 'Snappy', 'Sparkly', 'Spunky', 'Zippy'
];

const nouns = [
  // Animals
  'Badger', 'Bear', 'Beaver', 'Bunny', 'Cardinal', 'Chipmunk', 'Deer', 'Dolphin',
  'Dragon', 'Eagle', 'Falcon', 'Fox', 'Frog', 'Hawk', 'Hedgehog', 'Heron',
  'Hummingbird', 'Jaguar', 'Koala', 'Lark', 'Lemur', 'Lion', 'Lynx', 'Moose',
  'Otter', 'Owl', 'Panda', 'Panther', 'Parrot', 'Peacock', 'Pelican', 'Penguin',
  'Phoenix', 'Puffin', 'Raccoon', 'Raven', 'Robin', 'Seahorse', 'Sparrow',
  'Squirrel', 'Swan', 'Tiger', 'Turtle', 'Whale', 'Wolf', 'Wren',

  // Nature
  'Acorn', 'Birch', 'Blossom', 'Brook', 'Canyon', 'Cedar', 'Cloud', 'Clover',
  'Coral', 'Creek', 'Daisy', 'Dawn', 'Dune', 'Elm', 'Fern', 'Flower', 'Forest',
  'Glacier', 'Grove', 'Harbor', 'Ivy', 'Lake', 'Leaf', 'Maple', 'Meadow',
  'Moon', 'Mountain', 'Oak', 'Ocean', 'Pebble', 'Pine', 'Pond', 'Prairie',
  'Rain', 'Ridge', 'River', 'Rose', 'Sage', 'Sky', 'Star', 'Stone', 'Stream',
  'Summit', 'Sunrise', 'Sunset', 'Thunder', 'Valley', 'Willow', 'Wind',

  // Whimsical
  'Cookie', 'Cupcake', 'Muffin', 'Pickle', 'Pretzel', 'Waffle', 'Noodle',
  'Button', 'Marble', 'Pebble', 'Puzzle', 'Sprocket', 'Widget', 'Gadget'
];

/**
 * Generate a random guest name
 * @returns {string} A unique guest name like "Happy Otter" or "Brave Phoenix"
 */
export function generateGuestName() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
}

/**
 * Generate a guest name with a number suffix for guaranteed uniqueness
 * @returns {string} A guest name with number like "Happy Otter 42"
 */
export function generateUniqueGuestName() {
  const baseName = generateGuestName();
  const suffix = Math.floor(Math.random() * 100);
  return `${baseName} ${suffix}`;
}

/**
 * Get a list of possible names (for testing/preview)
 * @param {number} count - Number of names to generate
 * @returns {string[]} Array of random guest names
 */
export function generateMultipleNames(count = 5) {
  const names = [];
  for (let i = 0; i < count; i++) {
    names.push(generateGuestName());
  }
  return names;
}

export { adjectives, nouns };
