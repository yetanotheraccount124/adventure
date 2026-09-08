export enum GameAction {
    UP = "UP",
    DOWN = "DOWN",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    ACTION = "ACTION"
}

export class InputManager {
    private static actions: Map<GameAction, boolean> = new Map();

    private static keyMap: Record<string, GameAction> = {
        "ArrowUp": GameAction.UP,
        "KeyW": GameAction.UP,
        
        "ArrowDown": GameAction.DOWN,
        "KeyS": GameAction.DOWN,
        
        "ArrowLeft": GameAction.LEFT,
        "KeyA": GameAction.LEFT,
        
        "ArrowRight": GameAction.RIGHT,
        "KeyD": GameAction.RIGHT,
        
        "Space": GameAction.ACTION,
        "KeyE": GameAction.ACTION
    };

    public static init(): void {
        for (const action of Object.values(GameAction)) {
            this.actions.set(action, false);
        }

        window.addEventListener("keydown", (e: KeyboardEvent) => {
            const action = this.keyMap[e.code];
            if (action) {
                this.actions.set(action, true);
                e.preventDefault(); 
            }
        });

        window.addEventListener("keyup", (e: KeyboardEvent) => {
            const action = this.keyMap[e.code];
            if (action) {
                this.actions.set(action, false);
                e.preventDefault();
            }
        });
    }

    public static isPressed(action: GameAction): boolean {
        return this.actions.get(action) || false;
    }

    public static triggerVirtualAction(action: GameAction, isPressed: boolean): void {
        if (this.actions.has(action)) {
            this.actions.set(action, isPressed);
        }
    }

    public static reset(): void {
        for (const key of this.actions.keys()) {
            this.actions.set(key, false);
        }
    }
}
