import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI)
let db

async function connectToDatabase() {
  if (!db) {
    await client.connect()
    db = client.db('sunrise-bingo')
  }
  return db
}

export default async function handler(req, res) {
  try {
    const database = await connectToDatabase()
    
    if (req.method === 'GET') {
      // Get top 10 players from leaderboard
      const leaderboard = await database
        .collection('leaderboard')
        .find({})
        .sort({ totalPoints: -1 })
        .limit(10)
        .toArray()
      
      res.status(200).json({ leaderboard })
      
    } else if (req.method === 'POST') {
      // Submit/update player stats to leaderboard
      const { playerData } = req.body
      
      if (!playerData || !playerData.id) {
        return res.status(400).json({ error: 'Invalid player data' })
      }
      
      // Check if player exists, update or insert
      const existingPlayer = await database
        .collection('leaderboard')
        .findOne({ playerId: playerData.id })
      
      const leaderboardEntry = {
        playerId: playerData.id,
        playerName: playerData.name || 'Anonymous Player',
        totalPoints: playerData.stats.totalPoints,
        totalGames: playerData.stats.totalGames,
        totalBingos: playerData.stats.totalBingos,
        winRate: playerData.stats.totalGames > 0 ? 
          Math.round((playerData.stats.totalBingos / playerData.stats.totalGames) * 100) : 0,
        highestScore: playerData.stats.highestScore,
        fastestBingo: playerData.stats.fastestBingo,
        currentStreak: playerData.stats.currentStreak,
        longestStreak: playerData.stats.longestStreak,
        achievementsCount: playerData.achievements.unlocked.length,
        lastPlayed: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      if (existingPlayer) {
        // Only update if new total points is higher
        if (playerData.stats.totalPoints > existingPlayer.totalPoints) {
          await database
            .collection('leaderboard')
            .updateOne(
              { playerId: playerData.id },
              { $set: leaderboardEntry }
            )
        }
      } else {
        // Insert new player
        leaderboardEntry.createdAt = new Date().toISOString()
        await database
          .collection('leaderboard')
          .insertOne(leaderboardEntry)
      }
      
      res.status(200).json({ success: true })
      
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    
  } catch (error) {
    console.error('Leaderboard API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}