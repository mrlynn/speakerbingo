// Daily Challenge System
// Challenges rotate daily and provide extra engagement

export const CHALLENGE_TYPES = {
  POINTS_GOAL: 'points_goal',
  CORNER_BINGO: 'corner_bingo',
  NO_REPEAT_CLICKS: 'no_repeat_clicks',
  SPEED_BINGO: 'speed_bingo',
  EDGE_FOCUS: 'edge_focus',
  HIGH_SCORER: 'high_scorer',
  LISTENING_MASTER: 'listening_master'
}

export const DAILY_CHALLENGES = [
  {
    id: 'corner_crusher',
    type: CHALLENGE_TYPES.CORNER_BINGO,
    title: '🎯 Corner Crusher',
    description: 'Get BINGO using only corner and edge squares',
    reward: 500,
    icon: '🎯',
    difficulty: 'Medium'
  },
  {
    id: 'points_master',
    type: CHALLENGE_TYPES.POINTS_GOAL,
    title: '💎 Points Master',
    description: 'Score 1,500+ points in a single game',
    reward: 750,
    icon: '💎',
    difficulty: 'Hard',
    target: 1500
  },
  {
    id: 'speed_demon',
    type: CHALLENGE_TYPES.SPEED_BINGO,
    title: '⚡ Speed Demon',
    description: 'Get BINGO in under 10 minutes',
    reward: 400,
    icon: '⚡',
    difficulty: 'Medium',
    timeLimit: 600 // 10 minutes in seconds
  },
  {
    id: 'no_repeats',
    type: CHALLENGE_TYPES.NO_REPEAT_CLICKS,
    title: '✨ Perfect Listener',
    description: 'Get BINGO without clicking any square twice',
    reward: 600,
    icon: '✨',
    difficulty: 'Hard'
  },
  {
    id: 'edge_lord',
    type: CHALLENGE_TYPES.EDGE_FOCUS,
    title: '🔲 Edge Lord',
    description: 'Score 800+ points using only edge squares',
    reward: 450,
    icon: '🔲',
    difficulty: 'Medium',
    target: 800
  },
  {
    id: 'high_scorer',
    type: CHALLENGE_TYPES.HIGH_SCORER,
    title: '🏆 High Scorer',
    description: 'Finish in top 2 of a multiplayer game',
    reward: 350,
    icon: '🏆',
    difficulty: 'Easy'
  },
  {
    id: 'listening_zen',
    type: CHALLENGE_TYPES.LISTENING_MASTER,
    title: '🧘 Listening Zen',
    description: 'Mark 20+ squares without getting BINGO',
    reward: 300,
    icon: '🧘',
    difficulty: 'Easy',
    target: 20
  }
]

// Advertisements that can appear in the banner
export const ADVERTISEMENTS = [
  {
    id: 'premium_upgrade',
    type: 'premium',
    message: '✨ Upgrade to Premium for unlimited phrase categories and custom themes! 🌟',
    cta: 'Learn More',
    link: '/premium'
  },
  {
    id: 'invite_friends',
    type: 'social',
    message: '👥 More fun with friends! Share your room code and play together! 🎉',
    cta: 'Invite Now',
    action: 'share'
  },
  {
    id: 'new_phrases',
    type: 'content',
    message: '🆕 New phrases added to all categories! Keep the game fresh and exciting! 📝',
    cta: null
  },
  {
    id: 'community',
    type: 'social',
    message: '💬 Join our community facebook group to share tips and meet other players! 🤝',
    cta: 'Join Facebook Group',
    link: 'https://www.facebook.com/groups/sunrisesemester'
  }
]

// Get today's challenge based on date
export function getTodaysChallenge() {
  const today = new Date()
  const dayOfYear = getDayOfYear(today)
  const challengeIndex = dayOfYear % DAILY_CHALLENGES.length
  
  return {
    ...DAILY_CHALLENGES[challengeIndex],
    date: today.toDateString(),
    expiresAt: getEndOfDay(today)
  }
}

// Get current banner message (alternates between challenges and ads)
export function getCurrentBannerMessage() {
  const now = new Date()
  const minuteOfDay = now.getHours() * 60 + now.getMinutes()
  
  // Every 5 minutes, decide between challenge or ad
  const cycleIndex = Math.floor(minuteOfDay / 5)
  const showChallenge = cycleIndex % 3 !== 0 // Show challenge 2/3 of the time
  
  if (showChallenge) {
    const challenge = getTodaysChallenge()
    return {
      type: 'challenge',
      message: `${challenge.icon} Daily Challenge: ${challenge.title} - ${challenge.description} (+${challenge.reward} bonus points!)`,
      challenge: challenge
    }
  } else {
    const adIndex = cycleIndex % ADVERTISEMENTS.length
    return {
      type: 'advertisement',
      message: ADVERTISEMENTS[adIndex].message,
      ad: ADVERTISEMENTS[adIndex]
    }
  }
}

// Check if a challenge is completed based on game state
export function checkChallengeCompletion(challenge, gameStats) {
  switch (challenge.type) {
    case CHALLENGE_TYPES.POINTS_GOAL:
      return gameStats.points >= challenge.target
      
    case CHALLENGE_TYPES.CORNER_BINGO:
      // Check if bingo was achieved using only corners and edges
      return gameStats.hasBingo && gameStats.usedOnlyEdgesAndCorners
      
    case CHALLENGE_TYPES.NO_REPEAT_CLICKS:
      // Check if bingo was achieved without repeat clicks
      return gameStats.hasBingo && gameStats.maxClicksOnSquare === 1
      
    case CHALLENGE_TYPES.SPEED_BINGO:
      // Check if bingo was achieved within time limit
      return gameStats.hasBingo && gameStats.timeToCompletion <= challenge.timeLimit
      
    case CHALLENGE_TYPES.EDGE_FOCUS:
      // Check if target points achieved using only edge squares
      return gameStats.edgeOnlyPoints >= challenge.target
      
    case CHALLENGE_TYPES.HIGH_SCORER:
      // Check if finished in top 2 of multiplayer
      return gameStats.isMultiplayer && gameStats.rank <= 2
      
    case CHALLENGE_TYPES.LISTENING_MASTER:
      // Check if marked enough squares without bingo
      return !gameStats.hasBingo && gameStats.markedSquares >= challenge.target
      
    default:
      return false
  }
}

// Utility functions
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getEndOfDay(date) {
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  return endOfDay
}

// Get challenge progress message
export function getChallengeProgressMessage(challenge, gameStats) {
  switch (challenge.type) {
    case CHALLENGE_TYPES.POINTS_GOAL:
      const pointsNeeded = Math.max(0, challenge.target - gameStats.points)
      return pointsNeeded > 0 ? `${pointsNeeded} more points needed!` : 'Challenge completed! 🎉'
      
    case CHALLENGE_TYPES.LISTENING_MASTER:
      const squaresNeeded = Math.max(0, challenge.target - gameStats.markedSquares)
      return squaresNeeded > 0 ? `${squaresNeeded} more squares to mark!` : 'Challenge completed! 🎉'
      
    default:
      return 'Keep playing to complete this challenge!'
  }
}