import { Application, Graphics, type Ticker } from 'pixi.js';

async function boot(): Promise<void> {
    const app = new Application();
    await app.init({ background: '#0a0f1d', resizeTo: window });
    document.body.style.margin = '0';
    document.body.appendChild(app.canvas);

    // Create a circle
    const circle = new Graphics()
        .circle(0, 0, 50)
        .fill(0xffcc00);

    circle.x = app.renderer.width / 2;
    circle.y = app.renderer.height / 2;
    app.stage.addChild(circle);

    // Frame counter
    let t = 0;

    app.ticker.add((ticker: Ticker) => {
        t += ticker.deltaTime;
        circle.x = app.renderer.width / 2 + Math.sin(t / 20) * 100;
    });
}

boot();
