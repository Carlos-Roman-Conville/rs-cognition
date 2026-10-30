# Rules for Codex (and any belt worker) in `Toolchain/cognition`

1. Read `DESIGN.md` (the sections your task names) first. It is the spec. Disagree by parking in `HANDOFF.md`
   Blocked, never by changing DESIGN.md.
2. Cognition outputs **intentions**, never outcomes. Never compute physiology, strength, injury, neurology, prices or
   any other engine's state; read them as declared inputs (DESIGN §0, §8).
3. **Objective vs subjective** (DESIGN §1): only `src/perception.ts` may see a `Stimulus` (a true value). Every other
   module works on observations, beliefs, memory and needs. Never pass world state into the policy.
4. `src/` imports only `@rex/kernel` and its own files. Never an engine, never a game, never pirate-ship. The
   benchmark fixture lives in `bench/` and imports `src/`, never the reverse.
5. No behaviour per type, agent or scenario in `src/`: actions are host data (DESIGN §2.4); no branch on an agent id
   or parameter value that picks an action or an outcome.
6. Deterministic: no `Math.random`, no `Date.now`; randomness only from kernel streams named in DESIGN §7; iterate
   minds and records in mint order, never over unordered keys where order reaches the output.
7. Every formula carries a comment with its DESIGN section and source; every parameter default carries its source or
   the word "proposed".
8. Style: TypeScript, ES modules with `.ts` import suffixes, small files, one test file per source file in `test/`,
   test titles naming the rule they check. Verification tests check each formula as stated, its boundary cases and
   numerical stability (DESIGN §10).
9. Run only your own tests while working (`npx vitest run test/<file>.test.ts`); the runner runs the Gate.
10. One commit, not pushed, ending with `Co-Authored-By: OpenAI Codex <codex@openai.com>`. Nothing left uncommitted.
    Close with a short report: done or parked, tests, commit hash.
