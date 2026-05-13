import express from 'express';
import { authMiddleware, requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();
router.use(authMiddleware);
router.use(requireAuth);

/**
 * POST /api/gist — Create a GitHub Gist
 */
router.post('/', async (req, res) => {
  try {
    const { filename, content, description, isPublic } = req.body;

    if (!filename || !content) {
      return res.status(400).json({ error: 'Filename and content are required.' });
    }

    // Get user's GitHub token
    const user = await User.findById(req.user.id);
    const githubToken = user?.settings?.githubToken;

    if (!githubToken) {
      return res.status(400).json({
        error: 'GitHub token not configured. Go to Settings to add your GitHub Personal Access Token.',
      });
    }

    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        description: description || `Code shared from Amulya AI`,
        public: isPublic || false,
        files: {
          [filename]: { content },
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'GitHub API error');
    }

    const gist = await response.json();
    res.json({
      url: gist.html_url,
      id: gist.id,
      rawUrl: Object.values(gist.files)[0]?.raw_url,
    });
  } catch (error) {
    console.error('Gist API Error:', error.message);
    res.status(500).json({ error: 'Failed to create Gist.', details: error.message });
  }
});

export default router;
