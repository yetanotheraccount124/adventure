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

// Перечисление типов бустов
export enum BoostType {
    MAGNET = "MAGNET",
    INVINCIBILITY = "INVINCIBILITY",
    SPEED = "SPEED"
}

// Упрощенный вспомогательный класс для бустов
export class Boost {
    public texture: StaticTexture;
    public type: BoostType;
    public x: number;
    public y: number;
    public width: number = 40;
    public height: number = 40;
    public isLoaded: boolean = true;
    public paused: boolean = false;
    private speedX: number;

    constructor(textureSrc: string, type: BoostType, x: number, y: number, speedX: number) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.texture = new StaticTexture(textureSrc, x, y);
        this.texture.scale = 0.2
        this.texture.show();
    }

    public update(delta: number): void {
        if (this.paused) return;
        this.x -= this.speedX * delta;
        this.texture.x = this.x;
        this.texture.y = this.y;
    }

    public getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

export class Game implements TickListener {
    private bg: StaticTexture | null = null;
    private clouds: StaticTexture | null = null;
    private rocks: StaticTexture | null = null;
    private ground: ScrollingGround | null = null;
    private hero: KinematicBody | null = null;

    private coinBg: StaticTexture | null = null;
    private menuLogo: StaticTexture | null = null; // Логотип для меню

    private readonly bgTextures: string[] = ["/assets/bg.png", "/assets/bg-2.png",
        "/assets/bg-3.jpg", "/assets/bg-4.jpg", "/assets/bg-5.jpg",
        "/assets/bg-6.png", "/assets/bg-7.png"];
    private readonly rockTextures: string[] = ["/assets/rock.png", "/assets/rock-2.png", "/assets/rock-3.png"];
    private readonly obstacleTextures: string[] = ["/assets/obs1.png", "/assets/obs2.png"];
    private readonly cloudTextures: string[] = ["/assets/cloud.png", "/assets/cloud-2.png"];
    private currentBgIndex: number = 0;

    private coins: Coin[] = [];
    private coinSpawnTimer: number = 0;
    private readonly coinSpawnInterval: number = 2.0;
    private score: number = 0;

    private obstacles: Obstacle[] = [];
    private obstacleSpawnTimer: number = 0;
    private readonly obstacleSpawnInterval: number = 2.5;

    // Логика бустов
    private boosts: Boost[] = [];
    private boostSpawnTimer: number = 0;
    private readonly boostSpawnInterval: number = 4.0; // Частота спавна 4 секунды
    
    // Таймеры активных бустов (оставшееся время в секундах)
    private activeBoosts: Record<BoostType, number> = {
        [BoostType.MAGNET]: 0,
        [BoostType.INVINCIBILITY]: 0,
        [BoostType.SPEED]: 0
    };
    private readonly boostDuration: number = 5.0;

    private isPaused: boolean = false;
    private isDead: boolean = false;
    private isGameOver: boolean = false;
    private flashAlpha: number = 0;

    private btnUp: UiButton | null = null;
    private btnDown: UiButton | null = null;
    private btnPause: UiButton | null = null;

    private btnResume: UiButton | null = null;
    private btnSettings: UiButton | null = null;

    private btnBack: UiButton | null = null;
    private btnSound: UiButton | null = null;
    private isSoundOn: boolean = true;
    private isInSettingsSubmenu: boolean = false;

    // Аудиосистема
    private bgMusic: HTMLAudioElement | null = null;
    private readonly musicTracks: string[] = [
        "/assets/sounds/1.mp3",
        "/assets/sounds/2.mp3",
        "/assets/sounds/3.mp3",
        "/assets/sounds/4.mp3"
    ];

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
        this.bg = new StaticTexture(this.bgTextures[this.currentBgIndex] !, 0, 0);
        this.bg.show();
        Global.scene.add(this.bg);

        const sw = window.innerWidth;

        this.clouds = new StaticTexture(this.getRandomTexture(this.cloudTextures), sw + 200, 50);
        this.clouds.show();
        Global.scene.add(this.clouds);
        
