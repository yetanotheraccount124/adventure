import type { TickListener } from "../core/TickListener.js";
import type { Entity } from "../entity/Entity.js";
export declare class Scene implements TickListener {
    private entities;
    private canvas;
    private ctx;
    constructor();
    add(entity: Entity): void;
    remove(entity: Entity): boolean;
    init(): void;
    invoke(delta: number): void;
    private redraw;
    private resizeCanvas;
    dispose(): void;
}
//# sourceMappingURL=Scene.d.ts.map