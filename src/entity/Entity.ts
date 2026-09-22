import { TextureManager } from "../core/TextureManager.js";

export class Entity {
    public x: number;
    public y: number;
    public scale: number;

    public hidden: boolean;
    public paused: boolean;

    public texture: HTMLImageElement;
    public isLoaded: boolean = false;

    constructor(textureSrc: string, x: number = 0, y: number = 0, scale: number = 1) {
        this.x = x;
        this.y = y;
        this.scale = scale;

        this.hidden = true;
        this.paused = false;

        this.texture = TextureManager.getOrCreate(textureSrc, () => {
            this.isLoaded = true;
        });
    }

    public get scaleWidth(): number {
        return this.isLoaded ? this.texture.width * this.scale : 0;
    }

    public get scaleHeight(): number {
        return this.isLoaded ? this.texture.height * this.scale : 0;
    }

    public show(): void {
        this.hidden = false;
    }

    public hide(): void {
        this.hidden = true;
    }

    public update(delta: number): void {
        if (!this.isLoaded || this.paused) return;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.isLoaded && !this.hidden) {
            ctx.drawImage(
                this.texture, 
                this.x, 
                this.y, 
                this.texture.width * this.scale, 
                this.texture.height * this.scale
            );
        }
    }

    public init(): void {}
    
    public dispose(): void {
        (this.texture as any) = null; 
    }
}
