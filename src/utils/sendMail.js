const nodemailer = require("nodemailer");
const SibApiV3Sdk = require('sib-api-v3-sdk');
const welcomeTemplate = require('../templates/welcome')
const resetPassTemplate = require('../templates/resetPassword')
const setPassTemp = require('../templates/setPassword')
const contactUsTemplate = require('../templates/contactUs')
const recurringPaymentTemplate = require('../templates/recurringPayment')
const emailToContactTemplate = require('../templates/emailToContact')
require('dotenv').config()

let defaultClient = SibApiV3Sdk.ApiClient.instance;
//Instantiate the client\
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.API_KEY;

module.exports.welcomeEmail = async (email , link, userName) => {

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    //Define the campaign settings\
    sendSmtpEmail.name = "Email sent via the API";
    sendSmtpEmail.subject = "Welcome to hirise";
    sendSmtpEmail.sender = { "name": "Hirise Tech", "email": process.env.SMTP_EMAIL };
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
    sendSmtpEmail.sender = { "name": "Hirise Tech", "email": process.env.SMTP_EMAIL };
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
    sendSmtpEmail.sender = { "name": "Hirise Tech", "email": process.env.SMTP_EMAIL };
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

module.exports.recurringPaymentMail = async (email,customerName,endDate) => {
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    //Define the campaign settings\
    sendSmtpEmail.name = "Email sent via the API";
    sendSmtpEmail.subject = subject1;
    sendSmtpEmail.sender = { "name": "Hirise Tech", "email": process.env.SMTP_EMAIL };
    sendSmtpEmail.type = "classic";
    //Content that will be sent
    sendSmtpEmail.htmlContent = recurringPaymentTemplate.recurringPayment(customerName,endDate)
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
    sendSmtpEmail.sender = { "name": "Hirise Tech", "email": process.env.SMTP_EMAIL };
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
    sendSmtpEmail.sender = { "name": "Hirise Tech", "email": process.env.SMTP_EMAIL };
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

module.exports.sendEmailToContact = async (emails, subject, message, cc) => {

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    //Define the campaign settings\
    sendSmtpEmail.name = "Email sent via the API";
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.sender = { "name": "Hirise Tech", "email": process.env.SMTP_EMAIL };
    sendSmtpEmail.type = "classic";
    //Content that will be sent
    sendSmtpEmail.htmlContent = emailToContactTemplate.emailToContact(message)
    //Select the recipients
    let emailArr = []
    for(let email of emails){
        emailArr.push({
            "email" : email
        })
    }
    sendSmtpEmail.to = emailArr

    if(cc.length > 0){
        let ccArr = []
        for(let ccEmail of cc){
            ccArr.push({
                "email" : ccEmail
            })
        }
        sendSmtpEmail.cc = ccArr
    }

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

module.exports.recurringPaymentMail2 = async (email,customerName,endDate) => {
    const smtpEndpoint = "smtp.gmail.com";
    const port = 587;
    const senderAddress = process.env.SMTP_USERNAME;
    var toAddresses = email;

    let payment = recurringPaymentTemplate.recurringPayment(customerName,endDate)

    var ccAddresses = "";
    var bccAddresses = "";

    const smtpUsername = process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // The subject line of the email
    var subject = "Recurring payment Mail";
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

    let senderMail = senderEmail.email.split('@')[1]

    let smtp = (senderMail == 'gmail.com') ? "smtp.gmail.com" : 
               (senderMail == 'yahoo.com') ? "smtp.mail.yahoo.com" : 
               (senderMail == 'outlook.com') ? "smtp-mail.outlook.com" : 
               (senderMail == 'mail.com') ? "smtp.mail.com" : 
               (senderMail == 'zoho.com') ? "smtp.zoho.com" : `smtp.${senderMail}`

    let port = (senderMail == 'gmail.com') ? 587 : 
                (senderMail == 'yahoo.com') ? 465 : 
                (senderMail == 'outlook.com') ? 587 : 
                (senderMail == 'mail.com') ? 587 : 
                (senderMail == 'zoho.com') ? 465 : 587

   // const smtpEndpoint = "smtp.gmail.com";
   // const port = 587;
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
        host: smtp,
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
        html: sendEmail,
        attachments : attechments,
        // Custom headers for configuration set and message tags.
        headers: {}
    };

    // Send the email.
    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent! Message ID: ", info.messageId);

}
