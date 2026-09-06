/**
 * EdgeReactor™ Tactical Operator Console JavaScript
 * Real-time WebSocket streaming, Purdue visualization, and guided playbooks
 */

let ws = null;
let currentTopology = null;
let currentPlaybooks = {};
let alertsMap = new Map();
let totalEvents = 0;

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  initWebSocket();
  initEventListeners();
});

let pollTimer = null;
let wsAttempts = 0;

function initWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      wsAttempts = 0;
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      document.getElementById("ws-status").textContent = "STREAM ACTIVE";
      document.getElementById("ws-status").className = "text-emerald-400";
      document.getElementById("ws-pulse").className = "relative inline-flex rounded-full h-2 w-2 bg-emerald-500";
    };

    ws.onclose = () => {
      wsAttempts++;
      if (wsAttempts > 2) {
        startPollingFallback();
      } else {
        document.getElementById("ws-status").textContent = "CONNECTING...";
        document.getElementById("ws-status").className = "text-amber-400";
        document.getElementById("ws-pulse").className = "relative inline-flex rounded-full h-2 w-2 bg-amber-500";
        setTimeout(initWebSocket, 2000);
      }
    };

    ws.onerror = () => {
      startPollingFallback();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleMessage(msg);
      } catch (err) {
        console.error("WS Parse error:", err);
      }
    };
  } catch (err) {
    startPollingFallback();
  }
}

async function startPollingFallback() {
  if (pollTimer) return;
  document.getElementById("ws-status").textContent = "CLOUD SYNC (HTTP)";
  document.getElementById("ws-status").className = "text-sky-400";
  document.getElementById("ws-pulse").className = "relative inline-flex rounded-full h-2 w-2 bg-sky-400";

  await fetchServerlessState();
  pollTimer = setInterval(fetchServerlessState, 3000);
}

async function fetchServerlessState() {
  try {
    const [statusRes, topoRes, telemRes, alertsRes, pbRes] = await Promise.allSettled([
      fetch("/api/status").then(r => r.json()),
      fetch("/api/topology").then(r => r.json()),
      fetch("/api/telemetry").then(r => r.json()),
      fetch("/api/alerts").then(r => r.json()),
      fetch("/api/playbooks").then(r => r.json()),
    ]);

    if (topoRes.status === "fulfilled" && topoRes.value) {
      currentTopology = topoRes.value;
      renderTopology(currentTopology);
    }
    if (pbRes.status === "fulfilled" && pbRes.value) {
      currentPlaybooks = pbRes.value;
    }
    if (telemRes.status === "fulfilled" && telemRes.value) {
      updateTelemetry(telemRes.value);
    }
    if (alertsRes.status === "fulfilled" && Array.isArray(alertsRes.value)) {
      alertsRes.value.forEach(addOrUpdateAlert);
    }
    if (statusRes.status === "fulfilled" && statusRes.value && statusRes.value.node_id) {
      document.getElementById("node-id").textContent = statusRes.value.node_id;
    }
  } catch (e) {
    console.warn("Serverless sync error:", e);
  }
}

function handleMessage(msg) {
  if (msg.type === "INIT_STATE") {
    currentTopology = msg.topology;
    currentPlaybooks = msg.playbooks || {};
    renderTopology(currentTopology);
    if (msg.telemetry) updateTelemetry(msg.telemetry);
    if (msg.alerts && msg.alerts.length > 0) {
      msg.alerts.forEach(addOrUpdateAlert);
    }
    if (msg.status && msg.status.node_id) {
      document.getElementById("node-id").textContent = msg.status.node_id;
    }
  } else if (msg.type === "OT_EVENT") {
    totalEvents++;
    document.getElementById("metric-events").textContent = totalEvents.toLocaleString();
    if (msg.plant_state) updateTelemetry(msg.plant_state);
    appendTerminalEvent(msg.data);
  } else if (msg.type === "OT_ALERT") {
    addOrUpdateAlert(msg.data);
  } else if (msg.type === "EMULATION_STARTED") {
    showEmulationProgress(msg.campaign);
  } else if (msg.type === "EMULATION_COMPLETED") {
    finishEmulationProgress(msg.result);
  }
}

