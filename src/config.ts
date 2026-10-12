/** Single source of truth for site-wide metadata and navigation. */
export const SITE = {
  name: 'AITeCXO',
  legalName: 'AITeCXO',
  domain: 'aitecxo.com',
  url: 'https://aitecxo.com',
  tagline: 'Practical AI strategy, implementation, and integration for growing businesses.',
  description:
    'AITeCXO helps SMB and enterprise teams innovate, implement, and integrate AI into their business — from strategy and roadmaps to production-ready solutions.',
  email: 'hello@aitecxo.com',
  /** Free 30-minute discovery call (Calendly). */
  booking: 'https://calendly.com/tim-aitecxo/30min',
  location: 'Remote-first · United States',
} as const;

export const NAV: { label: string; href: string }[] = [
  { label: 'Services', href: '/services' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Insights', href: '/insights' },
  { label: 'FAQ', href: '/faq' },
];

/**
 * Public profile links. Keep these canonical — no tracking or session query
 * strings (e.g. LinkedIn's `?viewAsMember=true`, which only appears when an
 * admin views their own page). They are rendered in the footer and published as
 * `sameAs` in the JSON-LD, so search engines treat them as identity signals.
 */
export const SOCIAL: { label: string; href: string }[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/aitecxo/' },
  { label: 'GitHub', href: 'https://github.com/TimothyJAndrus' },
];

/** The three core service pillars, reused on the home and services pages. */
export const SERVICES = [
  {
    id: 'innovation',
    title: 'AI Innovation',
    tagline: 'Find the highest-value opportunities.',
    description:
      'Strategy, ideation, and roadmaps that connect AI capabilities to measurable business outcomes — not hype.',
    points: [
      'Opportunity discovery & use-case prioritization',
      'AI strategy and adoption roadmaps',
      'Executive and team enablement / workshops',
    ],
  },
  {
    id: 'implementation',
    title: 'AI Implementation',
    tagline: 'Ship from proof-of-concept to production.',
    description:
      'Hands-on delivery of AI solutions — from rapid prototypes to secure, scalable systems running in your cloud.',
    points: [
      'Prototypes & proofs-of-concept',
      'Production LLM, RAG, and agent systems',
      'Cloud-native, secure, and cost-aware architecture',
    ],
  },
  {
    id: 'integration',
    title: 'AI Integration',
    tagline: 'Embed AI where your work already happens.',
    description:
      'Integrate AI into your existing products, data, and workflows so teams get value without disruption.',
    points: [
      'Workflow and data pipeline integration',
      'APIs, automations, and internal tooling',
      'Evaluation, monitoring, and guardrails',
    ],
  },
] as const;

/**
 * Service families beyond the three AI pillars. Each item has a stable `id`
 * (used as an anchor on /services and linked from /pricing) and a public
 * "from" price. Keep prices in sync with the rate card on /pricing.
 */
export const SERVICE_FAMILIES = [
  {
    id: 'leadership',
    title: 'Leadership & Change',
    intro: 'Coaching and consulting for the people side of transformation: leaders, teams, and the organization around them.',
    items: [
      {
        id: 'executive-coaching',
        title: 'Executive Coaching',
        description: 'One-to-one and team coaching on executive presence, navigating organizational politics, 60-day plans, 360° reviews, and accelerating momentum in a new role.',
        from: 'Programs from $2,400',
      },
      {
        id: 'business-consulting',
        title: 'Business Consulting',
        description: 'Operating-model, technology, and cost strategy from a leader who has run a 213-person organization and a $13.5M budget, not a slide factory.',
        from: 'Engagements from $6,500',
      },
      {
        id: 'change-management',
        title: 'Change Management',
        description: 'Readiness assessments, stakeholder maps, communication plans, and adoption metrics so new systems and AI tools actually get used.',
        from: 'From $6,500',
      },
      {
        id: 'training',
        title: 'Training',
        description: 'Hands-on workshops for executives and teams: practical AI, cloud fundamentals, and leadership skills, tailored to your tools and your work.',
        from: 'Workshops from $2,500',
      },
      {
        id: 'project-management',
        title: 'Project Management',
        description: 'Delivery leadership for technology programs: scope, plan, risks, vendors, and status that executives can trust.',
        from: 'From $4,500/mo',
      },
    ],
  },
  {
    id: 'software',
    title: 'Software & Cloud',
    intro: 'Senior engineering for the systems your business runs on, built in your cloud and handed over cleanly.',
    items: [
      {
        id: 'application-development',
        title: 'Application Development',
        description: 'Web applications and internal tools, from a fixed-price blueprint to a production release your team can own.',
        from: 'Builds from $8,000',
      },
      {
        id: 'cloud-application-development',
        title: 'Cloud Application Development',
        description: 'Cloud-native applications and data platforms on AWS and Google Cloud: serverless, containers, and managed data services, designed for cost and reliability.',
        from: 'Blueprint $1,800 · builds from $8,000',
      },
      {
        id: 'custom-software-development',
        title: 'Custom Software Development',
        description: 'Software built around your process instead of the other way around: integrations, automations, and APIs that connect the systems you already have.',
        from: 'From $175/hr or fixed price',
      },
      {
        id: 'software-testing',
        title: 'Software Testing',
        description: 'Test strategy, automated test suites, and evaluation gates for AI-written code, so customers stop being your QA team.',
        from: 'Test audit from $3,500',
      },
    ],
  },
  {
    id: 'data',
    title: 'Data & Information',
    intro: 'The foundation every AI and analytics effort depends on.',
    items: [
      {
        id: 'information-management',
        title: 'Information Management',
        description: 'Data governance, quality, lineage, and access controls, plus the pipelines and analytics that turn records into decisions, including regulated data (HIPAA, FERPA, SOC 2).',
        from: 'Assessment from $6,500',
      },
    ],
  },
] as const;

/** Calendly link tagged with where on the site it was clicked (shows in Calendly's UTM report). */
export const bookingUrl = (placement: string) =>
  `${SITE.booking}?utm_source=aitecxo.com&utm_medium=website&utm_content=${encodeURIComponent(placement)}`;

/** Topics offered in the contact form. Order = display order. */
export const CONTACT_TOPICS = [
  'AI strategy or implementation',
  'Executive coaching',
  'Business consulting / change management',
  'Training or workshop',
  'Project management',
  'Application or cloud development',
  'Software testing',
  'Information management',
  'Something else',
] as const;
