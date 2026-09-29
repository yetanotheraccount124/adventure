import { Entity } from "./Entity.js";
export declare class Coin extends Entity {
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
//# sourceMappingURL=Coin.d.ts.map