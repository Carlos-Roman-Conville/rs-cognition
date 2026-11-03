/**
 * PLAN A.11.1, A.11.6: proposed Bayesian associative learning (Dayan & Kakade 2001;
 * Kruschke 2008; temporal contiguity: Buehner & May 2003). Exact only for the
 * assumed linear, additive Gaussian model; interacting causes are not represented.
 * All configuration numbers/profiles are host fixtures, not physiological defaults.
 * This module estimates consequences only; evaluation integration belongs to 5513.
 */
export interface ConsequenceKind {
  readonly action: string;
  readonly targetKind: string;
}

export interface CumulativeProfile {
  readonly points: readonly (readonly [seconds: number, share: number])[];
}

export interface JointConsequenceBelief {
  /** beta (signal/second), then theta_j (signal/act), in declared kind order. */
  readonly mu: readonly number[];
  readonly Sigma: readonly (readonly number[])[];
}

/** PLAN A.11.1 initial assumptions: every supplied value is a labelled host fixture. */
export interface ConsequenceConfig {
  readonly beta: { readonly mu0: number; readonly var0: number };
  readonly kinds: readonly {
    readonly kind: ConsequenceKind;
    readonly mu0: number;
    readonly var0: number;
    readonly G: CumulativeProfile;
  }[];
  /** Fixture diffusion variance in signal^2/second. */
  readonly sigmaW2: number;
  /** Fixture diagonal of Q, in parameter variance/second; no implicit drift. */
  readonly Q: readonly number[];
}

export interface ConsequenceState extends JointConsequenceBelief {
  readonly need: string;
  readonly kinds: readonly ConsequenceKind[];
  readonly hPrev?: number;
  /** Kernel milliseconds; converted to seconds only at the regression boundary. */
  readonly tPrev?: number;
}

export interface CompletedAct {
  readonly kind: ConsequenceKind;
  /** Physical seconds at the completed outcome, not the intention's start. */
  readonly t: number;
}

export interface ConsequenceTrace extends JointConsequenceBelief {
  readonly need: string;
}

export function sameConsequenceKind(a: ConsequenceKind, b: ConsequenceKind): boolean {
  return a.action === b.action && a.targetKind === b.targetKind;
}

function finite(value: number, name: string): number {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
  return value;
}

function nonnegative(value: number, name: string): number {
  if (finite(value, name) < 0) throw new RangeError(`${name} must be nonnegative`);
  return value;
}

export function validateProfile(G: CumulativeProfile): void {
  const { points } = G;
  if (points.length < 2 || points[0][1] !== 0 || points[points.length - 1][1] !== 1) {
    throw new RangeError("G must run from 0 to 1 over a positive window");
  }
  points.forEach(([t, share], i) => {
    nonnegative(t, "G time");
    nonnegative(share, "G share");
    if (share > 1 || (i > 0 && (t <= points[i - 1][0] || share < points[i - 1][1]))) {
      throw new RangeError("G times must increase and shares must be monotone in [0,1]");
    }
  });
}

function cumulative(G: CumulativeProfile, tau: number): number {
  if (tau <= G.points[0][0]) return 0;
  for (let i = 1; i < G.points.length; i++) {
    const [t, share] = G.points[i];
    if (tau < t) {
      const [previous, start] = G.points[i - 1];
      // PLAN A.11.1: interpolate the host's cumulative delay assumption in seconds.
      return start + (share - start) * (tau - previous) / (t - previous);
    }
  }
  return 1;
}

/** PLAN A.11.1: sum of cumulative increments from own completed acts, all times in seconds. */
export function phi(
  acts: readonly CompletedAct[], kind: ConsequenceKind, G: CumulativeProfile, t: number, tPrev: number,
): number {
  validateProfile(G);
  nonnegative(t, "sample time");
  nonnegative(tPrev, "previous sample time");
  if (t < tPrev) throw new RangeError("Sample times must not decrease");
  return acts.reduce((sum, act) => {
    nonnegative(act.t, "completion time");
    return sum + (sameConsequenceKind(act.kind, kind) ? cumulative(G, t - act.t) - cumulative(G, tPrev - act.t) : 0);
  }, 0);
}