        this.rocks = new StaticTexture(this.getRandomTexture(this.rockTextures), sw + 600, 400);
        this.rocks.show();
        Global.scene.add(this.rocks);

        this.ground = new ScrollingGround("/assets/ground.png", this.groundHeight, this.gameSpeed);
        this.ground.show();
        Global.scene.add(this.ground);

        this.hero = new KinematicBody("/assets/hero.png", 30, 200);
        this.hero.scale = 0.8;
        this.hero.show();
        Global.scene.add(this.hero);

        this.coinBg = new StaticTexture("/assets/coin-bg.png", sw - 210, 5, 0.25);
        this.coinBg.isUi = true;
        this.coinBg.hide();
        Global.scene.add(this.coinBg);

        // Инициализируем логотип меню над кнопками
        this.menuLogo = new StaticTexture("/assets/logo.png", 0, 0);
        this.menuLogo.isUi = true;
        this.menuLogo.scale = 0;
        Global.scene.add(this.menuLogo);

        this.createMobileButtons();
        this.createMenuButtons();

        this.hookScoreRenderer();

        window.addEventListener("mousedown", this.onGameOverClickRef);
        window.addEventListener("touchstart", this.onGameOverClickRef);
        window.addEventListener('resize', this.handleResize.bind(this));

        this.playRandomMusic();

