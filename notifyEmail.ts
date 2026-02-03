import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function sendEmail() {

  const screenshotsDir = 'test-results';

  // 📸 Get all image files
  const attachments = fs.readdirSync(screenshotsDir)
    .filter(file => file.endsWith('.png'))
    .map(file => ({
      filename: file,
      path: path.join(screenshotsDir, file),
    }));

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
    subject: 'Playwright Automation Proof Screenshots',
    text: 'Automation completed. All step screenshots are attached.',
    attachments
  });

  console.log(`✅ Sent ${attachments.length} screenshots by email`);
}
