const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const { sendEmailToContact2 } = require("../utils/sendMail")
const {simpleParser} = require('mailparser');
const Imap = require('node-imap')
const {containsObject, setEmailRead, mysql_real_escape_string} = require('../utils/helper')
const { decrypt } = require('../utils/crypto')

module.exports.fetchEmails = async (req, res) => {
    try {
        await connection.query('BEGIN')
        let id = req.user.id
        let s0 = dbScript(db_sql['Q8'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            let j = 0;
            let s1 = dbScript(db_sql['Q125'], { var1: checkAdmin.rows[0].id, var2 : checkAdmin.rows[0].company_id })
            let findCredentials = await connection.query(s1)
            let mainArray = []
            if (findCredentials.rowCount > 0) {
                let dpass = decrypt(JSON.parse(findCredentials.rows[0].app_password))
                let imapConfig = {
                    user: findCredentials.rows[0].email,
                    password: dpass,
                    host: findCredentials.rows[0].imap_host,
                    port: Number(findCredentials.rows[0].imap_port),
                    tls: true,
                    tlsOptions: {
                        rejectUnauthorized: false
                    }
                }
                let imap = new Imap(imapConfig);
                imap.once('error', (err) => {
                    res.json({
                        status: 400,
                        success: false,
                        message: `IMAP Error : ${err.message}`
                    })
                });

                function openInbox(cb) {
                    imap.once('ready', function () {
                        imap.openBox('INBOX', true, cb);
                    })
                }
                openInbox(async function (err, box) {
                    if (err) throw err;
                    let arr = []
                    let date = new Date()
                    let month = date.toLocaleString('default', { month: 'long' });
                    let year = date.getFullYear()
                    let day = date.getDate()
                    let formatedDate = `${month} ${day}, ${year}`
                    //console.log('October 28, 2021');
                    imap.search(['ALL', ['SINCE', formatedDate]], function (err, results) {
                        if (err) {
                            console.log('Search error : ', err)
                        }
                        else if (results.length > 0) {
                            let f = imap.fetch(results, { bodies: '' });
                            f.on('message', function (msg, seqno) {
                                let prefix = '(#' + seqno + ') ';
                                msg.on('body', async function (stream, info) {
                                    j += 1
                                    let parsed = await simpleParser(stream)
                                    let obj = {
                                        messageId: parsed.messageId
                                    }
                                    arr.push(obj)
                                    let s2 = dbScript(db_sql['Q122'], { var1: checkAdmin.rows[0].company_id, var2 : checkAdmin.rows[0].id })
                                    let getEmails = await connection.query(s2)
                                    if (getEmails.rowCount > 0) {
                                        let checkMail = containsObject(parsed, getEmails.rows)
                                        if (!checkMail) {
                                            let s3 = dbScript(db_sql['Q123'], { var1: parsed.from.value[0].address, var2: checkAdmin.rows[0].company_id })
                                            let findByFrom = await connection.query(s3)
                                            if (findByFrom.rowCount > 0) {
                                               
                                                let text = (Buffer.from(parsed.text, "utf8")).toString('base64')
                                                let html = (Buffer.from(parsed.html, "utf8")).toString('base64')
                                                let textAsHtml = (Buffer.from(parsed.textAsHtml, "utf8")).toString('base64')
                                                let attachments = (parsed.attachments.length > 0) ? (Buffer.from(JSON.stringify(parsed.attachments), "utf8")).toString('base64') : ""
                                                let date = parsed.date.toISOString()

                                                let s4 = dbScript(db_sql['Q124'], { var1: parsed.messageId, var2: parsed.to.value[0].address, var3: parsed.from.value[0].address, var4: parsed.from.value[0].name, var5: date, var6: parsed.subject, var7: html, var8: text, var9: textAsHtml, var10: checkAdmin.rows[0].company_id, var11: attachments, var12 : checkAdmin.rows[0].id })
                                                let insertEmail = await connection.query(s4)
                                                if (insertEmail.rowCount > 0) {
                                                    mainArray.push(insertEmail);
                                                    await connection.query('COMMIT')
                                                }
                                            }
                                        }
                                    } else {
                                        let s5 = dbScript(db_sql['Q123'], { var1: parsed.from.value[0].address, var2: checkAdmin.rows[0].company_id })
                                        let findByFrom = await connection.query(s5)
                                        if (findByFrom.rowCount > 0) {
                                            await connection.query('BEGIN')
                                            let text = (Buffer.from(parsed.text, "utf8")).toString('base64')
                                            let html = (Buffer.from(parsed.html, "utf8")).toString('base64')
                                            let textAsHtml = (Buffer.from(parsed.textAsHtml, "utf8")).toString('base64')
                                            let attachments = (parsed.attachments.length > 0) ? (Buffer.from(JSON.stringify(parsed.attachments), "utf8")).toString('base64') : ""
                                            let date = parsed.date.toISOString()

                                            let s6 = dbScript(db_sql['Q124'], { var1: parsed.messageId, var2: parsed.to.value[0].address, var3: parsed.from.value[0].address, var4: parsed.from.value[0].name, var5: date, var6: parsed.subject, var7: html, var8: text, var9: textAsHtml, var10: checkAdmin.rows[0].company_id, var11: attachments, var12 : checkAdmin.rows[0].id })
                                            let insertEmail = await connection.query(s6)
                                            if (insertEmail.rowCount > 0) {
                                                mainArray.push(insertEmail);
                                                await connection.query('COMMIT')
                                            }
                                        }
                                    }
                                });
                                msg.once('end', function () {
                                    console.log(prefix + 'Finished');
                                });
                            });
                            f.once('error', function (err) {
                                console.log('Fetch error: ' + err);
                            });
                            f.once('end', async function () {
                                imap.end();
                                let interval = setInterval(async () => {
                                    if (arr.length == j) {
                                        if (mainArray.length > 0) {
                                            res.json({
                                                status: 200,
                                                success: true,
                                                message: "New email recieved"
                                            })
                                            clearInterval(interval)
                                        } else {
                                            res.json({
                                                status: 200,
                                                success: false,
                                                message: "No new email recieved"
                                            })
                                            clearInterval(interval)
                                        }
                                    }
                                }, 1000);
                            });
                        } else {
                            res.json({
                                status: 200,
                                success: false,
                                message: "No new email received"
                            })
                        }
                    });
                })
                imap.once('end', function () {
                    console.log('Connection ended');
                });
                imap.connect();
            } else {
                if (findCredentials.rowCount == 0) {
                    res.json({
                        status: 400,
                        success: false,
                        message: "IMAP credentials not found"
                    })
                } else {
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
            })
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }
}

module.exports.inbox = async(req, res) => {
    try {
        let { id } = req.user
        let s0 = dbScript(db_sql['Q8'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            let s1 = dbScript(db_sql['Q122'], {var1 : checkAdmin.rows[0].company_id, var2 : checkAdmin.rows[0].id})
            let findInbox = await connection.query(s1)
            if(findInbox.rowCount > 0){
                let inboxArr = []
                for(let inboxData of findInbox.rows){
                    let text = (Buffer.from(inboxData.mail_text, "base64")).toString('utf8')
                    let html = (Buffer.from(inboxData.mail_html, "base64")).toString('utf8')
                    let textAsHtml = (Buffer.from(inboxData.mail_text_as_html, "base64")).toString('utf8')
                    let attachments = inboxData.attechments ? JSON.parse((Buffer.from(inboxData.attechments, "base64")).toString('utf8')) : []

                    inboxArr.push({
                        id : inboxData.id,
                        messageId : inboxData.message_id,
                        toMail : inboxData.to_mail,
                        fromMail : inboxData.from_mail,
                        fromName : inboxData.from_name,
                        fromImage : process.env.DEFAULT_EMAIL_LOGO,
                        mailDate : inboxData.mail_date,
                        subject : inboxData.subject,
                        text : text,
                        html : html,
                        textAsHtml : textAsHtml,
                        attachments : attachments,
                        companyId : inboxData.company_id,
                        readStatus : inboxData.read_status
                    })
                }
                if(inboxArr.length > 0){
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Inbox Data',
                        data : inboxArr
                    })
                }else{
                    res.json({
                        status: 200,
                        success: false,
                        message: 'Empty Inbox Data',
                        data : inboxArr
                    })
                }
            }else{
                if(findInbox.rowCount == 0){
                    res.json({
                        status: 200,
                        success: false,
                        message: 'Empty inbox data',
                        data : []
                    })
                }else{
                    res.json({
                        status: 400,
                        success: false,
                        message: 'Something went wrong'
                    })
                } 
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: 'Admin not found'
            })
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }
}

module.exports.uploadMailAttechment = async (req, res) => {
    try {
        let files = req.files
        uploadedArr = []
        for(let item of files){
            let path = `${process.env.MAIL_ATTECHMENT_PATH}/${item.filename}`
            uploadedArr.push(
                {
                    filename : item.originalname,
                    path : path,
                    mimetype : item.mimetype
                }
            )
        }
        if(uploadedArr.length > 0){
            res.json({
                status: 201,
                success: true,
                message: "Mail attachments Uploaded successfully!",
                data: uploadedArr
            })
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
            data: ""
        })
    }
}

