# Deployment Summary
**Status: deployed and verified.**
Last functional commit on `main`: **`83c0fa8`** — `fix(seo): stop advertising a dead URL on the 404 page`
Recorded 2026-07-31.
This is a point-in-time record. `README.md` and `DEPLOY.md` are the maintained
references and win wherever this file has aged.
## Headline
The GitHub Actions pipeline now deploys successfully. Before this work every run
had failed at AWS authentication, going back to at least 2026-07-29 — the
"Automated (recommended)" path the README advertised had **never once worked**,
and every previous release was manual.
## Live state
- **Stacks** — `AitecxoDnsStack`, `AitecxoSiteStack`, `AitecxoContactApiStack`
  all `UPDATE_COMPLETE`, zero failed or rollback events, no drift.
- **Site** — all 12 routes serve 200; `www` redirects to the apex; clean URLs
  resolve; CloudFront `5xxErrorRate` 0%.
- **Contact form** — verified end to end with a real email received at
  `tim@aitecxo.com`. Validation, honeypot, and CORS enforcement all behave.
  Lambda: 0 errors, 0 throttles, no error log entries.
- **Assets** — every reference across all 9 pages resolves; no broken links.
## What shipped
### Brand identity
Real favicons, web manifest, and logo lockups replaced placeholder
blue-gradient artwork. The supplied logo PNGs had **opaque cream backgrounds
rather than alpha**, so each was keyed to transparency and cropped to its
artwork; dropped in as-is they would have shown a cream box on the white header.
### Palette
Design tokens retuned from placeholder indigo to the logo's cyan and slate. The
logo cyan (`#33c7df`) measures ~1.9:1 against white and so cannot carry text or
button fills; it sits at `brand-400` with deeper shades derived along the same
hue. All 14 token pairings the codebase actually uses were checked against WCAG
AA and pass — tightest is `accent-600` on white at 4.68:1.
### Open Graph
`og:image` pointed at an SVG, which LinkedIn, Facebook, X, and Slack do not
render, so link previews were broken everywhere. Replaced with a real 1200x630
PNG generated from the logo.
### CI/CD repair
Three compounding faults, each only visible once the previous was fixed:
1. **No deploy role or secret.** `AWS_DEPLOY_ROLE_ARN` was absent, so
   `role-to-assume` never reached the action.
2. **OIDC subject mismatch.** GitHub issues this repo an *immutable* subject
   embedding numeric IDs
   (`repo:TimothyJAndrus@54549665/aitecxo-website@1316540118:ref:refs/heads/main`),
   not the conventional `repo:OWNER/REPO:ref:...` that DEPLOY.md documented. The
   API reports `use_immutable_subject: false` while issuing it anyway;
   `sub_claim_prefix` is the reliable field and CloudTrail is definitive.
3. **Node below Astro's floor.** The workflow pinned Node 20 against Astro 7's
   `>=22.12.0`, and `engines.node` still claimed `>=20`, which made the stale
   pin look correct.
The deploy role uses least privilege: it assumes the three CDK bootstrap roles
rather than re-granting CloudFormation, IAM, Route 53, Lambda, API Gateway, or
SES, and holds S3 and CloudFront rights scoped to the specific bucket and
distribution.
### Feature-branch workflow
`ci.yml` validates pull requests by building the site and synthesizing the CDK
stacks, holding **no AWS credentials** — the deploy role trusts only
`refs/heads/main`, so a pull-request token cannot assume it. Merges to `main`
deploy. Docs-only pushes are skipped via `paths-ignore`.
### Contact recipient
The live Lambda was mailing `hello@aitecxo.com` despite an earlier deploy
passing `-c contactToEmail=tim@aitecxo.com`. **CDK context is per-invocation and
is not persisted in the stack**, so every CI deploy silently reverted it. The
value now lives in the default in `infra/bin/aitecxo.ts`.
### Asset weight
`public/` PNGs were truecolour exports of flat two-colour artwork — the 512px
icon alone was 233kB. Palette-encoded with dithering disabled: **456kB to
111kB, ~75% smaller**, deviation confined to a few antialiased edge pixels.
Dithering was disabled deliberately; the default stipples flat fills, which both
shows under magnification and compresses worse.
### Smaller fixes
- LinkedIn link pointed at the placeholder homepage; now the canonical company
  page, with `?viewAsMember=true` stripped (an admin-preview artifact). Profiles
  are also published as `sameAs` in the organization JSON-LD.
