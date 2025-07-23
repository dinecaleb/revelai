import { Journey } from '../models/journey';
import { PatientContext } from '../models/patient';

export interface JourneyRun {
    runId: string;
    journeyId: string;
    currentNodeId: string | null;
    status: 'in_progress' | 'completed';
    patientContext: PatientContext;
}

export const journeyStore: Map<string, Journey> = new Map();
export const runStore: Map<string, JourneyRun> = new Map();
