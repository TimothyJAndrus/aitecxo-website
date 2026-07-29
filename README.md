# AITeCXO Website

Marketing website for **AITeCXO** — AI innovation, implementation, and integration consulting for SMB and enterprise teams. Live at [aitecxo.com](https://aitecxo.com).

Built as a static [Astro](https://astro.build) site, hosted on AWS (S3 + CloudFront + Route 53), with a serverless contact form (API Gateway + Lambda + SES). All infrastructure is defined as code with the AWS CDK.

## Tech stack

- **Framework:** Astro 7 (static output — no server required)
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Content:** Markdown content collections for case studies and insights
- **Hosting:** Amazon S3 (private) + CloudFront (OAC) + ACM + Route 53
- **Contact API:** Amazon API Gateway (HTTP API) + AWS Lambda + Amazon SES
- **IaC:** AWS CDK (TypeScript), run via `tsx`
- **CI/CD:** GitHub Actions with AWS OIDC (no stored credentials)

## Project structure

```
.
├── src/
│   ├── pages/         # Routes (home, services, about, work, insights, contact, pricing, faq)
│   ├── components/    # Header, Footer, Hero, ServiceCard, CTA, ContactForm, …
│   ├── layouts/       # BaseLayout (SEO head, header/footer shell)
│   ├── content/       # case-studies/*.md and insights/*.md
│   ├── styles/        # global.css (Tailwind + design tokens)
│   └── config.ts      # Site metadata, navigation, services
├── public/            # favicon, og image, robots.txt
├── infra/             # AWS CDK app (DnsStack, SiteStack, ContactApiStack)
└── .github/workflows/ # deploy.yml (CI/CD)
```

## Local development

Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:4321
```

Other scripts:

```bash
npm run build      # Build the static site to dist/
npm run preview    # Preview the production build locally
```

### Contact form

The contact form posts to the serverless endpoint defined by `PUBLIC_CONTACT_API_URL`. Copy `.env.example` to `.env` and set it to the `ContactApiUrl` output from the CDK deploy. Until it is set, the form gracefully falls back to a `mailto:` link.

## Deployment

Hosting and the contact API are provisioned with the AWS CDK in [`infra/`](infra/). See **[DEPLOY.md](DEPLOY.md)** for first-time setup (bootstrap, DNS delegation from Google, SES verification) and ongoing deploys.

Once the one-time setup is complete, pushing to `main` triggers the GitHub Actions workflow, which deploys infrastructure, builds the site, publishes to S3, and invalidates the CloudFront cache.
