# Codex fingerprint check: independent run (unit 2675)

Run 2026-10-30 by the Cognition keeper, who did not write `scripts/codex-fingerprint.ts` (unit 2674, Sonnet). The belt
session for 2675 could not read the matrix folder from its sandbox, so the keeper ran the steps by hand. The real
matrix was only copied; it was never edited.

1. Copied `FUNCTIONS.md` and `THEORY.md` from the matrix into a temporary scratch directory outside both repos.
   `node --experimental-strip-types scripts/codex-fingerprint.ts --check --matrix <copy>` printed
   `fresh (v1, 15 sections)` and exited 0.
2. Appended " (edited copy)" to the first body line (line 204) of `### Se — concrete reality observation [CARLOS]` in the
   copy, a section cited by F6. The same command printed
   `stale F6: FUNCTIONS.md#### Se — concrete reality observation [CARLOS]` and exited 1. No other formula was listed.
3. Restored the copy, then edited a body line of `## Rules for AI readers`, a section no formula cites. The command
   printed `fresh (v1, 15 sections)` and exited 0.
4. Deleted the temporary directory.

`npm run codex-check` against the real matrix: `fresh (v1, 15 sections)`.

Verdict: PASS
