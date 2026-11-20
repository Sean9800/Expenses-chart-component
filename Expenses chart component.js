// Fallback used when data.json can't be fetched (e.g. opening index.html via file://).
const FALLBACK = {
     currency: "$",
  balance: { label: "My balance", amount: 921.48 },
  summary: { label: "Total this month", amount: 478.33, change: "+2.4%", changeLabel: "from last month" },
  days: [
    { day: "mon", amount: 17.45 }, { day: "tue", amount: 34.91 },
    { day: "wed", amount: 52.36 }, { day: "thu", amount: 31.07 },
    { day: "fri", amount: 23.39 }, { day: "sat", amount: 43.28 },
    { day: "sun", amount: 25.48 }
  ]
};
    
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const money = (cur, n) => cur + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function loadData() {
  try {
    const res = await fetch("data.json");
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch {
    return FALLBACK;
  }
}

function renderChart(data) {
  const chart = document.getElementById("chart");
  const today = DAY_KEYS[new Date().getDay()];
  const max = Math.max(...data.days.map(d => d.amount));
  const chartHeight = "var(--chart-height)";

  chart.innerHTML = "";
  data.days.forEach((d, i) => {
    const col = document.createElement("div");
    col.className = "bar-col";
    col.setAttribute("role", "listitem");

    const pct = (d.amount / max) * 100;
    // Bar height is a share of the chart area; the tooltip sits just above it.
    col.style.setProperty("--h", `calc(${chartHeight} * ${(pct / 100).toFixed(4)})`);
    col.style.setProperty("--i", i);

    const tip = document.createElement("span");
    tip.className = "tooltip";
    tip.textContent = money(data.currency, d.amount);

    const bar = document.createElement("button");
    bar.type = "button";
    bar.className = "bar" + (d.day === today ? " is-today" : "");
    bar.style.height = `calc(${chartHeight} * ${(pct / 100).toFixed(4)})`;
    bar.setAttribute("aria-label", `${d.day}: ${money(data.currency, d.amount)}${d.day === today ? " (today)" : ""}`);

    const label = document.createElement("span");
    label.className = "bar-col__day";
    label.textContent = d.day;

    col.append(tip, bar, label);
    chart.appendChild(col);
  });
}

function renderText(data) {
  const set = (id, text) => (document.getElementById(id).textContent = text);
  if (data.title) set("chart-title", data.title);
  set("balance-label", data.balance.label);
  set("balance-amount", money(data.currency, data.balance.amount));
  set("summary-label", data.summary.label);
  set("summary-amount", money(data.currency, data.summary.amount));
  set("summary-change", data.summary.change);
  set("summary-change-label", data.summary.changeLabel);
}

loadData().then(data => { renderText(data); renderChart(data); });