# Deployment Summary — 2026-07-30

A record of the work done to deploy the contact API, document it, and repair the
CI/CD pipeline. Written as a point-in-time snapshot; `README.md` and `DEPLOY.md`
remain the authoritative, maintained references.

## Outcome

The site's GitHub Actions pipeline deployed successfully for the first time.
Prior to this session every workflow run had failed at AWS authentication, going
back to at least 2026-07-29 — the "Automated (recommended)" deployment path
described in the README had never actually worked. All deploys until now were
manual.

## Starting point

The session opened with what looked like a failed CDK deploy. It had not failed:
the command was `cd infra && npx cdk deploy ...`, and because the shell was
already in `infra/`, zoxide printed `you are already in the only match` and
returned a non-zero exit before `cdk` ran. Re-running from the correct directory
deployed `AitecxoContactApiStack` cleanly.

## Work completed

### 1. Contact API verification

Exercised the deployed endpoint end to end:

- Valid submission → `200 {"ok":true}`, with a real email delivered through SES
- Invalid payload → `400` with the validation message
- Honeypot field populated → `200` with no mail sent
- CORS preflight → `204` with `access-control-allow-origin: https://aitecxo.com`

### 2. Documentation

Added a Contact API reference to `README.md` covering the route, request schema,
field length caps, the `company_website` honeypot, every response code, CORS, and
the stage throttle. Rewrote `DEPLOY.md` §5 (SES) and §7 (CI/CD) — both had become
inaccurate enough to actively mislead.

### 3. CI path filter

The deploy workflow had no path filter, so documentation-only pushes triggered a
full `cdk deploy --all`, site rebuild, S3 sync, and CloudFront invalidation.
Added `paths-ignore` scoped to root-level docs.

### 4. CI/CD repair

Created the missing OIDC infrastructure and fixed two further blockers that only
surfaced once authentication worked. Details in "Root causes" below.

## Root causes found and fixed

Three issues compounded to keep the pipeline broken. Each was only visible after
the previous one was resolved.

### Missing deploy role and secret

`gh secret list` reported no secrets at all, so `secrets.AWS_DEPLOY_ROLE_ARN`
resolved to empty and `role-to-assume` never reached the action. The step failed
with `Could not load credentials from any providers`. The GitHub OIDC identity
provider existed in IAM, but no deploy role did — `DEPLOY.md` §7 had been started
and abandoned partway.

Created `AitecxoWebsiteGitHubDeployRole` and set the repo secret.

### OIDC subject claim mismatch

With the role in place, authentication still failed with
`Not authorized to perform sts:AssumeRoleWithWebIdentity`.

The conventional subject documented nearly everywhere, and in the old §7, is:

```
repo:OWNER/REPO:ref:refs/heads/main
```

CloudTrail showed the token actually presented GitHub's **immutable** subject,
which embeds numeric owner and repository IDs:

```
repo:TimothyJAndrus@54549665/aitecxo-website@1316540118:ref:refs/heads/main
```

Compounding the confusion, the GitHub API reports `use_immutable_subject: false`
for this repo while the immutable prefix is issued regardless. The
`sub_claim_prefix` field is the reliable indicator; CloudTrail is definitive.

The trust policy now accepts both forms, so it survives a change in which format
GitHub issues. Both entries remain pinned to this repository and to `main`.

### Node version below Astro's minimum

Authentication and infrastructure deployment then succeeded, and the failure
moved to the build step:

```
Node.js v20.20.2 is not supported by Astro!
Please upgrade Node.js to a supported version: ">=22.12.0"
```

The workflow pinned Node 20. `package.json` also declared `engines.node: ">=20"`,
which made the stale pin look correct. Set `engines.node` to `>=22.12.0` to match
Astro 7's actual floor and moved CI to Node 24, matching local development.

## AWS and GitHub changes

These live outside version control.

- **IAM role** `AitecxoWebsiteGitHubDeployRole`
  (`arn:aws:iam::358254890860:role/AitecxoWebsiteGitHubDeployRole`), trusting the
  existing GitHub OIDC provider, restricted to this repository on
  `refs/heads/main`, 1-hour maximum session.
- **Inline policy** `AitecxoWebsiteDeployPermissions`, least privilege:
  - `sts:AssumeRole` / `sts:TagSession` on the three CDK bootstrap roles
    (`deploy`, `file-publishing`, `lookup`)
  - `ssm:GetParameter` on `/cdk-bootstrap/hnb659fds/version`
  - S3 read/write scoped to the site bucket
  - `cloudfront:CreateInvalidation` / `GetInvalidation` scoped to distribution
    `EPQ17AE6B3LLH`

  Notably it grants **no** CloudFormation, IAM, Route 53, Lambda, API Gateway, or
  SES permissions. `cdk deploy` obtains those by assuming the bootstrap roles,
  which already hold them. This replaces the previous "start broad, then tighten"
  guidance.
- **Repo secret** `AWS_DEPLOY_ROLE_ARN`.

## Corrected assumptions

Three claims made during the session proved wrong on verification and are
recorded here so the incorrect versions do not resurface:

1. **Throttling returns `503`, not `429`.** A 60-request burst against the
   endpoint returned `503 {"message":"Service Unavailable"}` from API Gateway.
   The body uses API Gateway's `message` key, not the Lambda's `error` key —
   relevant to any client code branching on the response shape.
2. **The pending DNS stack change was not risky to deploy.** It was flagged as a
   likely collision with a console-created SES identity. CloudFormation already
   owned the identity (`SesDomainIdentity`, `CREATE_COMPLETE`) from an earlier
   local `cdk deploy`; `cdk diff` confirmed a no-op. The repository was simply
   behind the deployed state.
3. **CI had never succeeded.** Assumed working because the README documented it.
   Discovered only while verifying that the newly added path filter worked.

## Verified final state

- CI/CD: run for `94aea68` succeeded through every step
- Path filter: no run created for docs-only pushes (`e1ebf36`, `e574d45`)
- Site: apex `200`, `/services` `200` (clean-URL rewrite), `www` `301` → apex
- Contact API: validation and delivery both confirmed
- SES: `aitecxo.com` verified for sending, DKIM `SUCCESS`, CDK-managed
- Git: working tree clean, `main` level with `origin/main`

## Commit history

Oldest first.

- `9acb834` (16:25) — `docs: document contact API contract and throttling limits`
- `9276b4e` (16:33) — `ci: skip production deploys for docs-only pushes`
- `89f5c69` (16:33) — `infra: manage the SES domain identity in the DNS stack`
- `e1ebf36` (16:36) — `docs: DEPLOY.md now reflects CDK-managed SES identity and DKIM`
- `94aea68` (16:50) — `ci: build on Node 24 and correct the declared Node requirement`
- `e574d45` (17:07) — `docs: correct the OIDC trust policy subject format in DEPLOY.md`

## Open items

Not addressed in this session.

- **SES sandbox status unconfirmed.** If the account is still in the sandbox, the
  contact form can only deliver to verified addresses and genuine inquiries fail
  silently. Worth checking before promoting the form.
- **`infra/lib/dns-stack.ts:74`** — the `HostedZoneNameServers` output description
  reads "at Google"; the registrar is Network Solutions. Cosmetic, but it is the
  string read during a nameserver migration.
- **Deploy-role policy documents are not version controlled.** The role must be
  created out-of-band (it is what grants CDK access in the first place), but the
  trust and permissions JSON could live under `infra/bootstrap/` for
  reproducibility.
