
export const REELS = 3;
export const ROWS = 3;

export const SYMBOL_SIZE = 140;
export const SYMBOL_GAP = 10;       // vertical spacing
export const REEL_GAP = 26;         // horizontal

export const SYMBOLS = ['A', 'B', 'C', 'D', 'E'] as const;
export type SymbolLetter = typeof SYMBOLS[number];

export const PAYOUT: Record<SymbolLetter, number> = {
    A: 50, B: 40, C: 25, D: 15, E: 10,
};
