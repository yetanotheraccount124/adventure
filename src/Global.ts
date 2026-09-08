import type { Core } from "./core/Core.js";
import type { Game } from "./game/Game.js";
import type { Scene } from "./scene/Scene.js";

export class Global {
    public static core: Core;
    public static scene: Scene;
    public static game: Game;
}