import { Resend } from 'resend';
export const resend = new Resend(process.env.RESEND_API_KEY);
export const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@example.com';
export const ADMIN_EMAILS =
  (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean);
