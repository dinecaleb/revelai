import request from 'supertest';
import { journeyStore, runStore } from '../engine/state';
import app from '../app';

describe('API: Journey Creation & Triggering', () => {
    beforeEach(() => {
        journeyStore.clear();
        runStore.clear();
    });

    const testJourney = {
        id: 'test-journey-1',
        name: 'Test Linear Journey',
        start_node_id: 'node-1',
        nodes: [
            { id: 'node-1', type: 'MESSAGE', message: 'Hello', next_node_id: 'node-2' },
            { id: 'node-2', type: 'MESSAGE', message: 'How are you?', next_node_id: null }
        ]
    };

    const testPatient = {
        id: 'patient-123',
        age: 45,
        language: 'en',
        condition: 'hip_replacement'
    };

    it('should create a journey', async () => {
        const res = await request(app)
            .post('/journeys')
            .send(testJourney)
            .expect(201);

        expect(res.body.journeyId).toBe('test-journey-1');
        expect(journeyStore.has('test-journey-1')).toBe(true);
    });

    it('should trigger a journey run', async () => {
        await request(app).post('/journeys').send(testJourney);
        const res = await request(app)
            .post('/journeys/test-journey-1/trigger')
            .send(testPatient)
            .expect(202);

        expect(res.body.runId).toBeDefined();
        expect(res.headers['location']).toContain('/journeys/runs/');
    });

    it('should return status for a running journey', async () => {
        await request(app).post('/journeys').send(testJourney);

        const triggerRes = await request(app)
            .post('/journeys/test-journey-1/trigger')
            .send(testPatient)
            .expect(202);

        const runId = triggerRes.body.runId;

        const statusRes = await request(app)
            .get(`/journeys/runs/${runId}`)
            .expect(200);

        expect(statusRes.body).toMatchObject({
            runId,
            journeyId: 'test-journey-1',
            patientContext: testPatient
        });

        expect(['in_progress', 'completed']).toContain(statusRes.body.status);
    });

    it('should return 404 for unknown run ID', async () => {
        await request(app)
            .get('/journeys/runs/invalid-run-id')
            .expect(404);
    });
});
