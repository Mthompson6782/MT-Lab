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
    audio: "Armis / CVE Intel / Attack Graph",
    repoUrl: "https://github.com/Mthompson6782/MT-Lab/tree/main/cutlass-62443-platform",
    liveUrl: "cutlass-demo.html",
    executiveUrl: "cutlass-demo.html",
    vercelUrl: "",
    isDemo: true,
    synopsis: "An automated ISA/IEC 62443-3-2 cyber-physical risk assessment platform engineered for Enterprise Operational Technology. Ingests live telemetry from Armis, active CVE intelligence, targets SL-T 2 across all zones, and models multi-hop attack graphs with supply chain blast radius quantification.",
    longDescription: `CUTLASS™ (Cyber Unified Threat Level Automated Site Survey) is an enterprise-scale cyber-physical risk assessment platform engineered specifically for modern operational technology footprints across Distribution Centers, Fulfillment Centers, Micro-Fulfillment, and Retail Cold-Chain facilities.

Automating the rigorous ISA/IEC 62443-3-2 and 62443-3-3 standards, CUTLASS combines real-time passive network telemetry (Armis), vulnerability intelligence feeds, and corporate security policy into a continuous, audit-ready compliance engine.

Key Architecture & Capabilities:
• End-to-End IEC 62443-3-2 Automation: Scopes the System Under Consideration (SuC), partitions Purdue Model zones & conduits (L0-L5), and auto-generates Clause Z6 Cybersecurity Requirements Specifications (CRS).
• Live Armis & CVE Telemetry Ingestion: Continuously monitors inter-zone conduits, active industrial protocols (CIP, Modbus-TCP, PROFINET, S7comm), and matches live vulnerability intelligence without intrusive plant scanning.
• Mandated SL-T 2 Benchmark: Rigorously calculates the Achieved Security Level Vector (SL-V = [AC, UC, SI, DC, RDF, TRE, RA]) across all 7 Foundational Requirements for every operational zone.
• Multi-Hop Attack Graphs & Blast Radius: Simulates lateral movement from IT/DMZ to physical PLCs and models real-world financial loss ($/hr) and supply chain ripple effects across critical distribution networks.
• AI Compensating Control Engine: Synthesizes OT-safe mitigations (DPI filtering, industrial switch ACLs) to maintain continuous operations without requiring high-risk mid-shift controller reboots.`,
    tags: [
      "CUTLASS",
      "IEC 62443-3-2",
      "IEC 62443-3-3",
      "Enterprise OT",
      "Armis Telemetry",
      "CVE Intel Feed",
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
  },
  {
    id: "slice-ot",
    title: "SLiCE™ — Structured Likelihood & Confidence Evaluation",
    subtitle: "ICD 203 Risk & Analytic Confidence Engine for OT/ICS Cybersecurity",
    featured: false,
    posterGradient: "linear-gradient(135deg, #064e3b 0%, #0f172a 55%, #020617 100%)",
    gradientBg: "linear-gradient(135deg, #064e3b 0%, #0f172a 55%, #020617 100%)",
    accentColor: "#10b981",
    category: "OT Cybersecurity",
    rows: ["Trending Originals", "IEC 62443 & Critical Infrastructure Defense", "Top 10 in Tech Today"],
    top10Rank: 4,
    rating: "ICD 203",
    matchScore: 98,
    year: 2026,
    duration: "Interactive Web Console",
    quality: "AIChE GCPS 2026",
    audio: "L : C : I Triplet",
    repoUrl: "https://github.com/Mthompson6782/MT-Lab/tree/main/slice-ot",
    liveUrl: "slice-demo.html",
    docsUrl: "https://github.com/Mthompson6782/MT-Lab/blob/main/slice-ot/docs/METHODOLOGY.md",
    isDemo: true,
    thumbnailIcon: "compass",
    icon: "compass",
    synopsis: "Replaces single-point OT risk guesswork with an Intelligence Community Directive (ICD 203) inspired Likelihood : Confidence : Impact (L:C:I) framework that separates threat likelihood from evidentiary certainty.",
    longDescription: `Authored for the AIChE 2026 Spring Meeting & 22nd Global Congress on Process Safety (GCPS), SLiCE adapts Intelligence Community Directive (ICD 203) Analytic Tradecraft Standards to Industrial Control Systems (ICS) and OT cybersecurity risk assessments.

KEY CAPABILITIES:
• Weighted Likelihood Triplet (L1–L5): Evaluates Attack Surface & Accessibility (40%), Exploitable Conditions (35%), and Historical & Threat Activity (25%) with strict score boundaries.
• Four-Dimension Confidence Engine (C1–C4): Assesses Control Validation, Asset Inventory, Network Telemetry, and Analytic Corroboration without ever mathematically collapsing Confidence into Likelihood.
• Deterministic Integrity Safeguards: Enforces the Single-Source Override (C4=Low caps overall Confidence at Low), Historical Linkage Rule (H ≤ 2 caps Confidence at Moderate), and 10-Bias Analytic Catalog Gate.
• Worst-Case Consequence Scoring (I1–I5): Scores Safety & HSE, Environmental Release, Operational Downtime, Financial Loss, and Regulatory/Compliance impact using max() with documented cascade & degraded-response rules.
• 3×3 Decision Matrix & Report Export: Separates engineering remediation (MITIGATE) from targeted reconnaissance (CHARACTERIZE / INVESTIGATE), exporting reproducible Markdown and JSON artifacts.`,
    techStack: ["React 19", "TypeScript", "Tailwind CSS", "Vitest", "ICD 203", "IEC 62443-3-2", "NIST SP 800-82"],
    tags: [
      "SLiCE",
      "ICD 203",
      "OT Risk Assessment",
      "Analytic Confidence",
      "IEC 62443-3-2",
      "NIST SP 800-82",
      "TSA SD02",
      "Decision Matrix",
      "Bias Mitigation",
      "TypeScript"
    ],
    metrics: [
      { label: "Output Format", value: "L[1–5] : C-[Low/Mod/High] : I[1–5]" },
      { label: "Safeguards", value: "Single-Source, Historical Linkage, 10-Bias Gate" },
      { label: "Publication", value: "AIChE 2026 GCPS (Houston, TX)" }
    ],
    architectureSummary: "Pure TypeScript SLiCE calculation engine paired with a dark-mode React interactive console featuring 5 OT reference scenarios, bias checklist enforcement, 3×3 L×C Decision Matrix, and Markdown/JSON export.",
    keyHighlights: [
      "Weighted Likelihood L = 0.40A + 0.35E + 0.25H mapped to L1–L5 tiers",
      "Independent Confidence dimensions (C1–C4) with Single-Source & Historical Linkage overrides",
      "Mandatory 10-Bias Analytic Catalog Gate capping unreviewed assessments at Moderate Confidence",
      "Max-consequence Impact engine (I1–I5) plus 3×3 L×C Decision Matrix exposing the Bottom-Right Paradox ('we don't know ≠ we're safe')",
      "100% client-side static architecture deployable air-gapped or via GitHub Pages"
    ],
    links: {
      liveUrl: "slice-demo.html",
      repoUrl: "https://github.com/Mthompson6782/MT-Lab/tree/main/slice-ot",
      docsUrl: "https://github.com/Mthompson6782/MT-Lab/blob/main/slice-ot/docs/METHODOLOGY.md"
    },
    stats: { stars: 12, forks: 3, status: "Active Framework" }
  },
  {
    id: "standards-meet-steel",
    title: "Standards Meet Steel",
    subtitle: "U of A CyberHogs Talk · 43-Slide Interactive Deck + 3D WebGL Sim",
    category: "OT Cybersecurity",
    rows: ["Trending Originals", "IEC 62443 & Critical Infrastructure Defense", "Top 10 in Tech Today"],
    top10Rank: 3,
    matchScore: 99,
    rating: "OT-EXEC",
    year: 2026,
    duration: "43-slide talk + 3D Sim",
    featured: false,
    accentColor: "#f59e0b",
    gradientBg: "linear-gradient(135deg, #451a03 0%, #78350f 50%, #090d16 100%)",
    thumbnailIcon: "shield-alert",
    heroVisualType: "iec-shield",
    synopsis: "Interactive 43-slide executive talk for the University of Arkansas CyberHogs Speaker Series on making IEC 62443, NIST SP 800-82 Rev. 4, the Zombie Purdue Model, NIST OSCAL, and AI-tailored standards survive contact with plant-floor steel.",
    longDescription: "Built for the University of Arkansas CyberHogs Speaker Series (Nov 18, 2026), 'Standards Meet Steel' leads upfront with an honest field breakdown of OT cybersecurity standards: IEC 62443, NIST SP 800-82 Rev. 4 (Initial Public Draft aligned with CSF 2.0 Govern & OT Zero Trust), the Zombie Purdue Model, an embedded 3D WebGL Planetary Defense simulation ('Patching Is for Suckers'), the MT Floor (SL 2 -> SL 3 -> SL 2+ tailored engineering judgment), Cyber-Informed Engineering (FSE with networks and switches), NIST OSCAL (Standards as Code), and using AI to generate one-page plant-floor commandments.",
    techStack: ["Interactive HTML Deck", "Three.js 3D WebGL", "IEC 62443", "NIST 800-82 Rev 4", "NIST OSCAL", "CIE / FSE"],
    tags: ["Speaking", "OT Security", "IEC 62443", "NIST 800-82 Rev 4", "OSCAL", "3D Simulation"],
    metrics: [
      { label: "Format", value: "43-Slide Interactive HTML + 3D Sim" },
      { label: "Core Thesis", value: "Standards Never Replace Engineering Judgment" },
      { label: "Venue", value: "University of Arkansas · Nov 18, 2026" }
    ],
    architectureSummary: "Single-file zero-dependency HTML/CSS/SVG presentation deck with an embedded Three.js 3D WebGL Planetary Defense simulation (Slide 7), interactive step-reveal diagrams, speaker notes drawer (N), and slide overview grid (G).",
    keyHighlights: [
      "Upfront deep dive on IEC 62443, NIST SP 800-82 Rev. 4 Draft, NERC CIP, and the Zombie Purdue Model",
      "Embedded 3D WebGL 'Patching Is for Suckers' Planetary Defense simulation contrasting 100% laser patching against segmentation shielding",
      "The MT Floor (SL 2 baseline -> SL 3 -> SL 2+ tailored) & CIE ('FSE with networks and switches' bounded by mechanical relief)",
      "NIST OSCAL (Standards as Code) & AI-driven custom organizational standards ('One-Page Commandments')",
      "Three anonymized field cases (Water Utility, Brownfield Pharma, Green Energy Co-Op) + 60-Second Vendor Bullshit Detector"
    ],
    links: {
      liveUrl: "decks/standards-meet-steel.html",
      repoUrl: "https://github.com/Mthompson6782/MT-Lab/blob/main/decks/standards-meet-steel.html",
      docsUrl: "OT-with-MT/index.html"
    }
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
