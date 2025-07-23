
import { v4 as uuidv4 } from 'uuid';
import { runStore } from '../engine/state';
import { executeJourney } from '../engine/executor';
import { Journey } from '../models/journey';
import { PatientContext } from '../models/patient';

describe('Journey Execution Logic', () => {
    beforeEach(() => {
        runStore.clear();
        jest.useRealTimers(); // Reset any mocked timers
    });

    const createRun = (journey: Journey, patient: PatientContext) => {
        const runId = uuidv4();
        runStore.set(runId, {
            runId,
            journeyId: journey.id,
            currentNodeId: journey.start_node_id,
            status: 'in_progress',
            patientContext: patient
        });
        return runId;
    };

    it('executes a simple linear journey', async () => {
        const journey: Journey = {
            id: 'linear-1',
            name: 'Linear',
            start_node_id: 'n1',
            nodes: [
                { id: 'n1', type: 'MESSAGE', message: 'Hi', next_node_id: 'n2' },
                { id: 'n2', type: 'MESSAGE', message: 'Bye', next_node_id: null }
            ]
        };

        const patient: PatientContext = {
            id: 'p1', age: 30, language: 'en', condition: 'hip_replacement'
        };

        const runId = createRun(journey, patient);
        await executeJourney(journey, patient, runId);

        const run = runStore.get(runId)!;
        expect(run.status).toBe('completed');
        expect(run.currentNodeId).toBe(null);
    });

    it('branches using CONDITIONAL node', async () => {
        const journey: Journey = {
            id: 'conditional-1',
            name: 'Branch Test',
            start_node_id: 'cond',
            nodes: [
                {
                    id: 'cond',
                    type: 'CONDITIONAL',
                    condition: { field: 'age', operator: '>', value: 65 },
                    on_true_next_node_id: 'senior',
                    on_false_next_node_id: 'young'
                },
                { id: 'senior', type: 'MESSAGE', message: 'Senior msg', next_node_id: null },
                { id: 'young', type: 'MESSAGE', message: 'Young msg', next_node_id: null }
            ]
        };

        const patient: PatientContext = {
            id: 'p2', age: 70, language: 'en', condition: 'hip_replacement'
        };

        const runId = createRun(journey, patient);
        await executeJourney(journey, patient, runId);

        const run = runStore.get(runId)!;
        expect(run.status).toBe('completed');
        expect(run.currentNodeId).toBe(null);
    });

    it('waits on DELAY node', async () => {
        jest.useFakeTimers();
        const journey: Journey = {
            id: 'delay-1',
            name: 'Delay Test',
            start_node_id: 'n1',
            nodes: [
                { id: 'n1', type: 'DELAY', duration_seconds: 2, next_node_id: 'n2' },
                { id: 'n2', type: 'MESSAGE', message: 'Done!', next_node_id: null }
            ]
        };

        const patient: PatientContext = {
            id: 'p3', age: 55, language: 'en', condition: 'knee_replacement'
        };

        const runId = createRun(journey, patient);
        const promise = executeJourney(journey, patient, runId);

        jest.advanceTimersByTime(2000); // simulate time passing
        await promise;

        const run = runStore.get(runId)!;
        expect(run.status).toBe('completed');
    });
});
