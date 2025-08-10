import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { ROWS, SYMBOL_GAP, SYMBOL_SIZE, TILE_INSET } from '../utils/constants';

const BASE_SCALE = (SYMBOL_SIZE - 2 * TILE_INSET) / SYMBOL_SIZE; // fit inside cell

export class Reel {
    public view = new Container();

    private cells: Sprite[] = [];
    private speed = 0;

    private buffer = 4;
    private viewportW: number;
    private viewportH: number;

    private x: number; // left edge of reel viewport
    private y: number; // top edge of reel viewport

    private texturesByLetter: Record<string, Texture>;
    private plannedEnd: string[] | null = null;

    constructor(opts: {
        x: number;
        y: number;
        texturesByLetter: Record<string, Texture>;
    }) {
        this.x = opts.x;
        this.y = opts.y;
        this.texturesByLetter = opts.texturesByLetter;

        this.viewportW = SYMBOL_SIZE;
        this.viewportH = ROWS * SYMBOL_SIZE + (ROWS - 1) * SYMBOL_GAP;

        // Mask for the reel viewport
        const mask = new Graphics()
            .roundRect(this.x, this.y, this.viewportW, this.viewportH, 12)
            .fill(0xffffff);
        this.view.mask = mask as any;

        // Background panel
        const bg = new Graphics()
            .roundRect(this.x, this.y, this.viewportW, this.viewportH, 12)
            .fill(0x0f1629)
            .stroke({ color: 0x1b2a4a, width: 2 });

        this.view.addChild(bg, mask);

        // Build cells (centered)
        const step = SYMBOL_SIZE + SYMBOL_GAP;
        const total = ROWS + this.buffer * 2;
        const firstCenterY = this.y - this.buffer * step + SYMBOL_SIZE / 2;

        const keys = Object.keys(this.texturesByLetter);

        for (let i = 0; i < total; i++) {
            const spr = new Sprite();
            spr.pivot.set(SYMBOL_SIZE / 2, SYMBOL_SIZE / 2);
            spr.scale.set(BASE_SCALE);
            spr.x = this.x + SYMBOL_SIZE / 2;
            spr.y = firstCenterY + i * step;

            // random starting letter
            const letter = keys[(Math.random() * keys.length) | 0];
            spr.texture = this.texturesByLetter[letter];
            (spr as any).letter = letter;

            this.view.addChild(spr);
            this.cells.push(spr);
        }
    }

    public setSpeed(pxPerMs: number) {
        this.speed = pxPerMs;
    }

    /** Plan the exact letters for visible 3 rows (top→bottom) after stop */
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
                spr.texture = this.texturesByLetter[letter];
                (spr as any).letter = letter;
                spr.scale.set(BASE_SCALE);
            }
            this.plannedEnd = null;
        }
    }

    /** Align all cells to perfect grid centers, reset any pulse scale */
    private snapToGrid() {
        const step = SYMBOL_SIZE + SYMBOL_GAP;
        const firstCenterY = this.y - this.buffer * step + SYMBOL_SIZE / 2;

        this.cells.sort((a, b) => a.y - b.y);
        for (let i = 0; i < this.cells.length; i++) {
            const spr = this.cells[i];
            spr.y = firstCenterY + i * step;
            spr.scale.set(BASE_SCALE);
        }
    }

    /** Per-frame update; smooth recycle with center-based math */
    public update(deltaMS: number) {
        if (this.speed === 0) return;

        const dy = this.speed * deltaMS;
        for (const spr of this.cells) spr.y += dy;

        this.cells.sort((a, b) => a.y - b.y);

        const step = SYMBOL_SIZE + SYMBOL_GAP;
        const bottomEdge = this.y + this.viewportH;
        const offscreenCenterY = bottomEdge + SYMBOL_SIZE / 2;

        // recycle bottom-most → above top-most
        while (this.cells[this.cells.length - 1].y >= offscreenCenterY) {
            const last = this.cells.pop()!;
            const topY = this.cells[0].y;
            last.y = topY - step;

            // assign a new random letter
            const keys = Object.keys(this.texturesByLetter);
            const letter = keys[(Math.random() * keys.length) | 0];
            last.texture = this.texturesByLetter[letter];
            (last as any).letter = letter;

            last.scale.set(BASE_SCALE);
            this.cells.unshift(last);
        }
    }

    /** Get sprite for visible row (0=top,1=mid,2=bot) */
    public getVisibleSprite(row: number) {
        return this.cells[this.buffer + row];
    }
}

export { BASE_SCALE };
