// ==========================================================================
// MT-Lab: Industrial & OT Cybersecurity Engineering Catalog
// Tailored for Operational Technology (OT), ICS, SCADA, & Critical Infrastructure Engineers
// ==========================================================================

const PROJECTS_DATA = [
  {
    id: "cutlass-ot",
    title: "CUTLASS™",
    subtitle: "Cyber Unified Threat Level Automated Site Survey (ISA/IEC 62443-3-2 & 3-3)",
    featured: true,
    bannerImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80",
    posterGradient: "linear-gradient(135deg, #0b0f19 0%, #0071dc 45%, #f59e0b 100%)",
    category: "OT Cyber Risk & IEC 62443 Compliance",
    rows: ["Trending Originals", "IEC 62443 & Critical Infrastructure Defense", "Top 10 in Tech Today"],
    top10Rank: 1,
    rating: "OT-L3",
    matchScore: 100,
    year: "2026",
    duration: "Automated 62443 Site Survey",
    quality: "SL-T 2 / Deterministic + LLM",
    audio: "Armis / RUNE / Attack Graph",
    repoUrl: "https://github.com/Mthompson6782/MT-Lab/tree/main/cutlass-62443-platform",
    liveUrl: "cutlass-demo.html",
    executiveUrl: "cutlass-demo.html",
    vercelUrl: "",
    isDemo: true,
    synopsis: "An automated ISA/IEC 62443-3-2 cyber-physical risk assessment platform engineered for Enterprise Operational Technology. Ingests live telemetry from Armis, active CVEs from RUNE, targets SL-T 2 across all zones, and models multi-hop attack graphs with supply chain blast radius quantification.",
    longDescription: `CUTLASS™ (Cyber Unified Threat Level Automated Site Survey) is an enterprise-scale cyber-physical risk assessment platform engineered specifically for modern operational technology footprints across Distribution Centers, Fulfillment Centers, Micro-Fulfillment, and Retail Cold-Chain facilities.

Automating the rigorous ISA/IEC 62443-3-2 and 62443-3-3 standards, CUTLASS combines real-time passive network telemetry (Armis), internal vulnerability intelligence (RUNE), and corporate security policy into a continuous, audit-ready compliance engine.

Key Architecture & Capabilities:
• End-to-End IEC 62443-3-2 Automation: Scopes the System Under Consideration (SuC), partitions Purdue Model zones & conduits (L0-L5), and auto-generates Clause Z6 Cybersecurity Requirements Specifications (CRS).
• Live Armis & RUNE Telemetry Ingestion: Continuously monitors inter-zone conduits, active industrial protocols (CIP, Modbus-TCP, PROFINET, S7comm), and matches live vulnerability intelligence without intrusive plant scanning.
• Mandated SL-T 2 Benchmark: Rigorously calculates the Achieved Security Level Vector (SL-V = [AC, UC, SI, DC, RDF, TRE, RA]) across all 7 Foundational Requirements for every operational zone.
• Multi-Hop Attack Graphs & Blast Radius: Simulates lateral movement from IT/DMZ to physical PLCs and models real-world financial loss ($/hr) and supply chain ripple effects across critical distribution networks.
• AI Compensating Control Engine: Synthesizes OT-safe mitigations (DPI filtering, industrial switch ACLs) to maintain continuous operations without requiring high-risk mid-shift controller reboots.`,
    tags: [
      "CUTLASS",
      "IEC 62443-3-2",
      "IEC 62443-3-3",
      "Enterprise OT",
      "Armis Telemetry",
      "RUNE CVE Feed",
      "Purdue Model (L0-L5)",
      "Attack Graphs",
      "Blast Radius",
      "Python",
      "Tailwind CSS",
      "Chart.js"
    ],
    stats: { stars: 12, forks: 3, status: "Active OT Platform" },
    icon: "shield-alert"
  },
  {
    id: "halberd-ot",
    title: "HALBERD™",
    subtitle: "Happened-Before Analytics & Logic Baseline for Edge Response & Defense",
    featured: true,
    bannerImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    posterGradient: "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0d9488 100%)",
    category: "OT/ICS Edge Defense & Cyber-Physical Safety",
    rows: ["Trending Originals", "IEC 62443 & Critical Infrastructure Defense", "Top 10 in Tech Today"],
    top10Rank: 2,
    rating: "OT-L1/L2",
    matchScore: 99,
    year: "2026",
    duration: "Edge Security Suite",
    quality: "Low-SWaP OT / Deterministic",
    audio: "Modbus / CIP / Causal Logic",
    repoUrl: "https://github.com/Mthompson6782/MT-Lab/tree/main/halberd-ot",
    liveUrl: "halberd-demo.html",
    executiveUrl: "halberd-executive.html",
    vercelUrl: "",
    isDemo: true,
    synopsis: "An open-source, low-SWaP OT/ICS cybersecurity platform engineered for edge deployment at Purdue Levels 1 & 2. Utilizes Lamport Happened-Before causal tracking to detect physics-violating commands, rogue PLC logic, and unauthorized setpoint overrides with zero false trips.",
    longDescription: `HALBERD™ is an edge-native OT/ICS cybersecurity engine built for critical cyber-physical systems including municipal water utilities, power generation, chemical distribution, and advanced manufacturing.

Operating directly alongside industrial controllers (PLCs, RTUs, DCS) at Purdue Model Levels 1 and 2, HALBERD continuously enforces causal execution bounds through mathematically rigorous Happened-Before relations (Lamport clocks).

Key Architecture & Capabilities:
• Causal Happened-Before Analysis: Reconstructs true chronological causality across distributed industrial controllers, instantly detecting out-of-order manipulation, packet replay, and unauthorized command injections.
• Industrial Protocol Deep Inspection: Passively inspects Modbus-TCP function codes, CIP object services, and PROFINET frames without injecting latency or inducing jitter into real-time control loops.
• Cyber-Physical Boundary Enforcement: Validates engineering process boundaries (tank levels, PSI limits, chemical dosing ppm) against physical plant invariant models, alerting before catastrophic equipment damage occurs.
• Zero-Trip Safe Failover: Engineered with deterministic, air-gappable architecture that will never trip a live operational process unexpectedly.
• Interactive Technical Console & Executive Story: Includes real-time operational simulation dashboards and C-Suite executive briefing walkthroughs.`,
    tags: [
      "HALBERD",
      "OT Cybersecurity",
      "ICS/SCADA",
      "Happened-Before Analytics",
      "Purdue Level 1-2",
      "Modbus-TCP",
      "CIP Deep Inspection",
      "Zero-Trip Safety",
      "Critical Infrastructure",
      "Air-Gapped",
      "Python"
    ],
    stats: { stars: 15, forks: 4, status: "Active Edge System" },
    icon: "shield-alert"
  }
];

const USER_PROFILES = [
  {
    id: "ot-engineer",
    name: "OT / ICS Cyber Engineer",
    avatar: "🛡️",
    color: "#0071dc",
    tagline: "Inspecting PLC/SCADA edge defense, protocol DPI & threat detection"
  },
  {
    id: "controls-engineer",
    name: "Automation & Controls Lead",
    avatar: "⚡",
    color: "#10b981",
    tagline: "Reviewing Purdue model zones, conduits, DCS safety & zero-trip operations"
  },
  {
    id: "ciso-grc",
    name: "OT GRC & Compliance Auditor",
    avatar: "📋",
    color: "#f59e0b",
    tagline: "Validating ISA/IEC 62443-3-2, NIST SP 800-82 & CISA CPG compliance"
  },
  {
    id: "architect",
    name: "Critical Infrastructure Architect",
    avatar: "🏛️",
    color: "#8b5cf6",
    tagline: "Analyzing multi-hop attack graphs, blast radius & enterprise defense"
  }
];
