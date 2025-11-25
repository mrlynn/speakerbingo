import clientPromise from '../../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const { id } = req.query

  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid phrase ID' })
  }

  const client = await clientPromise
  const db = client.db('bingo')
  const phrases = db.collection('phrases')

  // GET - Get a single phrase
  if (req.method === 'GET') {
    try {
      const phrase = await phrases.findOne({ _id: new ObjectId(id) })

      if (!phrase) {
        return res.status(404).json({ error: 'Phrase not found' })
      }

      return res.status(200).json({ phrase })
    } catch (error) {
      console.error('Error fetching phrase:', error)
      return res.status(500).json({ error: 'Failed to fetch phrase' })
    }
  }

  // PUT - Update a phrase
  if (req.method === 'PUT') {
    try {
      const { text, category, points, status } = req.body

      const updateFields = { updatedAt: new Date() }
      if (text !== undefined) updateFields.text = text.trim()
      if (category !== undefined) updateFields.category = category
      if (points !== undefined) updateFields.points = parseInt(points)
      if (status !== undefined) updateFields.status = status

      const result = await phrases.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
      )

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Phrase not found' })
      }

      const updated = await phrases.findOne({ _id: new ObjectId(id) })

      return res.status(200).json({
        success: true,
        phrase: updated
      })
    } catch (error) {
      console.error('Error updating phrase:', error)
      return res.status(500).json({ error: 'Failed to update phrase' })
    }
  }

  // DELETE - Delete a phrase
  if (req.method === 'DELETE') {
    try {
      const result = await phrases.deleteOne({ _id: new ObjectId(id) })

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Phrase not found' })
      }

      return res.status(200).json({
        success: true,
        message: 'Phrase deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting phrase:', error)
      return res.status(500).json({ error: 'Failed to delete phrase' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
