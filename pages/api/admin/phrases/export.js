import dbConnect from '../../../../lib/mongodb';
import Phrase from '../../../../lib/models/Phrase';
import Theme from '../../../../lib/models/Theme';
import { requirePermission } from '../../../../lib/auth/middleware';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { format = 'json', status, theme, category } = req.query;

    const query = {};
    if (status) query.status = status;
    if (theme) query.themes = theme;
    if (category) query.category = category;

    const phrases = await Phrase.find(query)
      .populate('themes', 'name')
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csv = [
        'Text,Category,Themes,Status,Created By,Created Date',
        ...phrases.map(p => 
          `"${p.text}","${p.category}","${p.themes.map(t => t.name).join(', ')}","${p.status}","${p.createdBy?.fullName || 'Unknown'}","${p.createdAt.toISOString()}"`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=phrases-export.csv');
      return res.status(200).send(csv);
    }

    // Default JSON format
    const exportData = {
      exportDate: new Date().toISOString(),
      totalPhrases: phrases.length,
      phrases: phrases.map(p => ({
        text: p.text,
        category: p.category,
        themes: p.themes.map(t => t.name),
        status: p.status,
        createdBy: p.createdBy?.fullName || 'Unknown',
        createdAt: p.createdAt
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=phrases-export.json');
    res.status(200).json(exportData);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export phrases' });
  }
}

export default function(req, res) {
  const middleware = requirePermission('phrases', 'read');
  return new Promise((resolve) => {
    middleware(req, res, () => {
      resolve(handler(req, res));
    });
  });
}