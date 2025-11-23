import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import clientPromise from '../../../lib/mongoClient'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get authenticated session
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const client = await clientPromise
    const db = client.db('bingo')
    const profilesCollection = db.collection('profiles')

    // Find player profile by user ID
    const profile = await profilesCollection.findOne({
      userId: session.user.id
    })

    if (profile) {
      return res.status(200).json({ profile })
    }

    // If no profile exists, return null (client will create default)
    return res.status(200).json({ profile: null })

  } catch (error) {
    console.error('Error loading profile:', error)
    return res.status(500).json({ error: 'Failed to load profile' })
  }
}

