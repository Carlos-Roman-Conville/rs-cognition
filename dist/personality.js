export const nullPersonality = Object.freeze({
    id: "null", version: "1",
    pertinence: (base) => base,
    interpret: (base) => base,
    generate: (candidates, base) => ({ candidates, params: base }),
    learning: (base) => base,
});
