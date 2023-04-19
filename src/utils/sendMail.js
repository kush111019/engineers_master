const nodemailer = require("nodemailer");
const SibApiV3Sdk = require('sib-api-v3-sdk');
const welcomeTemplate = require('../templates/welcome')
const resetPassTemplate = require('../templates/resetPassword')
const setPassTemp = require('../templates/setPassword')
const contactUsTemplate = require('../templates/contactUs')
const paymentReminderTemplate = require('../templates/paymentReminder')
const emailToContactTemplate = require('../templates/emailToContact')
const tagetClosingDateRemindertemplate = require('../templates/targetClosingDateReminder')
const recurringSaleRemindertemplate = require('../templates/recurringSalesReminder')
const notificationTemplate = require('../templates/notifications')
require('dotenv').config()
const eventScheduleTemplate = require('../templates/eventSchedule')

let defaultClient = SibApiV3Sdk.ApiClient.instance;
//Instantiate the client\
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.API_KEY;

module.exports.welcomeEmail = async (email , link, userName) => {

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    //Define the campaign settings\
    sendSmtpEmail.name = "Email sent via the API";
    sendSmtpEmail.subject = "Welcome to Revenue Captain";
    sendSmtpEmail.sender = { "name": "Revenue Captain", "email": process.env.SMTP_EMAIL };
    sendSmtpEmail.type = "classic";
    //Content that will be sent
    sendSmtpEmail.htmlContent = welcomeTemplate.welcome(link, userName)
    //Select the recipients
    sendSmtpEmail.to = [{ "email" : email }]
    //Schedule the sending in one hour
    //scheduledAt = '2018-01-01 00:00:01'

    //Make the call to the client
    let sentdata = apiInstance.sendTransacEmail(sendSmtpEmail).then((data)=> {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
        return JSON.stringify(data)
      }).catch((error)=> {
        console.error(error);
        return error
      });
    return sentdata
}

module.exports.resetPasswordMail = async (email , link , userName) => {

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    //Define the campaign settings\
    sendSmtpEmail.name = "Email sent via the API";
    sendSmtpEmail.subject = "Reset Password";
    sendSmtpEmail.sender = { "name": "Revenue Captain", "email": process.env.SMTP_EMAIL };
    sendSmtpEmail.type = "classic";
    //Content that will be sent
    sendSmtpEmail.htmlContent = resetPassTemplate.resetPassword(link, email, userName)
    //Select the recipients
    sendSmtpEmail.to = [{ "email" : email }]
    //Schedule the sending in one hour
    //scheduledAt = '2018-01-01 00:00:01'

    //Make the call to the client
    let sentdata = apiInstance.sendTransacEmail(sendSmtpEmail).then((data)=> {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
        return JSON.stringify(data)
      }).catch((error)=> {
        console.error(error);
        return error
      });
    return sentdata
}

module.exports.setPasswordMail = async (email , link, userName) => {

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    //Define the campaign settings\
    sendSmtpEmail.name = "Email sent via the API";
    sendSmtpEmail.subject = "Set password mail";
    sendSmtpEmail.sender = { "name": "Revenue Captain", "email": process.env.SMTP_EMAIL };
    sendSmtpEmail.type = "classic";
    //Content that will be sent
    sendSmtpEmail.htmlContent = setPassTemp.setPassword(link, userName)
    //Select the recipients
    sendSmtpEmail.to = [{ "email" : email }]
    //Schedule the sending in one hour
    //scheduledAt = '2018-01-01 00:00:01'

    //Make the call to the client
    let sentdata = apiInstance.sendTransacEmail(sendSmtpEmail).then((data)=> {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
        return JSON.stringify(data)
      }).catch((error)=> {
        console.error(error);
        return error
      });
    return sentdata
}

module.exports.paymentReminderMail = async (email,customerName,endDate) => {
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    //Define the campaign settings\
    sendSmtpEmail.name = "Email sent via the API";
    sendSmtpEmail.subject = "Payment reminder mail";
    sendSmtpEmail.sender = { "name": "Revenue Captain", "email": process.env.SMTP_EMAIL };
    sendSmtpEmail.type = "classic";
    //Content that will be sent
    sendSmtpEmail.htmlContent = paymentReminderTemplate.paymentReminder(customerName,endDate)
    //Select the recipients
    sendSmtpEmail.to = [{ "email" : email }]
    //Schedule the sending in one hour
    //scheduledAt = '2018-01-01 00:00:01'

    //Make the call to the client
    let sentdata = apiInstance.sendTransacEmail(sendSmtpEmail).then((data)=> {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
        return JSON.stringify(data)
      }).catch((error)=> {
        console.error(error);
        return error
      });
    return sentdata

}

