# HANDOFF: cognition

## State
Unit 2661 done: package scaffold (`package.json`, `tsconfig.json` with `noUnusedLocals`/`noUnusedParameters`,
`src/index.ts` empty barrel, `test/smoke.test.ts`, `test/fence.test.ts`, README, lockfile). DESIGN.md approved by Rex
(2026-10-30). No engine code yet.

## Next
Units 2662–2672, in order, each adding its exports to `src/index.ts`. Read each unit's WORK file for its scope.

## Blocked
Nothing.

## Gotchas
- `tsconfig` has `types: []` (as economy) and there is no `@types/node`; `test/node-shim.d.ts` declares the few
  `node:fs`/`node:path` names the fence test uses. Extend the shim rather than adding a dependency.
- `include` lists `bench`, which does not exist yet; fine for tsc while `src` and `test` match.
- The fence test fails if `src/` has no files, so keep `src/index.ts`.
- Keeper's read guard blocked `../economy/*` until absolute paths were added to the WORK file's Read section.
