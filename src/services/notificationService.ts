import db from "../database/database";
import nodemailer from "nodemailer";

type ContactSubmission = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

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


function generateOrderHtml({
  isCustomer,
  customerName,
  orderId,
  items,
  totalAmount,
  location,
  pickupDate,
}: {
  isCustomer: boolean;
  customerName: string;
  orderId: number;
  items: {
    name: string;
    quantity: number;
    price: number;
    pack_size: string;
  }[];
  totalAmount: number;
  location?: string;
  pickupDate?: Date;
}) {
  const itemRows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 0;">${item.quantity} × ${item.name} (${item.pack_size})</td>
          <td style="text-align: right;">$${(Number(item.price) * item.quantity).toFixed(2)}</td>
        </tr>`,
    )
    .join("");

  const pickupDateFormatted = pickupDate
    ? new Date(pickupDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "TBD";

  const greeting = isCustomer
    ? `<h2 style="margin: 0; color: #8b4513;">Thank you for your order, ${customerName}!</h2>
       <p style="margin: 8px 0 0;">We're delighted to bake for you.</p>`
    : `<h2 style="margin: 0; color: #8b4513;">📥 New Order from ${customerName}</h2>
       <p style="margin: 8px 0 0;">Time to start baking!</p>`;

  return `
  <div style="font-family: 'Segoe UI', sans-serif; color: #333; padding: 20px; background: #fdfaf6;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
      
      <div style="padding: 24px; border-bottom: 2px solid #f3e5d8;">
        ${greeting}
      </div>

      <div style="padding: 24px;">
        <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0;"><strong>Order ID:</strong></td>
            <td style="text-align: right;">#${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><strong>Pickup Date:</strong></td>
            <td style="text-align: right;">${pickupDateFormatted}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><strong>Pickup Location:</strong></td>
            <td style="text-align: right;">${location || "TBD"}</td>
          </tr>
        </table>

        <h3 style="color: #8b4513;">Items</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${itemRows}
        </table>

        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 16px;"><strong>Total:</strong> $${Number(totalAmount).toFixed(2)}</p>

        <div style="margin-top: 32px; background: #fdf2e9; padding: 16px; border-radius: 6px; text-align: center;">
          <p style="margin: 0; font-size: 15px;">
            ${isCustomer ? "Questions? Reply to this email or visit our website." : "Prepare this order for the pickup date above."}
          </p>
        </div>
      </div>

      <div style="padding: 20px; text-align: center; font-size: 12px; color: #888;">
        <p>With love,</p>
        <p><strong>GM Petit Café</strong></p>
      </div>
    </div>
  </div>
  `.trim();
}


const sendOrderSummaryEmail = async (
  customerEmail: string,
  customerName: string,
  orderId: number,
  items: {
    name: string;
    quantity: number;
    price: number;
    pack_size: string;
  }[],
  totalAmount: number,
  location?: string,
  pickupDate?: Date,
): Promise<void> => {
  const html = generateOrderHtml({
    isCustomer: true,
    customerName,
    orderId,
    items,
    totalAmount,
    location,
    pickupDate,
  });

  await transporter.sendMail({
    from: `"GM Petit Cafe" <${process.env.MAIL_USER}>`,
    to: customerEmail,
    subject: `Your Order Summary - Order #${orderId}`,
    html,
  });
};


const sendIncomingOrderEmail = async (
  businessEmail: string,
  customerName: string,
  orderId: number,
  items: {
    name: string;
    quantity: number;
    price: number;
    pack_size: string;
  }[],
  totalAmount: number,
  location?: string,
  pickupDate?: Date,
): Promise<void> => {
  const html = generateOrderHtml({
    isCustomer: false,
    customerName,
    orderId,
    items,
    totalAmount,
    location,
    pickupDate,
  });

  await transporter.sendMail({
    from: `GM Petit Cafe Orders" <${process.env.MAIL_USER}>`,
    to: businessEmail,
    subject: `📥 New Incoming Order #${orderId} from ${customerName}`,
    html,
  });
};



export default {
  saveContactSubmission,
  sendEmail,
  sendOrderSummaryEmail,
  sendIncomingOrderEmail,
};
