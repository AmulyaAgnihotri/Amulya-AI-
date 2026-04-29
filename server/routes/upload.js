import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createStreamingCompletion } from '../services/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      // Code files
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h',
      '.cs', '.rb', '.go', '.rs', '.php', '.html', '.css', '.scss',
      '.json', '.xml', '.yaml', '.yml', '.md', '.txt', '.sql', '.sh',
      '.bat', '.ps1', '.env', '.config', '.toml', '.ini',
      // PDF
      '.pdf',
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not supported. Supported: code files and PDFs.`));
    }
  },
});

/**
 * Detect if a file is a PDF
 */
function isPDF(filename) {
  return path.extname(filename).toLowerCase() === '.pdf';
}

/**
 * POST /api/upload
 * Accepts: multipart/form-data with 'file' field + optional 'prompt' field
 * Returns: SSE stream of AI analysis
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const userPrompt = req.body.prompt || '';
    let fileContent = '';
    let analysisPrompt = '';

    if (isPDF(fileName)) {
      // Dynamic import for pdf-parse
      const pdfParse = (await import('pdf-parse')).default;
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      fileContent = pdfData.text;

      analysisPrompt = `The user uploaded a PDF file named "${fileName}".

Here is the extracted text content:

---
${fileContent.substring(0, 12000)}
---

${userPrompt ? `User's request: ${userPrompt}` : 'Please summarize this document, extract key insights, and highlight the most important points.'}`;
    } else {
      // Code file
      fileContent = fs.readFileSync(filePath, 'utf-8');
      const ext = path.extname(fileName).toLowerCase().replace('.', '');

      analysisPrompt = `The user uploaded a code file named "${fileName}" (${ext}).

Here is the code:

\`\`\`${ext}
${fileContent.substring(0, 12000)}
\`\`\`

${userPrompt ? `User's request: ${userPrompt}` : 'Please analyze this code: debug any issues, suggest optimizations, explain the logic, and recommend best practices.'}`;
    }

    const messages = [{ role: 'user', content: analysisPrompt }];

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const stream = await createStreamingCompletion(messages);

    for await (const chunk of stream) {
      if (!chunk.choices || chunk.choices.length === 0) continue;

      const delta = chunk.choices[0].delta;
      if (delta && delta.content) {
        res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
      }

      if (chunk.choices[0].finish_reason === 'stop') {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      }
    }

    res.end();

    // Clean up uploaded file after processing
    fs.unlink(filePath, () => {});
  } catch (error) {
    console.error('Upload API Error:', error.message);

    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Failed to process uploaded file.',
        details: error.message,
      });
    }

    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export default router;
