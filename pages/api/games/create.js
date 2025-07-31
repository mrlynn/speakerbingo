import clientPromise from '../../../lib/mongodb'
import { nanoid } from 'nanoid'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { playerName, phrases } = req.body
    
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({ error: 'MongoDB connection not configured. Please set MONGODB_URI environment variable.' })
    }
    
    const client = await clientPromise
    const db = client.db('bingo')
    
    const roomCode = nanoid(6).toUpperCase()
    
    const game = {
      roomCode,
      createdAt: new Date(),
      players: [{
        id: nanoid(),
        name: playerName,
        isHost: true,
        grid: phrases,
        selected: Array(5).fill(0).map(() => Array(5).fill(false)),
        hasWon: false
      }],
      status: 'waiting', // waiting, playing, finished
      winner: null
    }
    
    // Set FREE space for host
    game.players[0].selected[2][2] = true
    
    await db.collection('games').insertOne(game)
    
    res.status(200).json({ 
      roomCode, 
      playerId: game.players[0].id,
      game 
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create game' })
  }
}