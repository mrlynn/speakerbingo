import clientPromise from '../../../../lib/mongodb'
import { PHRASE_CATEGORIES } from '../../../../lib/phrases'

// Seed the database with phrases from the hardcoded file
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { overwrite = false } = req.body

    const client = await clientPromise
    const db = client.db('bingo')
    const phrases = db.collection('phrases')

    const now = new Date()
    let totalInserted = 0
    let totalSkipped = 0
    const categoryStats = {}

    for (const [categoryKey, categoryData] of Object.entries(PHRASE_CATEGORIES)) {
      let inserted = 0
      let skipped = 0

      for (const phraseText of categoryData.phrases) {
        // Check for existing phrase
        const existing = await phrases.findOne({
          text: { $regex: `^${phraseText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
          category: categoryKey
        })

        if (existing) {
          if (overwrite) {
            await phrases.updateOne(
              { _id: existing._id },
              { $set: { updatedAt: now } }
            )
          }
          skipped++
          continue
        }

        await phrases.insertOne({
          text: phraseText,
          category: categoryKey,
          points: 100,
          status: 'approved',
          source: 'seed',
          createdAt: now,
          updatedAt: now
        })
        inserted++
      }

      categoryStats[categoryKey] = { inserted, skipped, total: categoryData.phrases.length }
      totalInserted += inserted
      totalSkipped += skipped
    }

    return res.status(200).json({
      success: true,
      totalInserted,
      totalSkipped,
      categoryStats,
      message: `Seeded ${totalInserted} new phrases, skipped ${totalSkipped} existing`
    })
  } catch (error) {
    console.error('Error seeding phrases:', error)
    return res.status(500).json({ error: 'Failed to seed phrases' })
  }
}
