import { Request, Response } from "express";
import notificationService from "../services/notificationService";

const sendEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ message: "Required fields missing" });
      return;
    }

    await notificationService.saveContactSubmission({
      name,
      email,
      phone,
      subject,
      message,
    });
    await notificationService.sendEmail({
      name,
      email,
      phone,
      subject,
      message,
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error sending contact form" });
  }
};

export default {
  sendEmail,
};
