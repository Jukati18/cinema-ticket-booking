import { Router } from 'express';
import { env } from '../config/env.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ status: 'ok', service: env.SERVICE_NAME, uptime: Math.round(process.uptime()) });
});

export default router;
