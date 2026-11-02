export const DEFAULT_COGNITIVE_PARAMS = Object.freeze({
    beta: 1, // proposed; inverse decision temperature, >= 0
    lambda: 2.25, // DESIGN §2.4: Tversky & Kahneman 1992 median; >= 0
    gamma: 0.99, // proposed; per-epoch discount, [0, 1]
    eta: 1, // proposed Bayesian baseline, [0, 1]; 0 freezes learning (DESIGN CB-5)
    alpha0: 1, // proposed; theory pseudo-count strength, > 0
    d: 0.5, // DESIGN §2.3: ACT-R, Anderson & Lebiere 1998; > 0
    tau: 0, // proposed; retrieval activation threshold, finite
    s: 0.4, // proposed baseline logistic scale, > 0; research calibration belongs to memory
    kappa: 0, // proposed; commitment advantage threshold, >= 0
    k: 0, // proposed; neutral SDT criterion, finite
    n: 4, // DESIGN §2.2: Keramati & Gutkin 2014 starting value; n > m
    m: 3, // DESIGN §2.2: Keramati & Gutkin 2014 starting value; m >= 1
});
