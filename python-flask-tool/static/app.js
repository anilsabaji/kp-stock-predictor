/* KP + Mundane Astrology NSE Predictor - frontend logic */
let selected = null;          // currently selected symbol row
let lastPrediction = null;

const $ = (id) => document.getElementById(id);
const api = (path) => fetch(path).then((r) => r.json());

/* ---------------- autocomplete ---------------- */
const searchBox = $("search");
const sugBox = $("suggestions");
let sugItems = [], activeIdx = -1, debounce;

searchBox.addEventListener("input", () => {
  clearTimeout(debounce);
  const q = searchBox.value.trim();
  if (!q) { sugBox.classList.remove("show"); return; }
  debounce = setTimeout(() => doSearch(q), 180);
});
searchBox.addEventListener("keydown", (e) => {
  if (!sugBox.classList.contains("show")) return;
  if (e.key === "ArrowDown") { activeIdx = Math.min(activeIdx + 1, sugItems.length - 1); paintActive(); e.preventDefault(); }
  else if (e.key === "ArrowUp") { activeIdx = Math.max(activeIdx - 1, 0); paintActive(); e.preventDefault(); }
  else if (e.key === "Enter") { if (activeIdx >= 0) pick(sugItems[activeIdx]); }
  else if (e.key === "Escape") { sugBox.classList.remove("show"); }
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrap")) sugBox.classList.remove("show");
});

async function doSearch(q) {
  const rows = await api("/api/search?q=" + encodeURIComponent(q));
  sugItems = rows; activeIdx = -1;
  if (!rows.length) { sugBox.classList.remove("show"); return; }
  sugBox.innerHTML = rows.map((r, i) =>
    `<div class="sug-item" data-i="${i}">
       <span class="badge ${r.type === 'INDEX' ? 'idx' : ''}">${r.type}</span>
       <span class="sym">${r.symbol}</span>
       <div class="nm">${r.name}${r.listing_date ? ' &middot; listed ' + r.listing_date : ''}</div>
     </div>`).join("");
  sugBox.classList.add("show");
  sugBox.querySelectorAll(".sug-item").forEach((el) =>
    el.addEventListener("click", () => pick(sugItems[+el.dataset.i])));
}
function paintActive() {
  sugBox.querySelectorAll(".sug-item").forEach((el, i) =>
    el.classList.toggle("active", i === activeIdx));
}
function pick(row) {
  selected = row;
  searchBox.value = `${row.symbol} - ${row.name}`;
  sugBox.classList.remove("show");
  renderSelected();
  loadChartInfo();
}

/* ---------------- selected header + quote ---------------- */
function renderSelected() {
  const el = $("selected");
  el.classList.remove("hidden");
  el.innerHTML = `
    <div><div class="big">${selected.symbol}</div>
      <div class="nm">${selected.name}</div></div>
    <div><label>Type</label><div>${selected.type}</div></div>
    <div><label>NSE listing (chart birth)</label>
      <div>${selected.listing_date || 'n/a'} &middot; 09:15 &middot; Mumbai</div></div>
    <div><label>Live price</label><div class="px" id="livepx">&hellip;</div></div>`;
  api("/api/quote?symbol=" + encodeURIComponent(selected.symbol)).then((q) => {
    const px = $("livepx"); if (!px) return;
    if (q.price != null) {
      px.textContent = "\u20b9" + Number(q.price).toFixed(2);
      px.title = "source: " + q.source;
      if (q.pChange != null) {
        px.innerHTML += ` <span class="${q.pChange >= 0 ? 'up' : 'down'}" style="font-size:13px">${q.pChange >= 0 ? '+' : ''}${q.pChange}%</span>`;
      }
    } else { px.textContent = "n/a"; }
  });
}

/* ---------------- chart info (natal planets etc.) ---------------- */
async function loadChartInfo() {
  const info = await api("/api/chart_info?symbol=" + encodeURIComponent(selected.symbol));
  if (info.error) return;
  // planets table
  const rows = info.planets.map((p) => `
    <tr>
      <td><b>${p.planet}</b></td>
      <td>${p.position}</td>
      <td>H${p.house}</td>
      <td>${p.nakshatra}</td>
      <td>${p.star_lord}</td>
      <td>${p.sub_lord}</td>
      <td class="${p.retrograde ? 'tag-r' : ''}">${p.retrograde ? 'R' : 'D'}</td>
      <td>${p.speed}</td>
      <td>${p.declination}&deg; ${p.declination_dir[0]}</td>
      <td>${p.direction}</td>
      <td>${p.dignity}${p.combust ? ' / combust' : ''}</td>
      <td class="${p.polarity > 0 ? 'up' : p.polarity < 0 ? 'down' : ''}">${p.polarity}</td>
    </tr>`).join("");
  $("planets-wrap").innerHTML = `
    <table><thead><tr>
      <th>Planet</th><th>Position</th><th>House</th><th>Nakshatra</th>
      <th>Star Lord</th><th>Sub Lord</th><th>R/D</th><th>Speed</th>
      <th>Decl.</th><th>Dir.</th><th>Dignity</th><th>Mkt&nbsp;pol.</th>
    </tr></thead><tbody>${rows}</tbody></table>
    <div class="nm" style="margin-top:8px">Ascendant:
      <b>${info.ascendant.position}</b> &middot; ${info.ascendant.sign} &middot;
      star ${info.ascendant.star_lord} &middot; sub ${info.ascendant.sub_lord}</div>`;
}