function renderTopology(topology) {
  if (!topology || !topology.assets) return;

  const lvl35 = document.getElementById("purdue-level-35");
  const lvl2 = document.getElementById("purdue-level-2");
  const lvl1 = document.getElementById("purdue-level-1");
  const lvl0 = document.getElementById("purdue-level-0");

  lvl35.innerHTML = "";
  lvl2.innerHTML = "";
  lvl1.innerHTML = "";
  lvl0.innerHTML = "";

  Object.values(topology.assets).forEach((asset) => {
    const badge = document.createElement("div");
    badge.className = `asset-badge flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono text-xs cursor-pointer select-none ${getAssetStatusStyle(
      asset.status
    )}`;
    badge.id = `asset-node-${asset.asset_id}`;
    badge.innerHTML = `
      <span class="w-2 h-2 rounded-full ${getAssetDotColor(asset.status)}"></span>
      <div>
        <div class="font-bold">${asset.name}</div>
        <div class="text-[10px] text-slate-400">${asset.asset_id} • ${asset.ip_address}</div>
      </div>
    `;
    badge.onclick = () => showAssetModal(asset);

    if (asset.purdue_level >= 3) lvl35.appendChild(badge);
    else if (asset.purdue_level === 2) lvl2.appendChild(badge);
    else if (asset.purdue_level === 1) lvl1.appendChild(badge);
    else lvl0.appendChild(badge);
  });
}

function getAssetStatusStyle(status) {
  if (status === "COMPROMISED") return "border-rose-600 bg-rose-950/60 text-rose-200 alert-critical-pulse";
  if (status === "SUSPICIOUS") return "border-amber-600 bg-amber-950/60 text-amber-200";
  return "border-slate-800 bg-slate-900/90 text-slate-200 hover:border-cyan-700";
}

function getAssetDotColor(status) {
  if (status === "COMPROMISED") return "bg-rose-500 animate-ping";
  if (status === "SUSPICIOUS") return "bg-amber-400";
  return "bg-emerald-400";
}

function updateTelemetry(state) {
  // Tank level
  const tank = state.TANK1_LEVEL_PCT || 0;
  document.getElementById("telemetry-tank").textContent = tank.toFixed(1);
  const tankBar = document.getElementById("tank-bar");
  tankBar.style.width = `${Math.min(100, Math.max(0, tank))}%`;
  if (tank > 85 || tank < 25) tankBar.className = "bg-rose-500 h-1.5 rounded-full transition-all duration-300";
  else tankBar.className = "bg-cyan-500 h-1.5 rounded-full transition-all duration-300";

  // Chlorine residual
  const chlorine = state.CHLORINE_PPM || 0;
  const chlorineEl = document.getElementById("telemetry-chlorine");
  chlorineEl.textContent = chlorine.toFixed(2);
  const chlorineBar = document.getElementById("chlorine-bar");
  const chlorineDot = document.getElementById("chlorine-status-dot");
  const chlorineCard = document.getElementById("card-chlorine");

  // Percentage bar scaling (0 to 10 ppm max)
  chlorineBar.style.width = `${Math.min(100, (chlorine / 10.0) * 100)}%`;

  if (chlorine > 3.5 || chlorine < 0.8) {
    chlorineEl.className = "text-2xl font-bold font-mono text-rose-400";
    chlorineBar.className = "bg-rose-500 h-1.5 rounded-full transition-all duration-300";
    chlorineDot.className = "w-2 h-2 rounded-full bg-rose-500 animate-ping";
    chlorineCard.className = "bg-slate-950/80 border border-rose-600/80 rounded-lg p-3 flex flex-col justify-between alert-critical-pulse";
  } else {
    chlorineEl.className = "text-2xl font-bold font-mono text-emerald-400";
    chlorineBar.className = "bg-emerald-500 h-1.5 rounded-full transition-all duration-300";
    chlorineDot.className = "w-2 h-2 rounded-full bg-emerald-500";
    chlorineCard.className = "bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden";
  }

  // Pump & Pressure
  document.getElementById("telemetry-pump").textContent = (state.PUMP1_RPM || 0).toFixed(0);
  document.getElementById("telemetry-pressure").textContent = (state.LINE_PRESSURE_PSI || 0).toFixed(1);
}

function appendTerminalEvent(ev) {
  const feed = document.getElementById("terminal-feed");
  const line = document.createElement("div");
  const timeStr = new Date(ev.timestamp * 1000).toLocaleTimeString();
  const tagStr = ev.process_tag ? `[${ev.process_tag}=${ev.register_value}]` : `[FC ${ev.function_code}]`;
  const isSuspicious = ev.function_code === 8 || ev.function_code === 16 || ev.source_ip === "192.168.1.99";

  line.className = `leading-relaxed ${isSuspicious ? "text-amber-400 font-bold" : "text-slate-400"}`;
  line.textContent = `${timeStr} ${ev.source_ip} -> ${ev.dest_ip}:${ev.dest_port} ${ev.protocol} ${tagStr}`;

  feed.appendChild(line);
  if (feed.children.length > 80) feed.removeChild(feed.children[0]);
  feed.scrollTop = feed.scrollHeight;
}

