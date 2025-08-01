import dbConnect from '../../../../lib/mongodb';
import Phrase from '../../../../lib/models/Phrase';
import Theme from '../../../../lib/models/Theme';
import { requirePermission } from '../../../../lib/auth/middleware';

async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      return await getPhraseHandler(req, res, id);
    case 'PUT':
      return await updatePhraseHandler(req, res, id);
    case 'DELETE':
      return await deletePhraseHandler(req, res, id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getPhraseHandler(req, res, id) {
  try {
    const phrase = await Phrase.findById(id)
      .populate('themes', 'name color')
      .populate('createdBy', 'username fullName')
      .populate('approvedBy', 'username fullName')
      .populate('modifiedBy', 'username fullName')
      .populate('history.modifiedBy', 'username fullName');

    if (!phrase) {
      return res.status(404).json({ error: 'Phrase not found' });
    }

    res.status(200).json(phrase);
  } catch (error) {
    console.error('Get phrase error:', error);
    res.status(500).json({ error: 'Failed to fetch phrase' });
  }
}

async function updatePhraseHandler(req, res, id) {
  try {
    const phrase = await Phrase.findById(id);
    
    if (!phrase) {
      return res.status(404).json({ error: 'Phrase not found' });
    }

    const { text, themes, category, status, isActive, flagReason } = req.body;
    
    phrase._original = { text: phrase.text };
    
    const oldThemes = phrase.themes.map(t => t.toString());
    
    if (text !== undefined) phrase.text = text.trim();
    if (themes !== undefined) phrase.themes = themes;
    if (category !== undefined) phrase.category = category;
    if (isActive !== undefined) phrase.isActive = isActive;
    if (flagReason !== undefined) phrase.flagReason = flagReason;
    
    if (status !== undefined && status !== phrase.status) {
      if (status === 'approved' && phrase.status !== 'approved') {
        phrase.status = status;
        phrase.approvedBy = req.user._id;
        phrase.approvedAt = new Date();
      } else if (status === 'flagged' || status === 'rejected') {
        phrase.status = status;
        if (!flagReason) {
          return res.status(400).json({ 
            error: 'Flag reason is required when flagging or rejecting' 
          });
        }
      } else {
        phrase.status = status;
      }
    }
    
    phrase.modifiedBy = req.user._id;
    
    await phrase.save();
    
    if (themes !== undefined) {
      const newThemes = themes.map(t => t.toString());
      const themesToRemove = oldThemes.filter(t => !newThemes.includes(t));
      const themesToAdd = newThemes.filter(t => !oldThemes.includes(t));
      
      if (themesToRemove.length > 0) {
        await Theme.updateMany(
          { _id: { $in: themesToRemove } },
          { $inc: { phraseCount: -1 } }
        );
      }
      
      if (themesToAdd.length > 0) {
        await Theme.updateMany(
          { _id: { $in: themesToAdd } },
          { $inc: { phraseCount: 1 } }
        );
      }
    }

    const updatedPhrase = await Phrase.findById(id)
      .populate('themes', 'name color')
      .populate('createdBy', 'username fullName')
      .populate('approvedBy', 'username fullName')
      .populate('modifiedBy', 'username fullName');

    res.status(200).json(updatedPhrase);
  } catch (error) {
    console.error('Update phrase error:', error);
    res.status(500).json({ error: 'Failed to update phrase' });
  }
}

async function deletePhraseHandler(req, res, id) {
  try {
    const phrase = await Phrase.findById(id);
    
    if (!phrase) {
      return res.status(404).json({ error: 'Phrase not found' });
    }

    if (phrase.themes.length > 0) {
      await Theme.updateMany(
        { _id: { $in: phrase.themes } },
        { $inc: { phraseCount: -1 } }
      );
    }

    await phrase.deleteOne();

    res.status(200).json({ message: 'Phrase deleted successfully' });
  } catch (error) {
    console.error('Delete phrase error:', error);
    res.status(500).json({ error: 'Failed to delete phrase' });
  }
}

export default function(req, res) {
  const action = req.method === 'GET' ? 'read' : 
                 req.method === 'PUT' ? 'update' : 'delete';
  const middleware = requirePermission('phrases', action);
  
  return new Promise((resolve) => {
    middleware(req, res, () => {
      resolve(handler(req, res));
    });
  });
}