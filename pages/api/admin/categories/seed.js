import clientPromise from '../../../../lib/mongodb'
import { PHRASE_CATEGORIES } from '../../../../lib/phrases'

// Seed the database with categories from the hardcoded file
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const client = await clientPromise
    const db = client.db('bingo')
    const categories = db.collection('categories')
    const phrases = db.collection('phrases')

    const now = new Date()
    let inserted = 0
    let skipped = 0

    const categoryEmojis = {
      'sunrise-regulars': '🌅',
      'steps-traditions': '📖',
      'aa-sayings': '💬',
      'clutter-words': '🗣️',
      'general': '📝'
    }

    // First, seed from PHRASE_CATEGORIES
    let order = 0
    for (const [key, data] of Object.entries(PHRASE_CATEGORIES)) {
      const existing = await categories.findOne({ key })

      if (existing) {
        skipped++
        continue
      }

      await categories.insertOne({
        key,
        name: data.name,
        description: data.description,
        emoji: categoryEmojis[key] || '',
        order: order++,
        isActive: true,
        source: 'seed',
        createdAt: now,
        updatedAt: now
      })
      inserted++
    }

    // Also create categories for any phrases that exist with unknown categories
    const uniqueCategories = await phrases.distinct('category')
    for (const catKey of uniqueCategories) {
      if (!catKey) continue

      const existing = await categories.findOne({ key: catKey })
      if (existing) continue

      // Create a category for orphaned phrases
      await categories.insertOne({
        key: catKey,
        name: catKey.charAt(0).toUpperCase() + catKey.slice(1).replace(/-/g, ' '),
        description: 'Auto-created from existing phrases',
        emoji: categoryEmojis[catKey] || '📝',
        order: order++,
        isActive: true,
        source: 'auto',
        createdAt: now,
        updatedAt: now
      })
      inserted++
    }

    return res.status(200).json({
      success: true,
      inserted,
      skipped,
      message: `Seeded ${inserted} new categories, skipped ${skipped} existing`
    })
  } catch (error) {
    console.error('Error seeding categories:', error)
    return res.status(500).json({ error: 'Failed to seed categories' })
  }
}
