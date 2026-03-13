import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les images uploadées
app.use('/uploads', express.static(join(__dirname, '../uploads')));

app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
}, routes);

app.use(errorHandler);

export default app;
