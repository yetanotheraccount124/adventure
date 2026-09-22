import type {
    TickListener
} from "../core/TickListener.js";
import {
    StaticTexture
} from "../entity/StaticTexture.js";
import {
    ScrollingGround
} from "../entity/ScrollingGround.js";
import {
    KinematicBody
} from "../entity/KinematicBody.js";
import {
    UiButton
} from "../entity/UiButton.js";
import {
    Coin
} from "../entity/Coin.js";
import {
    Obstacle
} from "../entity/Obstacle.js";
import {
    InputManager,
    GameAction
} from "../input/InputManager.js";
import {
    Global
} from "../Global.js";

export class Game implements TickListener {
    private bg: StaticTexture | null = null;
    private clouds: StaticTexture | null = null;
    private rocks: StaticTexture | null = null;
    private ground: ScrollingGround | null = null;
    private hero: KinematicBody | null = null;

    private coins: Coin[] = [];
    private coinSpawnTimer: number = 0;
    private readonly coinSpawnInterval: number = 2.0;
    private score: number = 0;

    private obstacles: Obstacle[] = [];
    private obstacleSpawnTimer: number = 0;
    private readonly obstacleSpawnInterval: number = 2.5;

    private isPaused: boolean = false;
    private isDead: boolean = false;
    private isGameOver: boolean = false;
    private flashAlpha: number = 0;

    private btnUp: UiButton | null = null;
    private btnDown: UiButton | null = null;
    private btnPause: UiButton | null = null;
    private btnResume: UiButton | null = null;
    private btnSettings: UiButton | null = null;

    private heroSpeed: number = 300;
    private readonly groundHeight: number = 100;
    private gameSpeed: number = 200;
    private readonly btnSize: number = 80;
    private readonly btnMargin: number = 20;

    private menuTargetScale: number = 0;
    private menuCurrentScale: number = 0;
    private readonly menuAnimSpeed: number = 5;

    private restartDelayTimer: number = 0;

    private onGameOverClickRef: () => void;

    constructor() {
        this.onGameOverClickRef = () => {
            if (this.isGameOver && this.restartDelayTimer >= 2.0) {
                this.resetGame();
            }
        };
    }

    public init(): void {
        this.bg = new StaticTexture("/assets/bg.png", 0, 0);
        this.bg.show();
        Global.scene.add(this.bg);

        const sw = window.innerWidth;

        this.clouds = new StaticTexture("/assets/cloud.png", sw + 200, 50);
        this.clouds.show();
        Global.scene.add(this.clouds);

        this.rocks = new StaticTexture("/assets/rock.png", sw + 600, 250);
        this.rocks.show();
        Global.scene.add(this.rocks);

        this.ground = new ScrollingGround("/assets/ground.png", this.groundHeight, this.gameSpeed);
        this.ground.show();
        Global.scene.add(this.ground);

        this.hero = new KinematicBody("/assets/hero.png", 30, 200);
        this.hero.scale = 0.8;
        this.hero.show();
        Global.scene.add(this.hero);

        this.createMobileButtons();
        this.createMenuButtons();

        this.hookScoreRenderer();

        window.addEventListener("mousedown", this.onGameOverClickRef);
        window.addEventListener("touchstart", this.onGameOverClickRef);
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

        this.btnPause = new UiButton("/assets/btn-pause.png", this.btnMargin, this.btnMargin, 60, 60, null, () => {
            this.togglePause(true);
        });

        this.btnUp.show();
        this.btnDown.show();
        this.btnPause.show();

        Global.scene.add(this.btnUp);
        Global.scene.add(this.btnDown);
        Global.scene.add(this.btnPause);
    }

    private createMenuButtons(): void {
        this.btnResume = new UiButton("/assets/btn-resume.png", 0, 0, 0, 0, null, () => {
            this.togglePause(false);
        });

        this.btnSettings = new UiButton("/assets/btn-settings.png", 0, 0, 0, 0, null, () => {});

        this.btnResume.scale = 0;
        this.btnSettings.scale = 0;

        Global.scene.add(this.btnResume);
        Global.scene.add(this.btnSettings);

        this.updateMenuButtonsPositions();
    }

