import { health } from '../Controllers/Health';
import express, { Router } from 'express';

const router: Router = express.Router();

const healthRoutes = (): Router => {
  router.get('/course-health', health);

  return router;
};

export { healthRoutes };