function validateNoise(sigmaW2: number, Q: readonly number[], size: number): void {
  if (finite(sigmaW2, "sigmaW2") <= 0) throw new RangeError("sigmaW2 must be positive");
  if (Q.length !== size) throw new RangeError("Q diagonal must match the parameter vector");
  Q.forEach(value => nonnegative(value, "Q diagonal"));
}

export function initialConsequences(need: string, config: ConsequenceConfig): ConsequenceState {
  const priors = [config.beta, ...config.kinds];
  validateNoise(config.sigmaW2, config.Q, priors.length);
  config.kinds.forEach(({ kind, G }, i) => {
    if (!kind.action || !kind.targetKind || config.kinds.slice(0, i).some(row => sameConsequenceKind(row.kind, kind))) {
      throw new RangeError("Consequence kinds must be nonempty and unique per need");
    }
    validateProfile(G);
  });
  return { need, kinds: config.kinds.map(({ kind }) => ({ ...kind })),
    mu: priors.map(prior => finite(prior.mu0, "prior mean")),
    // PLAN A.11.1: declared independent initial priors; updates retain the full joint matrix.
    Sigma: priors.map((prior, i) => priors.map((_, j) => i === j ? nonnegative(prior.var0, "prior variance") : 0)),
  };
}

/** PLAN A.11.1: exact static-parameter Kalman regression, with declared diagonal Q added after evidence. */
export function updateConsequences(
  belief: JointConsequenceBelief, y: number, phiVec: readonly number[], dt: number,
  sigmaW2: number, eta: number, Q: readonly number[],
): JointConsequenceBelief {
  const { mu, Sigma } = belief;
  const size = mu.length;
  finite(y, "signal change");
  if (finite(dt, "dt") <= 0) throw new RangeError("dt must be positive seconds");
  if (nonnegative(eta, "eta") > 1) throw new RangeError("eta must be in [0,1]");
  validateNoise(sigmaW2, Q, size);
  if (!size || phiVec.length !== size || Sigma.length !== size || Sigma.some(row => row.length !== size)) {
    throw new RangeError("Joint regression dimensions must agree");
  }
  mu.forEach(value => finite(value, "mean"));
  phiVec.forEach(value => finite(value, "regressor"));
  Sigma.forEach((row, i) => row.forEach((value, j) => {
    finite(value, "covariance");
    if (value !== Sigma[j][i] || (i === j && value < 0)) throw new RangeError("Covariance must be symmetric with nonnegative variances");
  }));
  if (eta === 0 && Q.every(value => value === 0)) return belief;
  const dot = (a: readonly number[], b: readonly number[]) => a.reduce((sum, value, i) => sum + value * b[i], 0);
  const projected = Sigma.map(row => dot(row, phiVec));
  // eta=0 has no evidence gain and never divides by eta; Q still accumulates in physical time.
  const denominator = eta === 0 ? 1 : finite(dot(phiVec, projected) + sigmaW2 * dt / eta, "innovation variance");
  if (denominator <= 0) throw new RangeError("Innovation variance must be positive");
  const gain = projected.map(value => eta === 0 ? 0 : value / denominator);
  const innovation = y - dot(phiVec, mu);
  const posterior = Sigma.map((row, i) => row.map((value, j) =>
    value - gain[i] * projected[j] + (i === j ? Q[i] * dt : 0)));
  return { mu: mu.map((value, i) => finite(value + gain[i] * innovation, "posterior mean")),
    // Symmetrisation removes floating-point asymmetry, not cross-cause uncertainty.
    Sigma: posterior.map((row, i) => row.map((value, j) => finite((value + posterior[j][i]) / 2, "posterior covariance"))),
  };
}
