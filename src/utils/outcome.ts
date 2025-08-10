import { REELS, ROWS, SYMBOLS } from './constants';
import { choice, rand } from './rng';

export function generateOutcome(forceWin = false): string[][] {
    const grid: string[][] = Array.from({ length: REELS }, () =>
        Array.from({ length: ROWS }, () => choice(SYMBOLS))
    );
    if (forceWin || rand() < 0.25) {
        const row = 1; // middle row to keep it obvious
        const sym = choice(SYMBOLS);
        for (let c = 0; c < REELS; c++) grid[c][row] = sym;
    }

    return grid;
}
