import express from 'express';
import Chat from '../models/Chat.js';
import { createStreamingCompletion, SYSTEM_PROMPT } from '../services/ai.js';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';
import { isDBConnected } from '../db.js';

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /api/chat/history — Get paginated chat list
 */
router.get('/history', async (req, res) => {
  if (!req.user || !isDBConnected()) {
    return res.json({ chats: [] });
  }
  try {
    const chats = await Chat.find({ userId: req.user.id })
      .select('title pinned createdAt updatedAt')
      .sort({ pinned: -1, updatedAt: -1 })
      .limit(50)
      .lean();
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

/**
 * GET /api/chat/:id — Get a single chat with messages
 */
router.get('/:id', async (req, res) => {
  if (!req.user || !isDBConnected()) {
    return res.status(404).json({ error: 'Not found.' });
  }
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!chat) return res.status(404).json({ error: 'Chat not found.' });
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat.' });
  }
});

/**
 * PUT /api/chat/:id/rename
 */
router.put('/:id/rename', async (req, res) => {
  if (!req.user || !isDBConnected()) return res.status(400).json({ error: 'Not available.' });
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title: req.body.title },
      { new: true }
    );
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ error: 'Rename failed.' });
  }
});

/**
 * PUT /api/chat/:id/pin
 */
router.put('/:id/pin', async (req, res) => {
  if (!req.user || !isDBConnected()) return res.status(400).json({ error: 'Not available.' });
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.id });
    if (!chat) return res.status(404).json({ error: 'Not found.' });
    chat.pinned = !chat.pinned;
    await chat.save();
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ error: 'Pin failed.' });
  }
});

/**
 * DELETE /api/chat/:id
 */
router.delete('/:id', async (req, res) => {
  if (!req.user || !isDBConnected()) return res.status(400).json({ error: 'Not available.' });
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed.' });
  }
});

/**
 * POST /api/chat — Streaming chat (works with or without auth)
 */
router.post('/', async (req, res) => {
  try {
    const { message, history, chatId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Build messages array
    const messages = [
      ...(history || []).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    // Get custom system prompt if authenticated
    let customPrompt = '';
    if (req.user && isDBConnected()) {
      try {
        const user = await User.findById(req.user.id);
        if (user?.settings?.systemPrompt) customPrompt = user.settings.systemPrompt;
      } catch {}
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const stream = await createStreamingCompletion(messages, customPrompt);
    let fullResponse = '';

    for await (const chunk of stream) {
      if (!chunk.choices || chunk.choices.length === 0) continue;
      const delta = chunk.choices[0].delta;
      if (delta && delta.content) {
        fullResponse += delta.content;
        res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
      }
      if (chunk.choices[0].finish_reason === 'stop') {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      }
    }

    // Save to DB if authenticated
    if (req.user && isDBConnected() && fullResponse) {
      try {
        if (chatId) {
          await Chat.findOneAndUpdate(
            { _id: chatId, userId: req.user.id },
            {
              $push: {
                messages: [
                  { role: 'user', content: message },
                  { role: 'assistant', content: fullResponse },
                ]
              },
              $set: { updatedAt: new Date() }
            }
          );
        } else {
          await Chat.create({
            userId: req.user.id,
            title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            messages: [
              { role: 'user', content: message },
              { role: 'assistant', content: fullResponse },
            ],
          });
        }
      } catch (dbErr) {
        console.error('Failed to save chat to DB:', dbErr.message);
      }
    }

    res.end();
  } catch (error) {
    console.error('Chat API Error:', error.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Chat failed.', details: error.message });
    }
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export default router;
