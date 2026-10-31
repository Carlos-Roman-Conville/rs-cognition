# Eight-function v1

DESIGN §9 defines this level-5 model. Nothing enables it by default. The baseline and
hungry-pair benchmark still use `nullPersonality`; T-1–T-3 wait for baseline acceptance.

```ts
import { createEightFunctionV1 } from "@rex/cognition";

// 0.01 is an illustrative host choice, not a sourced personality constant.
const personality = createEightFunctionV1("ENFJ", { etaMin: 0.01 });
```

`etaMin` is required because §9 supplies the symbol but no numerical default. The
factory returns the four hooks plus frozen `stack`, `weights`, `tilt`, and `off` records.
Every `off` record exposes the null model's identity hooks. `formulas.json` preserves
the F1–F13 formula cells verbatim, with primary `cite` and any `additional_cites`.
Citation file paths are relative to the repository root. Bold-item punctuation is
preserved exactly as it appears in the matrix. The matrix is read only.

`../stacks.json` derives the 16 configurations from THEORY §3a's function sets and
§3d's dominant functions, with DESIGN §9's alternating attitudes (and THEORY §3c's
reversed-stack pairs checked). Custom diagnostic stacks can contain two to four
distinct functions with both attitudes represented. This permits the requested
Fe/Ti/Fi-only check, since there are only three off core functions. Missing functions
have zero weight; present positions retain §9's ordinal weights.

The optional pure `context(mind)` adapter supplies subjective cue domain/physical/
present tags, recorded failure count, targeted-entity status, person and testimony
tags. Absent failure history means zero; absent tags do not trigger tagged effects.
The `people` domain supplies a person tag unless explicitly overridden. The adapter
must describe the current hook call, without reading world state. F13 uses the
existing `testimonyFloor` slot for the supplied reliability `r`.

Formulas compose in ID order: F2 normalizes attention, then F4/F6 multiply tagged
weights; F1 changes the prior before F12 multiplies it for a person. F4 precedes F5.
Zero attention mass stays zero. Learning's existing infinite half-life sentinel is
preserved. The baseline policy's explicit `eta = 0` freeze still wins over hooks.

F9's optional `compound(a, b, mind)` adapter supplies the subjective link from a
possible outcome of a to a prerequisite of b and a host-defined two-step candidate.
v1 adds at most the specified count in input order, checks the link identifiers,
deduplicates action/target pairs and preserves both steps in candidate traces. The
host owns the compound's outcome model and execution meaning; v1 invents no joint
probability or world transition. Only original candidates are combined in a call.

F10's optional `otherMind.situation` adapter supplies the other's believed situation
only for choice-dependent outcomes. `ownPolicy` runs this mind's policy there and maps
its choice distribution onto the original outcome support. It receives v1 with nested
F10 disabled to bound recursion; other hooks remain active. Randomness, if needed,
must use a caller-supplied kernel stream. Without these host adapters there is no
declared compound or other-mind simulation to apply; F11 still modifies commitment.

The factory does not change perception, testimony, retrieval or drift call sites.
Those callers must supply the relevant tags and consume the returned controls when
the layer is enabled. Tests verify these controls directly and smoke-test the existing
policy integration. No empirical validation or type-specific action preference is claimed.
