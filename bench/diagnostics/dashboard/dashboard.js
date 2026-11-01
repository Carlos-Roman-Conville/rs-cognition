/**
 * Expected JSON schemas (offline file picker):
 *
 * 1) function-ledger-report/v1 — output of buildReport() / ledger-report.json
 *    { schema, seedCount, limitations[], byFunction|byStack|byScenario|byDomain|
 *      observedRelevanceMap|byDevelopmentalStage|byUpbringing: ReportRow[] }
 *    ReportRow: key, decisions, activations, opportunities, frequency, changedHookCalls,
 *    attentionMoved, interpretationMagnitude, generationChanges, generationParameterMagnitude,
 *    learningContribution, deltaUSum, deltaUCount, meanDeltaU, eligibility{activated,
 *    eligible-not-activated,no-relevant-input}, seeds, interval95:[lo,hi]|null
 *
 * 2) function-ledger/v1 (optional detailed export) — adds records[] with per-epoch LedgerRecord
 *    fields used for the decision table (activation, hook, triggerTags, domains, …).
 */
"use strict";

const FUNCTIONS = ["Se", "Si", "Ne", "Ni", "Te", "Ti", "Fe", "Fi"];
const HOOKS = ["pertinence", "interpret", "generate", "learning"];
const STACK_ORDER = {
  ESTP: ["Se", "Ti", "Fe", "Ni"],
  ISTJ: ["Si", "Te", "Fi", "Ne"],
  ESFP: ["Se", "Fi", "Te", "Ni"],
  INFJ: ["Ni", "Fe", "Ti", "Se"],
};
const ROLES = ["dominant", "auxiliary", "tertiary", "inferior"];

const $ = (id) => document.getElementById(id);
const fmt = (n, d = 3) => (n === null || n === undefined || Number.isNaN(n) ? "—" : Number(n).toFixed(d));
const fmtInt = (n) => (n === null || n === undefined ? "—" : String(Math.round(n)));

let state = { kind: null, data: null, illustrative: false, cardTab: "activation", mapMetric: "frequency" };

function stackLabel(stack) {
  if (!stack || stack === "null") return "null control";
  const order = STACK_ORDER[stack] ?? FUNCTIONS;
  return `${stack} · ${order.join("–")}`;
}

function parseStackKey(key) {
  const parts = key.split("/");
  if (parts.length >= 3) return { version: parts[0], stack: parts[1], fn: parts[2] };
  return { version: null, stack: null, fn: parts[parts.length - 1] };
}

function parseScenarioKey(key) {
  const i = key.lastIndexOf("/");
  return i > 0 ? { scenario: key.slice(0, i), fn: key.slice(i + 1) } : { scenario: key, fn: "" };
}

function parseMapKey(key) {
  const i = key.indexOf("/");
  return i > 0 ? { fn: key.slice(0, i), domain: key.slice(i + 1) } : { fn: key, domain: "" };
}

function primaryStackRows(report) {
  const stacks = report.byStack.filter((r) => !r.key.startsWith("null/null/"));
  const counts = new Map();
  for (const row of stacks) {
    const { stack } = parseStackKey(row.key);
    if (stack && stack !== "null") counts.set(stack, (counts.get(stack) ?? 0) + 1);
  }
  let best = null;
  for (const [stack, n] of counts) if (!best || n > best.n) best = { stack, n };
  if (!best) return { stack: null, rows: stacks };
  const order = STACK_ORDER[best.stack] ?? FUNCTIONS;
  const byFn = new Map(stacks.filter((r) => parseStackKey(r.key).stack === best.stack).map((r) => [parseStackKey(r.key).fn, r]));
  return { stack: best.stack, rows: order.map((fn) => byFn.get(fn)).filter(Boolean) };
}

