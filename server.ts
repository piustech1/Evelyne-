import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // SMM API Proxy Routes
  const SMM_API_URL = 'https://smmtrustpanel.com/api/v2';
  const API_KEY = '83d97dd9b3b61589318f4f50b1b90d1a';

  app.post('/api/smm/services', async (req, res) => {
    try {
      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0'
        },
        body: `key=${API_KEY}&action=services`
      });
      const services = await response.json();
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smm/order', async (req, res) => {
    try {
      const { service, link, quantity } = req.body;
      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `key=${API_KEY}&action=add&service=${encodeURIComponent(service)}&link=${encodeURIComponent(link)}&quantity=${encodeURIComponent(quantity)}`
      });
      const data = await response.json();
      
      // Friendly error messages
      if (data.error) {
        const errorMsg = data.error.toLowerCase();
        if (errorMsg.includes('insufficient balance') || errorMsg.includes('balance')) {
          return res.json({ error: 'Server processing request. Please try again later.' });
        }
        return res.json({ error: 'Service temporarily unavailable. Try again later.' });
      }
      
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: 'Service temporarily unavailable. Try again later.' });
    }
  });

  app.post('/api/smm/balance', async (req, res) => {
    try {
      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `key=${API_KEY}&action=balance`
      });
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => res.sendFile('dist/index.html', { root: '.' }));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server live on http://localhost:${PORT}`);
  });
}

startServer();