module.exports.sendEmail = async (req, res) => {
    try {
        let { id } = req.user
        let { emails, subject, message, cc, salesId, attachments } = req.body
        await connection.query('BEGIN')
        let s0 = dbScript(db_sql['Q8'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            let s1 = dbScript(db_sql['Q125'], { var1: checkAdmin.rows[0].id, var2: checkAdmin.rows[0].company_id  })
            let findCredentials = await connection.query(s1)
            if (findCredentials.rowCount > 0) {
                let dpass = decrypt(JSON.parse(findCredentials.rows[0].app_password))
                let senderEmail = {
                    email: findCredentials.rows[0].email,
                    password: dpass,
                    smtpHost : findCredentials.rows[0].smtp_host,
                    smtpPort : findCredentials.rows[0].smtp_port
                }
                let bufferedMessage = (Buffer.from(message, "utf8")).toString('base64')
               
                let s2 = dbScript(db_sql['Q127'], { var1:findCredentials.rows[0].email, var2: JSON.stringify(emails), var3: JSON.stringify(cc), var4: mysql_real_escape_string(subject), var5: bufferedMessage, var6: checkAdmin.rows[0].company_id, var7: salesId, var8: JSON.stringify(attachments), var9 : checkAdmin.rows[0].id })
                let storeSentMail = await connection.query(s2)

                let attachmentsArr = [];
                if(attachments.length > 0){
                    for (let item of attachments) {
                        attachmentsArr.push({
                            filename: item.filename,
                            path: item.path
                        })
                    }
                }
                
                if (storeSentMail.rowCount > 0) {
                    await sendEmailToContact2(emails, subject, message, cc, senderEmail, attachmentsArr);
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Email sent successfully!",
                    })
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong",
                    })
                }
            } else {
                if(findCredentials.rowCount == 0){
                    res.json({
                        status: 400,
                        success: false,
                        message: "IMAP credentials not found"
                    })
                }else{
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }
            }

        } else {
            res.json({
                status: 400,
                success: false,
                message: 'Admin not found'
            })
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message
        });
    }
}

