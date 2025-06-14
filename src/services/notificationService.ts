import db from "../database/database";
import nodemailer from "nodemailer";

type ContactSubmission = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

const saveContactSubmission = async (
  data: ContactSubmission,
): Promise<void> => {
  const { name, email, phone, subject, message } = data;

  await db.query(
    `
    INSERT INTO contact_submissions (name, email, phone, subject, message)
    VALUES (?, ?, ?, ?, ?)
    `,
    [name, email, phone || "", subject, message],
  );
};

const sendEmail = async (data: ContactSubmission): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${data.name}" <${process.env.MAIL_USER}>`,
    to: process.env.BUSINESS_OWNER_EMAIL || process.env.MAIL_USER,
    subject: `New Contact Form Submission: ${data.subject}`,
    text: `
        From: ${data.name} <${data.email}>
        Phone: ${data.phone || "N/A"}

        Message:
        ${data.message}
    `.trim(),
  });
};

export default {
  saveContactSubmission,
  sendEmail,
};
