export class TextureManager {
    static cache = new Map();
    static getOrCreate(src, onLoaded) {
        if (this.cache.has(src)) {
            const cachedImage = this.cache.get(src);
            if (cachedImage.complete && onLoaded) {
                onLoaded();
            }
            return cachedImage;
        }
        const img = new Image();
        img.src = src;
        img.onload = () => {
            console.log(`[TextureManager] texture loaded: ${src}`);
            if (onLoaded)
                onLoaded();
        };
        img.onerror = () => {
            console.error(`[TextureManager] texture load error: ${src}`);
        };
        this.cache.set(src, img);
        return img;
    }
    static clear() {
        this.cache.clear();
    }
}
//# sourceMappingURL=TextureManager.js.map