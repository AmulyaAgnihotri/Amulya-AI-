import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

const NVIDIA_API_KEY = process.env.NVIDIA_IMAGINE_KEY || process.env.NVIDIA_API_KEY;
const INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

/**
 * POST /api/imagine
 * Generates an image description and uses NVIDIA's multimodal model
 * to create a detailed visual prompt, then returns the result.
 */
router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    // Use NVIDIA API to generate a detailed creative response
    const response = await fetch(INVOKE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-3n-e4b-it',
        messages: [
          {
            role: 'system',
            content: `You are a creative visual designer AI. When given a prompt, generate a VERY detailed visual description of the image that should be created. Include: colors, composition, style, lighting, mood, and any text that should appear. Format your response as a structured design brief. Be extremely detailed and creative.`
          },
          { role: 'user', content: `Create a detailed visual design for: ${prompt}` }
        ],
        max_tokens: 1024,
        temperature: 0.8,
        top_p: 0.9,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NVIDIA API error: ${response.status} — ${errText}`);
    }

    const data = await response.json();
    const designBrief = data.choices?.[0]?.message?.content || 'Failed to generate design.';

    res.json({
      prompt,
      design: designBrief,
      model: 'google/gemma-3n-e4b-it',
    });
  } catch (error) {
    console.error('Imagine API Error:', error.message);
    res.status(500).json({ error: 'Image generation failed.', details: error.message });
  }
});

/**
 * POST /api/imagine/stream — Streaming version
 */
router.post('/stream', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const response = await fetch(INVOKE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        model: 'google/gemma-3n-e4b-it',
        messages: [
          {
            role: 'system',
            content: `You are Amulya AI's creative design assistant. Generate detailed, vivid visual descriptions and design concepts. Be creative and detailed.`
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1024,
        temperature: 0.8,
        top_p: 0.9,
        stream: true,
      }),
    });

    if (!response.ok) throw new Error(`NVIDIA error: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const jsonStr = line.slice(6);
        if (jsonStr === '[DONE]') {
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          continue;
        }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        } catch {}
      }
    }

    res.end();
  } catch (error) {
    console.error('Imagine Stream Error:', error.message);
    if (!res.headersSent) return res.status(500).json({ error: error.message });
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export default router;
