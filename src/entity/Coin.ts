import { Entity } from "./Entity.js";

export class Coin extends Entity {
    private speed: number;

    constructor(textureSrc: string, x: number, y: number, speed: number) {
        super(textureSrc, x, y, 0.6); 
        this.speed = speed;
    }

    public override update(delta: number): void {
        super.update(delta);
        if (this.paused) { return; }
        this.x -= this.speed * delta;
    }

    public getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.scaleWidth,
            height: this.scaleHeight
        };
    }
}
