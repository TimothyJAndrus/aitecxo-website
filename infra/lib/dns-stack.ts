import { Stack, StackProps, CfnOutput, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';

export interface DnsStackProps extends StackProps {
  domainName: string;
}

/**
 * Owns the public hosted zone only. Deploy this first, delegate the domain's
 * nameservers (at Google) to the output values, then deploy the site stack so
 * ACM DNS validation can succeed.
 */
export class DnsStack extends Stack {
  public readonly hostedZone: route53.PublicHostedZone;

  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);

    this.hostedZone = new route53.PublicHostedZone(this, 'HostedZone', {
      zoneName: props.domainName,
    });

    new CfnOutput(this, 'HostedZoneId', { value: this.hostedZone.hostedZoneId });
    new CfnOutput(this, 'HostedZoneNameServers', {
      description: "Point the domain's nameservers (at Google) to these values.",
      value: Fn.join(', ', this.hostedZone.hostedZoneNameServers ?? []),
    });
  }
}
