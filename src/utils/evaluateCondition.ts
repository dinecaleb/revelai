import { ConditionalNode } from '../models/journey';
import { PatientContext } from '../models/patient';

export function evaluateCondition(
    node: ConditionalNode,
    patient: PatientContext
): boolean {
    const fieldValue = (patient as any)[node.condition.field];
    const { operator, value } = node.condition;

    switch (operator) {
        case '>': return fieldValue > value;
        case '<': return fieldValue < value;
        case '=': return fieldValue === value;
        case '!=': return fieldValue !== value;
        case '>=': return fieldValue >= value;
        case '<=': return fieldValue <= value;
        default: return false;
    }
}
