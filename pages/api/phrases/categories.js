import clientPromise from '../../../lib/mongodb'
import { PHRASE_CATEGORIES } from '../../../lib/phrases'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const client = await clientPromise
    const db = client.db('bingo')
    const categories = db.collection('categories')
    const phrases = db.collection('phrases')

    // Try to get categories from database
    const dbCategories = await categories.find({ isActive: true }).sort({ order: 1 }).toArray()

    if (dbCategories.length > 0) {
      // Get phrase counts
      const phraseCounts = await phrases.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]).toArray()

      const countMap = {}
      phraseCounts.forEach(c => {
        countMap[c._id] = c.count
      })

      const categoriesWithCounts = dbCategories
        .filter(cat => countMap[cat.key] > 0) // Only show categories with phrases
        .map(cat => ({
          key: cat.key,
          name: cat.name,
          description: cat.description,
          emoji: cat.emoji,
          phraseCount: countMap[cat.key] || 0
        }))

      // If we have categories with phrases, return them
      if (categoriesWithCounts.length > 0) {
        return res.status(200).json({
          source: 'database',
          categories: categoriesWithCounts
        })
      }
    }

    // Fallback to hardcoded categories
    const hardcodedCategories = Object.entries(PHRASE_CATEGORIES).map(([key, data]) => ({
      key,
      name: data.name,
      description: data.description,
      emoji: key === 'sunrise-regulars' ? '🌅' :
             key === 'steps-traditions' ? '📖' :
             key === 'aa-sayings' ? '💬' :
             key === 'clutter-words' ? '🗣️' : '',
      phraseCount: data.phrases.length
    }))

    return res.status(200).json({
      source: 'file',
      categories: hardcodedCategories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)

    // Ultimate fallback
    const hardcodedCategories = Object.entries(PHRASE_CATEGORIES).map(([key, data]) => ({
      key,
      name: data.name,
      description: data.description,
      phraseCount: data.phrases.length
    }))

    return res.status(200).json({
      source: 'file-fallback',
      categories: hardcodedCategories
    })
  }
}
