import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_PORT = process.env.SMTP_PORT;

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

export async function main() {
    // send mail with defined transport object :
    const info = await transporter.sendMail({
        from: `"Test" <${SMTP_USER}>`,
        to: "julesgrange@outlook.fr",
        subject: "Hello",
        text: "Hello world", // plain text body
        html: "<b>Hello world</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);
