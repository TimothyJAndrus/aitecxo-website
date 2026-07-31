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
