import clientPromise from '../../../../lib/mongodb'

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db('bingo')
  const phrases = db.collection('phrases')

  // POST - Bulk import phrases
  if (req.method === 'POST') {
    try {
      const { phrases: phraseList, category, skipDuplicates = true } = req.body

      if (!phraseList || !Array.isArray(phraseList) || phraseList.length === 0) {
        return res.status(400).json({ error: 'Phrases array is required' })
      }

      if (!category) {
        return res.status(400).json({ error: 'Category is required' })
      }

      const now = new Date()
      let inserted = 0
      let skipped = 0
      const errors = []

      for (const phraseText of phraseList) {
        if (!phraseText || typeof phraseText !== 'string') {
          skipped++
          continue
        }

        const text = phraseText.trim()
        if (!text) {
          skipped++
          continue
        }

        // Check for duplicate
        const existing = await phrases.findOne({
          text: { $regex: `^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
          category
        })

        if (existing) {
          if (skipDuplicates) {
            skipped++
            continue
          } else {
            errors.push(`Duplicate: "${text}"`)
            continue
          }
        }

        await phrases.insertOne({
          text,
          category,
          points: 100,
          status: 'approved',
          createdAt: now,
          updatedAt: now
        })
        inserted++
      }

      return res.status(200).json({
        success: true,
        inserted,
        skipped,
        errors,
        message: `Imported ${inserted} phrases, skipped ${skipped}`
      })
    } catch (error) {
      console.error('Error bulk importing phrases:', error)
      return res.status(500).json({ error: 'Failed to import phrases' })
    }
  }

  // DELETE - Bulk delete phrases
  if (req.method === 'DELETE') {
    try {
      const { ids, category, deleteAll = false } = req.body

      if (deleteAll && category) {
        // Delete all phrases in a category
        const result = await phrases.deleteMany({ category })
        return res.status(200).json({
          success: true,
          deleted: result.deletedCount,
          message: `Deleted ${result.deletedCount} phrases from ${category}`
        })
      }

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' })
      }

      const { ObjectId } = require('mongodb')
      const objectIds = ids.map(id => new ObjectId(id))

      const result = await phrases.deleteMany({ _id: { $in: objectIds } })

      return res.status(200).json({
        success: true,
        deleted: result.deletedCount,
        message: `Deleted ${result.deletedCount} phrases`
      })
    } catch (error) {
      console.error('Error bulk deleting phrases:', error)
      return res.status(500).json({ error: 'Failed to delete phrases' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
