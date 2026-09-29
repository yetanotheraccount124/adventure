import { Entity } from "./Entity.js";
export declare class ScrollingGround extends Entity {
    private pattern;
    private height;
    private speed;
    constructor(textureSrc: string, height?: number, speed?: number);
    update(delta: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=ScrollingGround.d.ts.map