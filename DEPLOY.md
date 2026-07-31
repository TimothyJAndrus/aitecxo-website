# Deploying aitecxo.com

This guide covers the **one-time** setup to get the site live on AWS, then the ongoing workflow.

Everything runs in **us-east-1** (required for CloudFront's ACM certificate). The CDK app defines three stacks:

- `AitecxoDnsStack` — the Route 53 public hosted zone, plus the SES domain identity and its DKIM records (deploy + delegate first).
- `AitecxoSiteStack` — S3 + CloudFront + ACM + DNS records.
- `AitecxoContactApiStack` — API Gateway + Lambda + SES for the contact form.

## Prerequisites

- An AWS account with credentials configured locally. Verify with:
  ```bash
  aws sts get-caller-identity
  ```
  If this fails, sign in first (e.g. `aws login` or your usual `aws configure` / SSO flow).
- Node.js 22.12+ (required by Astro 7).
- The domain `aitecxo.com` (registered at **Network Solutions**).

## 1. Install dependencies

```bash
npm install
npm --prefix infra install
```

## 2. Bootstrap CDK (first time per account/region)

```bash
cd infra
npx cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/us-east-1
```

## 3. Create the hosted zone and delegate DNS

Deploy just the DNS stack, then read its nameservers:

```bash
npx cdk deploy AitecxoDnsStack
```

This also creates the **SES domain identity** for `aitecxo.com` with Easy DKIM and publishes the three DKIM `CNAME` records into the zone automatically — there is nothing to copy by hand. SES cannot finish verifying the domain until delegation below is live, so expect the identity to sit unverified until then.

Copy the four servers from the `HostedZoneNameServers` output. **In Network Solutions' nameserver settings for `aitecxo.com`, set custom nameservers to these Route 53 values** (replacing the `worldnic.com` entries). This delegates DNS to Route 53 and is what lets ACM validate the certificate.

Verify delegation has propagated (can take minutes to a few hours):

```bash
dig +short NS aitecxo.com
```

You should see the Route 53 nameservers.

> Alternative (no delegation): keep DNS at Network Solutions and instead add the ACM validation `CNAME` records and a `CNAME`/ALIAS to CloudFront there. Delegation is simpler and enables apex ALIAS records, so it is the recommended path.

## 4. Deploy hosting

Once delegation resolves, deploy the site stack. ACM will create validation records in the (now-delegated) zone and issue the certificate automatically:

```bash
npx cdk deploy AitecxoSiteStack
```

Note the outputs: `BucketName`, `DistributionId`, `SiteUrl`.

## 5. Set up SES for the contact form

The domain identity and DKIM records are managed by `AitecxoDnsStack` (step 3), so there is **no manual identity verification or DKIM record entry**. Do not create an identity for `aitecxo.com` in the SES console — a console-created identity collides with the CDK-managed one and the stack deploy will fail.

Once delegation has propagated, confirm SES finished verifying the domain:

```bash
aws sesv2 get-email-identity --email-identity aitecxo.com --region us-east-1 \
  --query '{Verified:VerifiedForSendingStatus,Dkim:DkimAttributes.Status}'
```

Both should report `true` / `SUCCESS`. If not, verification is still pending on DNS — recheck `dig +short NS aitecxo.com` and the DKIM `CNAME`s.

What still requires manual action:

- **Sandbox limits.** New accounts start in the **SES sandbox**, which only delivers to verified identities. That does not block the contact form: it always sends to an `@aitecxo.com` address, which the verified domain identity covers. The caps are what matter — 200 messages/day and a 1/sec send rate. **Request production access** before sending to arbitrary external addresses or expecting bursts.
- **Recipient mailbox.** DKIM proves the domain can send; it does not create a mailbox. Make sure mail to `tim@aitecxo.com` actually lands somewhere you read.

The addresses default to `tim@aitecxo.com` and `no-reply@aitecxo.com`, set in `infra/bin/aitecxo.ts`. They can be overridden for a single deploy:

```bash
npx cdk deploy AitecxoContactApiStack \
  -c contactToEmail=someone@aitecxo.com \
  -c contactFromEmail=no-reply@aitecxo.com
```

> Context is **per-invocation** and is not stored in the stack. The next `cdk deploy` without these flags — which is what CI runs — resets both to the defaults above. For a lasting change, edit the defaults.

Note the `ContactApiUrl` output.

## 6. Build and publish the site

From the repo root, build with the contact endpoint wired in, then upload and invalidate:

```bash
PUBLIC_CONTACT_API_URL="<ContactApiUrl>" npm run build
aws s3 sync dist "s3://<BucketName>" --delete
aws cloudfront create-invalidation --distribution-id "<DistributionId>" --paths "/*"
```

Visit `https://aitecxo.com` — you should be live.

## 7. Enable CI/CD (GitHub Actions + OIDC)

The workflow in `.github/workflows/deploy.yml` deploys on every push to `main` using OIDC (no stored keys). Docs-only pushes are skipped — see `paths-ignore` in the workflow.

**This is already set up for the live account.** The role is `AitecxoWebsiteGitHubDeployRole` and the repo secret `AWS_DEPLOY_ROLE_ARN` points at it. The steps below document how it was built, for rebuilding it or porting to another account.

### 7.1 Identity provider

Create the GitHub OIDC provider once per account, with audience `sts.amazonaws.com`:

```bash
aws iam list-open-id-connect-providers   # check first; it may already exist
```

### 7.2 Trust policy — mind the subject format

> **The `sub` claim is not always `repo:OWNER/REPO:ref:refs/heads/main`.** GitHub also issues an *immutable* subject that embeds numeric owner and repository IDs. This repo receives the immutable form, so a trust policy written with the classic format fails with `Not authorized to perform sts:AssumeRoleWithWebIdentity`.

Find the subject your repo actually presents. The `sub_claim_prefix` field is authoritative — note that `use_immutable_subject` can report `false` while an immutable prefix is still issued:

```bash
gh api repos/TimothyJAndrus/aitecxo-website/actions/oidc/customization/sub
```

To see the exact string that reached AWS (most reliable, after at least one attempt), read it out of CloudTrail:

```bash
aws cloudtrail lookup-events --region us-east-1 \
  --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRoleWithWebIdentity \
  --max-results 1 --query 'Events[0].CloudTrailEvent' --output text \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["userIdentity"]["userName"])'
```

The trust policy in use accepts both formats, so it keeps working if GitHub changes which one it issues. Both entries stay pinned to this repo and to `main`:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "GitHubActionsOidcMainBranchOnly",
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::358254890860:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        "token.actions.githubusercontent.com:sub": [
          "repo:TimothyJAndrus@54549665/aitecxo-website@1316540118:ref:refs/heads/main",
          "repo:TimothyJAndrus/aitecxo-website:ref:refs/heads/main"
        ]
      }
    }
  }]
}
```

Use `StringEquals`, not `StringLike`, and never leave the `sub` condition off entirely — a policy that only checks `aud` lets **any** GitHub repository assume the role.

### 7.3 Permissions — assume the CDK roles, don't re-grant them

The role does **not** need CloudFormation, IAM, Route 53, Lambda, API Gateway, or SES permissions. `cdk deploy` assumes the CDK bootstrap roles, which already hold them. The deploy role only needs to assume those roles, plus the two things the workflow does with its own credentials (S3 sync and the CloudFront invalidation):

- `sts:AssumeRole` and `sts:TagSession` on `cdk-hnb659fds-{deploy,file-publishing,lookup}-role-<account>-us-east-1`
- `ssm:GetParameter` on `/cdk-bootstrap/hnb659fds/version`
- `s3:ListBucket` / `s3:GetBucketLocation` on the site bucket, and `s3:GetObject|PutObject|DeleteObject` on its contents
- `cloudfront:CreateInvalidation` / `GetInvalidation` on the distribution

Inspect the live policy with:

```bash
aws iam get-role-policy --role-name AitecxoWebsiteGitHubDeployRole \
  --policy-name AitecxoWebsiteDeployPermissions
