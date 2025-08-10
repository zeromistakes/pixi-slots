
import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { ROWS, SYMBOL_GAP, SYMBOL_SIZE } from '../utils/constants';

export class Reel {
    public view = new Container();

    private cells: Sprite[] = [];
    private speed = 0;

    private readonly buffer = 4;
    private readonly viewportW: number;
    private readonly viewportH: number;

    private readonly x: number;
    private readonly y: number;

    constructor(opts: {
        x: number;
        y: number;
        textures: Texture[];
        initial?: Texture[];
    }) {
        this.x = opts.x;
        this.y = opts.y;

        this.viewportW = SYMBOL_SIZE;
        this.viewportH = ROWS * SYMBOL_SIZE + (ROWS - 1) * SYMBOL_GAP;


        const mask = new Graphics()
            .roundRect(this.x, this.y, this.viewportW, this.viewportH, 12)
            .fill(0xffffff);
        this.view.mask = mask as any;

        const bg = new Graphics()
            .roundRect(this.x, this.y, this.viewportW, this.viewportH, 12)
            .fill(0x0f1629)
            .stroke({ color: 0x1b2a4a, width: 2 });

        this.view.addChild(bg, mask);

        const total = ROWS + this.buffer * 2;
        const startY = this.y - this.buffer * (SYMBOL_SIZE + SYMBOL_GAP);

        for (let i = 0; i < total; i++) {
            const tex =
                opts.initial?.[i % ROWS] ??
                opts.textures[Math.floor(Math.random() * opts.textures.length)];
            const spr = new Sprite(tex);
            spr.x = this.x;
            spr.y = startY + i * (SYMBOL_SIZE + SYMBOL_GAP);
            this.view.addChild(spr);
            this.cells.push(spr);
        }
    }

    public setSpeed(pxPerMs: number) {
        this.speed = pxPerMs;
    }

    public stop() {
        this.speed = 0;
        this.snapToGrid();
    }

    private snapToGrid() {
        this.cells.sort((a, b) => a.y - b.y);
        const startY = this.y - this.buffer * (SYMBOL_SIZE + SYMBOL_GAP);
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].y = startY + i * (SYMBOL_SIZE + SYMBOL_GAP);
        }
    }

    public update(deltaMS: number, textures: Texture[]) {
        if (this.speed === 0) return;

        const dy = this.speed * deltaMS;
        for (const spr of this.cells) spr.y += dy;

        this.cells.sort((a, b) => a.y - b.y);

        const bottomEdge = this.y + this.viewportH;
        const step = SYMBOL_SIZE + SYMBOL_GAP;

        while (this.cells[this.cells.length - 1].y >= bottomEdge) {
            const last = this.cells.pop()!;
            const topY = this.cells[0].y;
            last.y = topY - step;
            last.texture = textures[Math.floor(Math.random() * textures.length)];
            this.cells.unshift(last);
        }
    }
}
