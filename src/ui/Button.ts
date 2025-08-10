
import { Container, Graphics, Text } from 'pixi.js';

export class Button extends Container {
    private bg: Graphics;
    private label: Text;

    constructor(text: string, width = 180, height = 56) {
        super();

        this.bg = new Graphics()
            .roundRect(0, 0, width, height, 14)
            .fill(0x1f8ef1);
        this.addChild(this.bg);

        this.label = new Text({
            text,
            style: { fill: 0xffffff, fontSize: 20, fontWeight: '700' },
        });
        this.label.anchor.set(0.5);
        this.label.position.set(width / 2, height / 2);
        this.addChild(this.label);

        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.alpha = 1;
    }

    setEnabled(v: boolean) {
        this.eventMode = v ? 'static' : 'none';
        this.alpha = v ? 1 : 0.5;
    }
}
