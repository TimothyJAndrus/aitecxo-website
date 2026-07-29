#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { DnsStack } from '../lib/dns-stack';
import { SiteStack } from '../lib/site-stack';
import { ContactApiStack } from '../lib/contact-api-stack';

const app = new App();

const domainName = app.node.tryGetContext('domainName') || 'aitecxo.com';
const contactToEmail = app.node.tryGetContext('contactToEmail') || `hello@${domainName}`;
const contactFromEmail = app.node.tryGetContext('contactFromEmail') || `no-reply@${domainName}`;

// CloudFront and its ACM certificate must live in us-east-1.
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' };

const dns = new DnsStack(app, 'AitecxoDnsStack', {
  env,
  domainName,
  description: 'AITeCXO DNS — Route 53 public hosted zone (delegate here first)',
});

new SiteStack(app, 'AitecxoSiteStack', {
  env,
  domainName,
  hostedZone: dns.hostedZone,
  description: 'AITeCXO static site — S3 + CloudFront + ACM + Route 53',
});

new ContactApiStack(app, 'AitecxoContactApiStack', {
  env,
  domainName,
  toEmail: contactToEmail,
  fromEmail: contactFromEmail,
  description: 'AITeCXO serverless contact API — API Gateway + Lambda + SES',
});