```

### 7.4 Store the role ARN

```bash
gh secret set AWS_DEPLOY_ROLE_ARN --body "arn:aws:iam::358254890860:role/AitecxoWebsiteGitHubDeployRole"
```

After that, `git push` to `main` deploys automatically.

### Troubleshooting

- **`Could not load credentials from any providers`** — `AWS_DEPLOY_ROLE_ARN` is missing or empty, so `role-to-assume` never reached the action. Confirm with `gh secret list`; the step log also omits `role-to-assume` from its `with:` block.
- **`Not authorized to perform sts:AssumeRoleWithWebIdentity`** — the credentials reached STS but the trust policy rejected them. Almost always a `sub` mismatch (see 7.2); compare the CloudTrail value against the policy.
- **`Node.js vXX is not supported by Astro`** — the workflow's `node-version` has drifted below Astro's floor. Keep it in sync with `engines.node` in `package.json`.

## Teardown

```bash
cd infra
npx cdk destroy --all
```

The site bucket is set to auto-delete objects, so it removes cleanly. The hosted zone is deleted with `AitecxoDnsStack`; if you plan to redeploy, keep it to avoid re-delegating nameservers.

Destroying `AitecxoDnsStack` now also deletes the **SES domain identity**, which stops the contact form from sending. Redeploying issues fresh DKIM tokens and publishes new `CNAME`s, so the domain has to re-verify before mail flows again — another reason to keep this stack if you intend to come back.
