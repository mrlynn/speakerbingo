import clientPromise from '../../../lib/mongodb'
import { nanoid } from 'nanoid'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { roomCode, playerName, phrases } = req.body
    
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({ error: 'MongoDB connection not configured. Please set MONGODB_URI environment variable.' })
    }
    
    const client = await clientPromise
    const db = client.db('bingo')
    
    const game = await db.collection('games').findOne({ 
      roomCode: roomCode.toUpperCase(),
      status: { $ne: 'finished' }
    })
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' })
    }
    
    // Check if player name already exists
    const existingPlayer = game.players.find(p => p.name === playerName)
    if (existingPlayer) {
      return res.status(400).json({ error: 'Player name already taken' })
    }
    
    const newPlayer = {
      id: nanoid(),
      name: playerName,
      isHost: false,
      grid: phrases,
      selected: Array(5).fill(0).map(() => Array(5).fill(false)),
      hasWon: false
    }
    
    // Set FREE space
    newPlayer.selected[2][2] = true
    
    await db.collection('games').updateOne(
      { roomCode: roomCode.toUpperCase() },
      { 
        $push: { players: newPlayer },
        $set: { status: 'playing' }
      }
    )
    
    res.status(200).json({ 
      roomCode: roomCode.toUpperCase(),
      playerId: newPlayer.id,
      game: { ...game, players: [...game.players, newPlayer] }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to join game' })
  }
}