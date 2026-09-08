import { Entity } from "./Entity.js";

export class ScrollingGround extends Entity {
    private pattern: CanvasPattern | null = null;
    private height: number;
    private speed: number;

    constructor(textureSrc: string, height: number = 100, speed: number = 150) {
        super(textureSrc, 0, 0);
        this.height = height;
        this.speed = speed;
    }

    public override update(delta: number): void {
        if (!this.isLoaded || this.paused) return;

        this.x -= this.speed * delta;

        if (this.x <= -this.texture.width) {
            this.x = 0;
        }
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isLoaded || this.hidden) return;

        if (!this.pattern) {
            this.pattern = ctx.createPattern(this.texture, 'repeat')!;
        }

        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;
        const groundY = screenHeight - this.height;

        ctx.save();
        
        ctx.translate(this.x, groundY);

        ctx.fillStyle = this.pattern;

        ctx.fillRect(0, 0, screenWidth + this.texture.width, this.height);

        ctx.restore();
    }
}