/* ---------------- predict + overlay ---------------- */
$("run").addEventListener("click", runPrediction);

async function runPrediction() {
  if (!selected) { alert("Search and pick a stock or index first."); return; }
  const date = $("date").value || new Date().toISOString().slice(0, 10);
  const step = $("step").value;
  $("chart-empty").innerHTML = '<span class="loading">Computing astrological projection&hellip;</span>';
  $("chart-empty").style.display = "flex";

  const predUrl = `/api/predict?symbol=${encodeURIComponent(selected.symbol)}&date=${date}&step=${step}`;
  const priceUrl = `/api/prices?symbol=${encodeURIComponent(selected.symbol)}&date=${date}`;
  const [pred, prices] = await Promise.all([api(predUrl), api(priceUrl)]);
  if (pred.error) { $("chart-empty").textContent = pred.error; return; }
  lastPrediction = pred;

  renderSummary(pred);
  renderPanchanga(pred.panchanga);
  renderDasha(pred.dasha);
  drawChart(pred, prices);
}

function drawChart(pred, prices) {
  $("chart-empty").style.display = "none";
  // Use REAL datetime x-values (so the axis is a continuous time axis, not
  // categorical). Mixing categorical "HH:MM" strings from two traces with
  // different sampling rates caused spurious horizontal zig-zags.
  const xt = (t) => `${pred.date} ${t}`;
  const xPred = pred.series.map((p) => xt(p.time));
  const scores = pred.series.map((p) => p.score);

  // anchor projection to actual open price if available for visual overlay
  const bars = (prices && prices.bars) || [];
  let projection = pred.projection.slice();
  if (bars.length) {
    const open = bars[0].price;
    projection = pred.projection.map((v) => v / pred.projection[0] * open);
  }

  const traces = [];
  // Astro score area (right axis)
  traces.push({
    x: xPred, y: scores, name: "Astro score", yaxis: "y2",
    type: "scatter", mode: "lines", line: { color: "#7c5cff", width: 1.5 },
    fill: "tozeroy", fillcolor: "rgba(124,92,255,0.12)",
    hovertemplate: "%{x|%H:%M}<br>score %{y:.1f}<extra></extra>",
  });
  // Astro projected price path (left axis)
  traces.push({
    x: xPred, y: projection, name: "Astro projected price",
    type: "scatter", mode: "lines",
    line: { color: "#33c1b1", width: 2, dash: "dot" },
    hovertemplate: "%{x|%H:%M}<br>proj \u20b9%{y:.2f}<extra></extra>",
  });
  // Actual price (left axis) - sorted by time, gaps left as gaps
  if (bars.length) {
    const sorted = bars.slice().sort((a, b) => a.time.localeCompare(b.time));
    traces.push({
      x: sorted.map((b) => xt(b.time)), y: sorted.map((b) => b.price),
      name: "Actual NSE price", type: "scatter", mode: "lines",
      line: { color: "#f5a623", width: 2, shape: "linear" },
      connectgaps: false,
      hovertemplate: "%{x|%H:%M}<br>actual \u20b9%{y:.2f}<extra></extra>",
    });
  }

  const layout = {
    paper_bgcolor: "#161b22", plot_bgcolor: "#161b22",
    font: { color: "#e6edf3", size: 11 },
    margin: { l: 60, r: 60, t: 30, b: 40 },
    legend: { orientation: "h", y: 1.12 },
    xaxis: {
      type: "date", tickformat: "%H:%M", title: "IST", gridcolor: "#222b36",
    },
    yaxis: { title: "Price (\u20b9)", gridcolor: "#222b36" },
    yaxis2: {
      title: "Astro score", overlaying: "y", side: "right",
      range: [-100, 100], gridcolor: "transparent", zeroline: true,
      zerolinecolor: "#3a4150",
    },
    shapes: [{
      type: "line", xref: "paper", x0: 0, x1: 1, yref: "y2", y0: 0, y1: 0,
      line: { color: "#3a4150", width: 1 },
    }],
    title: {
      text: `${pred.symbol} &mdash; ${pred.date} &middot; Astro projection vs NSE price`,
      font: { size: 13 },
    },
  };
  Plotly.newPlot("chart", traces, layout, { responsive: true, displayModeBar: true });
  if (!bars.length) {
    $("chart-empty").style.display = "flex";
    $("chart-empty").innerHTML =
      "Astro projection shown. <br>Live/actual NSE prices unavailable for this date " +
      "(Yahoo serves intraday only for ~last 7 sessions). Pick a recent trading day to overlay.";
    setTimeout(() => { $("chart-empty").style.display = "none"; }, 4000);
  }
}

