import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use(
    '/v1/',
    createProxyMiddleware({
      target: 'https://api.openai.com',
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('Authorization', `Bearer ${process.env.API_KEY}`);
        },
        proxyRes: (proxyRes, req, res) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Headers'] =
              'Content-Type,Content-Length, Authorization, Accept,X-Requested-With';
        },
        error: (err) => {
            console.log(err);
        },
      }
    })
  );
app.listen(8866, () => {
        console.log('Server running on http://localhost:8866');
    })
    .on('error', (err) => {
        console.log(err);
    });