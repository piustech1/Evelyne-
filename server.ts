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
  const SMM_API_URL = 'https://mrgoviral.com/api/v2';
  const API_KEY = process.env.SMM_API_KEY;

  app.post('/api/smm/services', async (req, res) => {
    try {
      if (!API_KEY) throw new Error('SMM_API_KEY is not configured');

      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          key: API_KEY,
          action: 'services'
        })
      });

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('SMM Services Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smm/order', async (req, res) => {
    try {
      if (!API_KEY) throw new Error('SMM_API_KEY is not configured');
      const { service, link, quantity } = req.body;

      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          key: API_KEY,
          action: 'add',
          service: service.toString(),
          link,
          quantity: quantity.toString()
        })
      });

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('SMM Order Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smm/status', async (req, res) => {
    try {
      if (!API_KEY) throw new Error('SMM_API_KEY is not configured');
      const { orderId } = req.body;

      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          key: API_KEY,
          action: 'status',
          order: orderId.toString()
        })
      });

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('SMM Status Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
