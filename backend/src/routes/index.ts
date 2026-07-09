import { Router } from 'express';
import healthRoutes from './health.route.js';
import importRoutes from './import.route.js';
import { authRoutes } from './auth.routes.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(healthRoutes);
router.use('/api/auth', authRoutes);
router.use('/api', verifyToken, importRoutes);

export default router;
