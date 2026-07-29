import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

const ses = new SESv2Client({});
const TO_EMAIL = process.env.TO_EMAIL;
const FROM_EMAIL = process.env.FROM_EMAIL;

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const reply = (statusCode, payload) => ({
  statusCode,
  headers: JSON_HEADERS,
  body: JSON.stringify(payload),
});

export const handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return reply(400, { error: 'Invalid JSON payload.' });
  }

  // Honeypot: bots fill hidden fields. Pretend success so they don't retry.
  if (body.company_website) {
    return reply(200, { ok: true });
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const company = String(body.company || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !isEmail(email) || !message) {
    return reply(400, { error: 'Please provide your name, a valid email, and a message.' });
  }
  if (name.length > 200 || company.length > 200 || message.length > 5000) {
    return reply(400, { error: 'Input exceeds the allowed length.' });
  }

  const subject = `New inquiry from ${name}${company ? ` @ ${company}` : ''}`;
  const text = [`Name: ${name}`, `Email: ${email}`, `Company: ${company || '—'}`, '', message].join('\n');

  try {
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: FROM_EMAIL,
        Destination: { ToAddresses: [TO_EMAIL] },
        ReplyToAddresses: [email],
        Content: { Simple: { Subject: { Data: subject }, Body: { Text: { Data: text } } } },
      })
    );
    return reply(200, { ok: true });
  } catch (err) {
    console.error('SES send failed:', err);
    return reply(502, { error: 'Email delivery failed. Please email us directly.' });
  }
};