    private togglePause(pause: boolean): void {
        if (this.isDead || this.isGameOver) return;

        this.isPaused = pause;
        this.menuTargetScale = pause ? 1 : 0;

        for (const coin of this.coins) coin.paused = pause;
        for (const obs of this.obstacles) obs.paused = pause;

        if (pause) {
            this.btnResume?.show();
            this.btnSettings?.show();
            this.btnUp?.hide();
            this.btnDown?.hide();
            this.btnPause?.hide();

            if (this.ground) this.ground.paused = true;
        } else {
            this.btnUp?.show();
            this.btnDown?.show();
            this.btnPause?.show();

            if (this.ground) this.ground.paused = false;
        }
    }

    private updateMenuButtonsPositions(): void {
        const sw = window.innerWidth;
        const sh = window.innerHeight;

        if (this.btnResume && this.btnSettings) {
            this.btnResume.x = (sw - this.btnResume.scaleWidth) / 2;
            this.btnResume.y = (sh / 2) - this.btnResume.scaleHeight - 10;

            this.btnSettings.x = (sw - this.btnSettings.scaleWidth) / 2;
            this.btnSettings.y = (sh / 2) + 10;
        }
    }

    private spawnCoinGroup(): void {
        const sw = window.innerWidth;
        const sh = window.innerHeight;

        const minSpawnY = 50;
        const maxSpawnY = sh - this.groundHeight - 80;
        const spawnY = minSpawnY + Math.random() * (maxSpawnY - minSpawnY);

        const count = 3;
        const distanceBetween = 60;

        for (let i = 0; i < count; i++) {
            const coinX = sw + (i * distanceBetween);
            const coin = new Coin("/assets/coin.png", coinX, spawnY, this.gameSpeed);
            coin.show();

            this.coins.push(coin);
            Global.scene.add(coin);
        }
    }

    private spawnObstacle(): void {
        const sw = window.innerWidth;
        const sh = window.innerHeight;

        const minSpawnY = 50;
        const maxSpawnY = sh - this.groundHeight - 90;
        const spawnY = minSpawnY + Math.random() * (maxSpawnY - minSpawnY);

        const obstacle = new Obstacle("/assets/obs1.png", sw + 100, spawnY, this.gameSpeed);
        obstacle.show();

        this.obstacles.push(obstacle);
        Global.scene.add(obstacle);
    }

