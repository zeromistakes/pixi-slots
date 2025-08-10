import { Container, Graphics, Text } from 'pixi.js';

export class Button extends Container {
    private bg: Graphics;
    private caption: Text; // renamed to avoid clashing with DisplayObject.label:string

    constructor(text: string, width = 180, height = 56) {
        super();

        this.bg = new Graphics()
            .roundRect(0, 0, width, height, 14)
            .fill(0x1f8ef1);
        this.addChild(this.bg);

        this.caption = new Text(text, {
            fill: 0xffffff,
            fontSize: 20,
            fontWeight: '700',
            fontFamily: 'Inter, Arial, sans-serif',
            align: 'center',
        });
        this.caption.anchor.set(0.5);
        this.caption.position.set(width / 2, height / 2);
        this.addChild(this.caption);

        this.eventMode = 'static';
        this.cursor = 'pointer';
    }

    setEnabled(v: boolean) {
        this.eventMode = v ? 'static' : 'none';
        this.alpha = v ? 1 : 0.5;
    }
}