/* ---------------- info panels ---------------- */
function trendPill(t) {
  const c = t.startsWith("Bull") ? "bull" : t.startsWith("Bear") ? "bear" : "flat";
  return `<span class="pill ${c}">${t}</span>`;
}
function row(k, v) { return `<div class="row"><span>${k}</span><span>${v}</span></div>`; }

function renderSummary(pred) {
  const s = pred.summary;
  $("summary").innerHTML =
    row("Overall trend", trendPill(s.trend)) +
    row("Avg score", s.avg_score) +
    row("Max / Min", `${s.max_score} / ${s.min_score}`) +
    row("Likely reversal times", (s.reversal_times || []).slice(0, 8).join(", ") || "&mdash;") +
    row("Resolution", pred.step_minutes + " min");
}
function renderPanchanga(p) {
  if (!p) { $("panchanga").innerHTML = "&mdash;"; return; }
  $("panchanga").innerHTML =
    row("Tithi", p.tithi + " (" + p.tithi_num + ")") +
    row("Vara (day lord)", p.vara + " / " + p.vara_lord) +
    row("Nakshatra", p.nakshatra + " (" + p.nakshatra_lord + ")") +
    row("Yoga", p.yoga + (p.yoga_auspicious ? " &#9989;" : " &#9888;")) +
    row("Karana", p.karana) +
    row("Panchanga bias", p.bias);
}
function renderDasha(d) {
  if (!d) { $("dasha").innerHTML = "&mdash;"; return; }
  $("dasha").innerHTML =
    row("Mahadasha", `${d.maha_lord} <span class="nm">(${d.maha_start}&rarr;${d.maha_end})</span>`) +
    row("Antardasha", `${d.antar_lord} <span class="nm">(${d.antar_start}&rarr;${d.antar_end})</span>`) +
    row("Pratyantardasha", d.pratyantar_lord) +
    row("Dasha bias", d.bias);
}

/* ---------------- back-test ---------------- */
$("bt-run").addEventListener("click", async () => {
  if (!selected) { alert("Pick a stock first."); return; }
  const start = $("bt-start").value, end = $("bt-end").value;
  $("bt-summary").innerHTML = '<span class="loading">Running daily back-test (this may take a few seconds)&hellip;</span>';
  const url = `/api/backtest?mode=daily&symbol=${encodeURIComponent(selected.symbol)}` +
    (start ? `&start=${start}` : "") + (end ? `&end=${end}` : "");
  const bt = await api(url);
  renderBacktest(bt);
});
$("bt-intraday").addEventListener("click", async () => {
  if (!selected) { alert("Pick a stock first."); return; }
  const day = $("date").value;
  if (!day) { alert("Pick a date above first."); return; }
  $("bt-summary").innerHTML = '<span class="loading">Running intraday back-test&hellip;</span>';
  const bt = await api(`/api/backtest?mode=intraday&day=${day}&symbol=${encodeURIComponent(selected.symbol)}&step=${$("step").value}`);
  renderBacktest(bt);
});

function renderBacktest(bt) {
  if (bt.error) { $("bt-summary").textContent = bt.error; $("bt-table").innerHTML = ""; return; }
  const s = bt.summary;
  if (bt.mode === "intraday") {
    $("bt-summary").innerHTML =
      row("Mode", "Intraday (" + bt.day + ")") +
      row("Aligned points", s.points) +
      row("Directional hit-rate", (s.hit_rate_pct ?? "n/a") + "%") +
      row("Projection&harr;price correlation", s.correlation);
    $("bt-table").innerHTML = "";
    return;
  }
  $("bt-summary").innerHTML =
    row("Period", `${bt.start} &rarr; ${bt.end}`) +
    row("Trading days / evaluated", `${s.trading_days} / ${s.evaluated}`) +
    row("Directional hit-rate", (s.hit_rate_pct ?? "n/a") + "%") +
    row("Score&harr;return correlation", s.score_return_correlation) +
    `<div class="row"><span></span><span class="nm">${s.note}</span></div>`;
  const rows = bt.rows.filter((r) => r.actual_return_pct != null).map((r) => `
    <tr><td>${r.date}</td>
      <td class="${r.astro_score > 0 ? 'up' : 'down'}">${r.astro_score}</td>
      <td>${r.astro_dir}</td>
      <td>\u20b9${r.close}</td>
      <td class="${r.actual_return_pct > 0 ? 'up' : 'down'}">${r.actual_return_pct}%</td>
      <td>${r.actual_dir}</td>
      <td>${r.hit === null ? '&mdash;' : r.hit ? '&#9989;' : '&#10060;'}</td>
    </tr>`).join("");
  $("bt-table").innerHTML = `<table><thead><tr>
    <th>Date</th><th>Astro score</th><th>Astro dir</th><th>Close</th>
    <th>Actual ret</th><th>Actual dir</th><th>Hit</th></tr></thead>
    <tbody>${rows}</tbody></table>`;
}

/* ---------------- defaults ---------------- */
(function init() {
  const today = new Date().toISOString().slice(0, 10);
  $("date").value = today;
  const d = new Date(); d.setDate(d.getDate() - 60);
  $("bt-start").value = d.toISOString().slice(0, 10);
  $("bt-end").value = today;
})();
