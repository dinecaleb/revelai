import { Request, Response } from 'express';
import { journeyStore, runStore } from '../engine/state';
import { Journey } from '../models/journey';
import { PatientContext } from '../models/patient';
import { v4 as uuidv4 } from 'uuid';
import { executeJourney } from '../engine/executor';


export const createJourney = (req: Request, res: Response) => {
    const journey: Journey = req.body;
    journeyStore.set(journey.id, journey);
    res.status(201).json({ journeyId: journey.id });
};

export const triggerJourney = (req: Request, res: Response) => {
    const { journeyId } = req.params;
    const journey = journeyStore.get(journeyId);
    if (!journey) return res.status(404).json({ error: 'Journey not found' });

    const patient: PatientContext = req.body;
    const runId = uuidv4();

    runStore.set(runId, {
        runId,
        journeyId,
        currentNodeId: journey.start_node_id,
        status: 'in_progress',
        patientContext: patient,
    });

    executeJourney(journey, patient, runId);

    res.status(202)
        .location(`/journeys/runs/${runId}`)
        .json({ runId });
};

export const getRunStatus = (req: Request, res: Response) => {
    const { runId } = req.params;
    const run = runStore.get(runId);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.status(200).json(run);
};