module.exports.contactUsMail = async (email,fullName,subject1,message,address) => {

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    //Define the campaign settings\
    sendSmtpEmail.name = "Email sent via the API";
    sendSmtpEmail.subject = subject1;
    sendSmtpEmail.sender = { "name": "Revenue Captain", "email": process.env.SMTP_EMAIL };
    sendSmtpEmail.type = "classic";
    //Content that will be sent
    sendSmtpEmail.htmlContent = contactUsTemplate.contactUs(email,fullName,subject1,message,address)
    //Select the recipients
    sendSmtpEmail.to = [{ "email" : process.env.SMTP_EMAIL }]
    //Schedule the sending in one hour
    //scheduledAt = '2018-01-01 00:00:01'

    //Make the call to the client
    let sentdata = apiInstance.sendTransacEmail(sendSmtpEmail).then((data)=> {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
        return JSON.stringify(data)
      }).catch((error)=> {
        console.error(error);
        return error
      });
    return sentdata
}

module.exports.resetPasswordMail = async (email , link , userName) => {

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    //Define the campaign settings\
    sendSmtpEmail.name = "Email sent via the API";
    sendSmtpEmail.subject = "Reset Password";
    sendSmtpEmail.sender = { "name": "Revenue Captain", "email": process.env.SMTP_EMAIL };
    sendSmtpEmail.type = "classic";
    //Content that will be sent
    sendSmtpEmail.htmlContent = emailToContactTemplate.emailToContact(message)
    //Select the recipients
    sendSmtpEmail.to = [{ "email" : email }]
    //Schedule the sending in one hour
    //scheduledAt = '2018-01-01 00:00:01'

    //Make the call to the client
    let sentdata = apiInstance.sendTransacEmail(sendSmtpEmail).then((data)=> {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
        return JSON.stringify(data)
      }).catch((error)=> {
        console.error(error);
        return error
      });
    return sentdata
}

module.exports.tagetClosingDateReminderMail = async (email,customerName,targetClosingDate) => {
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    //Define the campaign settings\
    sendSmtpEmail.name = "Email sent via the API";
    sendSmtpEmail.subject = "Target closing date reminder";
    sendSmtpEmail.sender = { "name": "Revenue Captain", "email": process.env.SMTP_EMAIL };
    sendSmtpEmail.type = "classic";
    //Content that will be sent
    sendSmtpEmail.htmlContent = tagetClosingDateRemindertemplate.tagetClosingDateReminder(customerName,targetClosingDate)
    //Select the recipients
    let emailArr = []
    for(let i = 0 ; i<email.length; i++){
        emailArr.push({
            "email" : email[i]
        })
    }
    sendSmtpEmail.to = emailArr
    //Schedule the sending in one hour
    //scheduledAt = '2018-01-01 00:00:01'

    //Make the call to the client
    let sentdata = apiInstance.sendTransacEmail(sendSmtpEmail).then((data)=> {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
        return JSON.stringify(data)
      }).catch((error)=> {
        console.error(error);
        return error
      });
    return sentdata

}

module.exports.recurringSalesReminderMail = async (email,customerName,recurringDate) => {
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    //Define the campaign settings\
    sendSmtpEmail.name = "Email sent via the API";
    sendSmtpEmail.subject = "Recurring sales reminder";
    sendSmtpEmail.sender = { "name": "Revenue Captain", "email": process.env.SMTP_EMAIL };
    sendSmtpEmail.type = "classic";
    //Content that will be sent
    sendSmtpEmail.htmlContent = recurringSaleRemindertemplate.recurringSalesReminder(customerName,recurringDate)
    //Select the recipients
    let emailArr = []
    for(let i = 0 ; i<email.length; i++){
        emailArr.push({
            "email" : email[i]
        })
    }
    sendSmtpEmail.to = emailArr
    //Schedule the sending in one hour
    //scheduledAt = '2018-01-01 00:00:01'

    //Make the call to the client
    let sentdata = apiInstance.sendTransacEmail(sendSmtpEmail).then((data)=> {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
        return JSON.stringify(data)
      }).catch((error)=> {
        console.error(error);
        return error
      });
    return sentdata

}

