import { Stack, StackProps, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

export interface ContactApiStackProps extends StackProps {
  domainName: string;
  toEmail: string;
  fromEmail: string;
}

export class ContactApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ContactApiStackProps) {
    super(scope, id, props);
    const { domainName, toEmail, fromEmail } = props;
    const allowedOrigin = `https://${domainName}`;

    const contactFn = new lambda.Function(this, 'ContactFunction', {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'index.handler',
      // Resolved relative to the CDK working directory (infra/).
      code: lambda.Code.fromAsset('lambda/contact'),
      timeout: Duration.seconds(10),
      memorySize: 256,
      environment: {
        TO_EMAIL: toEmail,
        FROM_EMAIL: fromEmail,
        ALLOWED_ORIGIN: allowedOrigin,
      },
    });

    // Allow sending mail. Scope by the verified From identity's domain.
    contactFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendEmail'],
        resources: ['*'],
        conditions: {
          StringEquals: { 'ses:FromAddress': fromEmail },
        },
      })
    );

    const httpApi = new apigwv2.HttpApi(this, 'ContactHttpApi', {
      description: 'AITeCXO contact form endpoint',
      corsPreflight: {
        allowOrigins: [allowedOrigin],
        allowMethods: [apigwv2.CorsHttpMethod.POST, apigwv2.CorsHttpMethod.OPTIONS],
        allowHeaders: ['content-type'],
        maxAge: Duration.hours(1),
      },
    });

    httpApi.addRoutes({
      path: '/contact',
      methods: [apigwv2.HttpMethod.POST],
      integration: new HttpLambdaIntegration('ContactIntegration', contactFn),
    });

    // Basic throttling to blunt spam/abuse on the public endpoint.
    const stage = httpApi.defaultStage?.node.defaultChild as apigwv2.CfnStage | undefined;
    if (stage) {
      stage.defaultRouteSettings = {
        throttlingBurstLimit: 5,
        throttlingRateLimit: 2,
      };
    }

    new CfnOutput(this, 'ContactApiUrl', {
      description: 'Set PUBLIC_CONTACT_API_URL to this value when building the site.',
      value: `${httpApi.apiEndpoint}/contact`,
    });
  }
}
