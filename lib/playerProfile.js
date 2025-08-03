// Anonymous Player Profile System
// Tracks player stats and achievements without requiring authentication

export const ACHIEVEMENT_TYPES = {
  FIRST_BINGO: 'first_bingo',
  SPEED_DEMON: 'speed_demon', // Bingo in under 5 minutes
  POINT_MASTER: 'point_master', // 2000+ points in single game
  DAILY_CHALLENGER: 'daily_challenger', // Complete 5 daily challenges
  WEEK_WARRIOR: 'week_warrior', // Play 7 days in a row
  SOCIAL_PLAYER: 'social_player', // Play 10 multiplayer games
  PERFECTIONIST: 'perfectionist', // Get bingo without repeat clicks
  CORNER_KING: 'corner_king', // Get bingo using only corners/edges 5 times
  LISTENING_MASTER: 'listening_master', // Mark 24/24 squares (full card)
  VETERAN: 'veteran' // Play 100 games total
}

export const ACHIEVEMENTS = {
  [ACHIEVEMENT_TYPES.FIRST_BINGO]: {
    id: ACHIEVEMENT_TYPES.FIRST_BINGO,
    name: 'First Sunrise',
    description: 'Get your first BINGO!',
    icon: '🌅',
    points: 100,
    rarity: 'common'
  },
  [ACHIEVEMENT_TYPES.SPEED_DEMON]: {
    id: ACHIEVEMENT_TYPES.SPEED_DEMON,
    name: 'Speed Demon',
    description: 'Get BINGO in under 5 minutes',
    icon: '⚡',
    points: 300,
    rarity: 'rare'
  },
  [ACHIEVEMENT_TYPES.POINT_MASTER]: {
    id: ACHIEVEMENT_TYPES.POINT_MASTER,
    name: 'Point Master',
    description: 'Score 2000+ points in a single game',
    icon: '💎',
    points: 500,
    rarity: 'epic'
  },
  [ACHIEVEMENT_TYPES.DAILY_CHALLENGER]: {
    id: ACHIEVEMENT_TYPES.DAILY_CHALLENGER,
    name: 'Daily Challenger',
    description: 'Complete 5 daily challenges',
    icon: '🎯',
    points: 250,
    rarity: 'rare'
  },
  [ACHIEVEMENT_TYPES.WEEK_WARRIOR]: {
    id: ACHIEVEMENT_TYPES.WEEK_WARRIOR,
    name: 'Week Warrior',
    description: 'Play 7 days in a row',
    icon: '🔥',
    points: 400,
    rarity: 'epic'
  },
  [ACHIEVEMENT_TYPES.SOCIAL_PLAYER]: {
    id: ACHIEVEMENT_TYPES.SOCIAL_PLAYER,
    name: 'Social Player',
    description: 'Play 10 multiplayer games',
    icon: '👥',
    points: 200,
    rarity: 'uncommon'
  },
  [ACHIEVEMENT_TYPES.PERFECTIONIST]: {
    id: ACHIEVEMENT_TYPES.PERFECTIONIST,
    name: 'Perfectionist',
    description: 'Get BINGO without clicking any square twice',
    icon: '✨',
    points: 350,
    rarity: 'rare'
  },
  [ACHIEVEMENT_TYPES.CORNER_KING]: {
    id: ACHIEVEMENT_TYPES.CORNER_KING,
    name: 'Corner King',
    description: 'Get BINGO using only corners/edges 5 times',
    icon: '👑',
    points: 600,
    rarity: 'legendary'
  },
  [ACHIEVEMENT_TYPES.LISTENING_MASTER]: {
    id: ACHIEVEMENT_TYPES.LISTENING_MASTER,
    name: 'Listening Master',
    description: 'Mark all 24 squares (full card)',
    icon: '🧘',
    points: 300,
    rarity: 'rare'
  },
  [ACHIEVEMENT_TYPES.VETERAN]: {
    id: ACHIEVEMENT_TYPES.VETERAN,
    name: 'Veteran Player',
    description: 'Play 100 games total',
    icon: '🏆',
    points: 1000,
    rarity: 'legendary'
  }
}

// Default player profile structure
export function createDefaultProfile(playerName = '') {
  return {
    id: generatePlayerId(),
    name: playerName,
    createdAt: new Date().toISOString(),
    lastPlayed: new Date().toISOString(),
    
    // Game Statistics
    stats: {
      totalGames: 0,
      totalBingos: 0,
      totalPoints: 0,
      highestScore: 0,
      averageScore: 0,
      fastestBingo: null, // seconds
      multiplayerGames: 0,
      singlePlayerGames: 0,
      dailyChallengesCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastPlayDate: null,
      
      // Category preferences
      favoriteCategory: null,
      categoryStats: {
        'sunrise-regulars': { games: 0, bingos: 0, points: 0 },
        'steps-traditions': { games: 0, bingos: 0, points: 0 },
        'aa-sayings': { games: 0, bingos: 0, points: 0 },
        'clutter-words': { games: 0, bingos: 0, points: 0 }
      }
    },
    
    // Achievements
    achievements: {
      unlocked: [], // Array of achievement IDs
      progress: {} // Achievement progress tracking
    },
    
    // Settings/Preferences
    preferences: {
      defaultName: playerName,
      rememberName: true,
      showAchievementNotifications: true,
      preferredCategory: 'sunrise-regulars'
    }
  }
}