- The 404 page advertised `<link rel="canonical" href="https://aitecxo.com/404/">`
  — a path that returns 404, since the error document is served at whatever
  address was requested. `noindex` pages now emit no canonical.
- `HostedZoneNameServers` described the registrar as "Google"; it is Network
  Solutions. That string is read mid-migration, so a wrong name is worse than
  none.
- SES domain identity and DKIM records are CDK-managed, replacing the manual
  console verification DEPLOY.md used to prescribe.
## Assumptions that proved wrong
Recorded so the incorrect versions do not resurface:
1. **Throttling returns `503`, not `429`.** Established by bursting 60 requests:
   `503 {"message":"Service Unavailable"}`, using API Gateway's `message` key
   rather than the Lambda's `error`. Relevant to any client branching on shape.
2. **The SES sandbox does not break the contact form.** Warned twice that
   inquiries would fail silently. Wrong: the form always sends *to* an
   `@aitecxo.com` address covered by the verified domain identity, and the
   visitor's address is only `Reply-To`, never a recipient. The genuine limits
   are volume — 200/day and 1/sec.
3. **The DNS stack change was not risky to deploy.** Flagged as a likely
   collision with a console-created SES identity; CloudFormation already owned
   it (`CREATE_COMPLETE`) and `cdk diff` confirmed a no-op.
4. **CI had never succeeded.** Assumed working because the README said so.
   Found only while verifying the newly added path filter.
## Open items
- **`hello@` vs `tim@`.** `src/config.ts` advertises `hello@aitecxo.com`
  publicly while the form delivers to `tim@aitecxo.com`. A brand decision, and
  harmless if `hello@` is a monitored alias — but the two are independent and
  will not warn you when they diverge.
- **SES production access** not requested; still sandboxed at 200/day and 1/sec.
  Note the API's 2 req/s throttle sits above that send rate.
- **Social preview caches** not re-scraped, so LinkedIn/Facebook/X may still
  serve the old broken SVG reference.
- **CloudFront access logging is disabled**, which is why a residual 4xx rate
  (all non-5xx, consistent with deliberate 404 probes and bot scanning) cannot
  be attributed to specific paths.
- **Branch protection is unavailable** on the current plan, so the pull-request
  workflow is advisory. The `.githooks/pre-push` guard is opt-in per clone via
  `git config core.hooksPath .githooks` and `--no-verify` bypasses it.
- **`favicon.ico`** is unoptimized at 15kB; `sharp` cannot write ICO.
- **Deploy-role policy JSON is not version controlled.** The role must be
  created out-of-band, but the trust and permissions documents could live under
  `infra/bootstrap/` for reproducibility.
## Commit record
Newest first. `f344e51` and earlier predate this work.
- `83c0fa8` — fix(seo): stop advertising a dead URL on the 404 page
- `493abca` — feat(config): point the LinkedIn link at the real company page
- `b00aca9` — perf(assets): palette-encode the icons; fix registrar string and docs
- `412cedc` — fix(contact): default the contact recipient to tim@aitecxo.com
- `d699129` — ci: adopt a feature-branch workflow with pull-request validation
- `72e7c39` — style: retune the design tokens to the logo's cyan and slate
- `0f93ceb` — feat(brand): replace placeholder artwork with the real AITeCXO identity
- `ca41c89` — docs: add deployment summary for the 2026-07-30 CI/CD repair
- `e574d45` — docs: correct the OIDC trust policy subject format in DEPLOY.md
- `94aea68` — ci: build on Node 24 and correct the declared Node requirement
- `e1ebf36` — docs: DEPLOY.md now reflects CDK-managed SES identity and DKIM
- `89f5c69` — infra: manage the SES domain identity in the DNS stack
- `9276b4e` — ci: skip production deploys for docs-only pushes
- `9acb834` — docs: document contact API contract and throttling limits
Delivered as pull requests #1 through #5, each validated by CI and rebase-merged.
