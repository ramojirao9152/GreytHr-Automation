
import nodemailer from 'nodemailer';

export async function sendEmail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: 'Playwright Test Proof',
    text: 'Automation finished. Screenshot attached.',
    attachments: [
      { filename: 'signin-proof.png', path: 'test-results/signin-proof.png' }
    ]
  });
}
