import clientPromise from '../../../../lib/mongodb'

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db('bingo')
  const categories = db.collection('categories')
  const phrases = db.collection('phrases')

  // GET - List all categories with phrase counts
  if (req.method === 'GET') {
    try {
      const categoryList = await categories.find({}).sort({ order: 1, name: 1 }).toArray()

      // Get phrase counts for each category
      const phraseCounts = await phrases.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]).toArray()

      const countMap = {}
      phraseCounts.forEach(c => {
        countMap[c._id] = c.count
      })

      const categoriesWithCounts = categoryList.map(cat => ({
        ...cat,
        phraseCount: countMap[cat.key] || 0
      }))

      return res.status(200).json({ categories: categoriesWithCounts })
    } catch (error) {
      console.error('Error fetching categories:', error)
      return res.status(500).json({ error: 'Failed to fetch categories' })
    }
  }

  // POST - Create a new category
  if (req.method === 'POST') {
    try {
      const { key, name, description, emoji = '', order = 0 } = req.body

      if (!key || !name) {
        return res.status(400).json({ error: 'Key and name are required' })
      }

      // Validate key format (lowercase, hyphens only)
      const keyRegex = /^[a-z0-9-]+$/
      if (!keyRegex.test(key)) {
        return res.status(400).json({ error: 'Key must be lowercase alphanumeric with hyphens only' })
      }

      // Check for duplicate key
      const existing = await categories.findOne({ key })
      if (existing) {
        return res.status(400).json({ error: 'A category with this key already exists' })
      }

      const newCategory = {
        key,
        name,
        description: description || '',
        emoji,
        order: parseInt(order),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await categories.insertOne(newCategory)

      return res.status(201).json({
        success: true,
        category: { ...newCategory, _id: result.insertedId }
      })
    } catch (error) {
      console.error('Error creating category:', error)
      return res.status(500).json({ error: 'Failed to create category' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