function headerMeta() {
  const el = $("header-meta");
  if (!state.data) {
    el.textContent = "";
    return;
  }
  if (state.kind === "report") {
    const { stack, rows } = primaryStackRows(state.data);
    const scenario = state.data.byScenario.map((r) => parseScenarioKey(r.key).scenario).find(Boolean) ?? "—";
    const decisions = rows[0]?.decisions ?? state.data.byFunction[0]?.decisions ?? "—";
    const dev = state.data.byDevelopmentalStage?.length
      ? state.data.byDevelopmentalStage.map((r) => r.key).join(", ")
      : null;
    const up = state.data.byUpbringing?.length ? state.data.byUpbringing.map((r) => r.key).join(", ") : null;
    el.innerHTML = [
      `<span><strong>Stack</strong> ${stackLabel(stack)}</span>`,
      `<span><strong>Scenario</strong> ${scenario}</span>`,
      `<span><strong>Decisions counted</strong> ${decisions}</span>`,
      dev ? `<span><strong>Developmental stage</strong> ${dev}</span>` : "",
      up ? `<span><strong>Upbringing</strong> ${up}</span>` : "",
      `<span><strong>Seeds</strong> ${state.data.seedCount}</span>`,
    ].filter(Boolean).join("");
    return;
  }
  const L = state.data;
  el.innerHTML = [
    `<span><strong>Stack</strong> ${stackLabel(L.configuration?.stack ?? null)}</span>`,
    `<span><strong>Scenario</strong> ${L.scenario ?? "—"}</span>`,
    `<span><strong>Decisions counted</strong> ${L.totals?.decisions ?? L.records?.length ?? "—"}</span>`,
    L.developmentalStage ? `<span><strong>Developmental stage</strong> ${L.developmentalStage}</span>` : "",
    L.upbringing ? `<span><strong>Upbringing</strong> ${L.upbringing}</span>` : "",
    `<span><strong>Seed</strong> ${L.seed ?? "—"}</span>`,
  ].filter(Boolean).join("");
}

function eligibilityBadge(kind) {
  const cls = kind === "activated" ? "badge-activated" : kind === "eligible-not-activated" ? "badge-eligible" : "badge-none";
  const label = kind === "activated" ? "activated" : kind === "eligible-not-activated" ? "eligible, inactive" : "no relevant input";
  return `<span class="badge ${cls}">${label}</span>`;
}

function cardMetric(row, tab) {
  if (tab === "activation") return row.activations;
  if (tab === "influence") return row.meanDeltaU ?? 0;
  return row.learningContribution;
}

