export interface ActionNode {
    id: string;
    type: 'MESSAGE';
    message: string;
    next_node_id: string | null;
}

export interface DelayNode {
    id: string;
    type: 'DELAY';
    duration_seconds: number;
    next_node_id: string | null;
}

export interface ConditionalNode {
    id: string;
    type: 'CONDITIONAL';
    condition: {
        field: string;
        operator: '>' | '<' | '=' | '!=' | '>=' | '<=';
        value: any;
    };
    on_true_next_node_id: string | null;
    on_false_next_node_id: string | null;
}

export type JourneyNode = ActionNode | DelayNode | ConditionalNode;

export interface Journey {
    id: string;
    name: string;
    start_node_id: string;
    nodes: JourneyNode[];
}

export type NodeType = JourneyNode['type'];
