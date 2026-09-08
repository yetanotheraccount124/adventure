export interface TickListener {
    invoke(delta: number): void;

    init(): void;
    dispose(): void;
}