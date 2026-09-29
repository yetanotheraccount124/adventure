import { Entity } from "./Entity.js";
export class Obstacle extends Entity {
    speed;
    constructor(textureSrc, x, y, speed) {
        super(textureSrc, x, y, 1.0);
        this.speed = speed;
    }
    update(delta) {
        super.update(delta);
        if (this.paused) {
            return;
        }
        this.x -= this.speed * delta;
    }
    getBounds() {
        return {
            x: this.x,
            y: this.y - 40,
            width: this.scaleWidth,
            height: this.scaleHeight + 60
        };
    }
}
//# sourceMappingURL=Obstacle.js.map