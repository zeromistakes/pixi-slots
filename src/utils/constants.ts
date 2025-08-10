export const REELS = 3;
export const ROWS = 3;
export const SYMBOL_SIZE = 140;
export const SYMBOL_GAP = 10;
export const REEL_GAP = 26;
export const TILE_INSET = 10;
export const PULSE_EXTRA = 0.08;


export const TILE_BG_COLOR = 0x1c2541;
export const TILE_BORDER_COLOR = 0x3a506b;
export const LETTER_COLOR_NORMAL = 0xffffff;
export const LETTER_COLOR_WIN = 0xff2d55;

export const SYMBOLS = ['A', 'B', 'C', 'D', 'E'] as const;
export type SymbolLetter = typeof SYMBOLS[number];

export const PAYOUT: Record<SymbolLetter, number> = {
    A: 50, B: 40, C: 25, D: 15, E: 10,
};
