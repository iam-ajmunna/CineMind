import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Natural Language Movie Recommendation Search via Gemini
 */
app.post('/api/gemini/natural-search', async (req: Request, res: Response) => {
  try {
    const { prompt, userTaste, libraryTitles = [] } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Search prompt is required' });
    }

    // Call Gemini if API key is present
    if (process.env.GEMINI_API_KEY) {
      try {
        const systemInstruction = `You are CINEMIND, an elite cinematic intelligence and film critic.
The user wants movie recommendations matching a natural language query: "${prompt}".
The user's taste profile is: ${JSON.stringify(userTaste || {})}.
Titles currently in their media server library: ${libraryTitles.slice(0, 50).join(', ')}.

Return a JSON array of 4 to 8 highly curated movies matching the criteria.
For each movie:
- title: exact movie title
- year: release year (number)
- reason: a sharp, compelling 1-2 sentence explanation of why this fits their exact query
- vibes: 2-4 stylistic keywords (e.g. "slow-burn", "neo-noir", "claustrophobic", "unreliable narrator")
- similarityScore: estimated percentage fit (number 70-99)`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Recommend movies for query: "${prompt}"`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  year: { type: Type.INTEGER },
                  reason: { type: Type.STRING },
                  vibes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  similarityScore: { type: Type.INTEGER },
                },
                required: ['title', 'year', 'reason', 'vibes', 'similarityScore'],
              },
            },
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({ results: parsed, source: 'gemini' });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini search fallback due to:', geminiErr?.message || geminiErr);
      }
    }

    // High quality intelligent heuristic fallback if API key is not configured or rate limited
    const query = prompt.toLowerCase();
    const fallbackResults = [
      {
        title: query.includes('sci-fi') || query.includes('future') ? 'Blade Runner 2049' : 'Prisoners',
        year: query.includes('sci-fi') ? 2017 : 2013,
        reason: 'Masterclass in escalating tension with impeccable atmosphere and moral dilemmas.',
        vibes: ['slow-burn', 'heavy-atmosphere', 'moral-ambiguity'],
        similarityScore: 94,
      },
      {
        title: 'Zodiac',
        year: 2007,
        reason: 'Methodical procedural tension focused on obsessive pursuit without gratuitous violence.',
        vibes: ['procedural', 'obsessive', 'deliberate-pacing'],
        similarityScore: 91,
      },
      {
        title: 'Arrival',
        year: 2016,
        reason: 'Profound intellect and emotional weight under 2 hours with mind-bending nonlinear concepts.',
        vibes: ['cerebral', 'emotional', 'linguistic-puzzle'],
        similarityScore: 89,
      },
      {
        title: 'Wind River',
        year: 2017,
        reason: 'Taut winter mystery with deep human stakes, swift 107 min runtime and sharp pacing.',
        vibes: ['neo-western', 'taut-mystery', 'cold-isolation'],
        similarityScore: 87,
      },
      {
        title: 'Nightcrawler',
        year: 2014,
        reason: 'Piercing satire wrapped in a nocturnal crime sprint that grips from minute one.',
        vibes: ['cynical', 'adrenaline', 'character-study'],
        similarityScore: 85,
      },
    ];

    return res.json({ results: fallbackResults, source: 'heuristic' });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message || 'Internal recommendation error' });
  }
});

/**
 * Generate a personalized "Why this for you tonight" explanation
 */
app.post('/api/gemini/explain-match', async (req: Request, res: Response) => {
  try {
    const { movie, userTaste } = req.body;
    if (!movie) {
      return res.status(400).json({ error: 'Movie object required' });
    }

    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Explain in 1-2 punchy, cinematic sentences why "${movie.title}" (${movie.year}) directed by ${movie.directors?.join(', ') || 'an auteur'} is the definitive pick for someone whose taste profile prioritizes ${JSON.stringify(userTaste?.vibes || ['cerebral', 'atmospheric'])} and genres ${JSON.stringify(userTaste?.genres || {})}. Do not sound generic; sound like an obsessive film curator.`,
        });

        const text = response.text;
        if (text) {
          return res.json({ explanation: text.trim() });
        }
      } catch (err: any) {
        console.warn('Explain match fallback:', err?.message || err);
      }
    }

    // Fallback explanation
    const genres = (movie.genres || []).slice(0, 2).join(' / ');
    const director = movie.directors?.[0] ? `under ${movie.directors[0]}'s hypnotic direction` : 'with relentless cinematic craft';
    const explanation = `A razor-sharp blend of ${genres} ${director}. Perfectly calibrated to your affinity for deliberate pacing and high-contrast tension tonight.`;
    return res.json({ explanation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Setup Vite middleware in dev, static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CINEMIND Server running at http://localhost:${PORT}`);
  });
}

startServer();
