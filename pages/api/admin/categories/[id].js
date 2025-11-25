import clientPromise from '../../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const { id } = req.query

  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid category ID' })
  }

  const client = await clientPromise
  const db = client.db('bingo')
  const categories = db.collection('categories')

  // GET - Get a single category
  if (req.method === 'GET') {
    try {
      const category = await categories.findOne({ _id: new ObjectId(id) })

      if (!category) {
        return res.status(404).json({ error: 'Category not found' })
      }

      return res.status(200).json({ category })
    } catch (error) {
      console.error('Error fetching category:', error)
      return res.status(500).json({ error: 'Failed to fetch category' })
    }
  }

  // PUT - Update a category
  if (req.method === 'PUT') {
    try {
      const { name, description, emoji, order, isActive } = req.body

      const updateFields = { updatedAt: new Date() }
      if (name !== undefined) updateFields.name = name
      if (description !== undefined) updateFields.description = description
      if (emoji !== undefined) updateFields.emoji = emoji
      if (order !== undefined) updateFields.order = parseInt(order)
      if (isActive !== undefined) updateFields.isActive = isActive

      const result = await categories.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
      )

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Category not found' })
      }

      const updated = await categories.findOne({ _id: new ObjectId(id) })

      return res.status(200).json({
        success: true,
        category: updated
      })
    } catch (error) {
      console.error('Error updating category:', error)
      return res.status(500).json({ error: 'Failed to update category' })
    }
  }

  // DELETE - Delete a category
  if (req.method === 'DELETE') {
    try {
      // Check if category has phrases
      const phrases = db.collection('phrases')
      const category = await categories.findOne({ _id: new ObjectId(id) })

      if (!category) {
        return res.status(404).json({ error: 'Category not found' })
      }

      const phraseCount = await phrases.countDocuments({ category: category.key })

      if (phraseCount > 0) {
        return res.status(400).json({
          error: `Cannot delete category with ${phraseCount} phrases. Delete or move phrases first.`
        })
      }

      const result = await categories.deleteOne({ _id: new ObjectId(id) })

      return res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      return res.status(500).json({ error: 'Failed to delete category' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