module.exports.notificationMail = async (email,msg) => {
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    //Define the campaign settings\
    sendSmtpEmail.name = "Email sent via the API";
    sendSmtpEmail.subject = "Notification Mail";
    sendSmtpEmail.sender = { "name": "Revenue Captain", "email": process.env.SMTP_EMAIL };
    sendSmtpEmail.type = "classic";
    //Content that will be sent
    sendSmtpEmail.htmlContent = notificationTemplate.notifications(msg)
    //Select the recipients
    let emailArr = []
    for(let i = 0 ; i<email.length; i++){
        emailArr.push({
            "email" : email[i]
        })
    }
    sendSmtpEmail.to = emailArr
    //Schedule the sending in one hour
    //scheduledAt = '2018-01-01 00:00:01'

    //Make the call to the client
    let sentdata = apiInstance.sendTransacEmail(sendSmtpEmail).then((data)=> {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
        return JSON.stringify(data)
      }).catch((error)=> {
        console.error(error);
        return error
      });
    return sentdata

}

//-----------------------------------------Local Email-------------------------------------


module.exports.welcomeEmail2 = async (email , link, userName) => {
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

module.exports.resetPasswordMail2 = async (email , link , userName) => {
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

module.exports.setPasswordMail2 = async (email , link, userName) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    let setPass = setPassTemp.setPassword(link, userName)

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
        html: setPass,
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.paymentReminderMail2 = async (email,customerName,endDate) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    let payment = paymentReminderTemplate.paymentReminder(customerName,endDate)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = "Plan expiry reminder";
    // The email body for recipients with non-HTML email clients.
    var body_text = ``;
    
    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;

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

module.exports.contactUsMail2 = async (email,fullName,subject,message,address) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = process.env.SMTP_USERNAME;

    let contact = contactUsTemplate.contactUs(email,fullName,subject,message,address)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    //let subject = subject;
    // The email body for recipients with non-HTML email clients.
    var body_text = `Contact us Mail`;
    
    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;

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
        html: contact,
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.sendEmailToContact2 = async(emails, subject, message, cc, senderEmail, attechments) => {
   
    const senderAddress = senderEmail.email;
    let toAddresses = emails;

    let sendEmail = emailToContactTemplate.emailToContact(message)

    let ccAddresses = (cc.length > 0) ? cc : "";
    var bccAddresses = "";

    const smtpUsername = senderEmail.email;
    const smtpPassword = senderEmail.password;

    // The subject line of the email
    //let subject = subject;
    // The email body for recipients with non-HTML email clients.
    var body_text = ``;
    
    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;
    let transporter = nodemailer.createTransport({
        host: senderEmail.smtpHost,
        port: Number(senderEmail.smtpPort),
        secure: (Number(senderEmail.smtpPort) == 465) ? true : false, // true for 465, false for other ports
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
        html: sendEmail,
        attachments : attechments,
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.tagetClosingDateReminderMail2 = async (email,customerName,targetClosingDate) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    let payment = tagetClosingDateRemindertemplate.tagetClosingDateReminder(customerName,targetClosingDate)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = "Target closing date reminder";
    // The email body for recipients with non-HTML email clients.
    var body_text = ``;
    
    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;

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

module.exports.recurringSalesReminderMail2 = async (email,customerName,recurringDate) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    let payment = recurringSaleRemindertemplate.recurringSalesReminder(customerName,recurringDate)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = "Recurring sales reminder";
    // The email body for recipients with non-HTML email clients.
    var body_text = ``;
    
    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;

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

module.exports.notificationMail2 = async (email,msg) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    let notification = notificationTemplate.notifications(msg)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = "Notification Mail";
    // The email body for recipients with non-HTML email clients.
    var body_text = ``;
    
    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;

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
        html: notification,
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.leadEmail2 = async (email , template, subject, credentialObj) => {
    const smtpEndpoint = credentialObj.smtpHost;
    const port = Number(credentialObj.smtpPort);
    const senderAddress = credentialObj.email;
    var toAddresses = email;

    let Temp = template 

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = credentialObj.email;
    const smtpPassword = credentialObj.appPassword;

    // The subject line of the email
    var subject = subject;
    // The email body for recipients with non-HTML email clients.
    var body_text = ``;
    
    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;

    let transporter = nodemailer.createTransport({
        host: smtpEndpoint,
        port: port,
        secure: (port == 465) ? true : false, // true for 465, false for other ports
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
        html: Temp,
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}

module.exports.eventScheduleMail = async (creatorName,creatorEmail, eventName, meetLink, leadName, leadEmail, description, dateTime, timezone) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = creatorEmail;

    let notification = eventScheduleTemplate.eventSchedule(creatorName, eventName, meetLink, leadName, leadEmail, description, dateTime, timezone)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = `New Event:- ${leadName} - ${dateTime} -  ${eventName}`;
    // The email body for recipients with non-HTML email clients.
    var body_text = ``;
    
    // The body of the email for recipients whose email clients support HTML contenty.
    //var body_html= emailTem;

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
        html: notification,
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}
