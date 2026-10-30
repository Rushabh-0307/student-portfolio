// P13 – AI API Integration: backend route for generating task descriptions
// The API key is stored server-side only (.env) and never exposed to the frontend.

import { Router } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// ── Simple per-user rate limiter (max 1 AI request per minute per user) ──
const rateLimitMap = new Map();
const RATE_LIMIT_MS = 60_000; // 1 minute

function checkRateLimit(userId) {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(userId);
  if (lastRequest && now - lastRequest < RATE_LIMIT_MS) {
    const waitSec = Math.ceil((RATE_LIMIT_MS - (now - lastRequest)) / 1000);
    return { allowed: false, waitSec };
  }
  rateLimitMap.set(userId, now);
  return { allowed: true };
}

// ── POST /api/ai/generate-description ──
// Accepts { title } and returns { description, fallback }
router.post('/generate-description', async (req, res) => {
  const { title } = req.body || {};

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: 'Title is required to generate a description' });
  }

  // Rate-limit check
  const userId = req.user?.id || req.user?._id || 'anonymous';
  const rateCheck = checkRateLimit(userId);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: `Rate limit exceeded. Please wait ${rateCheck.waitSec} seconds before trying again.`,
      description: '',
      fallback: true,
    });
  }

  // Verify API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_key_here') {
    return res.status(200).json({
      description: '',
      fallback: true,
      message: 'AI service is not configured. Please add your OpenAI API key to the .env file.',
    });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Write a short task description for: ${String(title).trim()}`,
        },
      ],
    });

    const description = completion.choices[0].message.content;
    res.json({ description, fallback: false });
  } catch (err) {
    console.error('[AI] OpenAI API error:', err.message);
    // Graceful degradation – app keeps working, returns fallback
    res.status(200).json({ description: '', fallback: true });
  }
});

export default router;

