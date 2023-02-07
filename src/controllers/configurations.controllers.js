const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const Imap = require('node-imap')
const nodemailer = require("nodemailer");
const { encrypt, decrypt } = require('../utils/crypto')


module.exports.addConfigs = async (req, res) => {
    try {
        let userId = req.user.id
        let { currency, phoneFormat, dateFormat } = req.body

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            await connection.query('BEGIN')

            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q85'], { var1: _dt, var2: findAdmin.rows[0].company_id })
            let config = await connection.query(s2)

            let id = uuid.v4()
            let s3 = dbScript(db_sql['Q83'], { var1: id, var2: currency, var3: phoneFormat, var4: dateFormat, var5: findAdmin.rows[0].id, var6: findAdmin.rows[0].company_id })

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
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            let s2 = dbScript(db_sql['Q84'], { var1: findAdmin.rows[0].company_id })
            let configList = await connection.query(s2)

            let configuration = {}

            if (configList.rowCount > 0) {

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
        let userId = req.user.id
        let { email, appPassword, imapHost, imapPort, smtpHost, smtpPort } = req.body

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
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
                        promise.then(async (data) => {
                            await connection.query('BEGIN')
                            let _dt = new Date().toISOString();
                            let s2 = dbScript(db_sql['Q142'], { var1: _dt, var2: findAdmin.rows[0].id, var3: findAdmin.rows[0].company_id })
                            let updateCredential = await connection.query(s2)
                            let encryptedAppPassword = JSON.stringify(encrypt(appPassword))
                            let id = uuid.v4()
                            let s3 = dbScript(db_sql['Q143'], { var1: id, var2: email, var3: encryptedAppPassword, var4: findAdmin.rows[0].id, var5: imapHost, var6: imapPort, var7: smtpHost, var8: smtpPort, var9: findAdmin.rows[0].company_id })
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
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q138'], { var1: findAdmin.rows[0].id, var2: findAdmin.rows[0].company_id })
            let credentials = await connection.query(s2)

            let credentialObj = {}

            if (credentials.rowCount > 0) {
                let dpass = decrypt(JSON.parse(credentials.rows[0].app_password))
                credentialObj.id = credentials.rows[0].id
                credentialObj.email = credentials.rows[0].email
                credentialObj.appPassword = dpass
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

//-----------------------------------------------------------------------------------------

module.exports.addLeadTitle = async (req, res) => {
    try {
        let userId = req.user.id
        let { leadTitle } = req.body

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            await connection.query('BEGIN')

            let s2 = dbScript(db_sql['Q226'], { var1: leadTitle, var2: findAdmin.rows[0].company_id })
            let findTitle = await connection.query(s2)
            if (findTitle.rowCount == 0) {

                let id = uuid.v4()
                let s3 = dbScript(db_sql['Q210'], { var1: id, var2: leadTitle, var3: findAdmin.rows[0].company_id })
                let addTitle = await connection.query(s3)

                if (addTitle.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: "Lead title added successfully"
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
                    status: 200,
                    success: true,
                    message: "Lead title already exist"
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

module.exports.updateLeadTitle = async (req, res) => {
    try {
        let userId = req.user.id
        let { titleId, leadTitle } = req.body

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            await connection.query('BEGIN')

            let _dt = new Date().toISOString()
            let s3 = dbScript(db_sql['Q211'], { var1: leadTitle, var2: _dt, var3: titleId })

            let updateTitle = await connection.query(s3)

            if (updateTitle.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Lead title updated successfully"
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

module.exports.deleteLeadTitle = async (req, res) => {
    try {
        let userId = req.user.id
        let { titleId } = req.body

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            await connection.query('BEGIN')

            let _dt = new Date().toISOString()
            let s3 = dbScript(db_sql['Q212'], { var1: _dt, var2: titleId })

            let deleteTitle = await connection.query(s3)

            if (deleteTitle.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Lead title deleted successfully"
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

module.exports.leadTitleList = async (req, res) => {
    try {
        let userId = req.user.id

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            let s3 = dbScript(db_sql['Q213'], { var1: findAdmin.rows[0].company_id })
            let leadTitles = await connection.query(s3)

            if (leadTitles.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Lead title list",
                    data: leadTitles.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Lead title list",
                    data: []
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

//-----------------------------------------------------------------------------------------

module.exports.addLeadIndustry = async (req, res) => {
    try {
        let userId = req.user.id
        let { leadIndustry } = req.body

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            await connection.query('BEGIN')
            let s2 = dbScript(db_sql['Q227'], { var1: leadIndustry, var2: findAdmin.rows[0].company_id })
            let findIndustry = await connection.query(s2)
            if (findIndustry.rowCount == 0) {
                let id = uuid.v4()
                let s3 = dbScript(db_sql['Q214'], { var1: id, var2: leadIndustry, var3: findAdmin.rows[0].company_id })
                let addIndustry = await connection.query(s3)
                if (addIndustry.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: "Lead industry added successfully"
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
                    status: 200,
                    success: true,
                    message: "Lead industry already exists"
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

module.exports.updateLeadIndustry = async (req, res) => {
    try {
        let userId = req.user.id
        let { industryId, leadIndustry } = req.body

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            await connection.query('BEGIN')

            let _dt = new Date().toISOString()
            let s3 = dbScript(db_sql['Q215'], { var1: leadIndustry, var2: _dt, var3: industryId })

            let updateTitle = await connection.query(s3)

            if (updateTitle.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Lead industry updated successfully"
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

module.exports.deleteLeadIndustry = async (req, res) => {
    try {
        let userId = req.user.id
        let { industryId } = req.body

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            await connection.query('BEGIN')

            let _dt = new Date().toISOString()
            let s3 = dbScript(db_sql['Q216'], { var1: _dt, var2: industryId })

            let deleteLeadIndustry = await connection.query(s3)

            if (deleteLeadIndustry.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Lead industry deleted successfully"
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

module.exports.leadIndustryList = async (req, res) => {
    try {
        let userId = req.user.id

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            let s3 = dbScript(db_sql['Q217'], { var1: findAdmin.rows[0].company_id })
            let leadIndustry = await connection.query(s3)

            if (leadIndustry.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Lead industry list",
                    data: leadIndustry.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Lead industry list",
                    data: []
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

//-----------------------------------------------------------------------------------------

module.exports.addLeadSource = async (req, res) => {
    try {
        let userId = req.user.id
        let { leadSource } = req.body

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            await connection.query('BEGIN')
            let s2 = dbScript(db_sql['Q225'], { var1: leadSource, var2: findAdmin.rows[0].company_id })
            let findTitle = await connection.query(s2)
            if (findTitle.rowCount == 0) {
                let id = uuid.v4()
                let s3 = dbScript(db_sql['Q218'], { var1: id, var2: leadSource, var3: findAdmin.rows[0].company_id })
                let addSource = await connection.query(s3)
                if (addSource.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: "Lead source added successfully"
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
                    status: 200,
                    success: true,
                    message: "Lead source already exists"
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

module.exports.updateLeadSource = async (req, res) => {
    try {
        let userId = req.user.id
        let { sourceId, leadSource } = req.body

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            await connection.query('BEGIN')

            let _dt = new Date().toISOString()
            let s3 = dbScript(db_sql['Q219'], { var1: leadSource, var2: _dt, var3: sourceId })

            let updateSource = await connection.query(s3)

            if (updateSource.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Lead source updated successfully"
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

module.exports.deleteLeadSource = async (req, res) => {
    try {
        let userId = req.user.id
        let { sourceId } = req.body

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            await connection.query('BEGIN')

            let _dt = new Date().toISOString()
            let s3 = dbScript(db_sql['Q220'], { var1: _dt, var2: sourceId })

            let deleteSource = await connection.query(s3)

            if (deleteSource.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Lead source deleted successfully"
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

module.exports.leadSourceList = async (req, res) => {
    try {
        let userId = req.user.id

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            let s3 = dbScript(db_sql['Q221'], { var1: findAdmin.rows[0].company_id })
            let leadSource = await connection.query(s3)

            if (leadSource.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Lead Source list",
                    data: leadSource.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Lead Source list",
                    data: []
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

module.exports.notificationList = async (req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q290'], { var1: "'"+userId+"'"  })
        let notificationList = await connection.query(s1);
        console.log(notificationList.rows)
        await connection.query('BEGIN')
        if (notificationList.rows.length > 0) {
            await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Notification List",
                    data: notificationList.rows
                })
    
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Notification not found"
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