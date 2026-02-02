
import { sendEmail } from './notifyEmail';

export default async function globalTeardown() {
  console.log('📧 Sending automation report email...');
  await sendEmail();
}
