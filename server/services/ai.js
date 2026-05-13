import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({
  baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_API_KEY,
});

const MODEL = process.env.NVIDIA_MODEL || 'meta/llama-3.2-3b-instruct';

const SYSTEM_PROMPT = `You are Amulya AI — a highly intelligent, versatile AI assistant created by Amulya.

You can help with ANYTHING: general knowledge, science, history, current events, people, places, creative writing, math, analysis, conversations, coding, debugging, and much more.

## How to respond

Adapt your response format to match what the user is asking:

**For general questions** (e.g. "Who is Virat Kohli?", "What is quantum physics?", "Tell me a joke"):
- Answer naturally in clear, conversational prose
- Use paragraphs, not rigid templates
- Do NOT wrap the answer in code blocks
- Do NOT use the "Solution / Explanation / Improvements" format
- Just give a direct, informative, and well-written answer

**For coding/technical questions** (e.g. "Write a React component", "Debug this code", "Create an API"):
- Provide code in properly formatted markdown code blocks with language tags
- Add a clear explanation of what the code does
- Suggest improvements or best practices when relevant
- Label multiple files clearly

**For creative requests** (e.g. "Write a poem", "Tell me a story", "Draft an email"):
- Write creatively and naturally
- Match the tone the user is looking for

## Tone
- Friendly, clear, and professional
- Concise but thorough — never unnecessarily verbose
- Knowledgeable and confident

## Rules
- NEVER refuse to answer general knowledge questions
- NEVER redirect non-coding questions to "development-related help"
- Always format responses cleanly using markdown when it helps readability
- Use bullet points, bold text, and headers only when they genuinely improve clarity
- For simple questions, a simple answer is best — don't over-format`;

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
    temperature: 0.2,
    top_p: 0.7,
    max_tokens: 1024,
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
    temperature: 0.2,
    top_p: 0.7,
    max_tokens: 1024,
    stream: false,
  });

  return completion.choices[0]?.message?.content || '';
}

export { SYSTEM_PROMPT };
