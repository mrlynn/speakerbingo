import { seedDatabase } from '../../../../lib/seedData';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Only allow setup in development or if no admin users exist
  if (process.env.NODE_ENV === 'production') {
    const AdminUser = require('../../../../lib/models/AdminUser').default;
    const userCount = await AdminUser.countDocuments();
    if (userCount > 0) {
      return res.status(403).json({ error: 'Setup has already been completed' });
    }
  }

  try {
    await seedDatabase();
    res.status(200).json({ 
      message: 'Setup completed successfully',
      credentials: {
        username: 'admin',
        password: 'changeme123'
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Failed to complete setup' });
  }
}