function addOrUpdateAlert(alert) {
  alertsMap.set(alert.alert_id, alert);
  updateAlertsUI();

  // Mark affected asset in topology
  if (currentTopology && currentTopology.assets) {
    alert.assets_involved.forEach((ip) => {
      Object.values(currentTopology.assets).forEach((asset) => {
        if (asset.ip_address === ip && !alert.resolved) {
          asset.status = "COMPROMISED";
          const node = document.getElementById(`asset-node-${asset.asset_id}`);
          if (node) node.className = `asset-badge flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono text-xs cursor-pointer select-none ${getAssetStatusStyle("COMPROMISED")}`;
        }
      });
    });
  }
}

function updateAlertsUI() {
  const container = document.getElementById("alerts-container");
  const placeholder = document.getElementById("no-alerts-placeholder");
  const activeAlerts = Array.from(alertsMap.values()).filter((a) => !a.resolved);

  document.getElementById("metric-alerts").textContent = activeAlerts.length;
  document.getElementById("alert-counter-badge").textContent = `${activeAlerts.length} Active`;

  if (activeAlerts.length > 0) {
    document.getElementById("metric-alerts").className = "text-xl font-mono font-bold text-rose-400";
    document.getElementById("metric-alerts-icon").className = "w-6 h-6 text-rose-500 animate-pulse";
    if (placeholder) placeholder.style.display = "none";
  } else {
    document.getElementById("metric-alerts").className = "text-xl font-mono font-bold text-emerald-400";
    document.getElementById("metric-alerts-icon").className = "w-6 h-6 text-emerald-500/50";
    if (placeholder) placeholder.style.display = "block";
    return;
  }

  // Clear existing rendered cards (except placeholder)
  const cards = container.querySelectorAll(".alert-card");
  cards.forEach((c) => c.remove());

  activeAlerts.forEach((alert) => {
    const card = document.createElement("div");
    card.className = "alert-card bg-slate-950/90 border border-rose-800/80 rounded-xl p-4 shadow-lg space-y-3 font-mono";
    card.id = `card-${alert.alert_id}`;

    // Header
    const timeStr = new Date(alert.timestamp * 1000).toLocaleTimeString();
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 border border-rose-700 text-rose-300">${alert.severity}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 border border-purple-700 text-purple-300">ATT&CK: ${alert.mitre_ics_id}</span>
          <span class="text-[10px] text-slate-500">${timeStr}</span>
        </div>
        <span class="text-[10px] text-slate-400">${alert.detector}</span>
      </div>

      <div>
        <h4 class="font-bold text-sm text-rose-200">${alert.title}</h4>
        <p class="text-xs text-slate-400 font-sans mt-0.5">${alert.description}</p>
      </div>

      <!-- Happened-Before Causality Trace -->
      ${renderCausalityTrace(alert.causality_chain)}

      <!-- Operator Response Playbook -->
      ${renderPlaybookSection(alert)}

      <!-- Action Buttons -->
      <div class="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800 text-xs">
        <button onclick="acknowledgeAlert('${alert.alert_id}')" class="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
          ${alert.acknowledged ? "✓ Acknowledged" : "Acknowledge"}
        </button>
        <button onclick="resolveAlert('${alert.alert_id}')" class="px-3 py-1 rounded bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700 text-emerald-200">
          Resolve Incident
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  lucide.createIcons();
}

function renderCausalityTrace(chain) {
  if (!chain || chain.length === 0) return "";
  let stepsHtml = "";
  chain.forEach((ev, idx) => {
    const isArrow = idx > 0 ? `<div class="text-slate-600 font-bold text-xs self-center">→</div>` : "";
    stepsHtml += `
      ${isArrow}
      <div class="bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-300">
        <div class="text-cyan-400 font-bold">E${idx + 1}: ${ev.function_name || `FC ${ev.function_code}`}</div>
        <div class="text-slate-400">${ev.source_ip} &rarr; ${ev.dest_ip}</div>
        <div class="text-slate-500">${ev.process_tag ? `${ev.process_tag}=${ev.register_value}` : `Reg ${ev.register_address}`}</div>
      </div>
    `;
  });

  return `
    <div class="bg-black/60 border border-slate-800/80 rounded-lg p-2.5 space-y-1">
      <div class="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
        <i data-lucide="git-commit" class="w-3 h-3"></i> HBL Happened-Before Causality Trace
      </div>
      <div class="flex items-center gap-2 overflow-x-auto py-1">
        ${stepsHtml}
      </div>
    </div>
  `;
}

function renderPlaybookSection(alert) {
  const pb = alert.playbook;
  if (!pb) return "";

  let stepsHtml = "";
  pb.steps.forEach((step) => {
    const impactColor =
      step.impact === "ZERO_DISRUPTION"
        ? "text-emerald-400 bg-emerald-950 border-emerald-800"
        : "text-amber-400 bg-amber-950 border-amber-800";

    stepsHtml += `
      <div class="bg-slate-900/90 border border-slate-800 rounded p-2 text-xs space-y-1">
        <div class="flex items-center justify-between">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" ${step.completed ? "checked" : ""} onchange="toggleStep('${pb.playbook_id}', ${step.step_id}, this.checked)" class="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0">
            <span class="font-bold ${step.completed ? "line-through text-slate-500" : "text-slate-200"}">Step ${step.step_id}: ${step.title}</span>
          </label>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold border ${impactColor}">${step.impact.replace("_", " ")}</span>
        </div>
        <p class="text-[11px] text-slate-400 pl-5 font-sans">${step.description}</p>
        ${step.safety_warning ? `<div class="text-[10px] text-amber-300 pl-5 font-sans flex items-center gap-1"><i data-lucide="alert-circle" class="w-3 h-3"></i> <b>Warning:</b> ${step.safety_warning}</div>` : ""}
      </div>
    `;
  });

  return `
    <div class="bg-slate-950 border border-cyan-900/60 rounded-lg p-3 space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
          <i data-lucide="book-open" class="w-3.5 h-3.5"></i> Operator Response Playbook
        </span>
        <span class="text-[10px] text-slate-500 font-sans">${pb.non_disruption_guarantee}</span>
      </div>
      <div class="space-y-1.5">${stepsHtml}</div>
    </div>
  `;
}

async function acknowledgeAlert(alertId) {
  await fetch(`/api/alerts/${alertId}/ack`, { method: "POST" });
  if (alertsMap.has(alertId)) {
    alertsMap.get(alertId).acknowledged = true;
    updateAlertsUI();
  }
}

async function resolveAlert(alertId) {
  await fetch(`/api/alerts/${alertId}/resolve`, { method: "POST" });
  if (alertsMap.has(alertId)) {
    alertsMap.get(alertId).resolved = true;
    updateAlertsUI();
    // Refresh topology
    const topRes = await fetch("/api/topology");
    currentTopology = await topRes.json();
    renderTopology(currentTopology);
  }
}

async function toggleStep(playbookId, stepId, completed) {
  await fetch(`/api/playbooks/${playbookId}/step/${stepId}/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed, notes: "Operator confirmed" }),
  });
}

function initEventListeners() {
  document.getElementById("btn-clear-terminal").onclick = () => {
    document.getElementById("terminal-feed").innerHTML = "";
  };

  document.getElementById("btn-emulate-dosing").onclick = () => {
    triggerEmulation("chemical_overdose");
  };

  document.getElementById("btn-emulate-spoof").onclick = () => {
    triggerEmulation("false_data_injection");
  };

  document.getElementById("modal-close").onclick = () => {
    document.getElementById("asset-modal").classList.add("hidden");
  };
}

async function triggerEmulation(campaignType) {
  const prog = document.getElementById("emulation-progress");
  const log = document.getElementById("emulation-log");
  prog.classList.remove("hidden");
  log.innerHTML = `<div class="text-slate-500">// Dispatched Effects Language Scenario: ${campaignType}...</div>`;

  try {
    const res = await fetch("/api/emulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaign_type: campaignType }),
    });
    const data = await res.json();
    if (data.result && data.result.log) {
      data.result.log.forEach((l) => {
        const item = document.createElement("div");
        item.textContent = l;
        log.appendChild(item);
      });
    }
  } catch (err) {
    log.innerHTML += `<div class="text-rose-400">Error: ${err.message}</div>`;
  }
}

function showEmulationProgress(campaign) {
  const prog = document.getElementById("emulation-progress");
  prog.classList.remove("hidden");
  document.getElementById("emulation-status-text").textContent = `Emulating ${campaign.name}...`;
}

function finishEmulationProgress(result) {
  document.getElementById("emulation-status-text").textContent = `Emulation Completed (${result.steps_completed}/${result.steps_total} steps in ${result.duration_seconds.toFixed(1)}s)`;
}

function showAssetModal(asset) {
  document.getElementById("modal-asset-name").textContent = asset.name;
  document.getElementById("modal-asset-level").textContent = asset.level_label;
  document.getElementById("modal-asset-ip").textContent = asset.ip_address;
  document.getElementById("modal-asset-crit").textContent = asset.criticality;
  document.getElementById("modal-asset-protocols").textContent = asset.protocols.join(", ");
  const statusEl = document.getElementById("modal-asset-status");
  statusEl.textContent = asset.status;
  statusEl.className = `px-2 py-0.5 rounded text-[10px] font-bold ${
    asset.status === "COMPROMISED"
      ? "bg-rose-950 text-rose-300 border border-rose-700"
      : "bg-emerald-950 text-emerald-300 border border-emerald-700"
  }`;
  document.getElementById("asset-modal").classList.remove("hidden");
}