        this.togglePause(true);
    }

    private playRandomMusic(): void {
        const randomTrack = this.getRandomTexture(this.musicTracks);
        this.bgMusic = new Audio(randomTrack);
        this.bgMusic.loop = true;
        
        if (this.isSoundOn) {
            this.bgMusic.play().catch(err => {
                console.log("Автоплей музыки заблокирован браузером. Ожидание действий пользователя.", err);
            });
        }
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

        this.btnSettings = new UiButton("/assets/btn-settings.png", 0, 0, 0, 0, null, () => {
            this.openSettingsSubmenu(true);
        });

        this.btnBack = new UiButton("/assets/btn-back.png", 0, 0, 0, 0, null, () => {
            this.openSettingsSubmenu(false);
        });

        this.btnSound = new UiButton("/assets/btn-mute.png", 0, 0, 0, 0, null, () => {
            this.toggleSound();
        });

        this.btnResume.scale = 0;
        this.btnSettings.scale = 0;
        this.btnBack.scale = 0;
        this.btnSound.scale = 0;

        Global.scene.add(this.btnResume);
        Global.scene.add(this.btnSettings);
        Global.scene.add(this.btnBack);
        Global.scene.add(this.btnSound);

        this.updateMenuButtonsPositions();
    }

    private openSettingsSubmenu(open: boolean): void {
        this.isInSettingsSubmenu = open;

        if (open) {
            this.btnBack?.show();
            this.btnSound?.show();
        } else {
            this.btnResume?.show();
            this.btnSettings?.show();
        }
    }

    private toggleSound(): void {
        this.isSoundOn = !this.isSoundOn;
        if (this.btnSound) {
            this.btnSound.texture.src = this.isSoundOn ? "/assets/btn-mute.png" : "/assets/btn-unmute.png";
        }

        if (this.bgMusic) {
            if (this.isSoundOn) {
                this.bgMusic.play().catch(() => {});
            } else {
                this.bgMusic.pause();
            }
        }
    }

    private togglePause(pause: boolean): void {
        if (this.isDead || this.isGameOver) return;

        this.isPaused = pause;
        this.menuTargetScale = pause ? 0.7 : 0;

        for (const coin of this.coins) coin.paused = pause;
        for (const obs of this.obstacles) obs.paused = pause;
        for (const boost of this.boosts) boost.paused = pause;

        if (pause) {
            this.openSettingsSubmenu(false);
            this.btnResume?.show();
            this.btnSettings?.show();
            this.btnUp?.hide();
            this.btnDown?.hide();
            this.btnPause?.hide();
            this.menuLogo?.show();

            if (this.ground) this.ground.paused = true;
            if (this.hero) this.hero.speedY = 0; // Сбрасываем скорость при входе в паузу
        } else {
            if (this.isSoundOn && this.bgMusic && this.bgMusic.paused) {
                this.bgMusic.play().catch(() => {});
            }

            this.isInSettingsSubmenu = false;
            this.btnResume?.hide();
            this.btnSettings?.hide();
            this.btnBack?.hide();
            this.btnSound?.hide();
            this.menuLogo?.hide();

            this.btnUp?.show();
            this.btnDown?.show();
            this.btnPause?.show();

            if (this.ground) this.ground.paused = false;
        }
    }

    private updateMenuButtonsPositions(): void {
        const sw = window.innerWidth;
        const sh = window.innerHeight;

        // Центрируем и позиционируем кнопки меню
        if (this.btnResume && this.btnSettings) {
            this.btnResume.x = (sw - this.btnResume.scaleWidth) / 2;
            this.btnResume.y = (sh / 2) - this.btnResume.scaleHeight - 10;

            this.btnSettings.x = (sw - this.btnSettings.scaleWidth) / 2;
            this.btnSettings.y = (sh / 2) + 10;
        }

        if (this.btnSound && this.btnBack) {
            this.btnSound.x = (sw - this.btnSound.scaleWidth) / 2;
            this.btnSound.y = (sh / 2) - this.btnSound.scaleHeight - 10;

            this.btnBack.x = (sw - this.btnBack.scaleWidth) / 2;
            this.btnBack.y = (sh / 2) + 10;
        }

        // Позиционируем логотип над блоком верхних кнопок
        if (this.menuLogo && this.menuLogo.isLoaded) {
            const logoW = this.menuLogo.scaleWidth || 300;
            const logoH = this.menuLogo.scaleHeight || 100;
            this.menuLogo.x = (sw - logoW) / 2;
            // Размещаем над самой верхней кнопкой (которая находится на sh/2 - высота_кнопки - 10)
            const topBtnY = (sh / 2) - 80 - 10; 
            this.menuLogo.y = topBtnY - logoH - 30; // 30px отступ от кнопки вверх
        }
    }

    private getRandomTexture(list: string[]): string {
        const randomIndex = Math.floor(Math.random() * list.length);
        return list[randomIndex] !;
    }

    private changeEnvironmentOnDeath(): void {
        this.currentBgIndex = (this.currentBgIndex + 1) % this.bgTextures.length;
        if (this.bg) {
            this.bg.texture.src = this.bgTextures[this.currentBgIndex] !;
        }

        if (this.rocks) {
            this.rocks.texture.src = this.getRandomTexture(this.rockTextures);
        }

        if (this.clouds) {
            this.clouds.texture.src = this.getRandomTexture(this.cloudTextures);
        }
    }

    private lastCoinSpawnY: number = 200;

    private spawnCoinGroup(): void {
        const sw = window.innerWidth;
        const sh = window.innerHeight;

        const minSpawnY = 50;
        const maxSpawnY = sh - this.groundHeight - 80;
        const spawnY = minSpawnY + Math.random() * (maxSpawnY - minSpawnY);
        this.lastCoinSpawnY = spawnY;

        const count = 3;
        const distanceBetween = 60;

        for (let i = 0; i < count; i++) {
            const coinX = sw + (i * distanceBetween);
            const coin = new Coin("/assets/coin.png", coinX, spawnY, this.getCurrentGameSpeed());
            coin.show();

            this.coins.push(coin);
            Global.scene.add(coin);
        }
    }

    private spawnBoost(): void {
        const sw = window.innerWidth;
        const sh = window.innerHeight;
        const minSpawnY = 50;
        const maxSpawnY = sh - this.groundHeight - 80;
        
        let spawnY = minSpawnY + Math.random() * (maxSpawnY - minSpawnY);
        
        // Алгоритм анти-наложения по оси Y относительно последней группы монет
        if (Math.abs(spawnY - this.lastCoinSpawnY) < 100) {
            if (spawnY + 120 <= maxSpawnY) {
                spawnY += 120;
            } else if (spawnY - 120 >= minSpawnY) {
                spawnY -= 120;
            }
        }

        // Спавним буст с горизонтальным смещением вперед, чтобы не пересекаться с монетами
        const spawnX = sw + 250;

        // Случайный выбор типа буста
        const types = [BoostType.MAGNET, BoostType.INVINCIBILITY, BoostType.SPEED];
        const randomType = types[Math.floor(Math.random() * types.length)]!;
        
        let textureSrc = "/assets/boost.png";
        if (randomType === BoostType.INVINCIBILITY) textureSrc = "/assets/boost-2.png";
        if (randomType === BoostType.SPEED) textureSrc = "/assets/boost-3.png";

        const boost = new Boost(textureSrc, randomType, spawnX, spawnY, this.getCurrentGameSpeed());
        this.boosts.push(boost);
        Global.scene.add(boost.texture);
    }

    private spawnObstacle(): void {
        const sw = window.innerWidth;
        const sh = window.innerHeight;
        const minSpawnY = 50;
        const maxSpawnY = sh - this.groundHeight - 90;
        const spawnY = minSpawnY + Math.random() * (maxSpawnY - minSpawnY);
        const randomObstacleTexture = this.getRandomTexture(this.obstacleTextures);
        const obstacle = new Obstacle(randomObstacleTexture, sw + 100, spawnY, this.getCurrentGameSpeed());
        obstacle.show();
        this.obstacles.push(obstacle);
        Global.scene.add(obstacle);
    }

    private getCurrentGameSpeed(): number {
        // Если активен буст ускорения, увеличиваем скорость игры в 1.75 раза
        if (this.activeBoosts[BoostType.SPEED] > 0) {
            return this.gameSpeed * 1.75;
        }
        return this.gameSpeed;
    }

    private getCurrentHeroSpeed(): number {
        // Если активен буст ускорения, увеличиваем вертикальную скорость героя в 1.5 раза
        if (this.activeBoosts[BoostType.SPEED] > 0) {
            return this.heroSpeed * 1.5;
        }
        return this.heroSpeed;
    }

    private checkCollisions(): void {
        if (!this.hero || this.isDead || this.isGameOver) return;
        const heroBounds = {
            x: this.hero.x,
            y: this.hero.y,
            width: this.hero.scaleWidth || 60,
            height: this.hero.height
        };

        // Обработка столкновений с монетами
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

        // Обработка столкновений с бустами
        for (let i = this.boosts.length - 1; i >= 0; i--) {
            const boost = this.boosts[i];
            if (!boost) continue;
            const boostBounds = boost.getBounds();
            const isCollidingWithBoost =
                heroBounds.x < boostBounds.x + boostBounds.width &&
                heroBounds.x + heroBounds.width > boostBounds.x &&
                heroBounds.y < boostBounds.y + boostBounds.height &&
                heroBounds.y + heroBounds.height > boostBounds.y;

            if (isCollidingWithBoost) {
                this.activeBoosts[boost.type] = this.boostDuration;
                Global.scene.remove(boost.texture);
                this.boosts.splice(i, 1);
                continue;
            }

            if (boost.x + boostBounds.width < 0) {
                Global.scene.remove(boost.texture);
                this.boosts.splice(i, 1);
            }
        }

        // Обработка столкновений с препятствиями
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
                // Если активна неуязвимость, ломаем препятствие и летим дальше
                if (this.activeBoosts[BoostType.INVINCIBILITY] > 0) {
                    Global.scene.remove(obs);
                    this.obstacles.splice(i, 1);
                } else {
                    this.triggerDeath();
                    break;
                }
                continue;
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
        this.changeEnvironmentOnDeath();
        if (this.ground) this.ground.paused = true;
        for (const coin of this.coins) coin.paused = true;
        for (const obs of this.obstacles) obs.paused = true;
        for (const boost of this.boosts) boost.paused = true;

        // Сбрасываем все таймеры бустов при смерти
        this.activeBoosts[BoostType.MAGNET] = 0;
        this.activeBoosts[BoostType.INVINCIBILITY] = 0;
        this.activeBoosts[BoostType.SPEED] = 0;

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
        for (const boost of this.boosts) Global.scene.remove(boost.texture);
        this.boosts = [];

        this.activeBoosts[BoostType.MAGNET] = 0;
        this.activeBoosts[BoostType.INVINCIBILITY] = 0;
        this.activeBoosts[BoostType.SPEED] = 0;

        this.score = 0;
        this.coinSpawnTimer = 0;
        this.obstacleSpawnTimer = 0;
        this.boostSpawnTimer = 0;
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
                
                // Выводим очки справа сверху
                ctx.textAlign = "right";
                const scoreText = `Монеты: ${this.score}`;
                ctx.strokeText(scoreText, ctx.canvas.width - 35, 48);
                ctx.fillText(scoreText, ctx.canvas.width - 35, 48);

                // Отрисовка таймеров активных бустов слева сверху
                ctx.textAlign = "left";
                ctx.font = "bold 18px sans-serif";
                let offsetY = 40;

                if (this.activeBoosts[BoostType.MAGNET] > 0) {
                    const text = `Магнит: ${this.activeBoosts[BoostType.MAGNET].toFixed(1)}с`;
                    ctx.fillStyle = "#33ccff";
                    ctx.strokeText(text, 20, offsetY);
                    ctx.fillText(text, 20, offsetY);
                    offsetY += 25;
                }
                if (this.activeBoosts[BoostType.INVINCIBILITY] > 0) {
                    const text = `Щит: ${this.activeBoosts[BoostType.INVINCIBILITY].toFixed(1)}с`;
                    ctx.fillStyle = "#ffcc00";
                    ctx.strokeText(text, 20, offsetY);
                    ctx.fillText(text, 20, offsetY);
                    offsetY += 25;
                }
                if (this.activeBoosts[BoostType.SPEED] > 0) {
                    const text = `Ускорение: ${this.activeBoosts[BoostType.SPEED].toFixed(1)}с`;
                    ctx.fillStyle = "#ff3399";
                    ctx.strokeText(text, 20, offsetY);
                    ctx.fillText(text, 20, offsetY);
                }

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

        // Анимация плавного масштабирования элементов меню и логотипа
        if (this.menuCurrentScale !== this.menuTargetScale) {
            this.menuCurrentScale += (this.menuTargetScale - this.menuCurrentScale) * this.menuAnimSpeed * delta;
            if (Math.abs(this.menuCurrentScale - this.menuTargetScale) < 0.01) {
                this.menuCurrentScale = this.menuTargetScale;
                if (this.menuTargetScale === 0) {
                    this.btnResume?.hide();
                    this.btnSettings?.hide();
                    this.btnBack?.hide();
                    this.btnSound?.hide();
                    this.menuLogo?.hide();
                }
            }
        }

        if (this.btnResume && this.btnSettings && this.btnBack && this.btnSound && this.menuLogo) {
            const currentScaleValue = this.isInSettingsSubmenu ? 0 : this.menuCurrentScale;
            this.btnResume.scale = currentScaleValue;
            this.btnSettings.scale = currentScaleValue;
            this.menuLogo.scale = currentScaleValue; // Масштабируем логотип вместе с кнопками

            this.btnSound.scale = this.isInSettingsSubmenu ? this.menuCurrentScale : 0;
            this.btnBack.scale = this.isInSettingsSubmenu ? this.menuCurrentScale : 0;
            
            if (this.isInSettingsSubmenu) {
                this.btnResume.hide();
                this.btnSettings.hide();
            } else if (this.menuTargetScale !== 0) {
                this.btnBack.hide();
                this.btnSound.hide();
            }
            this.updateMenuButtonsPositions();
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

        // КРИТИЧЕСКИЙ ФИКС: Если игра на паузе, полностью замораживаем ввод и выходим
        if (this.isPaused) {
            if (this.hero) {
                this.hero.speedY = 0; // Намертво стопорим вертикальное перемещение героя
            }
            return;
        }

        // Обновляем таймеры активных бустов
        if (this.activeBoosts[BoostType.MAGNET] > 0) this.activeBoosts[BoostType.MAGNET] -= delta;
        if (this.activeBoosts[BoostType.INVINCIBILITY] > 0) this.activeBoosts[BoostType.INVINCIBILITY] -= delta;
        if (this.activeBoosts[BoostType.SPEED] > 0) this.activeBoosts[BoostType.SPEED] -= delta;

        // Позиционирование плашки с монетами
        if (this.coinBg && this.coinBg.isLoaded) {
            this.coinBg.show();
            const width = this.coinBg.scaleWidth || 200;
            this.coinBg.x = window.innerWidth - width;
            this.coinBg.y = 0;
        }

        // Обновление и притягивание монет (Магнит)
        if (this.hero) {
            const isMagnetActive = this.activeBoosts[BoostType.MAGNET] > 0;
            for (const coin of this.coins) {
                if (isMagnetActive) {
                    const dx = this.hero.x + (this.hero.scaleWidth / 2) - coin.x;
                    const dy = this.hero.y + (this.hero.height / 2) - coin.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    // Радиус действия магнита — 300 пикселей
                    if (distance < 300 && distance > 5) {
                        const pullForce = 450 * delta;
                        coin.x += (dx / distance) * pullForce;
                        coin.y += (dy / distance) * pullForce;
                    }
                }
            }
        }

        // Обновление физики бустов на экране
        for (const boost of this.boosts) {
            boost.update(delta);
        }

        this.coinSpawnTimer += delta;
        if (this.coinSpawnTimer >= this.coinSpawnInterval) {
            this.coinSpawnTimer = 0;
            this.spawnCoinGroup();
        }

        this.boostSpawnTimer += delta;
        if (this.boostSpawnTimer >= this.boostSpawnInterval) {
            this.boostSpawnTimer = 0;
            this.spawnBoost();
        }

        this.obstacleSpawnTimer += delta;
        if (this.obstacleSpawnTimer >= this.obstacleSpawnInterval) {
            this.obstacleSpawnTimer = 0;
            this.spawnObstacle();
        }

        this.checkCollisions();

        const sw = window.innerWidth;
        const currentSpeed = this.getCurrentGameSpeed();

        if (this.bg != null) {
            const bgSpeed = (currentSpeed / 8) * delta;
            this.bg.x -= bgSpeed;
            if (this.bg.x < -1000) this.bg.x = 0;
        }
        if (this.clouds != null) {
            const cloudsSpeed = (currentSpeed / 4) * delta;
            this.clouds.x -= cloudsSpeed;
            if (this.clouds.x + this.clouds.scaleWidth < 0) {
                const randomOffset = 150 + Math.random() * 500;
                this.clouds.x = sw + randomOffset;
                this.clouds.y = 30 + Math.random() * 80;
            }
        }
        if (this.rocks != null) {
            const rocksSpeed = (currentSpeed / 2) * delta;
            this.rocks.x -= rocksSpeed;
            if (this.rocks.x + this.rocks.scaleWidth < 0) {
                const randomOffset = 300 + Math.random() * 600;
                this.rocks.x = sw + randomOffset;
                this.rocks.texture.src = this.getRandomTexture(this.rockTextures);
            }
        }

        if (this.ground && 'speed' in this.ground) {
            (this.ground as any).speed = currentSpeed;
        }

        if (this.hero != null) {
            this.hero.speedY = 0;
            const currentHeroSpeed = this.getCurrentHeroSpeed();
            
            if (InputManager.isPressed(GameAction.UP)) {
                this.hero.speedY = -currentHeroSpeed;
            }
            if (InputManager.isPressed(GameAction.DOWN)) {
                this.hero.speedY = currentHeroSpeed;
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

    public handleResize(): void {
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
        
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic = null;
        }

        for (const coin of this.coins) Global.scene.remove(coin);
        this.coins = [];
        for (const obs of this.obstacles) Global.scene.remove(obs);
        this.obstacles = [];
        for (const boost of this.boosts) Global.scene.remove(boost.texture);
        this.boosts = [];

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
        if (this.btnBack) Global.scene.remove(this.btnBack);
        if (this.btnSound) Global.scene.remove(this.btnSound);
        if (this.coinBg) Global.scene.remove(this.coinBg);
        if (this.menuLogo) Global.scene.remove(this.menuLogo);

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
        this.btnBack = null;
        this.btnSound = null;
        this.coinBg = null;
        this.menuLogo = null;
    }
}
