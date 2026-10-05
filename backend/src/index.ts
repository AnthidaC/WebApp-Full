import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import typeRouter from './routes/type';
import menuRouter from './routes/menu';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/type', typeRouter);
app.use('/api/menu', menuRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
  console.log(`📍 Routes:`);
  console.log(`   - GET/POST/DELETE  http://localhost:${PORT}/api/type`);
  console.log(`   - GET/POST/PUT/DELETE http://localhost:${PORT}/api/menu`);
});
