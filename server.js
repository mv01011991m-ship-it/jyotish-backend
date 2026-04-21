// ═══════════════════════════════════════════
//  Jyotish Darshan — Backend Proxy Server
//  Node.js + Express
// ═══════════════════════════════════════════

const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS: sirf aapki website se requests allow karein
app.use(cors({
  origin: [
    'http://localhost',
    'http://127.0.0.1',
    process.env.FRONTEND_URL || '*'   // .env mein apna domain daalein
  ]
}));

app.use(express.json({ limit: '2mb' }));

// ── Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Jyotish Darshan API' });
});

// ── Claude API Proxy ──────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { system, messages } = req.body;

    if (!system || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'system aur messages required hain' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':            'application/json',
        'x-api-key':               process.env.ANTHROPIC_API_KEY,
        'anthropic-version':       '2023-06-01'
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-5',
        max_tokens: 1500,
        system:     system,
        messages:   messages.slice(-14)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'API Error' });
    }

    res.json(data);

  } catch (err) {
    console.error('Server Error:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✦ Jyotish Darshan Server chal raha hai — Port ${PORT}`);
});
