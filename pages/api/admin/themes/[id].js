import dbConnect from '../../../../lib/mongodb';
import Theme from '../../../../lib/models/Theme';
import Phrase from '../../../../lib/models/Phrase';
import { requirePermission } from '../../../../lib/auth/middleware';

async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      return await getThemeHandler(req, res, id);
    case 'PUT':
      return await updateThemeHandler(req, res, id);
    case 'DELETE':
      return await deleteThemeHandler(req, res, id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getThemeHandler(req, res, id) {
  try {
    const theme = await Theme.findById(id)
      .populate('createdBy', 'username fullName')
      .populate('modifiedBy', 'username fullName');

    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    const phrases = await Phrase.find({ 
      themes: id,
      status: 'approved',
      isActive: true 
    })
    .select('text category')
    .limit(10);

    res.status(200).json({
      ...theme.toObject(),
      samplePhrases: phrases
    });
  } catch (error) {
    console.error('Get theme error:', error);
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
}

async function updateThemeHandler(req, res, id) {
  try {
    const theme = await Theme.findById(id);
    
    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    const { name, description, color, icon, isActive, priority, minPhrases } = req.body;
    
    if (name !== undefined && name !== theme.name) {
      const existingTheme = await Theme.findOne({ 
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
        _id: { $ne: id }
      });

      if (existingTheme) {
        return res.status(400).json({ error: 'A theme with this name already exists' });
      }
      
      theme.name = name.trim();
    }
    
    if (description !== undefined) theme.description = description;
    if (color !== undefined) theme.color = color;
    if (icon !== undefined) theme.icon = icon;
    if (isActive !== undefined) theme.isActive = isActive;
    if (priority !== undefined) theme.priority = priority;
    if (minPhrases !== undefined) theme.minPhrases = minPhrases;
    
    theme.modifiedBy = req.user._id;
    
    await theme.save();
    await theme.updatePhraseCount();

    const updatedTheme = await Theme.findById(id)
      .populate('createdBy', 'username fullName')
      .populate('modifiedBy', 'username fullName');

    res.status(200).json(updatedTheme);
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ error: 'Failed to update theme' });
  }
}

async function deleteThemeHandler(req, res, id) {
  try {
    const theme = await Theme.findById(id);
    
    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    const phrasesWithTheme = await Phrase.countDocuments({ themes: id });
    
    if (phrasesWithTheme > 0) {
      return res.status(400).json({ 
        error: `Cannot delete theme. ${phrasesWithTheme} phrases are using this theme.` 
      });
    }

    await theme.deleteOne();

    res.status(200).json({ message: 'Theme deleted successfully' });
  } catch (error) {
    console.error('Delete theme error:', error);
    res.status(500).json({ error: 'Failed to delete theme' });
  }
}

export default function(req, res) {
  const action = req.method === 'GET' ? 'read' : 
                 req.method === 'PUT' ? 'update' : 'delete';
  const middleware = requirePermission('themes', action);
  
  return new Promise((resolve) => {
    middleware(req, res, () => {
      resolve(handler(req, res));
    });
  });
}