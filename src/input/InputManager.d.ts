export declare enum GameAction {
    UP = "UP",
    DOWN = "DOWN",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    ACTION = "ACTION"
}
export declare class InputManager {
    private static actions;
    private static keyMap;
    static init(): void;
    static isPressed(action: GameAction): boolean;
    static triggerVirtualAction(action: GameAction, isPressed: boolean): void;
    static reset(): void;
}
//# sourceMappingURL=InputManager.d.ts.map