import 'dotenv/config';
import { createRequire } from 'module';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middlewares/error.middleware.js';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import categoryRouter from './routes/category.routes.js';
import todoRouter from './routes/todo.routes.js';

const require = createRequire(import.meta.url);
const swaggerDocument = require('../swagger.json');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/todos', todoRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use(errorHandler);

export default app;
