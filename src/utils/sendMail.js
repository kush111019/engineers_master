const nodemailer = require("nodemailer");
const welcomeTemplate = require('../templates/welcome')
const resetPassTemplate = require('../templates/resetPassword')
const setPassTemp = require('../templates/setPassword')
require('dotenv').config()

// module.exports.sendEmail = async (email,code) => {
//     const smtpEndpoint = "smtp.gmail.com";
//     const port = 587;
//     const senderAddress = process.env.SMTP_USERNAME;
//     var toAddresses = email;

//     var ccAddresses = "";
//     var bccAddresses = "";

//     const smtpUsername = process.env.SMTP_USERNAME;
//     const smtpPassword = process.env.SMTP_PASSWORD;

//     // The subject line of the email
//     var subject = "Admin verification";
//     // The email body for recipients with non-HTML email clients.
//     var body_text = `Please use the below otp code to verify your self`;

//     // The body of the email for recipients whose email clients support HTML contenty.
//     //var body_html= emailTem;
//     var body_html = `<html>
//                      <head></head>
//                      <body>
//                      <b> your verification code is :- ${code} </b>
//                      </body>
//                      </html>`;

//     let transporter = nodemailer.createTransport({
//         host: smtpEndpoint,
//         port: port,
//         secure: false, // true for 465, false for other ports
//         auth: {
//             user: smtpUsername,
//             pass: smtpPassword
//         }
//     });

//     // Specify the fields in the email.
//     let mailOptions = {
//         from: senderAddress,
//         to: toAddresses,
//         subject: subject,
//         cc: ccAddresses,
//         bcc: bccAddresses,
//         text: body_text,
//         html: body_html,
//         // Custom headers for configuration set and message tags.
//         headers: {}
//     };

//     // Send the email.
//     let info = await transporter.sendMail(mailOptions)
//     console.log("Message sent! Message ID: ", info.messageId);

// }

module.exports.welcomeEmail = async (email , link, userName) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    let welcomeTemp = welcomeTemplate.welcome(link, userName)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = "Welcome to HiRise";
    // The email body for recipients with non-HTML email clients.
    var body_text = `Please use the below link to activate your account and reset your password`;
    
    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;
    var body_html = resetPass;

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
        html: welcomeTemp,
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.resetPasswordMail = async (email , link , userName) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    let resetPass = resetPassTemplate.resetPassword(link, email, userName)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = "Reset password";
    // The email body for recipients with non-HTML email clients.
    var body_text = `Please use the below link to reset your password`;
    
    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;
    var body_html = resetPass;

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
        html: resetPass,
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}


module.exports.setPasswordMail = async (email , link, userName) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    let verifyUser = setPassTemp.setPassword(link, userName)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = "Verification Mail";
    // The email body for recipients with non-HTML email clients.
    var body_text = `Please use the below link for verification`;
    
    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;
    var body_html = ``;

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
        html: verifyUser,
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}


module.exports.recurringPaymentMail = async (email,customerName) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    let payment = recurringPaymentTemplate.recurringPayment(customerName)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = "Recurring payment Mail";
    // The email body for recipients with non-HTML email clients.
    var body_text = `Please use the below link for verification`;
    
    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;
    var body_html = ``;

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
        html: payment,
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}