// Generate unique player ID
function generatePlayerId() {
  return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Load player profile from localStorage
export function loadPlayerProfile() {
  try {
    const saved = localStorage.getItem('sunrise_bingo_profile')
    if (saved) {
      const profile = JSON.parse(saved)
      // Migrate old profiles if needed
      return migrateProfile(profile)
    }
  } catch (error) {
    console.warn('Failed to load player profile:', error)
  }
  return createDefaultProfile()
}

// Save player profile to localStorage
export function savePlayerProfile(profile) {
  try {
    profile.lastPlayed = new Date().toISOString()
    localStorage.setItem('sunrise_bingo_profile', JSON.stringify(profile))
    
    // Submit to global leaderboard if significant progress
    if (profile.stats.totalPoints > 0) {
      submitToGlobalLeaderboard(profile)
    }
    
    return true
  } catch (error) {
    console.warn('Failed to save player profile:', error)
    return false
  }
}

// Submit player data to global leaderboard
async function submitToGlobalLeaderboard(profile) {
  try {
    // Only submit if player has meaningful progress
    if (profile.stats.totalGames < 1) return
    
    const response = await fetch('/api/leaderboard/global', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerData: profile
      })
    })
    
    if (!response.ok) {
      console.warn('Failed to submit to leaderboard:', response.statusText)
    }
  } catch (error) {
    console.warn('Error submitting to leaderboard:', error)
    // Fail silently - local data is more important
  }
}

// Update player statistics after a game
export function updateGameStats(profile, gameResult) {
  const stats = profile.stats
  
  // Basic game stats
  stats.totalGames++
  stats.totalPoints += gameResult.points || 0
  stats.lastPlayDate = new Date().toISOString()
  
  // Track highest score
  if (gameResult.points > stats.highestScore) {
    stats.highestScore = gameResult.points
  }
  
  // Calculate average score
  stats.averageScore = Math.round(stats.totalPoints / stats.totalGames)
  
  // Track bingo stats
  if (gameResult.hasBingo) {
    stats.totalBingos++
    
    // Track fastest bingo
    if (gameResult.timeToCompletion && 
        (!stats.fastestBingo || gameResult.timeToCompletion < stats.fastestBingo)) {
      stats.fastestBingo = gameResult.timeToCompletion
    }
  }
  
  // Track game mode
  if (gameResult.isMultiplayer) {
    stats.multiplayerGames++
  } else {
    stats.singlePlayerGames++
  }
  
  // Track category stats
  if (gameResult.category && stats.categoryStats[gameResult.category]) {
    const catStats = stats.categoryStats[gameResult.category]
    catStats.games++
    catStats.points += gameResult.points || 0
    if (gameResult.hasBingo) {
      catStats.bingos++
    }
  }
  
  // Update playing streak
  updatePlayingStreak(profile)
  
  // Check for new achievements
  const newAchievements = checkAchievements(profile, gameResult)
  
  return {
    profile,
    newAchievements
  }
}

// Update daily challenge completion
export function updateChallengeCompletion(profile, challengeReward) {
  profile.stats.dailyChallengesCompleted++
  profile.stats.totalPoints += challengeReward
  
  // Check for daily challenge achievements
  return checkAchievements(profile, { challengeCompleted: true })
}

// Update playing streak
function updatePlayingStreak(profile) {
  const today = new Date().toDateString()
  const lastPlayed = profile.stats.lastPlayDate ? 
    new Date(profile.stats.lastPlayDate).toDateString() : null
  
  if (!lastPlayed) {
    // First time playing
    profile.stats.currentStreak = 1
    profile.stats.longestStreak = 1
  } else {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toDateString()
    
    if (lastPlayed === yesterdayStr) {
      // Played yesterday, continue streak
      profile.stats.currentStreak++
      if (profile.stats.currentStreak > profile.stats.longestStreak) {
        profile.stats.longestStreak = profile.stats.currentStreak
      }
    } else if (lastPlayed !== today) {
      // Streak broken
      profile.stats.currentStreak = 1
    }
    // If lastPlayed === today, streak stays the same
  }
}

