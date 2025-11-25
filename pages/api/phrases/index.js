import clientPromise from '../../../lib/mongodb'
import { PHRASE_CATEGORIES } from '../../../lib/phrases'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { category, count = 24 } = req.query

  try {
    const client = await clientPromise
    const db = client.db('bingo')
    const phrases = db.collection('phrases')

    // Check if we have phrases in the database
    const dbCount = await phrases.countDocuments({
      category: category || 'sunrise-regulars',
      status: 'approved'
    })

    if (dbCount > 0) {
      // Get random phrases from database using aggregation
      const dbPhrases = await phrases.aggregate([
        { $match: { category: category || 'sunrise-regulars', status: 'approved' } },
        { $sample: { size: parseInt(count) } }
      ]).toArray()

      return res.status(200).json({
        source: 'database',
        phrases: dbPhrases.map(p => p.text),
        count: dbPhrases.length
      })
    }

    // Fallback to hardcoded phrases
    const categoryData = PHRASE_CATEGORIES[category || 'sunrise-regulars']
    if (!categoryData) {
      return res.status(404).json({ error: 'Category not found' })
    }

    // Shuffle and return
    const shuffled = [...categoryData.phrases].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, parseInt(count))

    return res.status(200).json({
      source: 'file',
      phrases: selected,
      count: selected.length
    })
  } catch (error) {
    console.error('Error fetching phrases:', error)

    // Ultimate fallback to hardcoded phrases on error
    const categoryData = PHRASE_CATEGORIES[category || 'sunrise-regulars']
    if (categoryData) {
      const shuffled = [...categoryData.phrases].sort(() => Math.random() - 0.5)
      return res.status(200).json({
        source: 'file-fallback',
        phrases: shuffled.slice(0, parseInt(count)),
        count: parseInt(count)
      })
    }

    return res.status(500).json({ error: 'Failed to fetch phrases' })
  }
}
