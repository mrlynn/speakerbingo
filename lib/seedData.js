import dbConnect from './mongodb';
import AdminUser from './models/AdminUser';
import Theme from './models/Theme';
import Phrase from './models/Phrase';

const themes = [
  {
    name: 'Step Work',
    description: 'Phrases related to working the 12 steps',
    color: '#2e7d32',
    icon: 'stairs',
    priority: 90,
    minPhrases: 25
  },
  {
    name: 'Sponsorship',
    description: 'Common phrases about sponsors and sponsees',
    color: '#1976d2',
    icon: 'people',
    priority: 85,
    minPhrases: 25
  },
  {
    name: 'Gratitude',
    description: 'Expressions of thankfulness and appreciation',
    color: '#f57c00',
    icon: 'favorite',
    priority: 80,
    minPhrases: 25
  },
  {
    name: 'Service',
    description: 'References to service work and helping others',
    color: '#7b1fa2',
    icon: 'volunteer',
    priority: 75,
    minPhrases: 25
  },
  {
    name: 'Newcomer',
    description: 'Phrases often heard from or about newcomers',
    color: '#d32f2f',
    icon: 'person_add',
    priority: 70,
    minPhrases: 25
  },
  {
    name: 'Old-timer Wisdom',
    description: 'Classic sayings from long-time members',
    color: '#455a64',
    icon: 'elderly',
    priority: 65,
    minPhrases: 25
  }
];

const phrases = [
  // Step Work
  { text: "Working the steps", category: 'steps', themes: ['Step Work'] },
  { text: "Made a searching and fearless moral inventory", category: 'steps', themes: ['Step Work'] },
  { text: "Powerless over alcohol", category: 'steps', themes: ['Step Work'] },
  { text: "Came to believe", category: 'steps', themes: ['Step Work'] },
  { text: "Turn it over", category: 'steps', themes: ['Step Work'] },
  { text: "Made a list", category: 'steps', themes: ['Step Work'] },
  { text: "Made amends", category: 'steps', themes: ['Step Work'] },
  { text: "Spiritual awakening", category: 'steps', themes: ['Step Work'] },
  { text: "Character defects", category: 'steps', themes: ['Step Work'] },
  { text: "Shortcomings", category: 'steps', themes: ['Step Work'] },
  
  // Sponsorship
  { text: "Get a sponsor", category: 'sponsorship', themes: ['Sponsorship'] },
  { text: "Call your sponsor", category: 'sponsorship', themes: ['Sponsorship'] },
  { text: "My sponsor says", category: 'sponsorship', themes: ['Sponsorship'] },
  { text: "Work with others", category: 'sponsorship', themes: ['Sponsorship'] },
  { text: "Sponsor someone", category: 'sponsorship', themes: ['Sponsorship'] },
  { text: "Fire your sponsor", category: 'sponsorship', themes: ['Sponsorship'] },
  { text: "Temporary sponsor", category: 'sponsorship', themes: ['Sponsorship'] },
  
  // Gratitude
  { text: "Grateful alcoholic", category: 'gratitude', themes: ['Gratitude'] },
  { text: "Attitude of gratitude", category: 'gratitude', themes: ['Gratitude'] },
  { text: "Gratitude list", category: 'gratitude', themes: ['Gratitude'] },
  { text: "Count your blessings", category: 'gratitude', themes: ['Gratitude'] },
  { text: "Grateful to be here", category: 'gratitude', themes: ['Gratitude'] },
  { text: "Thank you for my sobriety", category: 'gratitude', themes: ['Gratitude'] },
  
  // Service
  { text: "Service keeps you sober", category: 'service', themes: ['Service'] },
  { text: "Make coffee", category: 'service', themes: ['Service'] },
  { text: "Chair a meeting", category: 'service', themes: ['Service'] },
  { text: "Set up chairs", category: 'service', themes: ['Service'] },
  { text: "Greeter at the door", category: 'service', themes: ['Service'] },
  { text: "Secretary position", category: 'service', themes: ['Service'] },
  { text: "Treasurer report", category: 'service', themes: ['Service'] },
  { text: "GSR", category: 'service', themes: ['Service'] },
  
  // Newcomer
  { text: "Keep coming back", category: 'newcomer', themes: ['Newcomer'] },
  { text: "90 meetings in 90 days", category: 'newcomer', themes: ['Newcomer'] },
  { text: "Welcome newcomer", category: 'newcomer', themes: ['Newcomer'] },
  { text: "First things first", category: 'newcomer', themes: ['Newcomer'] },
  { text: "Stick with the winners", category: 'newcomer', themes: ['Newcomer'] },
  { text: "Get phone numbers", category: 'newcomer', themes: ['Newcomer'] },
  { text: "This too shall pass", category: 'newcomer', themes: ['Newcomer'] },
  
  // Old-timer Wisdom
  { text: "It works if you work it", category: 'oldtimer', themes: ['Old-timer Wisdom'] },
  { text: "One day at a time", category: 'oldtimer', themes: ['Old-timer Wisdom'] },
  { text: "Easy does it", category: 'oldtimer', themes: ['Old-timer Wisdom'] },
  { text: "Let go and let God", category: 'oldtimer', themes: ['Old-timer Wisdom'] },
  { text: "Progress not perfection", category: 'oldtimer', themes: ['Old-timer Wisdom'] },
  { text: "Principles before personalities", category: 'oldtimer', themes: ['Old-timer Wisdom'] },
  { text: "Meeting makers make it", category: 'oldtimer', themes: ['Old-timer Wisdom'] },
  { text: "HALT - Hungry, Angry, Lonely, Tired", category: 'oldtimer', themes: ['Old-timer Wisdom'] },
  { text: "Your best thinking got you here", category: 'oldtimer', themes: ['Old-timer Wisdom'] },
  { text: "Take what you need and leave the rest", category: 'oldtimer', themes: ['Old-timer Wisdom'] },
  
  // General recovery phrases
  { text: "Higher Power", category: 'general', themes: ['Step Work'] },
  { text: "God as we understood Him", category: 'general', themes: ['Step Work'] },
  { text: "Serenity Prayer", category: 'general', themes: ['Old-timer Wisdom'] },
  { text: "Big Book", category: 'general', themes: ['Old-timer Wisdom'] },
  { text: "12 and 12", category: 'general', themes: ['Old-timer Wisdom'] },
  { text: "Daily Reflections", category: 'general', themes: ['Old-timer Wisdom'] },
  { text: "Living Sober", category: 'general', themes: ['Old-timer Wisdom'] },
  { text: "Home group", category: 'general', themes: ['Service'] },
  { text: "Dry drunk", category: 'general', themes: ['Old-timer Wisdom'] },
  { text: "Pink cloud", category: 'general', themes: ['Newcomer'] },
  { text: "Rock bottom", category: 'general', themes: ['Newcomer'] },
  { text: "War stories", category: 'general', themes: ['Old-timer Wisdom'] },
  { text: "Experience, strength, and hope", category: 'general', themes: ['Old-timer Wisdom'] },
  { text: "We are not a glum lot", category: 'general', themes: ['Gratitude'] },
  { text: "Happy, joyous, and free", category: 'general', themes: ['Gratitude'] },
  { text: "Cunning, baffling, powerful", category: 'general', themes: ['Old-timer Wisdom'] },
  { text: "Half measures availed us nothing", category: 'general', themes: ['Step Work'] },
  { text: "Rigorous honesty", category: 'general', themes: ['Step Work'] },
  { text: "Constitutionally incapable", category: 'general', themes: ['Step Work'] },
  { text: "Entirely ready", category: 'general', themes: ['Step Work'] },
  { text: "Humbly asked", category: 'general', themes: ['Step Work'] },
  { text: "Conscious contact", category: 'general', themes: ['Step Work'] },
  { text: "Attraction rather than promotion", category: 'general', themes: ['Service'] },
  { text: "Anonymity is the spiritual foundation", category: 'general', themes: ['Service'] },
  { text: "I have a disease", category: 'general', themes: ['Old-timer Wisdom'] },
  { text: "Alcoholism is a family disease", category: 'general', themes: ['Old-timer Wisdom'] },
  { text: "Geographic cure", category: 'general', themes: ['Old-timer Wisdom'] },
  { text: "Insanity is doing the same thing", category: 'general', themes: ['Old-timer Wisdom'] },
  { text: "Surrender to win", category: 'general', themes: ['Step Work'] },
  { text: "Act as if", category: 'general', themes: ['Newcomer'] },
  { text: "Fake it till you make it", category: 'general', themes: ['Newcomer'] },
  { text: "More will be revealed", category: 'general', themes: ['Old-timer Wisdom'] },
  { text: "Stick around for the miracle", category: 'general', themes: ['Newcomer'] },
  { text: "But for the grace of God", category: 'general', themes: ['Gratitude'] },
  { text: "There but for the grace of God go I", category: 'general', themes: ['Gratitude'] }
];

