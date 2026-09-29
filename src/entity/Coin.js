import { Entity } from "./Entity.js";
export class Coin extends Entity {
    speed;
    constructor(textureSrc, x, y, speed) {
        super(textureSrc, x, y, 0.6);
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
            y: this.y - 60,
            width: this.scaleWidth,
            height: this.scaleHeight + 30
        };
    }
}
//# sourceMappingURL=Coin.js.map