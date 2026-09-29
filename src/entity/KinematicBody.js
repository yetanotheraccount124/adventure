import { TextureManager } from "../core/TextureManager.js";
import { Entity } from "./Entity.js";
export class KinematicBody extends Entity {
    speedX = 0;
    speedY = 0;
    accelX = 0;
    accelY = 0;
    friction = 0;
    gravity = 0;
    width = 0;
    height = 0;
    constructor(textureSrc, x = 0, y = 0, width = 0, height = 0) {
        super(textureSrc, x, y);
        this.width = width;
        this.height = height;
        if (width === 0 || height === 0) {
            TextureManager.getOrCreate(textureSrc, () => {
                if (this.width === 0)
                    this.width = this.texture.width;
                if (this.height === 0)
                    this.height = this.texture.height;
            });
        }
    }
    update(delta) {
        if (!this.isLoaded || this.paused)
            return;
        if (this.gravity !== 0) {
            this.speedY += this.gravity * delta;
        }
        this.speedX += this.accelX * delta;
        this.speedY += this.accelY * delta;
        if (this.friction > 0) {
            this.speedX -= this.speedX * this.friction * delta;
            this.speedY -= this.speedY * this.friction * delta;
            if (Math.abs(this.speedX) < 0.1)
                this.speedX = 0;
            if (Math.abs(this.speedY) < 0.1)
                this.speedY = 0;
        }
        this.x += this.speedX * delta;
        this.y += this.speedY * delta;
    }
    intersects(other) {
        return (this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y);
    }
    stop() {
        this.speedX = 0;
        this.speedY = 0;
        this.accelX = 0;
        this.accelY = 0;
    }
}
//# sourceMappingURL=KinematicBody.js.map