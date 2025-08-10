import { Application, Container, Graphics, Text, Texture } from 'pixi.js';
import { TILE_BG_COLOR, TILE_BORDER_COLOR } from './constants';
import type { SymbolLetter } from './constants';

export type TextureMap = Record<SymbolLetter, Texture>;

export async function createSymbolTextures(
    app: Application,
    letters: readonly SymbolLetter[],
    size: number,
    opts?: {
        textColor?: number;
        tileColor?: number;
        borderColor?: number;
    }
): Promise<TextureMap> {
    const textColor = opts?.textColor ?? 0xffffff;
    const tileColor = opts?.tileColor ?? TILE_BG_COLOR;
    const borderColor = opts?.borderColor ?? TILE_BORDER_COLOR;

    const map = {} as TextureMap;

    for (const letter of letters) {
        const tile = new Graphics()
            .roundRect(0, 0, size, size, 16)
            .fill(tileColor)
            .stroke({ color: borderColor, width: 3 });

        const text = new Text(letter, {
            fill: textColor,
            fontSize: Math.round(size * 0.45),
            fontFamily: 'Inter, Arial, sans-serif',
            fontWeight: '700',
            align: 'center',
        });
        text.anchor.set(0.5);
        text.position.set(size / 2, size / 2);

        const c = new Container();
        c.addChild(tile, text);

        map[letter as SymbolLetter] = app.renderer.generateTexture(c);
    }

    return map;
}
