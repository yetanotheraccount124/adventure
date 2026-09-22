import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach
} from 'vitest';
import {
    Core
} from './Core.js';
import type {
    TickListener
} from "./TickListener.js";

describe('Core tests', () => {
    let core: Core;
    let mockListener: TickListener;
    let callbacks: FrameRequestCallback[] = [];

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(1000);

        callbacks = [];

        vi.spyOn(performance, 'now').mockImplementation(() => vi.getMockedSystemTime()?.getTime() ?? 0);

        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
            callbacks.push(cb);
            return callbacks.length;
        });

        mockListener = {
            init: vi.fn(),
            dispose: vi.fn(),
            invoke: vi.fn(),
        };

        core = new Core();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should init all added listeners', () => {
        core.addListener(mockListener);
        core.init();
        expect(mockListener.init).toHaveBeenCalledTimes(1);
    });

    it('should dispose all added listeners', () => {
        core.addListener(mockListener);
        core.dispose();
        expect(mockListener.dispose).toHaveBeenCalledTimes(1);
    });

    it('should run, initialize listeners, and trigger the first tick via requestAnimationFrame', () => {
        core.addListener(mockListener);
        core.run();

        expect(mockListener.init).toHaveBeenCalledTimes(1);
        expect(window.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should invoke listeners with computed deltaTime during game loop', () => {
        core.addListener(mockListener);

        core.run();

        vi.setSystemTime(1016);

        const nextTick = callbacks.shift();
        expect(nextTick).toBeDefined();

        nextTick!(1016);

        expect(mockListener.invoke).toHaveBeenCalledWith(0.016);
    });

    it('should cap deltaTime to 0.1 seconds maximum', () => {
        core.addListener(mockListener);

        core.run();

        vi.setSystemTime(1500);

        const nextTick = callbacks.shift();
        expect(nextTick).toBeDefined();
        nextTick!(1500);

        expect(mockListener.invoke).toHaveBeenCalledWith(0.1);
    });

    it('should stop the loop and dispose listeners on the next tick after stop() is called', () => {
        core.addListener(mockListener);

        core.run();
        core.stop();

        vi.setSystemTime(1016);
        const nextTick = callbacks.shift();
        expect(nextTick).toBeDefined();
        nextTick!(1016);

        expect(mockListener.invoke).not.toHaveBeenCalled();
        expect(mockListener.dispose).toHaveBeenCalledTimes(1);
    });
});