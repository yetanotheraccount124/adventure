import type { TickListener } from "../core/TickListener.js";
import { StaticTexture } from "../entity/StaticTexture.js";
import { ScrollingGround } from "../entity/ScrollingGround.js";
import { KinematicBody } from "../entity/KinematicBody.js";
import { UiButton } from "../entity/UiButton.js";
import { InputManager, GameAction } from "../input/InputManager.js";
import { Global } from "../Global.js";

export class Game implements TickListener {
    private bg: StaticTexture | null = null;
    private ground: ScrollingGround | null = null;
    private hero: KinematicBody | null = null;
    private btnUp: UiButton | null = null;
    private btnDown: UiButton | null = null;

    private heroSpeed: number = 300;
    private readonly groundHeight: number = 100;
    private gameSpeed: number = 200;
    private readonly btnSize: number = 80;
    private readonly btnMargin: number = 20;

    public init(): void {
        this.bg = new StaticTexture("/assets/bg.png", 0, 0);
        this.bg.show();
        Global.scene.add(this.bg);

        this.ground = new ScrollingGround("/assets/ground.png", this.groundHeight, this.gameSpeed);
        this.ground.show();
        Global.scene.add(this.ground);

        this.hero = new KinematicBody("/assets/hero.png", 50, 200);
        this.hero.show();
        Global.scene.add(this.hero);

        this.createMobileButtons();
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    private createMobileButtons(): void {
        const sw = window.innerWidth;
        const sh = window.innerHeight;

        const btnUpX = sw - this.btnSize - this.btnMargin;
        const btnUpY = sh - (this.btnSize * 2) - this.btnMargin - 20;

        const btnDownX = sw - this.btnSize - this.btnMargin;
        const btnDownY = sh - this.btnSize - this.btnMargin - 5;

        this.btnUp = new UiButton("/assets/btn-up.png", btnUpX, btnUpY, this.btnSize, this.btnSize, GameAction.UP);
        this.btnDown = new UiButton("/assets/btn-down.png", btnDownX, btnDownY, this.btnSize, this.btnSize, GameAction.DOWN);

        this.btnUp.show();
        this.btnDown.show();

        Global.scene.add(this.btnUp);
        Global.scene.add(this.btnDown);
    }

    public invoke(delta: number): void {
        if (this.bg != null) {
            const bgSpeed = (this.gameSpeed / 4) * delta;
            this.bg.x -= bgSpeed;
            if (this.bg.x < -1000) this.bg.x = 0;
        }

        if (this.hero != null) {
            this.hero.speedY = 0;

            if (InputManager.isPressed(GameAction.UP)) {
                this.hero.speedY = -this.heroSpeed;
            }
            if (InputManager.isPressed(GameAction.DOWN)) {
                this.hero.speedY = this.heroSpeed;
            }

            const screenHeight = window.innerHeight - 90;
            
            if (this.hero.y < 0) {
                this.hero.y = 0;
                this.hero.speedY = 0;
            }

            const maxHeroY = screenHeight - this.groundHeight - this.hero.height;
            if (this.hero.y > maxHeroY) {
                this.hero.y = maxHeroY;
                this.hero.speedY = 0;
            }
        }
    }

    private handleResize(): void {
        if (this.btnUp && this.btnDown) {
            const sw = window.innerWidth;
            const sh = window.innerHeight;

            this.btnUp.x = sw - this.btnSize - this.btnMargin;
            this.btnUp.y = sh - (this.btnSize * 2) - this.btnMargin - 15;

            this.btnDown.x = sw - this.btnSize - this.btnMargin;
            this.btnDown.y = sh - this.btnSize - this.btnMargin;
        }
    }

    public dispose(): void {
        window.removeEventListener('resize', this.handleResize.bind(this));
        
        if (this.bg) Global.scene.remove(this.bg);
        if (this.ground) Global.scene.remove(this.ground);
        if (this.hero) Global.scene.remove(this.hero);
        if (this.btnUp) Global.scene.remove(this.btnUp);
        if (this.btnDown) Global.scene.remove(this.btnDown);
        
        this.bg = null;
        this.ground = null;
        this.hero = null;
        this.btnUp = null;
        this.btnDown = null;
    }
}
