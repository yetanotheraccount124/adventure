import type { TickListener } from "../core/TickListener.js";
import { StaticTexture } from "../entity/StaticTexture.js";
import { Global } from "../Global.js";

export class Game implements TickListener {
    private bg: StaticTexture | null = null;

    public invoke(delta: number): void {
        if (this.bg != null) {
            this.bg.x = this.bg.x < -1000 ? 0 : this.bg.x - 5
        }
    }

    public init(): void {
        this.bg = new StaticTexture("assets/bg.png",0, 0);
        this.bg.show();
        Global.scene.add(this.bg);
    }
    public dispose(): void {}
}