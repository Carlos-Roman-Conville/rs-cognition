declare module "node:fs" {
  export function mkdirSync(path: string | URL, options: { recursive: true }): unknown;
}
