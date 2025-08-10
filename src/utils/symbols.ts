
import { Application, Container, Graphics, Text, Texture } from 'pixi.js';
import type { SymbolLetter } from './constants';

type TextureMap = Record<SymbolLetter, Texture>;

export async function createSymbolTextures(
    app: Application,
    letters: readonly SymbolLetter[],
    size: number
): Promise<TextureMap> {
    const map = {} as TextureMap;

    for (const letter of letters) {
        const tile = new Graphics()
            .roundRect(0, 0, size, size, 16)
            .fill(0x1c2541)
            .stroke({ color: 0x3a506b, width: 3 });


        const text = new Text({
            text: letter,
            style: {
                fill: 0xffffff,
                fontSize: Math.round(size * 0.45),
                fontFamily: 'Inter, Arial, sans-serif',
                fontWeight: '700',
                align: 'center',
                dropShadow: true,
                dropShadowDistance: 2,
                dropShadowBlur: 2,
            },
        });
        text.anchor.set(0.5);
        text.position.set(size / 2, size / 2);


        const c = new Container();
        c.addChild(tile, text);

        const tex = app.renderer.generateTexture(c);
        map[letter] = tex;
    }

    return map;
}
