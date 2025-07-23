import { Journey } from '../models/journey';
import { PatientContext } from '../models/patient';
import { runStore } from './state';
import { evaluateCondition } from '../utils/evaluateCondition';

export async function executeJourney(
    journey: Journey,
    patient: PatientContext,
    runId: string
) {
    let currentNodeId = journey.start_node_id || null;

    const getNode = (id: string | null) =>
        journey.nodes.find((n) => n.id === id) ?? null;

    while (currentNodeId) {
        const node = getNode(currentNodeId);
        if (!node) break;

        const run = runStore.get(runId);
        if (!run) break;
        run.currentNodeId = node.id;
        runStore.set(runId, run);

        switch (node.type) {
            case 'MESSAGE':
                console.log(`Sending message to ${patient.id}: ${node.message}`);
                currentNodeId = node.next_node_id;
                break;

            case 'DELAY':
                await new Promise((res) => setTimeout(res, node.duration_seconds * 1000));
                currentNodeId = node.next_node_id;
                break;

            case 'CONDITIONAL':
                const result = evaluateCondition(node, patient);
                currentNodeId = result
                    ? node.on_true_next_node_id
                    : node.on_false_next_node_id;
                break;
        }
    }

    const run = runStore.get(runId);
    if (run) {
        run.status = 'completed';
        run.currentNodeId = null;
        runStore.set(runId, run);
    }
}
