import { Entity } from "./Entity.js";
import { InputManager, GameAction } from "../input/InputManager.js";

export class UiButton extends Entity {
    public width: number;
    public height: number;
    private action: GameAction;

    private onTouchStartRef: (e: TouchEvent) => void;
    private onTouchEndRef: (e: TouchEvent) => void;

    constructor(textureSrc: string, x: number, y: number, width: number, height: number, action: GameAction) {
        super(textureSrc, x, y);
        this.width = width;
        this.height = height;
        this.action = action;

        this.onTouchStartRef = (e) => this.handleTouchStart(e);
        this.onTouchEndRef = (e) => this.handleTouchEnd(e);

        window.addEventListener("touchstart", this.onTouchStartRef, { passive: false });
        window.addEventListener("touchend", this.onTouchEndRef, { passive: false });
    }

    private isTouchInside(touchX: number, touchY: number): boolean {
        return (
            touchX >= this.x &&
            touchX <= this.x + this.width &&
            touchY >= this.y &&
            touchY <= this.y + this.height
        );
    }

    private handleTouchStart(e: TouchEvent): void {
        if (this.hidden || this.paused) return;

        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            if (touch != undefined && this.isTouchInside(touch.clientX, touch.clientY)) {
                InputManager.triggerVirtualAction(this.action, true);
                e.preventDefault();
                break;
            }
        }
    }

    private handleTouchEnd(e: TouchEvent): void {
        if (this.hidden || this.paused) return;

        let stillPressed = false;
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            if (touch != undefined && this.isTouchInside(touch.clientX, touch.clientY)) {
                stillPressed = true;
                break;
            }
        }

        if (!stillPressed) {
            InputManager.triggerVirtualAction(this.action, false);
        }
    }

    public override draw(ctx: CanvasRenderingContext2D): void {
        if (this.isLoaded && !this.hidden) {
            ctx.drawImage(this.texture, this.x, this.y, this.width, this.height);
        }
    }

    public override dispose(): void {
        window.removeEventListener("touchstart", this.onTouchStartRef);
        window.removeEventListener("touchend", this.onTouchEndRef);
        super.dispose();
    }
}
