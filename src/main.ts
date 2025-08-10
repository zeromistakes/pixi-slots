
import { Application, type Ticker, Sprite } from 'pixi.js';
import {
    SYMBOLS,
    SYMBOL_SIZE,
    REEL_GAP,
    SYMBOL_GAP,
    REELS,
    ROWS,
    PULSE_EXTRA,
    LETTER_COLOR_NORMAL,
    LETTER_COLOR_WIN,
} from './utils/constants';
import { createSymbolTextures, type TextureMap } from './utils/symbols';
import { Reel, BASE_SCALE } from './engine/Reel';
import { Button } from './ui/Button';
import { generateOutcome } from './utils/outcome';
import { evaluate } from './engine/Paylines';


type Pulse = { spr: Sprite & { letter?: string }; t: number; dur: number };
const pulses: Pulse[] = [];


let normalTexMap: TextureMap;
let winTexMap: TextureMap;

function pulseSprite(spr: Sprite & { letter?: string }, dur = 900) {

    const letter = spr.letter as keyof TextureMap | undefined;
    if (letter && winTexMap?.[letter]) {
        spr.texture = winTexMap[letter];
    }
    spr.alpha = 1;
    pulses.push({ spr, t: 0, dur });
}

async function boot(): Promise<void> {
    const app = new Application();
    await app.init({ background: '#0a0f1d', resizeTo: window });
    document.body.style.margin = '0';
    document.body.appendChild(app.canvas);

    normalTexMap = await createSymbolTextures(app, SYMBOLS, SYMBOL_SIZE, {
        textColor: LETTER_COLOR_NORMAL,
    });
    winTexMap = await createSymbolTextures(app, SYMBOLS, SYMBOL_SIZE, {
        textColor: LETTER_COLOR_WIN,
    });

    const boardW = REELS * SYMBOL_SIZE + (REELS - 1) * REEL_GAP;
    const boardH = ROWS * SYMBOL_SIZE + (ROWS - 1) * SYMBOL_GAP;
    const startX = (app.renderer.width - boardW) / 2;
    const startY = (app.renderer.height - boardH) / 2;

    const reels: Reel[] = [];
    for (let i = 0; i < REELS; i++) {
        const x = startX + i * (SYMBOL_SIZE + REEL_GAP);
        const reel = new Reel({
            x,
            y: startY,
            texturesByLetter: normalTexMap,
        });
        app.stage.addChild(reel.view);
        reels.push(reel);
    }

    const btn = new Button('SPIN');
    btn.position.set((app.renderer.width - 180) / 2, startY + boardH + 24);
    app.stage.addChild(btn);

    let busy = false;

    (btn as any).on('pointertap', () => {
        if (busy) return;
        busy = true;
        btn.setEnabled(false);


        const outcome = generateOutcome();

        reels.forEach((r) => r.setSpeed(1.3));

        const base = 1000;
        const gap = 300;

        reels.forEach((r, i) => {
            r.plan(outcome[i]);

            setTimeout(() => {
                r.stop();


                if (i === reels.length - 1) {
                    busy = false;
                    btn.setEnabled(true);

                    const result = evaluate(outcome);
                    if (result.wins.length) {
                        result.wins.forEach((w) => {
                            w.positions.forEach((pos) => {
                                const spr = reels[pos.c].getVisibleSprite(pos.r) as Sprite & {
                                    letter?: string;
                                };
                                pulseSprite(spr, 900);
                            });
                        });
                    }
                }
            }, base + i * gap);
        });
    });


    app.ticker.add((ticker: Ticker) => {
        reels.forEach((r) => r.update(ticker.deltaMS));

        for (let i = 0; i < pulses.length; i++) {
            const p = pulses[i];
            p.t += ticker.deltaMS;
            const k = Math.min(1, p.t / p.dur); // 0..1
            const s = BASE_SCALE * (1 + Math.sin(k * Math.PI) * PULSE_EXTRA);
            p.spr.scale.set(s);
            p.spr.alpha = 0.95 + Math.sin(k * Math.PI) * 0.05;

            if (p.t >= p.dur) {

                const letter = p.spr.letter as keyof TextureMap | undefined;
                if (letter && normalTexMap?.[letter]) {
                    p.spr.texture = normalTexMap[letter];
                }
                p.spr.scale.set(BASE_SCALE);
                p.spr.alpha = 1;
                pulses.splice(i, 1);
                i--;
            }
        }
    });
}

boot();
