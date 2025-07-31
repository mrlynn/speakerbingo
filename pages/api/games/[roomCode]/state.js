import clientPromise from '../../../../lib/mongodb'

export default async function handler(req, res) {
  const { roomCode } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
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
    
    res.status(200).json({ game })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to get game state' })
  }
}