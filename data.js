// MT-FLIX Project Catalog Data
const PROJECTS_DATA = [
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
    liveUrl: null,
    synopsis: "A secure, collaborative Node.js web application designed for parents (Dad & Cindy) to manage digital safety audits, track real-time account remediation, and automatically scan exported Discord chat archives for cyber threats and grooming indicators.",
    longDescription: `Operation Leo Lockdown was engineered from the ground up to protect adolescent digital safety through rigorous automated analysis and parental visibility.
    
Key Architecture & Capabilities:
• Real-time Account Remediation: Interactive parent checklist tracking MFA, privacy settings, and access revokals.
• Discord Threat Intelligence Engine: Upload and parse large JSON chat exports, automatically scanning messages with keyword heuristical classifiers and sentiment indicators.
• Dual Parent Role Authentication: Distinct credential profiles for Mom & Dad with session security.
• Audit Logging: Complete activity tracking to ensure zero gaps in digital security posture.`,
    tags: ["Node.js", "Express", "Cyber Safety", "Threat Analysis", "Discord Audit", "Security Operations"],
    stats: { stars: 1, forks: 0, status: "Active System" },
    icon: "shield-alert"
  },
  {
    id: "cindys-homeschool-planner",
    title: "Cindy's Homeschool Planner",
    subtitle: "Modern Curriculum & Scheduling Platform",
    featured: true,
    bannerImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1600&q=80",
    posterGradient: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)",
    category: "Modern Web Apps",
    rows: ["Trending Originals", "Web Applications & Full Stack", "Top 10 in Tech Today"],
    top10Rank: 2,
    rating: "TV-PG",
    matchScore: 98,
    year: "2026",
    duration: "Web Suite",
    quality: "HD",
    audio: "Stereo",
    repoUrl: "https://github.com/Mthompson6782/cindys-homeschool-planner",
    liveUrl: null,
    synopsis: "A Next.js educational orchestration platform engineered for intuitive curriculum planning, multi-child course tracking, calendar scheduling, and academic progress visualization.",
    longDescription: `Cindy's Homeschool Planner streamlines homeschool management by combining fluid user experience with high-performance modern web architecture.
    
Key Architecture & Capabilities:
• Next.js App Router Architecture: Server and client components built with React 19 and TypeScript.
• Dynamic Lesson Scheduler: Drag-and-drop curriculum planning with automated holiday and semester pacing.
• Progress & Milestone Metrics: Visual completion gauges, attendance logs, and subject competency tracking.
• Responsive Typography: Optimized with Vercel Geist typography and mobile-first Tailwind design.`,
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Education Tech", "Vercel"],
    stats: { stars: 1, forks: 0, status: "Active Project" },
    icon: "calendar-check"
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
    liveUrl: null,
    synopsis: "The Resume and The Rap Sheet. The Safety Mother and the Kingpin. The Engineer and the Survivor. The autobiographical story of the man who lived all of those lives simultaneously — from Baltimore streets to nuclear control rooms.",
    longDescription: `This autobiography traces the arc of Michael Thompson's life through a series of radical dualities:
the Baltimore streets and the nuclear control room, the felony record and the functional safety credential, the cancer ward and the C-Suite. It is the story of a man who should not exist, statistically speaking — and yet here he is.

Structure:
• Part I: The Code of the Corner (Baltimore Beginnings)
• Part II: The Fracture & The Fall (Shadows & Consequences)
• Part III: Iron & Ink (The University Behind Bars)
• Part IV: Control Rods & Criticality (Nuclear Control Rooms)
• Part V: The Safety Paradox (Industrial Functional Safety)
• Part VI: Diagnosis & Defiance (The Cancer Ward Battle)
• Part VII: Executive Engineering (C-Suite Architecture)
• Part VIII & Epilogue: The Improbability of Me`,
    tags: ["Memoir", "Autobiography", "Literature", "Life Story", "Resilience", "Nuclear Safety"],
    stats: { stars: 1, forks: 0, status: "Literary Work" },
    icon: "book-open"
  },
  {
    id: "cyber-voice-cloner",
    title: "Cyber Voice Cloner & Avatar Studio",
    subtitle: "AI Speech Synthesis & Real-Time Avatar Engine",
    featured: false,
    bannerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80",
    posterGradient: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #6d28d9 100%)",
    category: "AI & Audio Engineering",
    rows: ["AI & Deep Tech Originals", "Top 10 in Tech Today"],
    top10Rank: 4,
    rating: "TV-14",
    matchScore: 97,
    year: "2026",
    duration: "AI Studio",
    quality: "Studio Quality",
    audio: "Dolby Atmos DSP",
    repoUrl: "https://github.com/Mthompson6782/MT-Lab",
    liveUrl: null,
    synopsis: "An end-to-end synthetic voice cloning and portrait alignment engine. Generates realistic AI-driven voice cloning with facial expression synchronization and real-time audio playback.",
    longDescription: `Cyber Voice Cloner & Avatar Studio couples neural voice cloning pipelines with facial landmark alignment to deliver interactive synthetic audio and avatar media.
    
Key Architecture & Capabilities:
• Voice Engine: Mel-spectrogram synthesis and voice acoustic embedding extraction.
• Avatar Engine: Computer vision portrait alignment and facial pose normalization.
• Studio Web Dashboard: Real-time generation studio with batch testing and parameter tuning.
• Python & PyTorch Backend: Highly optimized inference loop with hardware acceleration.`,
    tags: ["Python", "PyTorch", "Voice Cloning", "Audio DSP", "Computer Vision", "Avatar Engine"],
    stats: { stars: 1, forks: 0, status: "Active R&D" },
    icon: "mic"
  },
  {
    id: "graph-agent-engine",
    title: "Graph Agent Engine",
    subtitle: "Autonomous Multi-Agent Directed Graph Framework",
    featured: false,
    bannerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80",
    posterGradient: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)",
    category: "AI & Autonomous Agents",
    rows: ["AI & Deep Tech Originals", "Top 10 in Tech Today"],
    top10Rank: 5,
    rating: "TV-14",
    matchScore: 96,
    year: "2026",
    duration: "Agent Framework",
    quality: "Ultra HD",
    audio: "Event Stream",
    repoUrl: "https://github.com/Mthompson6782/MT-Lab",
    liveUrl: null,
    synopsis: "A directed acyclic graph (DAG) multi-agent orchestrator. Enables intelligent agents to coordinate, decompose high-ambiguity objectives, self-correct errors, and execute complex workflows.",
    longDescription: `The Graph Agent Engine reimagines autonomous workflows by treating task planning as directed acyclic graph traversal with dynamic node evaluation and branch resolution.
    
Key Architecture & Capabilities:
• DAG Execution Pipeline: Dynamic state passing across heterogeneous agent nodes.
• Autonomous Error Recovery: Fallback node resolution when API or tool execution errors occur.
• Type-Safe Agent Contracts: Written in TypeScript for enterprise-grade predictability.
• High Concurrency: Asynchronous parallel dispatch of independent sub-graph branches.`,
    tags: ["TypeScript", "Multi-Agent AI", "Graph Theory", "DAG Engine", "Autonomous Systems"],
    stats: { stars: 1, forks: 0, status: "Core Engine" },
    icon: "network"
  },
  {
    id: "mt-second-brain",
    title: "MT Second Brain (3,200+ Notes)",
    subtitle: "Interconnected Zettelkasten Knowledge Vault",
    featured: false,
    bannerImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
    posterGradient: "linear-gradient(135deg, #172554 0%, #1e40af 50%, #2563eb 100%)",
    category: "Knowledge & Architecture",
    rows: ["Knowledge & Systems Vault"],
    top10Rank: null,
    rating: "TV-G",
    matchScore: 95,
    year: "2026",
    duration: "3,240+ Notes",
    quality: "Hyperlinked",
    audio: "Silent Graph",
    repoUrl: "https://github.com/Mthompson6782/MT-second-brain",
    liveUrl: null,
    synopsis: "A vast hyperlinked knowledge graph containing over 3,200 curated atomic notes spanning industrial control cybersecurity (IEC 62443), systems engineering, software architecture, and operational telemetry.",
    longDescription: `The MT Second Brain represents years of deep systems architecture, operational technology (OT), industrial protocols, and software design consolidated into an Obsidian-powered graph database.
    
Key Knowledge Domains:
• OT/ICS Cybersecurity: IEC 62443, Purdue Model segmentation, SCADA/DNP3/Modbus security protocols.
• Systems Engineering: INCOSE lifecycle methodologies, MBSE, reliability modeling, and trade studies.
• Telemetry & Industrial Historians: OSIsoft PI, InfluxDB, TimescaleDB, and Sparkplug B architectures.
• Executive Governance: System Security Plans (SSPs), risk registers, and compliance frameworks.`,
    tags: ["Obsidian", "Knowledge Graph", "Zettelkasten", "OT Security", "IEC 62443", "Systems Engineering"],
    stats: { stars: 1, forks: 0, status: "Active Vault" },
    icon: "brain"
  },
  {
    id: "abs-enterprise-systems",
    title: "ABS Enterprise & Operations",
    subtitle: "Mission-Critical Industrial Infrastructure",
    featured: false,
    bannerImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80",
    posterGradient: "linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%)",
    category: "Systems & Architecture",
    rows: ["Knowledge & Systems Vault"],
    top10Rank: null,
    rating: "TV-PG",
    matchScore: 94,
    year: "2025",
    duration: "Infrastructure",
    quality: "Industrial Grade",
    audio: "Telemetry",
    repoUrl: "https://github.com/Mthompson6782/ABS",
    liveUrl: null,
    synopsis: "Advanced business systems, industrial telemetry integration, and operational architecture designed for critical infrastructure environments.",
    longDescription: `ABS encompasses enterprise integration systems, connecting real-time industrial operational networks to cloud analytics and business decision workflows while maintaining strict boundary air-gaps.`,
    tags: ["Industrial Automation", "OT/IT Integration", "Critical Infrastructure", "Telemetry"],
    stats: { stars: 1, forks: 0, status: "Enterprise" },
    icon: "cpu"
  },
  {
    id: "executive-presentations-docs",
    title: "Executive Presentations, Specs & Docs",
    subtitle: "Architectural Blueprints, Whitepapers & Slide Decks",
    featured: false,
    bannerImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1600&q=80",
    posterGradient: "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #14b8a6 100%)",
    category: "Executive Archive",
    rows: ["Knowledge & Systems Vault", "Executive Archive"],
    top10Rank: null,
    rating: "TV-G",
    matchScore: 93,
    year: "2025",
    duration: "Executive Library",
    quality: "Hi-Res Vector",
    audio: "Briefing",
    repoUrl: "https://github.com/Mthompson6782/presentations",
    liveUrl: null,
    synopsis: "A comprehensive repository of executive briefing decks, Concept of Operations (ConOps), Interface Control Documents (ICDs), and architectural whitepapers.",
    longDescription: `Curated repository of Michael Thompson's executive presentations, technical documentation, and slide decks authored for executive boards, engineering teams, and regulatory audits.`,
    tags: ["Executive Briefings", "ConOps", "Architecture Decks", "Whitepapers", "Technical Writing"],
    stats: { stars: 1, forks: 0, status: "Documentation" },
    icon: "presentation"
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
    synopsis: "The heartbeat repository of Michael Thompson's engineering experiments. Houses the MT-FLIX streaming portfolio, experimental prototypes, and interactive systems.",
    longDescription: `MT-Lab is the primary open-source laboratory and creative coding sandbox where cutting-edge frontends, autonomous agents, and industrial software experiments are forged and showcased.`,
    tags: ["Interactive Web", "Netflix UI", "Open Source", "R&D", "Prototypes", "Vanilla JS"],
    stats: { stars: 1, forks: 0, status: "Active Hub" },
    icon: "flask"
  }
];

const USER_PROFILES = [
  {
    id: "recruiter",
    name: "Recruiter / Talent Lead",
    avatar: "👔",
    color: "#E50914",
    tagline: "Exploring talent, leadership & full-stack expertise"
  },
  {
    id: "architect",
    name: "Senior Architect",
    avatar: "💻",
    color: "#0284c7",
    tagline: "Inspecting systems design, OT security & code quality"
  },
  {
    id: "engineer",
    name: "Fellow Engineer",
    avatar: "⚡",
    color: "#10b981",
    tagline: "Browsing repositories, tech stacks & experiments"
  },
  {
    id: "executive",
    name: "Executive / C-Suite",
    avatar: "🎯",
    color: "#f59e0b",
    tagline: "Reviewing strategic vision, leadership & publications"
  }
];
