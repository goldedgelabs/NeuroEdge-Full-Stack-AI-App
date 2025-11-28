import { Router } from 'express';
const router = Router();

// simple metrics endpoint (expand with Prometheus)
router.get('/api/metrics/tokens/:conv', (req, res) => {
  // placeholder — in production read from DB
  res.json({ tokens: 1234 });
});
export default router;
