import db from "../database/database";
import nodemailer from "nodemailer";

type ContactSubmission = {
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

const saveContactSubmission = async (
  data: ContactSubmission,
): Promise<void> => {
  const { email, phone, subject, message } = data;
  await db.query(
    "INSERT INTO contact_submissions (email, phone, subject, message) VALUES (?, ?, ?, ?)",
    [email, phone || "", subject, message],
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
    from: `"Contact Form" <${process.env.MAIL_USER}>`,
    to: process.env.BUSINESS_OWNER_EMAIL,
    replyTo: data.email,
    subject: `New Contact Form Submission: ${data.subject}`,
    text: `
    From: ${data.email}
    Phone: ${data.phone || "N/A"}
    Message:
    ${data.message}
  `,
  });
};

export default {
  saveContactSubmission,
  sendEmail,
};
