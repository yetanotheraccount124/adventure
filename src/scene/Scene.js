export class Scene {
    entities;
    canvas = null;
    ctx = null;
    constructor() {
        this.entities = [];
    }
    add(entity) {
        this.entities.push(entity);
        if (this.canvas) {
            entity.init();
        }
    }
    remove(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities[index]?.dispose();
            this.entities.splice(index, 1);
            return true;
        }
        return false;
    }
    init() {
        const appContainer = document.getElementById('app');
        if (!appContainer) {
            console.error("no container with 'app' id");
            return;
        }
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error("failed to fetch canvas");
            return;
        }
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        appContainer.appendChild(this.canvas);
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i]?.init();
        }
    }
    invoke(delta) {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i]?.update(delta);
        }
        this.redraw();
    }
    redraw() {
        if (!this.canvas || !this.ctx)
            return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            if (entity && !entity.isUi) {
                entity.draw(this.ctx);
            }
        }
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            if (entity && entity.isUi) {
                entity.draw(this.ctx);
            }
        }
    }
    resizeCanvas() {
        if (!this.canvas)
            return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
    }
    dispose() {
        window.removeEventListener('resize', this.resizeCanvas.bind(this));
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i]?.dispose();
        }
        this.entities = [];
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        this.canvas = null;
        this.ctx = null;
    }
}
//# sourceMappingURL=Scene.js.map