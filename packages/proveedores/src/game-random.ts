export type NextUint32 = () => number;

export function randomUint32(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

/** Uniform selection by rejection sampling. */
export function uniformIndex(size: number, nextUint32: NextUint32): number {
  const limit = Math.floor(0x100000000 / size) * size;
  for (let attempt = 0; attempt < 128; attempt++) {
    const value = nextUint32();
    if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
      throw new Error("RNG inválido");
    }
    if (value < limit) return value % size;
  }
  throw new Error("No se pudo generar la ronda");
}
