import dbConnect from '../../../../lib/mongodb';
import Phrase from '../../../../lib/models/Phrase';
import Theme from '../../../../lib/models/Theme';
import { requirePermission } from '../../../../lib/auth/middleware';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { phrases, autoCreateThemes = false } = req.body;

    if (!Array.isArray(phrases) || phrases.length === 0) {
      return res.status(400).json({ error: 'No phrases provided for import' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [],
      created: []
    };

    // Get all themes for mapping
    const existingThemes = await Theme.find({});
    const themeMap = {};
    existingThemes.forEach(theme => {
      themeMap[theme.name.toLowerCase()] = theme._id;
    });

    for (const phraseData of phrases) {
      try {
        // Validate required fields
        if (!phraseData.text || phraseData.text.trim().length === 0) {
          results.failed++;
          results.errors.push({ phrase: phraseData.text, error: 'Text is required' });
          continue;
        }

        // Check for duplicates
        const existing = await Phrase.findOne({ 
          text: { $regex: `^${phraseData.text.trim()}$`, $options: 'i' } 
        });

        if (existing) {
          results.failed++;
          results.errors.push({ phrase: phraseData.text, error: 'Phrase already exists' });
          continue;
        }

        // Process themes
        const themeIds = [];
        if (phraseData.themes && Array.isArray(phraseData.themes)) {
          for (const themeName of phraseData.themes) {
            const lowerThemeName = themeName.toLowerCase();
            
            if (themeMap[lowerThemeName]) {
              themeIds.push(themeMap[lowerThemeName]);
            } else if (autoCreateThemes) {
              // Create new theme
              const newTheme = await Theme.create({
                name: themeName,
                createdBy: req.user._id,
                color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
              });
              themeMap[lowerThemeName] = newTheme._id;
              themeIds.push(newTheme._id);
            }
          }
        }

        // Create phrase
        const phrase = await Phrase.create({
          text: phraseData.text.trim(),
          category: phraseData.category || 'general',
          themes: themeIds,
          status: req.user.role === 'moderator' ? 'pending' : 'approved',
          approvedBy: req.user.role !== 'moderator' ? req.user._id : undefined,
          approvedAt: req.user.role !== 'moderator' ? new Date() : undefined,
          createdBy: req.user._id
        });

        // Update theme counts
        if (themeIds.length > 0) {
          await Theme.updateMany(
            { _id: { $in: themeIds } },
            { $inc: { phraseCount: 1 } }
          );
        }

        results.success++;
        results.created.push({
          text: phrase.text,
          id: phrase._id
        });

      } catch (error) {
        results.failed++;
        results.errors.push({ 
          phrase: phraseData.text, 
          error: error.message 
        });
      }
    }

    res.status(200).json({
      message: `Import completed: ${results.success} phrases created, ${results.failed} failed`,
      results
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import phrases' });
  }
}

export default function(req, res) {
  const middleware = requirePermission('phrases', 'create');
  return new Promise((resolve) => {
    middleware(req, res, () => {
      resolve(handler(req, res));
    });
  });
}