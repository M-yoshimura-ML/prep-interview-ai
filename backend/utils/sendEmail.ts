import nodemailer from "nodemailer";

interface EmailOptions {
    email: string;
    subject: string;
    message: string;
}

export default async (options: EmailOptions) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}`,
        to: options.email,
        subject: options.subject,
        html: options.message
    }

    await transporter.sendMail(message);
}