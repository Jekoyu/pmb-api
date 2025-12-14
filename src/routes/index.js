import { Router } from 'express';
import apiKeyRoutes from './apiKeyRoutes.js';
import studentRoutes from './studentRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/api-keys', apiKeyRoutes);
router.use('/students', studentRoutes);

export default router;
