import { Entity } from "./Entity.js";
import { InputManager, GameAction } from "../input/InputManager.js";

export class UiButton extends Entity {
    private action: GameAction | null;
    private onClickCb?: (() => void) | undefined;

    private onTouchStartRef: (e: TouchEvent) => void;
    private onTouchEndRef: (e: TouchEvent) => void;
    private onMouseDownRef: (e: MouseEvent) => void;

    private fallbackWidth: number;
    private fallbackHeight: number;

    constructor(
        textureSrc: string, 
        x: number, 
        y: number, 
        fallbackWidth: number, 
        fallbackHeight: number, 
        action: GameAction | null = null, 
        onClick?: () => void
    ) {
        super(textureSrc, x, y);
        this.fallbackWidth = fallbackWidth;
        this.fallbackHeight = fallbackHeight;
        this.action = action;
        this.onClickCb = onClick;

        this.onTouchStartRef = (e) => this.handleTouchStart(e);
        this.onTouchEndRef = (e) => this.handleTouchEnd(e);
        this.onMouseDownRef = (e) => this.handleMouseDown(e);

        window.addEventListener("touchstart", this.onTouchStartRef, { passive: false });
        window.addEventListener("touchend", this.onTouchEndRef, { passive: false });
        window.addEventListener("mousedown", this.onMouseDownRef);
    }

    public get width(): number {
        return this.isLoaded ? this.scaleWidth : this.fallbackWidth * this.scale;
    }

    public get height(): number {
        return this.isLoaded ? this.scaleHeight : this.fallbackHeight * this.scale;
    }

    private isPointInside(px: number, py: number): boolean {
        return (
            px >= this.x &&
            px <= this.x + this.width &&
            py >= this.y &&
            py <= this.y + this.height
        );
    }

    private handleTouchStart(e: TouchEvent): void {
        if (this.hidden) return;

        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            if (touch != undefined && this.isPointInside(touch.clientX, touch.clientY)) {
                if (this.action !== null) InputManager.triggerVirtualAction(this.action, true);
                if (this.onClickCb) this.onClickCb();
                e.preventDefault();
                break;
            }
        }
    }

    private handleTouchEnd(e: TouchEvent): void {
        if (this.hidden) return;

        let stillPressed = false;
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            if (touch != undefined && this.isPointInside(touch.clientX, touch.clientY)) {
                stillPressed = true;
                break;
            }
        }

        if (!stillPressed && this.action !== null) {
            InputManager.triggerVirtualAction(this.action, false);
        }
    }

    private handleMouseDown(e: MouseEvent): void {
        if (this.hidden) return;
        if (this.isPointInside(e.clientX, e.clientY)) {
            if (this.onClickCb) this.onClickCb();
        }
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        if (this.isLoaded && !this.hidden) {
            super.draw(ctx);
        }
    }

    public override dispose(): void {
        window.removeEventListener("touchstart", this.onTouchStartRef);
        window.removeEventListener("touchend", this.onTouchEndRef);
        window.removeEventListener("mousedown", this.onMouseDownRef);
        super.dispose();
    }
}
