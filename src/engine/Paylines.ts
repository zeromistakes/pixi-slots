import { PAYOUT } from '../utils/constants';

export type Cell = { c: number; r: number }; // column, row
export type Line = [Cell, Cell, Cell];

export const PAYLINES: Line[] = [
    [{ c: 0, r: 0 }, { c: 1, r: 0 }, { c: 2, r: 0 }],
    [{ c: 0, r: 1 }, { c: 1, r: 1 }, { c: 2, r: 1 }],
    [{ c: 0, r: 2 }, { c: 1, r: 2 }, { c: 2, r: 2 }],
    [{ c: 0, r: 0 }, { c: 1, r: 1 }, { c: 2, r: 2 }],
    [{ c: 0, r: 2 }, { c: 1, r: 1 }, { c: 2, r: 0 }],
];

export type EvalWin = {
    lineIndex: number;
    symbol: string;
    amount: number;
    positions: Line;
};

export type EvalResult = {
    total: number;
    wins: EvalWin[];
};

export function evaluate(outcome: string[][]): EvalResult {
    const wins: EvalWin[] = [];

    PAYLINES.forEach((line, idx) => {
        const [a, b, c] = line;
        const s1 = outcome[a.c][a.r];
        const s2 = outcome[b.c][b.r];
        const s3 = outcome[c.c][c.r];

        if (s1 === s2 && s2 === s3) {
            wins.push({
                lineIndex: idx,
                symbol: s1,
                amount: PAYOUT[s1 as keyof typeof PAYOUT],
                positions: line,
            });
        }
    });

    return {
        total: wins.reduce((sum, w) => sum + w.amount, 0),
        wins,
    };
}