function renderCards() {
  const host = $("function-cards");
  host.innerHTML = "";
  if (!state.data) {
    host.innerHTML = '<p class="empty">Load a ledger report JSON file.</p>';
    return;
  }
  const rows = state.kind === "report" ? primaryStackRows(state.data).rows : stackRowsFromLedger(state.data);
  if (!rows.length) {
    host.innerHTML = '<p class="empty">No per-function aggregates in this file.</p>';
    return;
  }
  const max = Math.max(...rows.map((r) => cardMetric(r, state.cardTab)), 1e-9);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const fn = state.kind === "report" ? parseStackKey(row.key).fn : row.function;
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<h3>${fn}</h3><div class="role">${ROLES[i] ?? "—"}</div>`;
    const stats = document.createElement("div");
    stats.className = "stat-grid";
    stats.innerHTML = `
      <span>Activations</span><span>${fmtInt(row.activations)}</span>
      <span>Opportunities</span><span>${fmtInt(row.opportunities)}</span>
      <span>Frequency</span><span>${fmt(row.frequency)}</span>
      <span>Mean ΔU</span><span>${fmt(row.meanDeltaU)}${row.interval95 ? ` [${fmt(row.interval95[0])}, ${fmt(row.interval95[1])}]` : ""}</span>
      <span>Learning</span><span>${fmt(row.learningContribution)}</span>
      <span>Eligibility</span><span>${row.eligibility.activated} / ${row.eligibility["eligible-not-activated"]} / ${row.eligibility["no-relevant-input"]}</span>`;
    card.appendChild(stats);
    host.appendChild(card);
  }
  const tabs = $("card-metric-tabs");
  tabs.innerHTML = "";
  for (const tab of ["activation", "influence", "learning"]) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = tab.charAt(0).toUpperCase() + tab.slice(1);
    btn.setAttribute("aria-pressed", String(state.cardTab === tab));
    btn.addEventListener("click", () => {
      state.cardTab = tab;
      renderCards();
    });
    tabs.appendChild(btn);
  }
  const bars = $("function-bars");
  bars.innerHTML = "";
  for (const r of rows) {
    const f = state.kind === "report" ? parseStackKey(r.key).fn : r.function;
    const val = cardMetric(r, state.cardTab);
    const pct = Math.max(0, Math.min(100, (val / max) * 100));
    bars.innerHTML += `<div class="bar-row"><span class="bar-label">${f}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span class="bar-val">${fmt(val)}</span></div>`;
  }
}

function stackRowsFromLedger(ledger) {
  const order = STACK_ORDER[ledger.configuration?.stack] ?? FUNCTIONS;
  const map = new Map();
  for (const row of ledger.summary ?? []) {
    const cur = map.get(row.function);
    if (!cur) map.set(row.function, { ...row, key: row.function });
    else {
      for (const k of ["activations", "opportunities", "changedHookCalls", "attentionMoved", "interpretationMagnitude",
        "generationChanges", "generationParameterMagnitude", "learningContribution", "deltaUSum", "deltaUCount"]) {
        cur[k] += row[k];
      }
      for (const k of Object.keys(cur.eligibility)) cur.eligibility[k] += row.eligibility[k];
      cur.frequency = cur.opportunities ? cur.activations / cur.opportunities : 0;
      cur.meanDeltaU = cur.deltaUCount ? cur.deltaUSum / cur.deltaUCount : null;
    }
  }
  return order.map((fn) => map.get(fn)).filter(Boolean);
}

function recordTableRows(ledger) {
  return (ledger.records ?? []).map((r) => ({
    scenario: ledger.scenario,
    trigger: [...new Set([...(r.triggerTags ?? []), ...(r.domains ?? [])])].join(", "),
    function: r.function,
    hook: r.hook,
    stage: ledger.developmentalStage ?? "",
    activation: r.activation,
    attentionMoved: r.attentionMoved,
    interpretationMagnitude: Object.values(r.interpretationDeltas ?? {}).reduce((s, x) => s + Math.abs(x), 0),
    generationChanges: (r.generation?.added?.length ?? 0) + (r.generation?.removed?.length ?? 0) + Number(r.generation?.reordered),
    generationParameterMagnitude: r.generation?.parameterMagnitude ?? 0,
    deltaU: r.deltaU,
    learningContribution: r.learningContribution,
    stackPosition: r.stackPosition ?? "",
    eligibility: r.eligibility,
    result: `${r.chosenAction?.action ?? "?"}${r.chosenAction?.target ? `@${r.chosenAction.target}` : ""}`,
  }));
}

function aggregateTableRows(report) {
  const rows = [];
  for (const row of report.byScenario) {
    const { scenario, fn } = parseScenarioKey(row.key);
    rows.push({ scenario, trigger: "—", function: fn, hook: "all hooks", stage: "", source: "byScenario", ...spreadRow(row) });
  }
  for (const row of report.observedRelevanceMap) {
    const { fn, domain } = parseMapKey(row.key);
    rows.push({
      scenario: report.byScenario[0] ? parseScenarioKey(report.byScenario[0].key).scenario : "—",
      trigger: domain,
      function: fn,
      hook: "all hooks",
      stage: "",
      source: "map",
      ...spreadRow(row),
    });
  }
  return rows;
}

function dominantEligibility(e) {
  return Object.entries(e).sort((a, b) => b[1] - a[1])[0][0];
}

function spreadRow(row) {
  return {
    activation: row.activations,
    attentionMoved: row.attentionMoved,
    interpretationMagnitude: row.interpretationMagnitude,
    generationChanges: row.generationChanges,
    generationParameterMagnitude: row.generationParameterMagnitude,
    deltaU: row.meanDeltaU,
    learningContribution: row.learningContribution,
    stackPosition: "—",
    eligibility: dominantEligibility(row.eligibility),
    result: "aggregated",
  };
}

function renderTableFilters(rows) {
  const host = $("table-filters");
  const pick = (label, id, values) => {
    const opts = ['<option value="">All</option>', ...values.map((v) => `<option value="${v}">${v}</option>`)].join("");
    return `<label>${label}<select id="filter-${id}">${opts}</select></label>`;
  };
  const scenarios = [...new Set(rows.map((r) => r.scenario).filter(Boolean))].sort();
  const triggers = [...new Set(rows.map((r) => r.trigger).filter(Boolean))].sort();
  const fns = [...new Set(rows.map((r) => r.function).filter(Boolean))].sort();
  const hooks = [...new Set(rows.map((r) => r.hook).filter(Boolean))].sort();
  const stages = [...new Set(rows.map((r) => r.stage).filter(Boolean))].sort();
  host.innerHTML = pick("Scenario", "scenario", scenarios) + pick("Stimulus / domain", "trigger", triggers)
    + pick("Function", "function", fns) + pick("Hook", "hook", hooks) + pick("Developmental stage", "stage", stages);
  for (const id of ["scenario", "trigger", "function", "hook", "stage"]) {
    $(`filter-${id}`).addEventListener("change", renderTable);
  }
}

function renderTable() {
  const hint = $("table-hint");
  const thead = $("detail-table").querySelector("thead");
  const tbody = $("detail-table").querySelector("tbody");
  if (!state.data) {
    hint.textContent = "";
    thead.innerHTML = "";
    tbody.innerHTML = "";
    return;
  }
  const rows = state.kind === "ledger" ? recordTableRows(state.data) : aggregateTableRows(state.data);
  hint.textContent = state.kind === "ledger"
    ? "Decision-level rows from detailed ledger export."
    : "Aggregated rows from report sections (hook-level detail requires a detailed ledger JSON).";
  if (!document.getElementById("filter-scenario")) renderTableFilters(rows);
  const filt = (id) => $(`filter-${id}`)?.value ?? "";
  const filtered = rows.filter((r) => (!filt("scenario") || r.scenario === filt("scenario"))
    && (!filt("trigger") || r.trigger === filt("trigger"))
    && (!filt("function") || r.function === filt("function"))
    && (!filt("hook") || r.hook === filt("hook"))
    && (!filt("stage") || r.stage === filt("stage")));
  thead.innerHTML = `<tr>
    <th>Scenario</th><th>Trigger / domain</th><th>Function</th><th>Hook</th><th>Stage</th>
    <th>Activation</th><th>Attention</th><th>Interpretation</th><th>Generation</th><th>Gen params</th>
    <th>ΔU</th><th>Learning</th><th>Stack pos.</th><th>Eligibility</th><th>Result</th>
  </tr>`;
  tbody.innerHTML = filtered.slice(0, 500).map((r) => `<tr>
    <td>${r.scenario}</td><td>${r.trigger}</td><td>${r.function}</td><td>${r.hook}</td><td>${r.stage || "—"}</td>
    <td>${fmtInt(r.activation)}</td><td>${fmt(r.attentionMoved)}</td><td>${fmt(r.interpretationMagnitude)}</td>
    <td>${fmtInt(r.generationChanges)}</td><td>${fmt(r.generationParameterMagnitude)}</td>
    <td>${fmt(r.deltaU)}</td><td>${fmt(r.learningContribution)}</td><td>${r.stackPosition || "—"}</td>
    <td>${eligibilityBadge(typeof r.eligibility === "string" ? r.eligibility : dominantEligibility(r.eligibility))}</td>
    <td>${r.result}</td>
  </tr>`).join("");
  if (filtered.length > 500) hint.textContent += ` Showing first 500 of ${filtered.length} rows.`;
}

function heatColor(t) {
  const lo = getComputedStyle(document.documentElement).getPropertyValue("--heat-low").trim();
  const mid = getComputedStyle(document.documentElement).getPropertyValue("--heat-mid").trim();
  const hi = getComputedStyle(document.documentElement).getPropertyValue("--heat-high").trim();
  if (t <= 0.33) return lo;
  if (t <= 0.66) return mid;
  return hi;
}

function renderMap() {
  const host = $("relevance-map");
  const tabs = $("map-metric-tabs");
  tabs.innerHTML = "";
  for (const m of ["frequency", "influence"]) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = m === "frequency" ? "Frequency" : "Mean ΔU (influence)";
    btn.setAttribute("aria-pressed", String(state.mapMetric === m));
    btn.addEventListener("click", () => {
      state.mapMetric = m;
      renderMap();
    });
    tabs.appendChild(btn);
  }
  if (!state.data || state.kind !== "report") {
    host.innerHTML = '<p class="empty">Observed relevance map requires a ledger report JSON.</p>';
    return;
  }
  const entries = state.data.observedRelevanceMap.map((row) => ({ ...parseMapKey(row.key), row }));
  const domains = [...new Set(entries.map((e) => e.domain))].sort();
  const fns = [...new Set(entries.map((e) => e.fn))].sort((a, b) => FUNCTIONS.indexOf(a) - FUNCTIONS.indexOf(b));
  const lookup = new Map(entries.map((e) => [`${e.fn}/${e.domain}`, e.row]));
  const values = entries.map((e) => state.mapMetric === "frequency" ? e.row.frequency : (e.row.meanDeltaU ?? 0));
  const min = Math.min(...values);
  const max = Math.max(...values, min + 1e-9);
  const grid = document.createElement("div");
  grid.className = "matrix";
  grid.style.gridTemplateColumns = `auto repeat(${domains.length}, minmax(3.25rem, 1fr))`;
  grid.appendChild(cell("fn \\ domain", "corner"));
  for (const d of domains) grid.appendChild(cell(d, "col-head"));
  for (const fn of fns) {
    grid.appendChild(cell(fn, "row-head"));
    for (const domain of domains) {
      const row = lookup.get(`${fn}/${domain}`);
      const val = row ? (state.mapMetric === "frequency" ? row.frequency : row.meanDeltaU ?? 0) : null;
      const t = val === null ? 0 : (val - min) / (max - min);
      const c = document.createElement("div");
      c.className = "cell";
      c.style.background = val === null ? "transparent" : heatColor(t);
      c.textContent = val === null ? "—" : fmt(val);
      grid.appendChild(c);
    }
  }
  host.innerHTML = "";
  host.appendChild(grid);
}

function cell(text, cls) {
  const d = document.createElement("div");
  d.className = `cell ${cls}`;
  d.textContent = text;
  return d;
}

function ingest(json, illustrative) {
  if (json.schema === "function-ledger-report/v1") state = { kind: "report", data: json, illustrative, cardTab: state.cardTab, mapMetric: state.mapMetric };
  else if (json.schema === "function-ledger/v1") state = { kind: "ledger", data: json, illustrative, cardTab: state.cardTab, mapMetric: state.mapMetric };
  else throw new Error(`Unknown schema: ${json.schema ?? "(missing)"}`);
  $("illustrative-banner").classList.toggle("visible", illustrative);
  $("table-filters").innerHTML = "";
  headerMeta();
  renderCards();
  renderTable();
  renderMap();
}

async function loadSample() {
  const res = await fetch("sample-ledger.json");
  if (!res.ok) throw new Error("Could not load sample-ledger.json");
  ingest(await res.json(), true);
}

function loadFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      ingest(JSON.parse(String(reader.result)), false);
    } catch (err) {
      alert(err.message || String(err));
    }
  };
  reader.readAsText(file);
}

$("file-input").addEventListener("change", (ev) => {
  const file = ev.target.files?.[0];
  if (file) loadFile(file);
});
$("reload-sample").addEventListener("click", () => loadSample().catch((e) => alert(e.message)));

loadSample().catch(() => {
  $("function-cards").innerHTML = '<p class="empty">Open this folder as a file or use the file picker (sample load failed).</p>';
});
