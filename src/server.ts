import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import memeRoutes from './services/api/v1/routes/memes';
import tagRoutes from './services/api/v1/routes/tags';

const app = express();
const port = process.env.PORT || 8888;

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

app.use('/api/v1/memes', (req, res, next) => {
  console.log('Memes route hit');
  next();
}, memeRoutes);

app.use('/api/v1/tags', (req, res, next) => {
  console.log('Tags route hit');
  next();
}, tagRoutes);

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../../dist')));

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(__dirname, '../../dist/index.html'));
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
    console.log(`  - GET http://localhost:${port}/api/v1/tags`);
    console.log('===================\n');
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
