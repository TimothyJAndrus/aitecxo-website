import { Stack, StackProps, CfnOutput, Duration, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';

export interface DnsStackProps extends StackProps {
  domainName: string;
}

/**
 * Owns the public hosted zone only. Deploy this first, delegate the domain's
 * nameservers (at the registrar) to the output values, then deploy the site stack so
 * ACM DNS validation can succeed.
 */
export class DnsStack extends Stack {
  public readonly hostedZone: route53.PublicHostedZone;

  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);

    this.hostedZone = new route53.PublicHostedZone(this, 'HostedZone', {
      zoneName: props.domainName,
    });

    // --- Email (Google Workspace) ---
    // Delegating the domain to Route 53 makes this zone authoritative for ALL
    // records, so the mail records that lived at the previous DNS host must be
    // recreated here or email stops flowing. These mirror the prior setup.
    new route53.MxRecord(this, 'GoogleWorkspaceMx', {
      zone: this.hostedZone,
      values: [{ priority: 1, hostName: 'smtp.google.com' }],
      ttl: Duration.hours(1),
    });

    new route53.TxtRecord(this, 'GoogleSiteVerification', {
      zone: this.hostedZone,
      values: ['google-site-verification=gYaeJ96KHaynMkFjxQ1n4BkWiua-1BIiG2qE0mKT8hg'],
      ttl: Duration.hours(1),
    });

    new CfnOutput(this, 'HostedZoneId', { value: this.hostedZone.hostedZoneId });
    new CfnOutput(this, 'HostedZoneNameServers', {
      description: "Point the domain's nameservers (at Google) to these values.",
      value: Fn.join(', ', this.hostedZone.hostedZoneNameServers ?? []),
    });
  }
}
