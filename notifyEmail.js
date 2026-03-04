import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const status = process.argv[2] || 'unknown';

async function sendEmail() {

  const screenshotsDir = 'test-results';
  let attachments = [];

  if (fs.existsSync(screenshotsDir)) {
    attachments = fs.readdirSync(screenshotsDir)
      .filter(file => file.endsWith('.png'))
      .map(file => ({
        filename: file,
        path: path.join(screenshotsDir, file),
      }));
  }

  let subject;
  let message;

  if (status === 'success') {
    subject = '✅ GreytHR Automation SUCCESS';
    message = 'Automation completed successfully. Screenshots are attached.';
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
    subject,
    text: message,
    attachments
  });

  console.log(`📧 Email sent. Status: ${status}. Screenshots attached: ${attachments.length}`);
}

sendEmail();
