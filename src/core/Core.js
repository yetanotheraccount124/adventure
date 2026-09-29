export class Core {
    listeners;
    shutdown = false;
    lastTime = 0;
    constructor() {
        this.listeners = [];
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    stop() {
        this.shutdown = true;
    }
    init() {
        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i]?.init();
        }
    }
    dispose() {
        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i]?.dispose();
        }
    }
    run() {
        this.shutdown = false;
        this.lastTime = performance.now();
        this.init();
        requestAnimationFrame(this.tick.bind(this));
    }
    tick(currentTime) {
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
//# sourceMappingURL=Core.js.map