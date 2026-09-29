import type { TickListener } from "./TickListener.js";
export declare class Core {
    private listeners;
    private shutdown;
    private lastTime;
    constructor();
    addListener(listener: TickListener): void;
    stop(): void;
    init(): void;
    dispose(): void;
    run(): void;
    private tick;
}
//# sourceMappingURL=Core.d.ts.map