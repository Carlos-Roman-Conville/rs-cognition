// Minimal Node typings for the fingerprint script, matching test/node-shim.d.ts; no runtime dependency.
declare module "node:fs" {
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: { recursive: boolean }): void;
  export function mkdtempSync(prefix: string): string;
  export function readdirSync(path: string): string[];
  export function readFileSync(path: string, encoding: "utf8"): string;
  export function writeFileSync(path: string, text: string): void;
}
declare module "node:path" {
  export function basename(path: string): string;
  export function dirname(path: string): string;
  export function join(...parts: string[]): string;
  export function resolve(...parts: string[]): string;
}
declare module "node:os" {
  export function tmpdir(): string;
}
declare module "node:child_process" {
  export function spawnSync(file: string, args: string[], options: { encoding: "utf8" }): { stdout: string };
}
interface ImportMeta {
  readonly filename: string;
}
