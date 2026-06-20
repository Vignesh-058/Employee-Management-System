import nodemailer from 'nodemailer';
import logger from '../utils/logger';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT || '2525', 10),
      auth: {
        user: process.env.SMTP_USER || 'user',
        pass: process.env.SMTP_PASSWORD || 'password',
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const message = {
      from: `${process.env.FROM_NAME || 'EMS'} <${process.env.FROM_EMAIL || 'noreply@ems.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    try {
      // If we are using the default dummy credentials, just log the email instead of trying to send
      if (process.env.SMTP_USER === undefined || process.env.SMTP_USER === 'user') {
        logger.info(`[DEV MODE] Email to ${options.email}:`);
        logger.info(`Subject: ${options.subject}`);
        logger.info(`Body: \n${options.message}`);
        return;
      }
      
      await this.transporter.sendMail(message);
      logger.info(`Email sent to ${options.email}`);
    } catch (error) {
      logger.error('Email could not be sent', error);
      // In dev mode, still log the email if sending failed
      logger.info(`[FAILED EMAIL CONTENT]\nTo: ${options.email}\nSubject: ${options.subject}\nBody: \n${options.message}`);
    }
  }
}

export const emailService = new EmailService();
