import clientPromise from '../../../../lib/mongodb'

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db('bingo')
  const phrases = db.collection('phrases')

  // GET - List all phrases with optional filtering
  if (req.method === 'GET') {
    try {
      const { category, status, search, page = 1, limit = 50 } = req.query

      const filter = {}
      if (category) filter.category = category
      if (status) filter.status = status
      if (search) {
        filter.text = { $regex: search, $options: 'i' }
      }

      const skip = (parseInt(page) - 1) * parseInt(limit)

      const [results, total] = await Promise.all([
        phrases.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .toArray(),
        phrases.countDocuments(filter)
      ])

      return res.status(200).json({
        phrases: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      })
    } catch (error) {
      console.error('Error fetching phrases:', error)
      return res.status(500).json({ error: 'Failed to fetch phrases' })
    }
  }

  // POST - Create a new phrase
  if (req.method === 'POST') {
    try {
      const { text, category, points = 100, status = 'approved' } = req.body

      if (!text || !category) {
        return res.status(400).json({ error: 'Text and category are required' })
      }

      // Check for duplicate
      const existing = await phrases.findOne({
        text: { $regex: `^${text}$`, $options: 'i' },
        category
      })

      if (existing) {
        return res.status(400).json({ error: 'This phrase already exists in this category' })
      }

      const newPhrase = {
        text: text.trim(),
        category,
        points: parseInt(points),
        status,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await phrases.insertOne(newPhrase)

      return res.status(201).json({
        success: true,
        phrase: { ...newPhrase, _id: result.insertedId }
      })
    } catch (error) {
      console.error('Error creating phrase:', error)
      return res.status(500).json({ error: 'Failed to create phrase' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
