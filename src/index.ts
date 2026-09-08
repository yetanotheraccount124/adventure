import { Core } from "./core/Core.js";
import { Game } from "./game/Game.js";
import { Global } from "./Global.js";
import { Scene } from "./scene/Scene.js";

window.addEventListener('DOMContentLoaded', () => {
    let core = new Core();
    Global.core = core
    Global.scene = new Scene();
    Global.game = new Game();

    core.addListener(Global.scene);
    core.addListener(Global.game);
    
    core.run();
})
