import type { TickListener } from "../core/TickListener.js";
import { StaticTexture } from "../entity/StaticTexture.js";
import { Global } from "../Global.js";

export class Game implements TickListener {
    public invoke(delta: number): void {

    }

    public init(): void {
        let texture = new StaticTexture("assets/test.png", 100, 100);
        texture.show();
        Global.scene.add(texture);
    }
    public dispose(): void {}
}