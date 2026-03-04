import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Read status passed from GitHub Actions
const status = process.argv[2] || 'unknown';

export async function sendEmail() {

  const screenshotsDir = 'test-results';
  let attachments = [];

  // Safely read screenshots if folder exists
  if (fs.existsSync(screenshotsDir)) {
    attachments = fs.readdirSync(screenshotsDir)
      .filter(file => file.endsWith('.png'))
      .map(file => ({
        filename: file,
        path: path.join(screenshotsDir, file),
      }));
  }

  // Email subject + message based on status
  let subject;
  let message;

  if (status === 'success') {
    subject = '✅ GreytHR Automation SUCCESS';
    message = 'Automation completed successfully. Screenshots are attached as proof.';
  } else if (status === 'failure') {
    subject = '❌ GreytHR Automation FAILED';
    message = 'Automation failed. Please check GitHub Actions logs.';
  } else {
    subject = '⚠️ GreytHR Automation STATUS UNKNOWN';
    message = 'Automation finished but status could not be determined.';
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ALERT_EMAIL,
      pass: process.env.ALERT_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.ALERT_EMAIL,
    to: process.env.ALERT_TO,
    subject: subject,
    text: message,
    attachments: attachments
  });

  console.log(`📧 Email sent. Status: ${status}. Screenshots attached: ${attachments.length}`);
}

// Run function
sendEmail();
