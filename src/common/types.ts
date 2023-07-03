export interface TEvent {
    name: string;
    times: string[];
    type: TEventType;
    map: string;
    rewards: string[];
}

export enum TEventType {
    IMPORTANT = "IMPORTANT",
    CASUAL = "CASUAL",
}
