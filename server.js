import express from 'express';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT || '8080');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY env var is required');
  process.exit(1);
}

// Main Gemini API endpoint — called directly from the browser (no SDK, no service worker)
app.post('/api/gemini', express.json({ limit: '20mb' }), async (req, res) => {
  const { model, ...body } = req.body;
  if (!model) return res.status(400).json({ error: 'model is required' });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify(body),
    });
    const data = await geminiRes.json();
    res.status(geminiRes.status).json(data);
  } catch (e) {
    console.error('Gemini API error:', e);
    res.status(502).json({ error: 'Failed to reach Gemini API' });
  }
});

// Audio transcription — Float32 WAV → texte via Gemini multimodal
app.post('/api/transcribe', express.json({ limit: '20mb' }), async (req, res) => {
  const { audio, mimeType } = req.body;
  if (!audio || !mimeType) return res.status(400).json({ error: 'audio and mimeType required' });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
  try {
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [
          { inlineData: { mimeType, data: audio } },
          { text: 'Transcris exactement ce qui est dit dans cet audio, mot pour mot. Réponds UNIQUEMENT avec le texte transcrit, sans aucun commentaire ni ponctuation ajoutée.' },
        ]}],
        generationConfig: { temperature: 0.1, maxOutputTokens: 300, thinkingConfig: { thinkingBudget: 0 } },
      }),
    });
    const data = await geminiRes.json();
    if (!geminiRes.ok) return res.status(geminiRes.status).json({ error: data?.error?.message ?? 'Gemini error' });
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    res.json({ text });
  } catch (e) {
    console.error('Transcribe error:', e);
    res.status(502).json({ error: 'Failed to transcribe audio' });
  }
});

// Legacy proxy for the AI Studio service worker (kept as fallback)
app.use('/gemini-api-proxy', (req, res) => {
  const originalUrl = new URL(req.url, 'http://localhost');
  originalUrl.searchParams.delete('__applet_proxy');
  const targetPath = originalUrl.pathname + (originalUrl.search || '');

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: targetPath,
    method: req.method,
    headers: {
      'content-type': req.headers['content-type'] || 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    const skip = new Set(['transfer-encoding', 'connection', 'keep-alive']);
    const fwd = {};
    for (const [k, v] of Object.entries(proxyRes.headers)) {
      if (!skip.has(k.toLowerCase())) fwd[k] = v;
    }
    res.writeHead(proxyRes.statusCode || 200, fwd);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (e) => {
    console.error('Proxy error:', e.message);
    if (!res.headersSent) res.status(502).json({ error: 'Proxy failed' });
  });

  req.pipe(proxyReq);
});

// Serve the Vite static build
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌸 Bong & Oun server on port ${PORT}`);
});
