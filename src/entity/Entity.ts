import type { TickListener } from "../core/TickListener.js";
import { TextureManager } from "../core/TextureManager.js";

export class Entity {
    public x: number;
    public y: number;

    public hidden: boolean;

    public texture: HTMLImageElement;
    public isLoaded: boolean = false;

    constructor(textureSrc: string, x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;

        this.hidden = true;

        this.texture = TextureManager.getOrCreate(textureSrc, () => {
            this.isLoaded = true;
        });
    }

    public show(): void {
        this.hidden = false;
    }

    public hide(): void {
        this.hidden = true;
    }

    public update(delta: number): void {
        if (!this.isLoaded) return;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.isLoaded && !this.hidden) {
            ctx.drawImage(this.texture, this.x, this.y);
        }
    }

    public init(): void {}
    
    public dispose(): void {
        (this.texture as any) = null; 
    }
}
