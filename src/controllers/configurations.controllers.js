const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const Imap = require('node-imap')
const nodemailer = require("nodemailer");


module.exports.addConfigs = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { currency, phoneFormat, dateFormat } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            await connection.query('BEGIN')

            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q91'], { var1: _dt, var2: findAdmin.rows[0].company_id })
            let config = await connection.query(s2)

            let id = uuid.v4()
            let s3 = dbScript(db_sql['Q89'], { var1: id, var2: currency, var3: phoneFormat, var4: dateFormat, var5: findAdmin.rows[0].id, var6 :findAdmin.rows[0].company_id })

            let addConfig = await connection.query(s3)

            if (addConfig.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "Configuration added successfully"
                })
            } else {
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong"
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
            })
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.configList = async (req, res) => {
    try {
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            let s2 = dbScript(db_sql['Q90'], { var1: findAdmin.rows[0].company_id })
            let configList = await connection.query(s2)

            let configuration = {}

            if (configList.rowCount > 0 ) {

                configuration.id = configList.rows[0].id
                configuration.currency = configList.rows[0].currency,
                configuration.phoneFormat = configList.rows[0].phone_format,
                configuration.dateFormat = configList.rows[0].date_format
                res.json({
                    status: 200,
                    success: true,
                    message: "Configuration List",
                    data: configuration
                })
            } else {
                configuration.id = "",
                configuration.currency = "",
                configuration.phoneFormat = "",
                configuration.dateFormat = ""
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Configuration List",
                    data: configuration
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
            })
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.addImapCredentials = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { email, appPassword, imapHost, imapPort, smtpHost, smtpPort } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rows.length > 0) {
            let imapConfig = {
                user: email,
                password: appPassword,
                host: imapHost,
                port: Number(imapPort),
                tls: true,
                tlsOptions: {
                    rejectUnauthorized: false
                }
            }
            let imap = new Imap(imapConfig);
            imap.once('error', async (err) => {
                res.json({
                    status: 400,
                    success: false,
                    message: `IMAP Error : ${err.message}`
                })
            });

            function openInbox(cb) {
                imap.openBox('INBOX', true, cb);
            }

            imap.once('ready', function () {
                openInbox(function (err, box) {
                    if (err) {
                        res.json({
                            status: 400,
                            success: false,
                            message: `IMAP Error : ${err.message}`
                        })
                    } else {
                        let transporter = nodemailer.createTransport({
                            host: smtpHost,
                            port: Number(smtpPort),
                            secure: (Number(smtpPort) == 465) ? true : false, // true for 465, false for other ports
                            auth: {
                                user: email,
                                pass: appPassword
                            }
                        });

                        // Specify the fields in the email.
                        let mailOptions = {
                            from: email,
                            to: "test@yopmail.com",
                            subject: "test Mail",
                            text: "This is a test mail to check smtp and port are correct"
                        };

                        // Send the email.
                        // let info = await transporter.sendMail(mailOptions)
                        let promise = new Promise((resolve, reject) => {
                            let info = transporter.sendMail(mailOptions)
                            if (info) {
                                resolve(info)
                            } else {
                                reject("error")
                            }
                        })
                        promise.then(async(data) => {
                            await connection.query('BEGIN')
                            let _dt = new Date().toISOString();
                            let s2 = dbScript(db_sql['Q151'], { var1: _dt, var2: findAdmin.rows[0].id, var3 : findAdmin.rows[0].company_id })
                            let updateCredential = await connection.query(s2)

                            let id = uuid.v4()
                            let s3 = dbScript(db_sql['Q152'], { var1: id, var2: email, var3: appPassword, var4: findAdmin.rows[0].id, var5: imapHost, var6: imapPort, var7: smtpHost, var8: smtpPort, var9 : findAdmin.rows[0].company_id })
                            let addCredentails = await connection.query(s3)

                            if (addCredentails.rowCount > 0) {
                                await connection.query('COMMIT')
                                res.json({
                                    status: 201,
                                    success: true,
                                    message: "Credentials added successfully"
                                })
                            } else {
                                await connection.query('ROLLBACK')
                                res.json({
                                    status: 400,
                                    success: false,
                                    message: "Something went wrong"
                                })
                            }
                        
                        })
                        .catch((err) => 
                            res.json({
                                status: 400,
                                success: false,
                                message: `SMTP Error : ${err.message}`
                            })
                        )
                    }
                })
            })
            imap.connect();
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
            })
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.imapCredentials = async (req, res) => {
    try {
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q147'], { var1: findAdmin.rows[0].id, var2: findAdmin.rows[0].company_id })
            let credentials = await connection.query(s2)

            let credentialObj = {}

            if (credentials.rowCount > 0 ) {
                credentialObj.id = credentials.rows[0].id
                credentialObj.email = credentials.rows[0].email
                credentialObj.appPassword = credentials.rows[0].app_password
                credentialObj.imapHost = credentials.rows[0].imap_host
                credentialObj.imapPort = credentials.rows[0].imap_port
                credentialObj.smtpHost = credentials.rows[0].smtp_host
                credentialObj.smtpPort = credentials.rows[0].smtp_port

                res.json({
                    status: 200,
                    success: true,
                    message: "credential List",
                    data: credentialObj
                })
            } else {
                credentialObj.id = "",
                credentialObj.email = "",
                credentialObj.appPassword = "",
                credentialObj.imapHost = ""
                credentialObj.imapPort = ""
                credentialObj.smtpHost = ""
                credentialObj.smtpPort = ""
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty credential List",
                    data: credentialObj
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
            })
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}