module.exports.SentEmailList = async (req, res) => {
    try {
        let { id } = req.user
        let { salesId } = req.params
        let s0 = dbScript(db_sql['Q8'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            let s1 = dbScript(db_sql['Q128'], { var1: checkAdmin.rows[0].company_id, var2 : salesId, var3 : checkAdmin.rows[0].id })
            let findInbox = await connection.query(s1)
            if (findInbox.rowCount > 0) {
                let inboxArr = []
                for (let inboxData of findInbox.rows) {
                    let message = (Buffer.from(inboxData.message, "base64")).toString('utf8')
                    let attachments = (inboxData.attechments != null) ? JSON.parse(inboxData.attechments) : [];
    
                    inboxArr.push({
                        id : inboxData.id,
                        toMail : JSON.parse(inboxData.to_email),
                        fromMail : inboxData.from_email,
                        cc : JSON.parse(inboxData.cc),
                        subject : inboxData.subject,
                        message : message,
                        attachments : attachments,
                        companyId : inboxData.company_id,
                        salesId : inboxData.sales_id,
                        createdAt : inboxData.created_at
                    })
                }
                 if(inboxArr.length > 0){
                     res.json({
                         status: 200,
                         success: true,
                         message: 'Sent emails',
                         data : inboxArr
                     })
                 }else{
                     res.json({
                         status: 200,
                         success: false,
                         message: 'Empty Sent emails',
                         data : inboxArr
                     })
                 }
            } else {
                if (findInbox.rowCount == 0) {
                    res.json({
                        status: 200,
                        success: false,
                        message: 'Empty Sent emails',
                        data: []
                    })
                } else {
                    res.json({
                        status: 400,
                        success: false,
                        message: 'Something went wrong'
                    })
                }
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: 'Admin not found'
            })
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }

}

module.exports.readEmail = async (req, res) => {
    try {
        let { id } = req.user
    let { messageId } = req.body
    let s0 = dbScript(db_sql['Q8'], { var1: id })
    let checkAdmin = await connection.query(s0)
    if (checkAdmin.rowCount > 0) {
        let s1 = dbScript(db_sql['Q125'], { var1: checkAdmin.rows[0].id, var2: checkAdmin.rows[0].company_id  })
        let findCredentials = await connection.query(s1)
        if (findCredentials.rowCount > 0) {
            let dpass = decrypt(JSON.parse(findCredentials.rows[0].app_password))
            let imapConfig = {
                user: findCredentials.rows[0].email,
                password: dpass,
                host: findCredentials.rows[0].imap_host,
                port: findCredentials.rows[0].imap_port,
                tls: true,
                tlsOptions: {
                    rejectUnauthorized: false
                }
            };
            await setEmailRead(imapConfig, messageId, res)
        } else {
            if(findCredentials.rowCount == 0){
                res.json({
                    status: 400,
                    success: false,
                    message: "IMAP credentials not found"
                })
            }else{
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong"
                })
            }
            
        }
    } else {
        res.json({
            status: 400,
            success: false,
            message: "Admin not found"
        })
    }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }
    
}

