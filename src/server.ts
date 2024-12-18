import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import memeRoutes from './services/api/v1/routes/memes';
import tagRoutes from './services/api/v1/routes/tags';
import { handler as uploadMemeHandler } from '../functions/api-v1-memes-post';
import { HandlerContext } from '@netlify/functions';

const app = express();
const port = process.env.PORT || 8888;

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '../dist');

// Middleware
app.use(cors());
app.use(express.json());

// Detailed request logging
app.use((req, res, next) => {
  console.log('--------------------');
  console.log(`${new Date().toISOString()}`);
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('--------------------');
  next();
});

// API Routes
app.get('/api/v1', (req, res) => {
  console.log('Handling /api/v1 request');
  res.json({
    version: '1.0.0',
    endpoints: ['/memes', '/tags']
  });
});

// Handle POST /api/v1/memes using the Netlify function
app.post('/api/v1/memes', async (req, res) => {
  try {
    const context: HandlerContext = {
      awsRequestId: '1234567890',
      callbackWaitsForEmptyEventLoop: true,
      functionName: 'api-v1-memes-post',
      functionVersion: '$LATEST',
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:api-v1-memes-post',
      logGroupName: '/aws/lambda/api-v1-memes-post',
      logStreamName: '2021/01/01/[$LATEST]abcdef123456',
      memoryLimitInMB: '128',
      done: () => { },
      fail: () => { },
      getRemainingTimeInMillis: () => 0,
      succeed: () => { },
    };

    const result = await uploadMemeHandler({
      httpMethod: 'POST',
      headers: req.headers as Record<string, string>,
      body: JSON.stringify(req.body),
      path: req.path,
      queryStringParameters: req.query as Record<string, string>,
      rawUrl: req.url || '',
      rawQuery: req.query ? new URLSearchParams(req.query as Record<string, string>).toString() : '',
      isBase64Encoded: false,
      multiValueHeaders: {},
      multiValueQueryStringParameters: {}
    }, context);

    if (!result) {
      throw new Error('Handler returned no result');
    }

    res.status(result.statusCode).set(result.headers || {}).send(result.body);
  } catch (error) {
    console.error('Error in upload handler:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use('/api/v1/memes', (req, res, next) => {
  if (req.method !== 'POST') {
    console.log('Memes route hit');
    next();
  }
}, memeRoutes);

app.use('/api/v1/tags', (req, res, next) => {
  console.log('Tags route hit');
  next();
}, tagRoutes);

// Serve static files from the dist directory
app.use(express.static(distPath));

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    console.log('Serving index.html from:', join(distPath, 'index.html'));
    res.sendFile(join(distPath, 'index.html'), (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to serve index.html'
        });
      }
    });
  } else {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.path}`
    });
  }
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error handler hit:');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
try {
  app.listen(port, () => {
    console.log('\n===================');
    console.log(`Server running at http://localhost:${port}`);
    console.log('Available endpoints:');
    console.log(`  - GET http://localhost:${port}/api/v1`);
    console.log(`  - GET http://localhost:${port}/api/v1/memes`);
    console.log(`  - POST http://localhost:${port}/api/v1/memes`);
    console.log(`  - GET http://localhost:${port}/api/v1/tags`);
    console.log('===================\n');
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
