import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import clientPromise from '../../../lib/mongoClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get authenticated session
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { profile } = req.body
    if (!profile) {
      return res.status(400).json({ error: 'Profile data required' })
    }

    const client = await clientPromise
    const db = client.db('bingo')
    const profilesCollection = db.collection('profiles')

    // Update or insert profile
    const updatedProfile = {
      ...profile,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userImage: session.user.image,
      lastPlayed: new Date(),
      updatedAt: new Date()
    }

    const result = await profilesCollection.updateOne(
      { userId: session.user.id },
      { $set: updatedProfile },
      { upsert: true }
    )

    // Submit to global leaderboard if significant progress
    if (profile.stats?.totalPoints > 0) {
      await submitToGlobalLeaderboard(db, session.user, profile)
    }

    return res.status(200).json({ 
      success: true, 
      profile: updatedProfile 
    })

  } catch (error) {
    console.error('Error saving profile:', error)
    return res.status(500).json({ error: 'Failed to save profile' })
  }
}

async function submitToGlobalLeaderboard(db, user, profile) {
  try {
    const leaderboardCollection = db.collection('leaderboard')
    
    // Only submit if player has meaningful progress
    if (profile.stats.totalGames < 1) return

    const leaderboardEntry = {
      userId: user.id,
      playerName: user.name,
      playerEmail: user.email,
      playerImage: user.image,
      totalPoints: profile.stats.totalPoints || 0,
      totalBingos: profile.stats.totalBingos || 0,
      totalGames: profile.stats.totalGames || 0,
      highestScore: profile.stats.highestScore || 0,
      averageScore: profile.stats.averageScore || 0,
      fastestBingo: profile.stats.fastestBingo || null,
      currentStreak: profile.stats.currentStreak || 0,
      longestStreak: profile.stats.longestStreak || 0,
      achievements: profile.achievements?.unlocked || [],
      lastUpdated: new Date()
    }

    await leaderboardCollection.updateOne(
      { userId: user.id },
      { $set: leaderboardEntry },
      { upsert: true }
    )
  } catch (error) {
    console.warn('Error submitting to leaderboard:', error)
    // Fail silently - profile save is more important
  }
}

