import { Entity } from "./Entity.js";
export declare class KinematicBody extends Entity {
    speedX: number;
    speedY: number;
    accelX: number;
    accelY: number;
    friction: number;
    gravity: number;
    width: number;
    height: number;
    constructor(textureSrc: string, x?: number, y?: number, width?: number, height?: number);
    update(delta: number): void;
    intersects(other: KinematicBody): boolean;
    stop(): void;
}
//# sourceMappingURL=KinematicBody.d.ts.map