    private checkCollisions(): void {
        if (!this.hero || this.isDead || this.isGameOver) return;

        const heroBounds = {
            x: this.hero.x,
            y: this.hero.y,
            width: this.hero.scaleWidth || 60,
            height: this.hero.height
        };

        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            if (!coin) continue;

            const coinBounds = coin.getBounds();
            const isColliding =
                heroBounds.x < coinBounds.x + coinBounds.width &&
                heroBounds.x + heroBounds.width > coinBounds.x &&
                heroBounds.y < coinBounds.y + coinBounds.height &&
                heroBounds.y + heroBounds.height > coinBounds.y;

            if (isColliding) {
                this.score += 1;
                Global.scene.remove(coin);
                this.coins.splice(i, 1);
                continue;
            }

            if (coin.x + coinBounds.width < 0) {
                Global.scene.remove(coin);
                this.coins.splice(i, 1);
            }
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            if (!obs) continue;

            const obsBounds = obs.getBounds();
            const isCollidingWithObstacle =
                heroBounds.x < obsBounds.x + obsBounds.width &&
                heroBounds.x + heroBounds.width > obsBounds.x &&
                heroBounds.y < obsBounds.y + obsBounds.height &&
                heroBounds.y + heroBounds.height > obsBounds.y;

            if (isCollidingWithObstacle) {
                this.triggerDeath();
                break;
            }

            if (obs.x + obsBounds.width < 0) {
                Global.scene.remove(obs);
                this.obstacles.splice(i, 1);
            }
        }
    }

    private triggerDeath(): void {
        this.isDead = true;
        this.flashAlpha = 1.0;

        if (this.ground) this.ground.paused = true;
        for (const coin of this.coins) coin.paused = true;
        for (const obs of this.obstacles) obs.paused = true;

        this.btnUp?.hide();
        this.btnDown?.hide();
        this.btnPause?.hide();

        if (this.hero) {
            this.hero.speedY = -150;
            this.hero.gravity = 900;
        }
    }

    private resetGame(): void {
        for (const coin of this.coins) Global.scene.remove(coin);
        this.coins = [];

        for (const obs of this.obstacles) Global.scene.remove(obs);
        this.obstacles = [];

        this.score = 0;
        this.coinSpawnTimer = 0;
        this.obstacleSpawnTimer = 0;
        this.isDead = false;
        this.isGameOver = false;
        this.flashAlpha = 0;

        InputManager.triggerVirtualAction(GameAction.UP, false);

        if (this.hero) {
            this.hero.x = 30;
            this.hero.y = 200;
            this.hero.speedY = 0;
            this.hero.gravity = 0;
            this.hero.accelX = 0;
            this.hero.accelY = 0;
        }

        if (this.ground) this.ground.paused = false;
        this.btnUp?.show();
        this.btnDown?.show();
        this.btnPause?.show();
    }
    private hookScoreRenderer(): void {
        const dummyUi = {
            x: 0,
            y: 0,
            scale: 1,
            hidden: false,
            paused: false,
            isLoaded: true,
            isUi: true,
            texture: new Image(),
            scaleWidth: 0,
            scaleHeight: 0,
            init: () => {},
            update: () => {},
            dispose: () => {},
            show: () => {},
            hide: () => {},
            draw: (ctx: CanvasRenderingContext2D) => {
                ctx.save();
                ctx.lineJoin = "round";
                ctx.fillStyle = "#ffffff";
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 4;
                ctx.font = "bold 28px sans-serif";
                ctx.textAlign = "right";
                const scoreText = `Монеты: ${this.score}`;
                ctx.strokeText(scoreText, ctx.canvas.width - 20, 45);
                ctx.fillText(scoreText, ctx.canvas.width - 20, 45);
                if (this.flashAlpha > 0) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
                    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                }
                if (this.isGameOver) {
                    const cx = ctx.canvas.width / 2;
                    const cy = ctx.canvas.height / 2;
                    ctx.textAlign = "center";
                    ctx.strokeStyle = "#000000";

                    ctx.fillStyle = "#ff3333";
                    ctx.font = "bold 32px sans-serif";
                    ctx.lineWidth = 6;
                    ctx.strokeText("ИГРА ОКОНЧЕНА", cx, cy - 20);
                    ctx.fillText("ИГРА ОКОНЧЕНА", cx, cy - 20);

                    ctx.fillStyle = "#ffffff";
                    ctx.font = "24px sans-serif";
                    ctx.lineWidth = 4;
                    ctx.strokeText("Нажмите ВВЕРХ", cx, cy + 30);
                    ctx.fillText("Нажмите ВВЕРХ", cx, cy + 30);

                    ctx.font = "18px sans-serif";
                    ctx.strokeText("или кликните для рестарта", cx, cy + 60);
                    ctx.fillText("или кликните для рестарта", cx, cy + 60);
                }
                ctx.restore();
            }
        };
        Global.scene.add(dummyUi);
    }
    public invoke(delta: number): void {
        if (this.flashAlpha > 0) {
            this.flashAlpha -= delta * 4;
            if (this.flashAlpha < 0) this.flashAlpha = 0;
        }
        if (this.menuCurrentScale !== this.menuTargetScale) {
            this.menuCurrentScale += (this.menuTargetScale - this.menuCurrentScale) * this.menuAnimSpeed * delta;
            if (Math.abs(this.menuCurrentScale - this.menuTargetScale) < 0.01) {
                this.menuCurrentScale = this.menuTargetScale;
                if (this.menuTargetScale === 0) {
                    this.btnResume?.hide();
                    this.btnSettings?.hide();
                }
            }
            if (this.btnResume && this.btnSettings) {
                this.btnResume.scale = this.menuCurrentScale;
                this.btnSettings.scale = this.menuCurrentScale;
                this.updateMenuButtonsPositions();
            }
        }
        if (this.isDead && !this.isGameOver) {
            if (this.hero) {
                this.hero.update(delta);
                const screenHeight = window.innerHeight;
                const maxHeroY = screenHeight - this.groundHeight - this.hero.height;
                if (this.hero.y >= maxHeroY) {
                    this.hero.y = maxHeroY;
                    this.hero.stop();
                    this.isGameOver = true;
                    
                    this.restartDelayTimer = 0; 
                }
            }
            return;
        }

        if (this.isGameOver) {
            this.restartDelayTimer += delta;

            if (this.restartDelayTimer >= 2.0) {
                if (InputManager.isPressed(GameAction.UP)) {
                    this.resetGame();
                }
            }
            return;
        }
        if (this.isPaused) {
            return;
        }
        this.coinSpawnTimer += delta;
        if (this.coinSpawnTimer >= this.coinSpawnInterval) {
            this.coinSpawnTimer = 0;
            this.spawnCoinGroup();
        }
        this.obstacleSpawnTimer += delta;
        if (this.obstacleSpawnTimer >= this.obstacleSpawnInterval) {
            this.obstacleSpawnTimer = 0;
            this.spawnObstacle();
        }
        this.checkCollisions();
        const sw = window.innerWidth;
        if (this.bg != null) {
            const bgSpeed = (this.gameSpeed / 8) * delta;
            this.bg.x -= bgSpeed;
            if (this.bg.x < -1000) this.bg.x = 0;
        }
        if (this.clouds != null) {
            const cloudsSpeed = (this.gameSpeed / 4) * delta;
            this.clouds.x -= cloudsSpeed;
            if (this.clouds.x + this.clouds.scaleWidth < 0) {
                const randomOffset = 150 + Math.random() * 500;
                this.clouds.x = sw + randomOffset;
                this.clouds.y = 30 + Math.random() * 80;
            }
        }
        if (this.rocks != null) {
            const rocksSpeed = (this.gameSpeed / 2) * delta;
            this.rocks.x -= rocksSpeed;
            if (this.rocks.x + this.rocks.scaleWidth < 0) {
                const randomOffset = 300 + Math.random() * 600;
                this.rocks.x = sw + randomOffset;
            }
        }
        if (this.hero != null) {
            this.hero.speedY = 0;
            if (InputManager.isPressed(GameAction.UP)) {
                this.hero.speedY = -this.heroSpeed;
            }
            if (InputManager.isPressed(GameAction.DOWN)) {
                this.hero.speedY = this.heroSpeed;
            }
            const screenHeight = window.innerHeight - 80;
            const maxHeroY = screenHeight - this.groundHeight - this.hero.height;
            if (this.hero.y <= 0 && this.hero.speedY < 0) {
                this.hero.y = 0;
                this.hero.speedY = 0;
            }
            if (this.hero.y >= maxHeroY && this.hero.speedY > 0) {
                this.hero.y = maxHeroY;
                this.hero.speedY = 0;
            }
            this.hero.update(delta);
        }
    }
    private handleResize(): void {
        const sw = window.innerWidth;
        const sh = window.innerHeight;
        if (this.btnUp && this.btnDown && this.btnPause) {
            this.btnUp.x = sw - this.btnSize - this.btnMargin;
            this.btnUp.y = sh - (this.btnSize * 2) - this.btnMargin - 15;
            this.btnDown.x = sw - this.btnSize - this.btnMargin;
            this.btnDown.y = sh - this.btnSize - this.btnMargin;
            this.btnPause.x = this.btnMargin;
            this.btnPause.y = this.btnMargin;
        }
        this.updateMenuButtonsPositions();
    }
    public dispose(): void {
        window.removeEventListener('resize', this.handleResize.bind(this));
        window.removeEventListener("mousedown", this.onGameOverClickRef);
        window.removeEventListener("touchstart", this.onGameOverClickRef);
        for (const coin of this.coins) Global.scene.remove(coin);
        this.coins = [];
        for (const obs of this.obstacles) Global.scene.remove(obs);
        this.obstacles = [];
        if (this.bg) Global.scene.remove(this.bg);
        if (this.clouds) Global.scene.remove(this.clouds);
        if (this.rocks) Global.scene.remove(this.rocks);
        if (this.ground) Global.scene.remove(this.ground);
        if (this.hero) Global.scene.remove(this.hero);
        if (this.btnUp) Global.scene.remove(this.btnUp);
        if (this.btnDown) Global.scene.remove(this.btnDown);
        if (this.btnPause) Global.scene.remove(this.btnPause);
        if (this.btnResume) Global.scene.remove(this.btnResume);
        if (this.btnSettings) Global.scene.remove(this.btnSettings);
        this.bg = null;
        this.clouds = null;
        this.rocks = null;
        this.ground = null;
        this.hero = null;
        this.btnUp = null;
        this.btnDown = null;
        this.btnPause = null;
        this.btnResume = null;
        this.btnSettings = null;
    }
}