import dbConnect from '../../../../lib/mongodb';
import Theme from '../../../../lib/models/Theme';
import { requirePermission } from '../../../../lib/auth/middleware';

async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return await getThemesHandler(req, res);
    case 'POST':
      return await createThemeHandler(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getThemesHandler(req, res) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      isActive,
      sortBy = 'priority',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [themes, total] = await Promise.all([
      Theme.find(query)
        .populate('createdBy', 'username fullName')
        .populate('modifiedBy', 'username fullName')
        .sort(sort)
        .limit(parseInt(limit))
        .skip(skip),
      Theme.countDocuments(query)
    ]);

    res.status(200).json({
      themes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get themes error:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
}

async function createThemeHandler(req, res) {
  try {
    const { 
      name, 
      description, 
      color = '#3f51b5', 
      icon = 'category',
      priority = 0,
      minPhrases = 25 
    } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Theme name is required' });
    }

    const existingTheme = await Theme.findOne({ 
      name: { $regex: `^${name.trim()}$`, $options: 'i' } 
    });

    if (existingTheme) {
      return res.status(400).json({ error: 'A theme with this name already exists' });
    }

    const theme = new Theme({
      name: name.trim(),
      description,
      color,
      icon,
      priority,
      minPhrases,
      createdBy: req.user._id
    });

    await theme.save();

    const populatedTheme = await Theme.findById(theme._id)
      .populate('createdBy', 'username fullName');

    res.status(201).json(populatedTheme);
  } catch (error) {
    console.error('Create theme error:', error);
    res.status(500).json({ error: 'Failed to create theme' });
  }
}

export default function(req, res) {
  const middleware = requirePermission('themes', req.method === 'GET' ? 'read' : 'create');
  return new Promise((resolve) => {
    middleware(req, res, () => {
      resolve(handler(req, res));
    });
  });
}