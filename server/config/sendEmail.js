import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async ({ sendTo, subject, html }) => {
  try {
    if (process.env.BREVO_API_KEY === "dummy") {
      console.log("⚠️ Bypassing email send because BREVO_API_KEY is 'dummy'.");
      return true;
    }

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: "sahilrv191@gmail.com",
          name: "Samridhi Enterprises",
        },
        to: [{ email: sendTo }],
        subject: subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent successfully:", response.data);
    return true;
  } catch (error) {
    console.error(
      "❌ Error sending email:",
      error.response?.data || error.message
    );
    console.log("BREVO_API_KEY:", process.env.BREVO_API_KEY);

    return false;
  }
};

export default sendEmail;
