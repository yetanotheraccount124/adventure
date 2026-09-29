import { Entity } from "./Entity.js";
export declare class Obstacle extends Entity {
    private speed;
    constructor(textureSrc: string, x: number, y: number, speed: number);
    update(delta: number): void;
    getBounds(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
//# sourceMappingURL=Obstacle.d.ts.map