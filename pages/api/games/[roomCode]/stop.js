import clientPromise from '../../../../lib/mongodb'

export default async function handler(req, res) {
  const { roomCode } = req.query

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { playerId } = req.body
    
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({ error: 'MongoDB connection not configured. Please set MONGODB_URI environment variable.' })
    }
    
    const client = await clientPromise
    const db = client.db('bingo')
    
    const game = await db.collection('games').findOne({ 
      roomCode: roomCode.toUpperCase() 
    })
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' })
    }
    
    // Check if the player is the host
    const player = game.players.find(p => p.id === playerId)
    if (!player || !player.isHost) {
      return res.status(403).json({ error: 'Only the host can stop the game' })
    }
    
    // Check if game is already finished
    if (game.status === 'finished') {
      return res.status(400).json({ error: 'Game is already finished' })
    }
    
    // Find player with highest points
    let highestScore = -1
    let winner = null
    
    game.players.forEach(p => {
      const playerPoints = p.points || 0
      if (playerPoints > highestScore) {
        highestScore = playerPoints
        winner = p.id
      }
    })
    
    // Update game status
    const updateData = {
      status: 'finished',
      winner: winner,
      endedBy: 'host',
      endedAt: new Date()
    }
    
    // Mark the winning player
    if (winner) {
      const winnerIndex = game.players.findIndex(p => p.id === winner)
      if (winnerIndex !== -1) {
        updateData[`players.${winnerIndex}.hasWon`] = true
      }
    }
    
    await db.collection('games').updateOne(
      { roomCode: roomCode.toUpperCase() },
      { $set: updateData }
    )
    
    res.status(200).json({ 
      success: true, 
      winner: winner,
      highestScore: highestScore
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to stop game' })
  }
}