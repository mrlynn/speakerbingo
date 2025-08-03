// Meeting Topic Categories for Topic Jar Roulette
// A collection of thoughtful discussion topics for AA meetings

export const TOPIC_CATEGORIES = {
  'recovery-fundamentals': {
    name: 'Recovery Fundamentals',
    color: '#FF6B35', // Sunrise orange
    icon: '📚',
    topics: [
      {
        title: 'Working Step 4',
        description: 'Share your experience with taking a fearless moral inventory.',
        questions: ['What was the hardest part?', 'What insights did you gain?', 'How did it change your perspective?']
      },
      {
        title: 'Finding a Sponsor',
        description: 'Discuss the importance of sponsorship in recovery.',
        questions: ['What qualities do you look for in a sponsor?', 'How has sponsorship helped you?', 'What advice would you give someone seeking a sponsor?']
      },
      {
        title: 'Gratitude in Recovery',
        description: 'Share what you\'re grateful for in your recovery journey.',
        questions: ['How has gratitude changed since getting sober?', 'What are you most thankful for today?', 'How do you practice gratitude daily?']
      },
      {
        title: 'The First Step',
        description: 'Discuss powerlessness and unmanageability.',
        questions: ['When did you truly accept Step 1?', 'What does powerlessness mean to you?', 'How do you recognize unmanageability?']
      },
      {
        title: 'Spiritual Awakening',
        description: 'Share your experience of spiritual awakening in recovery.',
        questions: ['How would you describe your spiritual awakening?', 'Was it sudden or gradual?', 'How has it changed your life?']
      },
      {
        title: 'Making Amends',
        description: 'Discuss the process of making amends to others.',
        questions: ['What was your most difficult amends?', 'How did making amends change you?', 'What did you learn about forgiveness?']
      }
    ]
  },
  
  'life-skills': {
    name: 'Life Skills',
    color: '#F7931E', // Golden orange
    icon: '🛠️',
    topics: [
      {
        title: 'Healthy Relationships',
        description: 'Building and maintaining healthy relationships in sobriety.',
        questions: ['How have your relationships changed in recovery?', 'What makes a relationship healthy?', 'How do you set boundaries?']
      },
      {
        title: 'Dealing with Stress',
        description: 'Managing stress without drinking or using.',
        questions: ['What are your healthy coping mechanisms?', 'How do you recognize stress triggers?', 'What tools help you stay calm?']
      },
      {
        title: 'Work and Recovery',
        description: 'Balancing career and recovery priorities.',
        questions: ['How do you maintain recovery at work?', 'Have you disclosed your recovery to colleagues?', 'How do you handle work stress?']
      },
      {
        title: 'Financial Recovery',
        description: 'Rebuilding financial stability and responsibility.',
        questions: ['How has sobriety improved your finances?', 'What money mistakes did you make while using?', 'How do you practice financial responsibility?']
      },
      {
        title: 'Family Dynamics',
        description: 'Healing family relationships affected by addiction.',
        questions: ['How has your family adjusted to your sobriety?', 'What family relationships need healing?', 'How do you handle family gatherings?']
      },
      {
        title: 'Time Management',
        description: 'Using time productively and purposefully in recovery.',
        questions: ['How do you structure your day?', 'What activities bring you joy?', 'How do you avoid boredom?']
      }
    ]
  },
  
  'spiritual-growth': {
    name: 'Spiritual Growth',
    color: '#9B59B6', // Purple
    icon: '🙏',
    topics: [
      {
        title: 'Prayer and Meditation',
        description: 'Developing a personal practice of prayer and meditation.',
        questions: ['How do you pray or meditate?', 'What obstacles do you face?', 'How has your practice evolved?']
      },
      {
        title: 'Higher Power',
        description: 'Your understanding and relationship with a Higher Power.',
        questions: ['How do you define your Higher Power?', 'How has this understanding changed?', 'How do you connect with your Higher Power?']
      },
      {
        title: 'Surrender',
        description: 'Learning to let go and trust the process.',
        questions: ['What does surrender mean to you?', 'What are you having trouble letting go of?', 'How do you practice surrender daily?']
      },
      {
        title: 'Faith vs. Fear',
        description: 'Choosing faith over fear in daily life.',
        questions: ['How do you overcome fear with faith?', 'What fears still challenge you?', 'How has faith grown in your recovery?']
      },
      {
        title: 'Spiritual Principles',
        description: 'Living by spiritual principles in all areas of life.',
        questions: ['Which spiritual principles guide you?', 'How do you apply them at work/home?', 'Which principle needs more work?']
      },
      {
        title: 'Service Work',
        description: 'Finding purpose through helping others.',
        questions: ['How do you serve in recovery?', 'What service work means most to you?', 'How has service changed you?']
      }
    ]
  },
  
  'daily-living': {
    name: 'Daily Living',
    color: '#27AE60', // Green
    icon: '🌱',
    topics: [
      {
        title: 'HALT Check-in',
        description: 'Managing when we\'re Hungry, Angry, Lonely, or Tired.',
        questions: ['Which HALT emotion challenges you most?', 'How do you prevent getting too HALT?', 'What self-care practices help?']
      },
      {
        title: 'Triggers and Cravings',
        description: 'Identifying and managing triggers for substance use.',
        questions: ['What are your biggest triggers?', 'How do you handle cravings?', 'What tools work best for you?']
      },
      {
        title: 'Self-Care Practices',
        description: 'Taking care of your physical, mental, and emotional health.',
        questions: ['What does self-care look like for you?', 'How do you prioritize your wellbeing?', 'What self-care do you struggle with?']
      },
      {
        title: 'Sleep and Recovery',
        description: 'The importance of rest and healthy sleep habits.',
        questions: ['How has your sleep improved in sobriety?', 'What helps you sleep better?', 'How does lack of sleep affect your recovery?']
      },
      {
        title: 'Exercise and Wellness',
        description: 'Physical fitness and overall wellness in recovery.',
        questions: ['How do you stay physically active?', 'What role does exercise play in your recovery?', 'How do you motivate yourself to stay healthy?']
      },
      {
        title: 'One Day at a Time',
        description: 'Living in the present moment and taking recovery one day at a time.',
        questions: ['How do you stay present?', 'What helps when you\'re thinking too far ahead?', 'How do you handle overwhelming days?']
      }
    ]
  },
  
  'personal-growth': {
    name: 'Personal Growth',
    color: '#E74C3C', // Red
    icon: '🌟',
    topics: [
      {
        title: 'Character Defects',
        description: 'Identifying and working on personal character defects.',
        questions: ['What character defects do you struggle with?', 'How do you work on removing them?', 'Which ones have improved most?']
      },
      {
        title: 'Self-Acceptance',
        description: 'Learning to accept yourself as you are while growing.',
        questions: ['How has self-acceptance grown in recovery?', 'What parts of yourself are hardest to accept?', 'How do you practice self-compassion?']
      },
      {
        title: 'Perfectionism',
        description: 'Dealing with perfectionist tendencies and unrealistic expectations.',
        questions: ['How does perfectionism affect your recovery?', 'What does "progress not perfection" mean to you?', 'How do you handle mistakes?']
      },
      {
        title: 'Honesty',
        description: 'Developing rigorous honesty in all areas of life.',
        questions: ['How has honesty improved your life?', 'Where do you still struggle with honesty?', 'How do you practice honesty daily?']
      },
      {
        title: 'Humility',
        description: 'Learning humility and letting go of ego.',
        questions: ['What does humility mean to you?', 'How has your ego gotten in the way?', 'How do you practice being humble?']
      },
      {
        title: 'Personal Inventory',
        description: 'Regular self-examination and personal accountability.',
        questions: ['How often do you take personal inventory?', 'What patterns do you notice about yourself?', 'How do you stay accountable?']
      }
    ]
  },
  
  'fellowship': {
    name: 'Fellowship',
    color: '#3498DB', // Blue
    icon: '🤝',
    topics: [
      {
        title: 'Meeting Dynamics',
        description: 'Creating a safe and welcoming meeting environment.',
        questions: ['What makes a good meeting?', 'How do you welcome newcomers?', 'What meeting format do you prefer?']
      },
      {
        title: 'Sponsorship',
        description: 'Both having a sponsor and being a sponsor.',
        questions: ['How do you choose a sponsee?', 'What have you learned from sponsoring others?', 'How do you maintain healthy sponsor relationships?']
      },
      {
        title: 'Sharing Your Story',
        description: 'The importance of sharing experience, strength, and hope.',
        questions: ['How has sharing your story helped others?', 'What part of your story is hardest to share?', 'How has your story changed over time?']
      },
      {
        title: 'Group Conscience',
        description: 'Participating in group decisions and maintaining unity.',
        questions: ['How do you participate in group conscience?', 'How do you handle disagreements in meetings?', 'What does group unity mean to you?']
      },
      {
        title: 'Helping Newcomers',
        description: 'Supporting those new to recovery.',
        questions: ['How do you help newcomers feel welcome?', 'What do you wish someone had told you early in recovery?', 'How do you share hope without giving advice?']
      },
      {
        title: 'Conference Calls and Online Meetings',
        description: 'Staying connected through virtual fellowship.',
        questions: ['How have online meetings helped your recovery?', 'What are the benefits and challenges?', 'How do you stay engaged virtually?']
      }
    ]
  }
}

// Utility function to get a random topic from any category
export function getRandomTopic() {
  const categories = Object.keys(TOPIC_CATEGORIES)
  const randomCategory = categories[Math.floor(Math.random() * categories.length)]
  const categoryData = TOPIC_CATEGORIES[randomCategory]
  const randomTopic = categoryData.topics[Math.floor(Math.random() * categoryData.topics.length)]
  
  return {
    category: randomCategory,
    categoryName: categoryData.name,
    categoryColor: categoryData.color,
    categoryIcon: categoryData.icon,
    ...randomTopic
  }
}

// Utility function to get a random topic from a specific category
export function getRandomTopicFromCategory(categoryKey) {
  const categoryData = TOPIC_CATEGORIES[categoryKey]
  if (!categoryData) return null
  
  const randomTopic = categoryData.topics[Math.floor(Math.random() * categoryData.topics.length)]
  
  return {
    category: categoryKey,
    categoryName: categoryData.name,
    categoryColor: categoryData.color,
    categoryIcon: categoryData.icon,
    ...randomTopic
  }
}

// Get all categories for the roulette wheel
export function getAllCategories() {
  return Object.entries(TOPIC_CATEGORIES).map(([key, data]) => ({
    key,
    ...data
  }))
}