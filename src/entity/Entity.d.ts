export declare class Entity {
    x: number;
    y: number;
    scale: number;
    hidden: boolean;
    paused: boolean;
    texture: HTMLImageElement;
    isLoaded: boolean;
    isUi: boolean;
    constructor(textureSrc: string, x?: number, y?: number, scale?: number);
    get scaleWidth(): number;
    get scaleHeight(): number;
    show(): void;
    hide(): void;
    update(delta: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
    init(): void;
    dispose(): void;
}
//# sourceMappingURL=Entity.d.ts.map