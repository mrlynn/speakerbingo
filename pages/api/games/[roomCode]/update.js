import clientPromise from '../../../../lib/mongodb'
import { mockDb } from '../../../../lib/mockDb'

export default async function handler(req, res) {
  const { roomCode } = req.query

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { playerId, selected, hasWon } = req.body
    
    // Use mock DB if MongoDB not configured
    let db
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('username:password')) {
      db = mockDb
    } else {
      const client = await clientPromise
      db = client.db('bingo')
    }
    
    const game = await db.collection('games').findOne({ 
      roomCode: roomCode.toUpperCase() 
    })
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' })
    }
    
    const playerIndex = game.players.findIndex(p => p.id === playerId)
    if (playerIndex === -1) {
      return res.status(404).json({ error: 'Player not found' })
    }
    
    // Update player's selection state
    const updateData = {
      [`players.${playerIndex}.selected`]: selected
    }
    
    // If player won, update game status
    if (hasWon && !game.winner) {
      updateData[`players.${playerIndex}.hasWon`] = true
      updateData.winner = playerId
      updateData.status = 'finished'
    }
    
    await db.collection('games').updateOne(
      { roomCode: roomCode.toUpperCase() },
      { $set: updateData }
    )
    
    res.status(200).json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update game state' })
  }
}