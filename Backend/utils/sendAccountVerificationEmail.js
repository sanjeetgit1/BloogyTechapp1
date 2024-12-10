const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

//!Load dotenv into process object
dotenv.config();

const sendAccountVerificationEmail = async (to, verificationToken) => {
  try {
    //!create a transport object
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.APP_PWD,
      },
    });
    //create the message to be sent
    const message = {
      to,
      subject: " AccountVerification  Token",
      html: `<p> Your are receiving this email becouse you(or some else) have requested to verify your account. </p>
              <p> Please click in the following link, or paste this into your browser to complete the process:</p>
              <p>https://localhost:3000/reset-password/${verificationToken}</p>
              <p>If you did not request this ,please ingone this email and your password remain unchanged.</p>
              `,
    };
    //!send the email
    const info = await transport.sendMail(message);
    console.log("Email sent", info.messageId);
  } catch (error) {
    console.log(error.message);
    throw new Error("Email sending failed!");
  }
};

module.exports = sendAccountVerificationEmail;