// Check for achievement unlocks
function checkAchievements(profile, gameResult) {
  const newAchievements = []
  const { stats, achievements } = profile
  
  // Helper function to unlock achievement
  const unlock = (achievementId) => {
    if (!achievements.unlocked.includes(achievementId)) {
      achievements.unlocked.push(achievementId)
      newAchievements.push(ACHIEVEMENTS[achievementId])
    }
  }
  
  // First Bingo
  if (gameResult.hasBingo && stats.totalBingos === 1) {
    unlock(ACHIEVEMENT_TYPES.FIRST_BINGO)
  }
  
  // Speed Demon (5 minutes = 300 seconds)
  if (gameResult.hasBingo && gameResult.timeToCompletion && gameResult.timeToCompletion <= 300) {
    unlock(ACHIEVEMENT_TYPES.SPEED_DEMON)
  }
  
  // Point Master
  if (gameResult.points >= 2000) {
    unlock(ACHIEVEMENT_TYPES.POINT_MASTER)
  }
  
  // Daily Challenger
  if (stats.dailyChallengesCompleted >= 5) {
    unlock(ACHIEVEMENT_TYPES.DAILY_CHALLENGER)
  }
  
  // Week Warrior
  if (stats.currentStreak >= 7) {
    unlock(ACHIEVEMENT_TYPES.WEEK_WARRIOR)
  }
  
  // Social Player
  if (stats.multiplayerGames >= 10) {
    unlock(ACHIEVEMENT_TYPES.SOCIAL_PLAYER)
  }
  
  // Perfectionist
  if (gameResult.hasBingo && gameResult.maxClicksOnSquare === 1) {
    unlock(ACHIEVEMENT_TYPES.PERFECTIONIST)
  }
  
  // Corner King
  if (gameResult.hasBingo && gameResult.usedOnlyEdgesAndCorners) {
    if (!achievements.progress.cornerKingCount) {
      achievements.progress.cornerKingCount = 0
    }
    achievements.progress.cornerKingCount++
    if (achievements.progress.cornerKingCount >= 5) {
      unlock(ACHIEVEMENT_TYPES.CORNER_KING)
    }
  }
  
  // Listening Master
  if (gameResult.markedSquares >= 24) {
    unlock(ACHIEVEMENT_TYPES.LISTENING_MASTER)
  }
  
  // Veteran
  if (stats.totalGames >= 100) {
    unlock(ACHIEVEMENT_TYPES.VETERAN)
  }
  
  return newAchievements
}

// Migrate old profile versions
function migrateProfile(profile) {
  // Add any missing fields from newer versions
  const defaultProfile = createDefaultProfile()
  
  // Recursive merge function
  function mergeDeep(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {}
        mergeDeep(target[key], source[key])
      } else if (target[key] === undefined) {
        target[key] = source[key]
      }
    }
    return target
  }
  
  return mergeDeep(profile, defaultProfile)
}

// Export profile data as JSON
export function exportProfile(profile) {
  const exportData = {
    ...profile,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }
  
  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `sunrise-bingo-profile-${new Date().toISOString().split('T')[0]}.json`
  link.click()
}

// Import profile data from JSON
export function importProfile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedProfile = JSON.parse(e.target.result)
        // Validate profile structure
        if (importedProfile.id && importedProfile.stats) {
          const migratedProfile = migrateProfile(importedProfile)
          resolve(migratedProfile)
        } else {
          reject(new Error('Invalid profile file format'))
        }
      } catch (error) {
        reject(new Error('Failed to parse profile file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// Generate shareable player code for cloud backup (future feature)
export function generatePlayerCode(profile) {
  // This would integrate with a backend service
  // For now, just return a mock code
  return profile.id.split('_')[1].toUpperCase().substr(0, 8)
}

// Get player level based on total points
export function getPlayerLevel(totalPoints) {
  const levels = [
    { level: 1, threshold: 0, title: 'Newcomer' },
    { level: 2, threshold: 1000, title: 'Listener' },
    { level: 3, threshold: 2500, title: 'Regular' },
    { level: 4, threshold: 5000, title: 'Veteran' },
    { level: 5, threshold: 10000, title: 'Master' },
    { level: 6, threshold: 20000, title: 'Expert' },
    { level: 7, threshold: 35000, title: 'Champion' },
    { level: 8, threshold: 50000, title: 'Legend' },
    { level: 9, threshold: 75000, title: 'Grandmaster' },
    { level: 10, threshold: 100000, title: 'Sunrise Sage' }
  ]
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalPoints >= levels[i].threshold) {
      const nextLevel = levels[i + 1]
      return {
        ...levels[i],
        progress: nextLevel ? 
          (totalPoints - levels[i].threshold) / (nextLevel.threshold - levels[i].threshold) : 1,
        nextThreshold: nextLevel?.threshold || null
      }
    }
  }
  
  return levels[0]
}