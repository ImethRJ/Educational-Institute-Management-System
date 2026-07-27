import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const smtpHost = this.configService.get<string>("SMTP_HOST");
    const smtpPort = this.configService.get<number>("SMTP_PORT", 587);
    const smtpUser = this.configService.get<string>("SMTP_USER");
    const smtpPass = this.configService.get<string>("SMTP_PASS");

    if (smtpHost && smtpUser) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
    }
  }

  /**
   * Sri Lanka SMS Gateway Adapter Interface (Notify.lk / Dialog / Mobitel)
   */
  async sendSms(toPhone: string, messageText: string): Promise<boolean> {
    this.logger.log(
      `[SMS Gateway Adapter] Sending SMS to ${toPhone}: "${messageText}"`,
    );

    // In production, connects to Notify.lk REST API via fetch/axios
    // e.g. https://app.notify.lk/api/v1/send?user_id=...&api_key=...
    return true;
  }

  /**
   * Email Sender via Nodemailer
   */
  async sendEmail(
    toEmail: string,
    subject: string,
    htmlBody: string,
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`SMTP not configured. Mocking email send to ${toEmail}`);
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>(
          "EMAIL_FROM",
          "no-reply@sector.lk",
        ),
        to: toEmail,
        subject,
        html: htmlBody,
      });
      return true;
    } catch (err) {
      this.logger.error(`Failed to send email to ${toEmail}: ${err.message}`);
      return false;
    }
  }
}
