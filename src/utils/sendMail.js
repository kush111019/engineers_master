const nodemailer = require("nodemailer");
require('dotenv').config()

module.exports.sendEmail = async (email,code) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = "Admin verification";
    // The email body for recipients with non-HTML email clients.
    var body_text = `Please use the below otp code to verify your self`;

    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;
    var body_html = `<html>
                     <head></head>
                     <body>
                     <b> your verification code is :- ${code} </b>
                     </body>
                     </html>`;

    let transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: port,
        secure: false, // true for 465, false for other ports
        auth: {
            user: smtpUsername,
            pass: smtpPassword
        }
    });

    // Specify the fields in the email.
    let mailOptions = {
        from: senderAddress,
        to: toAddresses,
        subject: subject,
        cc: ccAddresses,
        bcc: bccAddresses,
        text: body_text,
        html: body_html,
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.resetPasswordMail = async (email , link) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = "forgot password";
    // The email body for recipients with non-HTML email clients.
    var body_text = `Please use the below link to reset your password`;
    
    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;
    var body_html = `<html>
                     <head></head>
                     <body>
                     <b> Please Click on the link :- <a style="font-size: 20px" href=${link} target="_blank">Link</a></b>
                     </body>
                     </html>`;

    let transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: port,
        secure: false, // true for 465, false for other ports
        auth: {
            user: smtpUsername,
            pass: smtpPassword
        }
    });

    // Specify the fields in the email.
    let mailOptions = {
        from: senderAddress,
        to: toAddresses,
        subject: subject,
        cc: ccAddresses,
        bcc: bccAddresses,
        text: body_text,
        html: body_html,
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

