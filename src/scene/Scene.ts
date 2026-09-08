import type { TickListener } from "../core/TickListener.js";
import type { Entity } from "../entity/Entity.js";

export class Scene implements TickListener {
    private entities: Entity[];
    
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;

    constructor() {
        this.entities = [];
    }

    public add(entity: Entity): void {
        this.entities.push(entity);
        if (this.canvas) {
            entity.init();
        }
    }

    public remove(entity: Entity): boolean {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities[index]?.dispose();
            this.entities.splice(index, 1);
            return true;
        }
        return false;
    }

    public init(): void {
        const appContainer = document.getElementById('app');
        if (!appContainer) {
            console.error("no container with 'app' id");
            return;
        }

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        if (!this.ctx) {
            console.error("failed to fetch canvas");
            return;
        }

        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));

        appContainer.appendChild(this.canvas);

        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i]?.init();
        }
    }

    public invoke(delta: number): void {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i]?.update(delta);
        }

        this.redraw();
    }

    private redraw(): void {
        if (!this.canvas || !this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i]?.draw(this.ctx);
        }
    }

    private resizeCanvas(): void {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
    }

    public dispose(): void {
        window.removeEventListener('resize', this.resizeCanvas.bind(this));
        
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i]?.dispose();
        }
        this.entities = [];

        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }

        this.canvas = null;
        this.ctx = null;
    }
}
