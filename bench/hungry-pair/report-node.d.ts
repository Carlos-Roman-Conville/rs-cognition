// Minimal host-only declarations, matching test/node-shim.d.ts; no runtime dependency.
declare module "node:fs" {
  export function writeFileSync(path: string | URL, text: string): void;
}
declare module "node:worker_threads" {
  export const isMainThread: boolean;
  export const workerData: { seeds: number[]; epochs: number };
  export const parentPort: { postMessage(value: unknown): void } | null;
  export class Worker {
    constructor(path: URL, options: { workerData: unknown; execArgv: string[] });
    on(event: "message", listener: (value: unknown) => void): this;
    on(event: "error", listener: (error: Error) => void): this;
    on(event: "exit", listener: (code: number) => void): this;
    terminate(): Promise<number>;
  }
}

declare module "node:crypto" {
  export function createHash(algorithm: string): {
    update(value: string): ReturnType<typeof createHash>;
    digest(encoding: "hex"): string;
  };
}
declare module "node:child_process" {
  export function execFileSync(file: string, args: string[], options: { encoding: "utf8" }): string;
}
