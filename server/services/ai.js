import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({
  baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_API_KEY,
});

const MODEL = process.env.NVIDIA_MODEL || 'deepseek-ai/deepseek-v4-pro';

const SYSTEM_PROMPT = `You are Amulya AI, a senior developer assistant.

Always respond with:
1. **Solution** (code if needed, wrapped in proper markdown code blocks with language tags)
2. **Explanation** (simple and clear)
3. **Improvements** (best practices and optimizations)

Tone:
- Professional
- Clear
- Minimal
- Mentor-like

Rules:
- Analyze code deeply before answering
- Fix errors with detailed explanation
- Prefer real-world, production-ready solutions
- Format responses cleanly using markdown
- Use code blocks with language identifiers for syntax highlighting
- When showing multiple files, clearly label each one
- If asked about non-coding topics, politely redirect to development-related help`;

/**
 * Creates a streaming chat completion using NVIDIA API.
 * @param {Array} messages - Array of {role, content} message objects
 * @param {string} customSystemPrompt - Optional custom system prompt from user settings
 * @returns {AsyncIterable} Stream of completion chunks
 */
export async function createStreamingCompletion(messages, customSystemPrompt = '') {
  const systemPrompt = customSystemPrompt
    ? `${SYSTEM_PROMPT}\n\nAdditional user instructions:\n${customSystemPrompt}`
    : SYSTEM_PROMPT;

  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: fullMessages,
    temperature: 1,
    top_p: 0.95,
    max_tokens: 16384,
    extra_body: { chat_template_kwargs: { thinking: false } },
    stream: true,
  });

  return stream;
}

/**
 * Creates a non-streaming chat completion.
 */
export async function createCompletion(messages, customSystemPrompt = '') {
  const systemPrompt = customSystemPrompt
    ? `${SYSTEM_PROMPT}\n\nAdditional user instructions:\n${customSystemPrompt}`
    : SYSTEM_PROMPT;

  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: fullMessages,
    temperature: 1,
    top_p: 0.95,
    max_tokens: 16384,
    extra_body: { chat_template_kwargs: { thinking: false } },
    stream: false,
  });

  return completion.choices[0]?.message?.content || '';
}

export { SYSTEM_PROMPT };
