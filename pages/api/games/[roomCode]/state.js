import clientPromise from '../../../../lib/mongodb'
import { mockDb } from '../../../../lib/mockDb'

export default async function handler(req, res) {
  const { roomCode } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
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
    
    res.status(200).json({ game })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to get game state' })
  }
}