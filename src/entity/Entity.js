import { TextureManager } from "../core/TextureManager.js";
export class Entity {
    x;
    y;
    scale;
    hidden;
    paused;
    texture;
    isLoaded = false;
    isUi = false;
    constructor(textureSrc, x = 0, y = 0, scale = 1) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.hidden = true;
        this.paused = false;
        this.texture = TextureManager.getOrCreate(textureSrc, () => {
            this.isLoaded = true;
        });
    }
    get scaleWidth() {
        return this.isLoaded ? this.texture.width * this.scale : 0;
    }
    get scaleHeight() {
        return this.isLoaded ? this.texture.height * this.scale : 0;
    }
    show() {
        this.hidden = false;
    }
    hide() {
        this.hidden = true;
    }
    update(delta) {
        if (!this.isLoaded || this.paused)
            return;
    }
    draw(ctx) {
        if (this.isLoaded && !this.hidden) {
            ctx.drawImage(this.texture, this.x, this.y, this.texture.width * this.scale, this.texture.height * this.scale);
        }
    }
    init() { }
    dispose() {
        this.texture = null;
    }
}
//# sourceMappingURL=Entity.js.map