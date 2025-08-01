import dbConnect from '../../../../lib/mongodb';
import AdminUser from '../../../../lib/models/AdminUser';
import { generateToken } from '../../../../lib/auth/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await AdminUser.findOne({ 
      $or: [{ username }, { email: username }] 
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isLocked) {
      return res.status(401).json({ 
        error: 'Account is locked. Please try again later.' 
      });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      await user.incLoginAttempts();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    await user.resetLoginAttempts();

    const token = generateToken({
      userId: user._id,
      username: user.username,
      role: user.role
    });

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions
    };

    res.status(200).json({
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}