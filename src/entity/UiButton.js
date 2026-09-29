import { Entity } from "./Entity.js";
import { InputManager, GameAction } from "../input/InputManager.js";
export class UiButton extends Entity {
    action;
    onClickCb;
    onTouchStartRef;
    onTouchEndRef;
    onMouseDownRef;
    fallbackWidth;
    fallbackHeight;
    constructor(textureSrc, x, y, fallbackWidth, fallbackHeight, action = null, onClick) {
        super(textureSrc, x, y);
        this.isUi = true;
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
    get width() {
        return this.isLoaded ? this.scaleWidth : this.fallbackWidth * this.scale;
    }
    get height() {
        return this.isLoaded ? this.scaleHeight : this.fallbackHeight * this.scale;
    }
    isPointInside(px, py) {
        return (px >= this.x &&
            px <= this.x + this.width &&
            py >= this.y &&
            py <= this.y + this.height);
    }
    handleTouchStart(e) {
        if (this.hidden)
            return;
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            if (touch != undefined && this.isPointInside(touch.clientX, touch.clientY)) {
                if (this.action !== null)
                    InputManager.triggerVirtualAction(this.action, true);
                if (this.onClickCb)
                    this.onClickCb();
                e.preventDefault();
                break;
            }
        }
    }
    handleTouchEnd(e) {
        if (this.hidden)
            return;
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
    handleMouseDown(e) {
        if (this.hidden)
            return;
        if (this.isPointInside(e.clientX, e.clientY)) {
            if (this.onClickCb)
                this.onClickCb();
        }
    }
    draw(ctx) {
        if (this.isLoaded && !this.hidden) {
            super.draw(ctx);
        }
    }
    dispose() {
        window.removeEventListener("touchstart", this.onTouchStartRef);
        window.removeEventListener("touchend", this.onTouchEndRef);
        window.removeEventListener("mousedown", this.onMouseDownRef);
        super.dispose();
    }
}
//# sourceMappingURL=UiButton.js.map