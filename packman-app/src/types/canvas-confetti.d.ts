declare module "canvas-confetti" {
  interface Options {
    particleCount?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    disableForReducedMotion?: boolean;
  }

  type Confetti = (options?: Options) => Promise<null> | null;

  const confetti: Confetti;
  export default confetti;
}
