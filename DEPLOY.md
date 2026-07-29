# Deploying aitecxo.com

This guide covers the **one-time** setup to get the site live on AWS, then the ongoing workflow.

Everything runs in **us-east-1** (required for CloudFront's ACM certificate). The CDK app defines three stacks:

- `AitecxoDnsStack` — the Route 53 public hosted zone (deploy + delegate first).
- `AitecxoSiteStack` — S3 + CloudFront + ACM + DNS records.
- `AitecxoContactApiStack` — API Gateway + Lambda + SES for the contact form.

## Prerequisites

- An AWS account with credentials configured locally. Verify with:
  ```bash
  aws sts get-caller-identity
  ```
  If this fails, sign in first (e.g. `aws login` or your usual `aws configure` / SSO flow).
- Node.js 20+.
- The domain `aitecxo.com` (registered/managed at Google).

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

Copy the four servers from the `HostedZoneNameServers` output. **In the Google domain settings for `aitecxo.com`, replace the custom nameservers with these Route 53 values.** This delegates DNS to Route 53 and is what lets ACM validate the certificate.

Verify delegation has propagated (can take minutes to a few hours):

```bash
dig +short NS aitecxo.com
```

You should see the Route 53 nameservers.

> Alternative (no delegation): keep DNS at Google and instead add the ACM validation `CNAME` records and a `CNAME`/ALIAS to CloudFront manually at Google. Delegation is simpler and enables apex ALIAS records, so it is the recommended path.

## 4. Deploy hosting

Once delegation resolves, deploy the site stack. ACM will create validation records in the (now-delegated) zone and issue the certificate automatically:

```bash
npx cdk deploy AitecxoSiteStack
```

Note the outputs: `BucketName`, `DistributionId`, `SiteUrl`.

## 5. Set up SES for the contact form

In the SES console (us-east-1):

1. **Verify a domain identity** for `aitecxo.com` and add the provided DKIM `CNAME` records in Route 53.
2. Ensure the send address (`no-reply@aitecxo.com`) and destination (`hello@aitecxo.com`) work for your setup. New accounts start in the **SES sandbox**, which only sends to verified addresses — verify your destination inbox, or **request production access** before accepting real inquiries.

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
