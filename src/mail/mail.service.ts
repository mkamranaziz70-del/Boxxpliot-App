import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
async sendSetPasswordEmail(
  email: string,
  name: string,
  link: string
) {
  await this.transporter.sendMail({
    from: `"BoxxPilot" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Set your BoxxPilot password",
    html: `
      <h2>Hello ${name}</h2>
      <p>Your account is confirmed.</p>

      <p>Please set your password to access BoxxPilot:</p>

      <a href="${link}" style="
        display:inline-block;
        padding:12px 18px;
        background:#10b981;
        color:#ffffff;
        border-radius:6px;
        text-decoration:none;
        font-weight:600;
      ">
        Set Password
      </a>

      <p style="margin-top:16px;color:#6B7280">
        This link expires in 1 hour.
      </p>
    `,
  });
}
async sendEmployeePasswordSetup(
  email: string,
  name: string,
  link: string
) {
  await this.transporter.sendMail({
    from: `"BoxxPilot" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Set your password – BoxxPilot",
    html: `
      <h2>Hello ${name}</h2>
      <p>Your employee account has been activated.</p>

      <p>Click below to set your password:</p>

      <a href="${link}" style="
        display:inline-block;
        padding:12px 18px;
        background:#10b981;
        color:#ffffff;
        border-radius:6px;
        text-decoration:none;
        font-weight:600;
      ">
        Set Password
      </a>

      <p style="margin-top:16px;color:#6B7280">
        This link will expire in 1 hour.
      </p>
    `,
  });
}

  // ✅ NOW ACCEPTS 3 ARGUMENTS
  async sendEmployeeConfirmation(
    email: string,
    name: string,
    link: string
  ) {
    await this.transporter.sendMail({
      from: `"BoxxPilot" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Confirm your employment – BoxxPilot",
      html: `
        <h2>Welcome ${name}</h2>
        <p>You have been added as an employee in BoxxPilot.</p>

        <p>Please confirm your account by clicking below:</p>

        <a href="${link}" style="
          display:inline-block;
          padding:12px 18px;
          background:#2563EB;
          color:#ffffff;
          border-radius:6px;
          text-decoration:none;
          font-weight:600;
        ">
          Confirm Account
        </a>

        <p style="margin-top:16px;color:#6B7280">
          If you did not expect this email, you can safely ignore it.
        </p>
      `,
    });
  }
}
