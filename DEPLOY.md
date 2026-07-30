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

- **Sandbox limits.** New accounts start in the **SES sandbox**, which only sends to verified addresses. Verify the destination inbox (`hello@aitecxo.com`), or **request production access** before accepting real inquiries.
- **Recipient mailbox.** DKIM proves the domain can send; it does not create a mailbox. Make sure mail to `hello@aitecxo.com` actually lands somewhere you read.

Override the default addresses at deploy time if needed:

```bash
npx cdk deploy AitecxoContactApiStack \
  -c contactToEmail=hello@aitecxo.com \
  -c contactFromEmail=no-reply@aitecxo.com
```

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

The workflow in `.github/workflows/deploy.yml` deploys on every push to `main` using OIDC (no stored keys).

1. Create a GitHub OIDC identity provider and a deploy role in IAM. Trust policy (replace the account ID and repo):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": { "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com" },
       "Action": "sts:AssumeRoleWithWebIdentity",
       "Condition": {
         "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
         "StringLike": { "token.actions.githubusercontent.com:sub": "repo:TimothyJAndrus/aitecxo-website:ref:refs/heads/main" }
       }
     }]
   }
   ```
2. Attach a permissions policy to the role covering CloudFormation, S3, CloudFront, ACM, Route 53, Lambda, API Gateway, SES, and IAM role management used by CDK. Start broad, then tighten to least privilege.
3. Store the role ARN as a repo secret:
   ```bash
   gh secret set AWS_DEPLOY_ROLE_ARN --body "arn:aws:iam::<ACCOUNT_ID>:role/<ROLE_NAME>"
   ```

After that, `git push` to `main` deploys automatically.

## Teardown

```bash
cd infra
npx cdk destroy --all
```

The site bucket is set to auto-delete objects, so it removes cleanly. The hosted zone is deleted with `AitecxoDnsStack`; if you plan to redeploy, keep it to avoid re-delegating nameservers.

Destroying `AitecxoDnsStack` now also deletes the **SES domain identity**, which stops the contact form from sending. Redeploying issues fresh DKIM tokens and publishes new `CNAME`s, so the domain has to re-verify before mail flows again — another reason to keep this stack if you intend to come back.
