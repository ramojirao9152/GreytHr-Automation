
import nodemailer from 'nodemailer';

export async function sendEmail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ALERT_EMAIL,
      pass: process.env.ALERT_PASS,
    }
  });

  await transporter.sendMail({
    from: process.env.ALERT_EMAIL,
    to: process.env.ALERT_TO,
    subject: 'Playwright Test Proof',
    text: 'Automation finished. Screenshot attached.',
    attachments: [
      { filename: 'signin-proof.png', path: 'test-results/signin-proof.png' }
    ]
  });
}