export async function seedDatabase() {
  try {
    await dbConnect();
    
    // Check if data already exists
    const existingUsers = await AdminUser.countDocuments();
    if (existingUsers > 0) {
      console.log('Database already contains data. Skipping seed.');
      return;
    }

    console.log('Creating super admin user...');
    const superAdmin = await AdminUser.create({
      username: 'admin',
      email: 'admin@speakerbingo.com',
      password: 'changeme123', // Change this in production!
      fullName: 'System Administrator',
      role: 'super_admin'
    });

    console.log('Creating themes...');
    const themeMap = {};
    for (const themeData of themes) {
      const theme = await Theme.create({
        ...themeData,
        createdBy: superAdmin._id
      });
      themeMap[theme.name] = theme._id;
    }

    console.log('Creating phrases...');
    for (const phraseData of phrases) {
      const themeIds = phraseData.themes.map(themeName => themeMap[themeName]);
      await Phrase.create({
        text: phraseData.text,
        category: phraseData.category,
        themes: themeIds,
        status: 'approved',
        approvedBy: superAdmin._id,
        approvedAt: new Date(),
        createdBy: superAdmin._id
      });
    }

    // Update phrase counts for themes
    console.log('Updating theme phrase counts...');
    for (const theme of Object.values(themeMap)) {
      const themeDoc = await Theme.findById(theme);
      await themeDoc.updatePhraseCount();
    }

    console.log('Seed data created successfully!');
    console.log('\nAdmin login credentials:');
    console.log('Username: admin');
    console.log('Password: changeme123');
    console.log('\nIMPORTANT: Change the admin password after first login!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}