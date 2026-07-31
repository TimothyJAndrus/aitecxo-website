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

Requires Node.js 22.12+ (Astro 7's minimum; CI builds on Node 24).

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

Note that CORS on the deployed API only allows `https://aitecxo.com`, so browser posts from `localhost` are rejected. Leave `PUBLIC_CONTACT_API_URL` unset for local work (and rely on the `mailto:` fallback) unless you deliberately widen `allowOrigins`. See [Contact API](#contact-api) for the full request/response contract and rate limits.

## Deployment architecture

The site is fully static and served from S3 through CloudFront; the only dynamic piece is the serverless contact API. Everything is defined as code in [`infra/`](infra/) and deployed to **us-east-1** (required for CloudFront's ACM certificate).

```mermaid
flowchart LR
  User([Visitor]) -->|HTTPS| CF["CloudFront + ACM TLS"]
  CF -->|OAC| S3[("Private S3 bucket<br/>Astro dist/")]
  CF --> Fn["CloudFront Function<br/>www→apex + clean URLs"]
  User -->|POST /contact| APIGW["API Gateway HTTP API"]
  APIGW --> L["Lambda handler"]
  L --> SES["Amazon SES"]
  R53["Route 53 hosted zone"] -. ALIAS .-> CF
  Reg["Network Solutions registrar"] -. NS delegation .-> R53
```

Three CDK stacks, deployed in order:

- **`AitecxoDnsStack`** — the Route 53 public hosted zone. `aitecxo.com` is registered at **Network Solutions**, whose nameservers are delegated to this zone. Deployed first so ACM can validate via DNS.
- **`AitecxoSiteStack`** — a private S3 bucket (no public access) served by CloudFront via Origin Access Control, an ACM certificate covering the apex and `www`, apex/`www` ALIAS records, and a CloudFront Function that redirects `www` → apex and rewrites clean URLs (e.g. `/services` → `/services/index.html`). Missing paths return the site's `404.html`.
- **`AitecxoContactApiStack`** — an HTTP API → Node.js Lambda → SES. CORS is locked to `https://aitecxo.com`, a honeypot + server-side validation reject spam, and the stage is throttled.

### Current environment

- **AWS account / region:** `358254890860` / `us-east-1`
- **Hosted zone:** `Z04272101NWQH90TO3IKE`
- **CloudFront distribution:** `EPQ17AE6B3LLH` (`dbnrgfydwaex.cloudfront.net`)
- **Site bucket:** `aitecxositestack-sitebucket397a1860-h5wc1rljrytw`
- **Contact endpoint:** `POST https://v2lrzu3l73.execute-api.us-east-1.amazonaws.com/contact` — throttled to 2 req/s, burst 5 ([details](#contact-api))

These values change if resources are recreated, so treat CloudFormation as the source of truth:

```bash
aws cloudformation describe-stacks --region us-east-1 \
  --stack-name AitecxoSiteStack --query "Stacks[0].Outputs" --output table
```

## Deploying changes

First-time setup (bootstrap, DNS delegation, SES) is in **[DEPLOY.md](DEPLOY.md)**. After that:

### Automated (recommended)

Work on a branch and merge through a pull request — **anything that lands on `main` deploys straight to production**, with no staging environment in between.

```bash
git switch -c my-change
# … edit …
git commit -am "…"
git push -u origin my-change
gh pr create --fill
```

Opening the PR runs [`.github/workflows/ci.yml`](.github/workflows/ci.yml), which builds the site and synthesizes the CDK stacks. It uses **no AWS credentials**: the deploy role only trusts `refs/heads/main`, so a pull-request token cannot assume it by design. CI proves the code compiles and the infrastructure is valid — it does not prove a deploy will succeed.

Merging the PR pushes to `main`, which runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): it deploys the CDK stacks, builds the site with the contact endpoint injected, syncs `dist/` to S3, and invalidates CloudFront.

Pushes that only touch root-level docs (`*.md`, `docs/**`, `LICENSE`, and similar) are skipped via `paths-ignore`, so documentation edits no longer redeploy production. Content Markdown under `src/content/` is *not* skipped, since it is part of the published site. To deploy a skipped change anyway, dispatch the workflow manually:

```bash
gh workflow run deploy.yml --ref main
```

#### The branch rule is advisory

This repository is private on a plan without branch protection, so GitHub **cannot** enforce pull requests or required checks. Nothing server-side stops a direct push to `main`. A local `pre-push` hook is included as a guardrail; enable it once per clone:

```bash
git config core.hooksPath .githooks
```

It refuses direct pushes to `main` and `git push --no-verify` bypasses it, which is the intended escape hatch for a hotfix or revert. Making the repository public, or upgrading the plan, would allow real branch protection with a required CI check.

### Manual

Requires valid credentials (`aws login`; sessions last up to 12h). From the repo root:

```bash
# 1. Deploy infra changes (safe to run even if nothing changed)
( cd infra && npm ci && npx cdk deploy --all --require-approval never --outputs-file cdk-outputs.json )

# 2. Read the live outputs
API=$(jq -r '.AitecxoContactApiStack.ContactApiUrl' infra/cdk-outputs.json)
BUCKET=$(jq -r '.AitecxoSiteStack.BucketName' infra/cdk-outputs.json)
DIST=$(jq -r '.AitecxoSiteStack.DistributionId' infra/cdk-outputs.json)

# 3. Build with the contact endpoint, publish, and invalidate
npm ci
PUBLIC_CONTACT_API_URL="$API" npm run build
aws s3 sync dist "s3://$BUCKET" --delete
aws cloudfront create-invalidation --distribution-id "$DIST" --paths "/*"
```

For **content-only** changes (no infra edits), skip step 1.

## Maintenance & operations

### Add a case study or insight

Drop a Markdown file into `src/content/case-studies/` or `src/content/insights/` using the frontmatter schema in `src/content.config.ts` (see the existing entries). Set `draft: true` to keep an entry out of the build. Then deploy.

### Update nav, services, or contact details

Edit `src/config.ts` — the single source of truth for site metadata, navigation, the service pillars, and the contact email.

Note that `src/config.ts` holds the **publicly displayed** address, while the address the contact form actually delivers to is the CDK default in [`infra/bin/aitecxo.ts`](infra/bin/aitecxo.ts). They are independent; keep them deliberately aligned.

### Replace the brand assets

Logo sources live in `src/assets/` (Astro optimizes them to WebP at build time); icons, the manifest, and the OG card are static files in `public/`.

The PNGs in `public/` are **palette-encoded with dithering disabled**, which suits flat two-colour artwork and cut them by ~75% (456kB to 111kB) with no visible change. A fresh export from a favicon generator will be full truecolour and several times larger, so re-optimize after replacing them rather than committing the raw export.

### Contact API

A single route: **`POST /contact`**, currently at `https://v2lrzu3l73.execute-api.us-east-1.amazonaws.com/contact`. API Gateway generates that hostname, and it changes if the HTTP API is ever recreated — treat the stack output as the source of truth:

```bash
aws cloudformation describe-stacks --region us-east-1 \
  --stack-name AitecxoContactApiStack \
  --query "Stacks[0].Outputs[?OutputKey=='ContactApiUrl'].OutputValue" --output text
```

**Request** (`content-type: application/json`):

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "company": "Acme Corp",
  "message": "We'd like help with an AI roadmap.",
  "company_website": ""
}
```

- `name`, `email`, and `message` are required; `email` must be syntactically valid.
- `company` is optional. Length caps: `name` and `company` 200 characters, `message` 5000.
- `company_website` is a **honeypot** — keep it hidden and empty in the form. Submissions that fill it get a `200` response and are silently discarded without sending mail.

**Responses:**

- `200 {"ok":true}` — handed off to SES (also returned for discarded honeypot hits).
- `400 {"error":"…"}` — malformed JSON, missing/invalid fields, or oversized input.
- `502 {"error":"Email delivery failed. Please email us directly."}` — SES rejected the send.
- `503 {"message":"Service Unavailable"}` — throttled; see below.

**CORS** is locked to `https://aitecxo.com` for `OPTIONS, POST` with the `content-type` header, and preflights are cached for 1 hour.

#### Throttling

The `$default` stage is throttled at **2 requests/second sustained, burst 5**, configured via `defaultRouteSettings` in [`infra/lib/contact-api-stack.ts`](infra/lib/contact-api-stack.ts). Things to know:

- The limit applies **per stage across all callers**, not per IP. It caps total contact-form traffic; it does not single out an individual abuser.
- Excess requests are rejected by API Gateway *before* reaching the Lambda, so they return API Gateway's error shape — `503 {"message":"Service Unavailable"}` with a `message` key — rather than the Lambda's `{"error":…}`. Note this is **503, not 429**. Client code should treat it as "retry in a moment," not a permanent failure.
- Check the live values with:
  ```bash
  aws apigatewayv2 get-stages --api-id <api-id> --region us-east-1 \
    --query 'Items[].DefaultRouteSettings'
  ```
- Adjust by editing `throttlingRateLimit` / `throttlingBurstLimit` and redeploying `AitecxoContactApiStack`.

#### SES and recipients

- The Lambda sends from `no-reply@aitecxo.com` to `tim@aitecxo.com`. Both defaults live in [`infra/bin/aitecxo.ts`](infra/bin/aitecxo.ts).
- A `-c contactToEmail=…` override applies to that single `cdk deploy` only. CDK context is not persisted in the stack, so the next deploy that omits the flag — including every CI deploy — silently reverts to the default. To change the recipient for good, edit the default.
- Delivery requires a verified SES domain identity for `aitecxo.com`. The account is still in the **SES sandbox**, which restricts recipients to verified identities — but since the recipient is always an `@aitecxo.com` address covered by the verified domain, contact-form mail is delivered normally. The visitor's own address is only set as `Reply-To`, never a recipient, so it needs no verification.
- The sandbox caps volume at **200 messages/day** and a **1/sec** send rate. Note the API's own throttle allows 2 req/s, so two submissions landing in the same second can reach SES faster than the sandbox permits. The AWS SDK retries throttling errors by default (standard mode, 3 attempts with backoff), which comfortably absorbs a brief spike inside the Lambda's 10s timeout; only a sustained burst would exhaust the retries and surface as `502`. Requesting production access removes the cap and is the real fix if traffic ever justifies it.
- Tail Lambda logs: `aws logs tail /aws/lambda/<function-name> --follow --region us-east-1` (find the name under the ContactApiStack resources).
- Smoke-test the deployed endpoint end to end (this sends a real email):
  ```bash
  curl -sS -X POST "$(aws cloudformation describe-stacks --region us-east-1 \
    --stack-name AitecxoContactApiStack \
    --query "Stacks[0].Outputs[?OutputKey=='ContactApiUrl'].OutputValue" --output text)" \
    -H 'content-type: application/json' \
    -d '{"name":"Smoke Test","email":"you@example.com","message":"Testing."}'
  ```

### Credentials

Local deploys use `aws login` (short-lived, auto-rotating, ≤12h). CI uses GitHub OIDC — no long-lived AWS keys are stored anywhere.

### Roll back

Revert the offending commit and redeploy (`git revert <sha>` then push, or run the manual steps above). Infrastructure rolls back via a `cdk deploy` of the previous definition.

### Tear down

```bash
( cd infra && npx cdk destroy --all )
```

The site bucket auto-empties on delete. Keep `AitecxoDnsStack` if you plan to redeploy, so you don't have to re-delegate nameservers at the registrar.
