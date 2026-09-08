import type { TickListener } from "./TickListener.js";

export class Core {
    private listeners: TickListener[];
    private shutdown: boolean = false;
    private lastTime: number = 0;

    constructor() {
        this.listeners = [];
    }

    public addListener(listener: TickListener): void {
        this.listeners.push(listener);
    }

    public stop(): void {
        this.shutdown = true;
    }

    public init(): void {
        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i]?.init();
        }
    }

    public dispose(): void {
        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i]?.dispose();
        }
    }

    public run(): void {
        this.shutdown = false;
        this.lastTime = performance.now();
        this.init();
        requestAnimationFrame(this.tick.bind(this));
    }

    private tick(currentTime: number): void {
        if (this.shutdown) {
            this.dispose();
            return;
        }

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        const cappedDeltaTime = Math.min(deltaTime, 0.1);

        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i]?.invoke(cappedDeltaTime);
        }

        requestAnimationFrame(this.tick.bind(this));
    }
}
