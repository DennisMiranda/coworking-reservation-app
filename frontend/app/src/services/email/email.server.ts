import nodemailer from "nodemailer";
import { db } from "/src/services/firebase/firebase.server";
import type {
  EmailSettingsResponse,
  EmailData,
  EmailReminderData,
} from "/src/models/email";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: import.meta.env.SECRET_EMAIL,
    pass: import.meta.env.SECRET_EMAIL_PASS,
  },
});

//Reminder with nodemailer
export const sendReservationReminderEmail = async (
  toEmail: string,
  subject: string,
  text: string
) => {
  try {
    const mailOptions = {
      from: import.meta.env.SECRET_EMAIL,
      to: toEmail,
      subject,
      html: text,
    };

    await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error(error as string);
    return {
      success: false,
      error: "Failed to send email",
    };
  }
};

export const getReminderBody = (template: string, data: EmailReminderData) => {
  let finalTemplate = template;
  for (const [key, value] of Object.entries(data)) {
    finalTemplate = finalTemplate.replace(`{{${key}}}`, value);
  }

  return finalTemplate;
};

export const getEmailSettings = async () => {
  try {
    const docRef = db.collection("settings").doc("email");
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    const { reminder_subject, reminder_content } =
      doc.data() as EmailSettingsResponse;

    return { subject: reminder_subject, content: reminder_content };
  } catch (error) {
    return null;
  }
};
