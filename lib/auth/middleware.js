import { verifyToken, extractToken } from './jwt';
import AdminUser from '../models/AdminUser';
import dbConnect from '../mongodb';

export async function authenticateAdmin(req) {
  try {
    await dbConnect();
    
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return { authenticated: false, error: 'No token provided' };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return { authenticated: false, error: 'Invalid token' };
    }

    const user = await AdminUser.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return { authenticated: false, error: 'User not found or inactive' };
    }

    if (user.isLocked) {
      return { authenticated: false, error: 'Account is locked' };
    }

    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, error: error.message };
  }
}

export function requirePermission(resource, action) {
  return async (req, res, next) => {
    const { authenticated, user, error } = await authenticateAdmin(req);
    
    if (!authenticated) {
      return res.status(401).json({ error: error || 'Authentication required' });
    }

    if (!user.permissions[resource]?.[action]) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.user = user;
    next();
  };
}

export function requireAuth() {
  return async (req, res, next) => {
    const { authenticated, user, error } = await authenticateAdmin(req);
    
    if (!authenticated) {
      return res.status(401).json({ error: error || 'Authentication required' });
    }

    req.user = user;
    next();
  };
}