let seed = Date.now() % 2147483647;

export function setSeed(s: number) {
    seed = s % 2147483647 || 1;
}

export function rand(): number {
    seed = (seed * 48271) % 2147483647;
    return (seed & 0x7fffffff) / 0x7fffffff;
}

export function choice<T>(arr: readonly T[]): T {
    return arr[(rand() * arr.length) | 0];
}
