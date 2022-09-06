const SibApiV3Sdk = require('sib-api-v3-sdk');
const welcomeTemplate = require('../templates/welcome')
const resetPassTemplate = require('../templates/resetPassword')
const setPassTemp = require('../templates/setPassword')
const contactUsTemplate = require('../templates/contactUs')
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
//---------------------------------------------------------------------------------------




