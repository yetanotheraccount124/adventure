export var GameAction;
(function (GameAction) {
    GameAction["UP"] = "UP";
    GameAction["DOWN"] = "DOWN";
    GameAction["LEFT"] = "LEFT";
    GameAction["RIGHT"] = "RIGHT";
    GameAction["ACTION"] = "ACTION";
})(GameAction || (GameAction = {}));
export class InputManager {
    static actions = new Map();
    static keyMap = {
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
    static init() {
        for (const action of Object.values(GameAction)) {
            this.actions.set(action, false);
        }
        window.addEventListener("keydown", (e) => {
            const action = this.keyMap[e.code];
            if (action) {
                this.actions.set(action, true);
                e.preventDefault();
            }
        });
        window.addEventListener("keyup", (e) => {
            const action = this.keyMap[e.code];
            if (action) {
                this.actions.set(action, false);
                e.preventDefault();
            }
        });
    }
    static isPressed(action) {
        return this.actions.get(action) || false;
    }
    static triggerVirtualAction(action, isPressed) {
        if (this.actions.has(action)) {
            this.actions.set(action, isPressed);
        }
    }
    static reset() {
        for (const key of this.actions.keys()) {
            this.actions.set(key, false);
        }
    }
}
//# sourceMappingURL=InputManager.js.map