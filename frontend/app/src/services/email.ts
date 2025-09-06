
import emailjs from "@emailjs/browser";

import type { EmailData } from "../models/email";

emailjs.init(import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY);

export const sendEmail = async (data: EmailData) => {
    try {
        const serviceId = import.meta.env.PUBLIC_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID;

        const response = await emailjs.send(serviceId, templateId, { ...data, logo: import.meta.env.PUBLIC_LOGO_URL });

        if (!response || response.status !== 200) {
            throw new Error(response?.text);
        }

        return {
            success: true,
            data: "Email sent successfully",
        };
    } catch (error) {
        console.error(error as string);
        return {
            success: false,
            error: "Failed to send email",
        };
    }
};