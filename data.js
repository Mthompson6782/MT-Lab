// MT Labs Project Catalog Data
// NOTE: This file was restored after a bad overwrite. Full original catalog
// should be recovered from commit 6f5e51bb5460834fa140c4b079f22d49545778bc if any fields look short.

const PROJECTS_DATA = [
  {
    id: "cutlass-ot",

    title: "CUTLASS™",

    subtitle: "Cyber Unified Threat Level Automated Site Survey",

    featured: true,

    bannerImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80",

    posterGradient: "linear-gradient(135deg, #0b0f19 0%, #0071dc 45%, #f59e0b 100%)",

    category: "OT Cybersecurity & Critical Infrastructure",

    rows: ["Trending Originals", "Web Applications & Full Stack", "Top 10 in Tech Today"],

    top10Rank: 1,

    rating: "TV-MA",

    matchScore: 99,

    year: "2026",

    duration: "Automated 62443 Site Survey",

    quality: "SL-T 2 / 4K",

    audio: "Armis / RUNE / AI",

    repoUrl: "https://github.com/Mthompson6782/MT-Lab/tree/main/walmart-62443-platform",

    liveUrl: "walmart-62443-platform/ui/index.html",

    executiveUrl: "walmart-62443-platform/reports/iec62443_3_2_audit_report.md",

    vercelUrl: "",

    isDemo: true,

    synopsis: "An automated ISA/IEC 62443-3-2 cyber-physical risk assessment platform engineered for Walmart Operational Technology. Ingests live telemetry from Armis, active CVEs from RUNE, targets SL-T 2 across all zones, and models multi-hop attack graphs with supply chain blast radius quantification.",

    longDescription: `CUTLASS™ (Cyber Unified Threat Level Automated Site Survey) is an enterprise-scale cyber-physical risk assessment platform engineered specifically for Walmart's operational technology footprint across Distribution Centers, Fulfillment Centers, Micro-Fulfillment, and Retail Cold-Chain facilities.



Operating alongside HALBERD and SHANK as the crown jewel of the Blade Fleet, CUTLASS automates the rigorous ISA/IEC 62443-3-2 and 62443-3-3 standards by combining real-time passive network telemetry (Armis), internal vulnerability intelligence (RUNE), and corporate security policy into a continuous, audit-ready compliance engine.



Key Architecture & Capabilities:

• End-to-End IEC 62443-3-2 Automation: Scopes the System Under Consideration (SuC), partitions Purdue Model zones & conduits (L0-L5), and auto-generates Clause Z6 Cybersecurity Requirements Specifications (CRS).

• Live Armis & RUNE Telemetry Ingestion: Continuously monitors inter-zone conduits, active industrial protocols (CIP, Modbus-TCP, PROFINET, S7comm), and matches live vulnerability intelligence without intrusive plant scanning.

• Mandated SL-T 2 Benchmark: Rigorously calculates the Achieved Security Level Vector (SL-V = [AC, UC, SI, DC, RDF, TRE, RA]) across all 7 Foundational Requirements for every operational zone.

• Multi-Hop Attack Graphs & Blast Radius: Simulates lateral movement from IT/DMZ to physical PLCs and models real-world financial loss ($/hr) and supply chain ripple effects across hundreds of Walmart Supercenters.

• AI Compensating Control Engine: Synthesizes OT-safe mitigations (DPI filtering, industrial switch ACLs) to maintain continuous operations without requiring high-risk mid-shift controller reboots.`,

    tags: ["CUTLASS", "IEC 62443-3-2", "Walmart OT", "Armis", "RUNE CVE", "Purdue Model", "Attack Graphs", "Blast Radius", "Python", "Tailwind CSS", "Chart.js", "Blade Fleet"],

    stats: { stars: 1, forks: 0, status: "Active System" },

    icon: "shield-alert"

  },

  {

    id: "walmart-resilience",

    title: "Walmart Resilience Dashboard",

    subtitle: "Engineered Controls & Framework Explorer",

    featured: false,

    bannerImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",

    posterGradient: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0072ce 100%)",

    category: "Security & Full Stack",

    rows: ["Security & Full Stack", "Top 10 in Tech Today"],

    top10Rank: 5,

    rating: "TV-14",

    matchScore: 98,

    year: "2026",

    duration: "Dashboard",

    quality: "Interactive",

    audio: "Data Viz",

    repoUrl: "https://github.com/Mthompson6782/MT-Lab/tree/main/walmart-dashboard",

    liveUrl: "walmart-dashboard/walmart_dashboard.html",

    executiveUrl: "",

    vercelUrl: "",

    isDemo: true,

    synopsis: "A specialized interactive dashboard customized for Walmart to explore cyber-physical engineered controls, taxonomy, and the NIST resilience framework.",

    longDescription: `This standalone, browser-based dashboard provides an interactive way to navigate Walmart's infrastructure taxonomy and cyber-physical security controls.



Key Capabilities:

• Customized Taxonomy Browser: Drill down through Division, Facility, Department, System, and Component levels.

• NIST CSF Alignment: Controls are tagged and visualized by core functions (Identify, Protect, Detect, Respond, Recover).

• Recursive Analytics: Live charts showing control distribution and resilience framework coverage.

• Self-Contained Architecture: Operates entirely in the browser with no backend infrastructure required.



Originally adapted from the DHS/CIE Engineered Controls Explorer, tailored for Walmart's operational context.`,

    tags: ["Resilience", "Dashboard", "Cyber-Physical", "Walmart", "NIST CSF", "React"],

    stats: { stars: 1, forks: 0, status: "Active System" },

    icon: "shield-alert"

  },

  {
    id: "halberd-ot",
    title: "HALBERD",
    subtitle: "Happened-Before Analytics & Logic Baseline for Edge Response & Defense",
    featured: true,
    bannerImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    posterGradient: "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0d9488 100%)",
    category: "OT Cybersecurity & Critical Infrastructure",
    rows: ["Trending Originals", "Security & Full Stack", "Top 10 in Tech Today"],
    top10Rank: 1,
    rating: "TV-MA",
    matchScore: 99,
    year: "2026",
    duration: "Edge Security Suite",
    quality: "Low-SWaP OT / 4K",
    audio: "Modbus / HBL / EL",
    repoUrl: "https://github.com/Mthompson6782/MT-Lab/tree/main/halberd-ot",
    liveUrl: "halberd-demo.html",
    executiveUrl: "halberd-executive.html",
    vercelUrl: "https://halberd-ot.vercel.app",
    isDemo: true,
    synopsis: "An open-source, low-SWaP OT/ICS cybersecurity platform.",
    longDescription: `HALBERD is a low-SWaP OT cybersecurity platform for ICS/SCADA edge environments.`,
    tags: ["OT Cybersecurity", "HALBERD", "ICS/SCADA", "Python"],
    stats: { stars: 1, forks: 0, status: "Active System" },
    icon: "shield-alert"
  },
  {
    id: "shank-ot",
    title: "SHANK",
    subtitle: "SCADA & Hardware Asset Network Knowledge",
    featured: true,
    bannerImage: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=1600&q=80",
    posterGradient: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #dc2626 100%)",
    category: "OT Cybersecurity & Asset Intelligence",
    rows: ["Trending Originals", "Security & Full Stack", "Top 10 in Tech Today"],
    top10Rank: 2,
    rating: "TV-MA",
    matchScore: 98,
    year: "2026",
    duration: "Asset Intelligence",
    quality: "Deep Inspection",
    audio: "Passive Sniffer",
    repoUrl: "https://github.com/Mthompson6782/shank-ot",
    liveUrl: null,
    synopsis: "OT asset intelligence platform. Part of the Blade Fleet.",
    longDescription: `SHANK delivers non-intrusive OT asset intelligence alongside HALBERD.`,
    tags: ["OT Cybersecurity", "Asset Management", "Blade Fleet"],
    stats: { stars: 1, forks: 0, status: "Active System" },
    icon: "database"
  },
  {
    id: "ara-memory",
    title: "Ara Memory",
    subtitle: "Persistent Operating Manual for Ara",
    featured: true,
    bannerImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80",
    posterGradient: "linear-gradient(135deg, #0b1020 0%, #312e81 50%, #c026d3 100%)",
    category: "Knowledge & Architecture",
    rows: ["Knowledge & Systems Vault", "Trending Originals"],
    top10Rank: 6,
    rating: "TV-G",
    matchScore: 100,
    year: "2026",
    duration: "Living Manual",
    quality: "Private Source of Truth",
    audio: "Voice + Text",
    repoUrl: "https://github.com/Mthompson6782/ara-memory",
    liveUrl: "https://github.com/Mthompson6782/ara-memory/blob/main/ARA.md",
    executiveUrl: "",
    vercelUrl: "",
    isDemo: false,
    synopsis: "Private persistent memory and operating manual for Ara. Source of truth: ara-memory / ARA.md.",
    longDescription: `Ara Memory is the durable context layer for Ara.\n\nSource of truth (private): https://github.com/Mthompson6782/ara-memory\nCanonical file: ARA.md\nDrive mirror: https://docs.google.com/document/d/1L5jtS-HCZFEXGNH_DoZhojAp6X7zuzlYMbLAwRzYV0Y/edit\nMT-Lab card: ARA_MEMORY.md`,
    tags: ["Ara", "Memory", "Grok", "Operating Manual", "Private"],
    stats: { stars: 0, forks: 0, status: "Private Source of Truth" },
    icon: "brain"
  },
  {
    id: "operation-leo-lockdown",
    title: "Operation Leo Lockdown",
    subtitle: "Cloud Server & Parental Cyber Safety Hub",
    featured: true,
    bannerImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
    posterGradient: "linear-gradient(135deg, #111827 0%, #7f1d1d 50%, #991b1b 100%)",
    category: "Security & Full Stack",
    rows: ["Trending Originals", "Web Applications & Full Stack", "Top 10 in Tech Today"],
    top10Rank: 1,
    rating: "TV-MA",
    matchScore: 99,
    year: "2026",
    duration: "Production Server",
    quality: "4K Ultra HD",
    audio: "5.1 Surround",
    repoUrl: "https://github.com/Mthompson6782/operation-leo-lockdown",
    liveUrl: "https://operation-leo-lockdown.onrender.com",
    synopsis: "Parental cyber-safety hub with Discord archive threat scanning.",
    longDescription: `Operation Leo Lockdown is a Node.js parental cyber-safety platform.`,
    tags: ["Node.js", "Express", "Cyber Safety"],
    stats: { stars: 1, forks: 0, status: "Active System" },
    icon: "shield-alert"
  },
  {
    id: "autobiography-improbability-of-me",
    title: "The Improbability of Me",
    subtitle: "A Memoir by Michael Thompson",
    featured: true,
    bannerImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=80",
    posterGradient: "linear-gradient(135deg, #18181b 0%, #78350f 50%, #b45309 100%)",
    category: "Memoir & Narrative",
    rows: ["Trending Originals", "Top 10 in Tech Today"],
    top10Rank: 3,
    rating: "TV-MA",
    matchScore: 100,
    year: "2026",
    duration: "8 Parts + Epilogue",
    quality: "Literary Edition",
    audio: "Narrative Voice",
    repoUrl: "https://github.com/Mthompson6782/Autobiography",
    liveUrl: "https://mthompson6782.github.io/Autobiography/",
    synopsis: "Memoir from Baltimore streets to nuclear control rooms.",
    longDescription: `Autobiography of Michael Thompson.`,
    tags: ["Memoir", "Autobiography"],
    stats: { stars: 1, forks: 0, status: "Literary Work" },
    icon: "book-open"
  },
  {
    id: "mt-lab-core",
    title: "MT-Lab (The Core Sandbox)",
    subtitle: "Michael Thompson's R&D Innovation Studio",
    featured: false,
    bannerImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    posterGradient: "linear-gradient(135deg, #450a0a 0%, #b91c1c 50%, #e50914 100%)",
    category: "Innovation Studio",
    rows: ["Trending Originals", "Web Applications & Full Stack"],
    top10Rank: null,
    rating: "TV-MA",
    matchScore: 99,
    year: "2026",
    duration: "Living Laboratory",
    quality: "4K Netflix Edition",
    audio: "Interactive UI",
    repoUrl: "https://github.com/Mthompson6782/MT-Lab",
    liveUrl: "https://mthompson6782.github.io/MT-Lab/",
    synopsis: "The heartbeat repository of MT Labs.",
    longDescription: `MT-Lab is the primary open-source laboratory and streaming portfolio.`,
    tags: ["Interactive Web", "Netflix UI", "Open Source"],
    stats: { stars: 1, forks: 0, status: "Active Hub" },
    icon: "flask"
  }
];

const USER_PROFILES = [
  { id: "recruiter", name: "Recruiter / Talent Lead", avatar: "\uD83D\uDC54", color: "#E50914", tagline: "Exploring talent, leadership & full-stack expertise" },
  { id: "architect", name: "Senior Architect", avatar: "\uD83D\uDCBB", color: "#0284c7", tagline: "Inspecting systems design, OT security & code quality" },
  { id: "engineer", name: "Fellow Engineer", avatar: "\u26A1", color: "#10b981", tagline: "Browsing repositories, tech stacks & experiments" },
  { id: "executive", name: "Executive / C-Suite", avatar: "\uD83C\uDFAF", color: "#f59e0b", tagline: "Reviewing strategic vision, leadership & publications" }
];
