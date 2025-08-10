
import { Application, type Ticker } from 'pixi.js';
import { SYMBOLS, SYMBOL_SIZE, REEL_GAP, SYMBOL_GAP, REELS, ROWS } from './utils/constants';
import { createSymbolTextures } from './utils/symbols';
import { Reel } from './engine/Reel';
import { Button } from './ui/Button';

async function boot(): Promise<void> {
    const app = new Application();
    await app.init({ background: '#0a0f1d', resizeTo: window });
    document.body.style.margin = '0';
    document.body.appendChild(app.canvas);

    const textures = await createSymbolTextures(app, SYMBOLS, SYMBOL_SIZE);
    const texArray = SYMBOLS.map(s => textures[s]);

    // layout
    const boardW = REELS * SYMBOL_SIZE + (REELS - 1) * REEL_GAP;
    const boardH = ROWS * SYMBOL_SIZE + (ROWS - 1) * SYMBOL_GAP;
    const startX = (app.renderer.width - boardW) / 2;
    const startY = (app.renderer.height - boardH) / 2;


    const reels: Reel[] = [];
    for (let i = 0; i < REELS; i++) {
        const x = startX + i * (SYMBOL_SIZE + REEL_GAP);
        const reel = new Reel({ x, y: startY, textures: texArray });
        app.stage.addChild(reel.view);
        reels.push(reel);
    }


    const btn = new Button('SPIN');
    btn.position.set((app.renderer.width - 180) / 2, startY + boardH + 24);
    app.stage.addChild(btn);

    let busy = false;

    btn.on('pointertap', () => {
        if (busy) return;
        busy = true;
        btn.setEnabled(false);

        reels.forEach(r => r.setSpeed(1.4)); // px/ms


        const base = 1000; // ms until first stop
        const gap = 300;   // ms between stops
        reels.forEach((r, i) => {
            setTimeout(() => {
                r.stop();                 // snap to grid
                if (i === reels.length - 1) {
                    // finished
                    busy = false;
                    btn.setEnabled(true);
                    // next step: evaluate wins
                }
            }, base + i * gap);
        });
    });

    app.ticker.add((ticker: Ticker) => {
        reels.forEach(r => r.update(ticker.deltaMS, texArray));
    });


    window.addEventListener('resize', () => {
        const nx = (app.renderer.width - boardW) / 2;
        const ny = (app.renderer.height - boardH) / 2;
        reels.forEach((r, i) => {
            (r as any).view.children.forEach((child: any) => {
            });
        });
        btn.position.set((app.renderer.width - 180) / 2, ny + boardH + 24);
    });
}

boot();
