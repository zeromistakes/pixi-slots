import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { ROWS, SYMBOL_GAP, SYMBOL_SIZE, TILE_INSET } from '../utils/constants';

const BASE_SCALE = (SYMBOL_SIZE - 2 * TILE_INSET) / SYMBOL_SIZE; // < 1

type LetteredSprite = Sprite & { letter?: string };

export class Reel {
    public view = new Container();

    private cells: LetteredSprite[] = [];
    private speed = 0;

    private readonly buffer = 4;
    private readonly viewportW: number;
    private readonly viewportH: number;

    private readonly x: number; // left edge of reel viewport
    private readonly y: number; // top edge of reel viewport

    private randomPool: Texture[];
    private texturesByLetter: Record<string, Texture>;
    private plannedEnd: string[] | null = null;

    constructor(opts: {
        x: number;
        y: number;
        textures: Texture[];                       // randomization while spinning
        texturesByLetter: Record<string, Texture>; // precise placement on stop
    }) {
        this.x = opts.x;
        this.y = opts.y;
        this.randomPool = opts.textures;
        this.texturesByLetter = opts.texturesByLetter;

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


        const step = SYMBOL_SIZE + SYMBOL_GAP;
        const total = ROWS + this.buffer * 2;
        const firstCenterY = this.y - this.buffer * step + SYMBOL_SIZE / 2;

        for (let i = 0; i < total; i++) {
            const spr = new Sprite() as LetteredSprite;
            spr.pivot.set(SYMBOL_SIZE / 2, SYMBOL_SIZE / 2);
            spr.scale.set(BASE_SCALE);
            spr.x = this.x + SYMBOL_SIZE / 2;
            spr.y = firstCenterY + i * step;
            this.view.addChild(spr);
            this.cells.push(spr);
            this.assignRandomLetter(spr);
        }
    }

    private assignRandomLetter(spr: LetteredSprite) {
        // pick a random letter from texturesByLetter keys
        const keys = Object.keys(this.texturesByLetter);
        const letter = keys[(Math.random() * keys.length) | 0];
        spr.texture = this.texturesByLetter[letter];
        spr.letter = letter;
        spr.scale.set(BASE_SCALE);
    }

    private setLetter(spr: LetteredSprite, letter: string) {
        spr.texture = this.texturesByLetter[letter];
        spr.letter = letter;
        spr.scale.set(BASE_SCALE);
    }

    public setSpeed(pxPerMs: number) { this.speed = pxPerMs; }


    public plan(columnLetters: string[]) {
        this.plannedEnd = columnLetters.slice(0, ROWS);
    }

    public stop() {
        this.speed = 0;
        this.snapToGrid();

        if (this.plannedEnd) {
            for (let r = 0; r < ROWS; r++) {
                const spr = this.cells[this.buffer + r];
                const letter = this.plannedEnd[r];
                this.setLetter(spr, letter);
            }
            this.plannedEnd = null;
        }
    }

    private snapToGrid() {
        const step = SYMBOL_SIZE + SYMBOL_GAP;
        const firstCenterY = this.y - this.buffer * step + SYMBOL_SIZE / 2;

        this.cells.sort((a, b) => a.y - b.y);
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].y = firstCenterY + i * step;
            this.cells[i].scale.set(BASE_SCALE);
        }
    }


    public update(deltaMS: number) {
        if (this.speed === 0) return;

        const dy = this.speed * deltaMS;
        for (const spr of this.cells) spr.y += dy;

        this.cells.sort((a, b) => a.y - b.y);

        const step = SYMBOL_SIZE + SYMBOL_GAP;
        const bottomEdge = this.y + this.viewportH;
        const offscreenCenterY = bottomEdge + SYMBOL_SIZE / 2;

        while (this.cells[this.cells.length - 1].y >= offscreenCenterY) {
            const last = this.cells.pop()!;
            const topY = this.cells[0].y;
            last.y = topY - step;
            this.assignRandomLetter(last);
            this.cells.unshift(last);
        }
    }


    public getVisibleSprite(row: number) {
        return this.cells[this.buffer + row];
    }
}

export { BASE_SCALE };
