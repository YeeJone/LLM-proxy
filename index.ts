import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const router = express.Router()
router.get('/health', (req, res) => {
    res.send('server is healthy!')
});

app.use(router);

app.use(
    '/v1/',
    createProxyMiddleware({
        target: 'https://api.openai.com//v1',
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req, res) => {
                // Log incoming request details
                console.log('Incoming Request URL: ', req.url);
                console.log('Incoming Request Headers: ', req.headers);

                // Set Authorization header for the forwarded request
                proxyReq.setHeader('Authorization', `Bearer ${process.env.API_KEY}`);

                // Log forwarded request details
                console.log('Forwarded Request URL: ', proxyReq.path);
                console.log('Forwarded Request Headers: ', proxyReq.getHeaders());
            },
            proxyRes: async (proxyRes, req, res) => {
                // Collect response data
                let body = '';
                proxyRes.on('data', (chunk) => {
                    body += chunk;
                });

                proxyRes.on('end', () => {
                    console.log('Response Headers: ', proxyRes.headers);
                    console.log('Response Body: ', body);
                });

                // Set CORS headers
                proxyRes.headers['Access-Control-Allow-Origin'] = '*';
                proxyRes.headers['Access-Control-Allow-Headers'] =
                    'Content-Type,Content-Length, Authorization, Accept,X-Requested-With';
            },
            error: (err, req, res) => {
                console.log('Proxy encountered an error: ', err);
            }
        }
    })
);

app.listen(8866, () => {
    console.log('Server running on http://localhost:8866');
}).on('error', (err) => {
    console.log('Server encountered an error: ', err);
});