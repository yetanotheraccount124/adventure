export class TextureManager {
    private static cache: Map<string, HTMLImageElement> = new Map();

    public static getOrCreate(src: string, onLoaded?: () => void): HTMLImageElement {
        if (this.cache.has(src)) {
            const cachedImage = this.cache.get(src)!;
            if (cachedImage.complete && onLoaded) {
                onLoaded();
            }
            return cachedImage;
        }

        const img = new Image();
        img.src = src;
        img.onload = () => {
            console.log(`[TextureManager] texture loaded: ${src}`);
            if (onLoaded) onLoaded();
        };
        img.onerror = () => {
            console.error(`[TextureManager] texture load error: ${src}`);
        };

        this.cache.set(src, img);
        return img;
    }

    public static clear(): void {
        this.cache.clear();
    }
}
