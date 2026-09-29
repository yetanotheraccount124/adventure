import { Entity } from "./Entity.js";
import { GameAction } from "../input/InputManager.js";
export declare class UiButton extends Entity {
    private action;
    private onClickCb?;
    private onTouchStartRef;
    private onTouchEndRef;
    private onMouseDownRef;
    private fallbackWidth;
    private fallbackHeight;
    constructor(textureSrc: string, x: number, y: number, fallbackWidth: number, fallbackHeight: number, action?: GameAction | null, onClick?: () => void);
    get width(): number;
    get height(): number;
    private isPointInside;
    private handleTouchStart;
    private handleTouchEnd;
    private handleMouseDown;
    draw(ctx: CanvasRenderingContext2D): void;
    dispose(): void;
}
//# sourceMappingURL=UiButton.d.ts.map