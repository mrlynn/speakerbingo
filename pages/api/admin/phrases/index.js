import dbConnect from '../../../../lib/mongodb';
import Phrase from '../../../../lib/models/Phrase';
import Theme from '../../../../lib/models/Theme';
import { requirePermission } from '../../../../lib/auth/middleware';

async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return await getPhrasesHandler(req, res);
    case 'POST':
      return await createPhraseHandler(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getPhrasesHandler(req, res) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      status, 
      theme,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.text = { $regex: search, $options: 'i' };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (theme) {
      query.themes = theme;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [phrases, total] = await Promise.all([
      Phrase.find(query)
        .populate('themes', 'name color')
        .populate('createdBy', 'username fullName')
        .populate('approvedBy', 'username fullName')
        .sort(sort)
        .limit(parseInt(limit))
        .skip(skip),
      Phrase.countDocuments(query)
    ]);

    res.status(200).json({
      phrases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get phrases error:', error);
    res.status(500).json({ error: 'Failed to fetch phrases' });
  }
}

async function createPhraseHandler(req, res) {
  try {
    const { text, themes = [], category = 'general' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Phrase text is required' });
    }

    const existingPhrase = await Phrase.findOne({ 
      text: { $regex: `^${text.trim()}$`, $options: 'i' } 
    });

    if (existingPhrase) {
      return res.status(400).json({ error: 'This phrase already exists' });
    }

    const phrase = new Phrase({
      text: text.trim(),
      themes,
      category,
      createdBy: req.user._id,
      status: req.user.role === 'moderator' ? 'pending' : 'approved',
      approvedBy: req.user.role !== 'moderator' ? req.user._id : undefined,
      approvedAt: req.user.role !== 'moderator' ? new Date() : undefined
    });

    await phrase.save();
    
    if (themes.length > 0) {
      await Theme.updateMany(
        { _id: { $in: themes } },
        { $inc: { phraseCount: 1 } }
      );
    }

    const populatedPhrase = await Phrase.findById(phrase._id)
      .populate('themes', 'name color')
      .populate('createdBy', 'username fullName');

    res.status(201).json(populatedPhrase);
  } catch (error) {
    console.error('Create phrase error:', error);
    res.status(500).json({ error: 'Failed to create phrase' });
  }
}

export default function(req, res) {
  const middleware = requirePermission('phrases', req.method === 'GET' ? 'read' : 'create');
  return new Promise((resolve) => {
    middleware(req, res, () => {
      resolve(handler(req, res));
    });
  });
}