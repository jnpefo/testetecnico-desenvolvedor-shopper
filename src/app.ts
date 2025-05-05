import express from 'express';
import measureRoutes from './routes/measure.route';
import healthRoutes from './routes/health.route';

const app = express();

app.use(express.json({ limit: '5mb' })); // Aumenta o limite para lidar com base64
app.use('/measures', measureRoutes);
app.use('/', healthRoutes);

export default app;
