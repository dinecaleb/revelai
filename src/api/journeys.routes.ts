import express from 'express';
import { createJourney, triggerJourney, getRunStatus } from './journeys.controller';

const router = express.Router();

router.post('/journeys', createJourney);
router.post('/journeys/:journeyId/trigger', triggerJourney);
router.get('/journeys/runs/:runId', getRunStatus);

export default router;
