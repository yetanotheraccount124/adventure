import { Entity } from "./Entity.js";

export class Obstacle extends Entity {
    private speed: number;

    constructor(textureSrc: string, x: number, y: number, speed: number) {
        super(textureSrc, x, y, 1.0); 
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
            y: this.y - 40,
            width: this.scaleWidth,
            height: this.scaleHeight + 60
        };
    }
}
