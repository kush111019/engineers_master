const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const { sendEmailToContact2, sendEmailToContact } = require("../utils/sendMail")
const uuid = require("node-uuid");
const {simpleParser} = require('mailparser');
// const io = require('../utils/socket')
const Imap = require('imap')

const containsObject = (obj, list) => {
    for (let i = 0; i < list.length; i++) {
        if (list[i].message_id === obj.messageId) {
            return true;
        }
    }
    return false;
}

module.exports.fetchEmails = async (req, res) => {
    let { id } = req.user
    let s0 = dbScript(db_sql['Q10'], { var1: id })
    let checkAdmin = await connection.query(s0)
    if (checkAdmin.rowCount > 0) {
        let j = 0;
        let s1 = dbScript(db_sql['Q147'], { var1: checkAdmin.rows[0].company_id })
        let findCompanies = await connection.query(s1)
        let mainArray = []
        if (findCompanies.rowCount > 0) {
            if (findCompanies.rows[0].email != null && findCompanies.rows[0].app_password != null) {
                let imapConfig = {
                    user: findCompanies.rows[0].email,
                    password: findCompanies.rows[0].app_password,
                    host: 'imap.gmail.com',
                    port: 993,
                    tls: true,
                    tlsOptions: {
                        rejectUnauthorized: false
                    }
                }
                let imap = new Imap(imapConfig);
                imap.once('error', (err) => {
                    console.log(err);
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

                                    let text = (Buffer.from(parsed.text, "utf8")).toString('base64')
                                    let html = (Buffer.from(parsed.html, "utf8")).toString('base64')
                                    let textAsHtml = (Buffer.from(parsed.textAsHtml, "utf8")).toString('base64')
                                    let date = parsed.date.toISOString()
                                    let obj = {
                                        messageId: parsed.messageId
                                    }
                                    arr.push(obj)
                                    let s2 = dbScript(db_sql['Q144'], { var1: company.company_id })
                                    let getEmails = await connection.query(s2)
                                    if (getEmails.rowCount > 0) {
                                        let checkMail = containsObject(parsed, getEmails.rows)
                                        if (!checkMail) {
                                            let s3 = dbScript(db_sql['Q145'], { var1: parsed.from.value[0].address, var2: company.company_id })
                                            let findByFrom = await connection.query(s3)
                                            if (findByFrom.rowCount > 0) {
                                                await connection.query('BEGIN')
                                                let id = uuid.v4()
                                                let s4 = dbScript(db_sql['Q146'], { var1: id, var2: parsed.messageId, var3: parsed.to.value[0].address, var4: parsed.from.value[0].address, var5: parsed.from.value[0].name, var6: date, var7: parsed.subject, var8: html, var9: text, var10: textAsHtml, var11: company.company_id })
                                                let insertEmail = await connection.query(s4)
                                                if (insertEmail.rowCount > 0) {
                                                    mainArray.push(insertEmail);
                                                    await connection.query('COMMIT')
                                                }
                                            }
                                        }
                                    } else {
                                        let s5 = dbScript(db_sql['Q145'], { var1: parsed.from.value[0].address, var2: company.company_id })
                                        let findByFrom = await connection.query(s5)
                                        if (findByFrom.rowCount > 0) {
                                            await connection.query('BEGIN')
                                            let id = uuid.v4()
                                            let s6 = dbScript(db_sql['Q146'], { var1: id, var2: parsed.messageId, var3: parsed.to.value[0].address, var4: parsed.from.value[0].address, var5: parsed.from.value[0].name, var6: date, var7: parsed.subject, var8: html, var9: text, var10: textAsHtml, var11: company.company_id })
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
                                status: 400,
                                success: false,
                                message: "No new email received"
                            })
                        }
                    });
                })
                imap.connect();
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Please add IMAP credentials"
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Company not found "
            })
        }
    } else {
        res.json({
            status: 400,
            success: false,
            message: "Admin not found"
        })
    }
}

module.exports.inbox = async(req, res) => {
    try {
        let { id } = req.user
        let s0 = dbScript(db_sql['Q10'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            let s1 = dbScript(db_sql['Q144'], {var1 : checkAdmin.rows[0].company_id})
            let findInbox = await connection.query(s1)
            if(findInbox.rowCount > 0){
                let inboxArr = []
                for(let inboxData of findInbox.rows){
                    let text = (Buffer.from(inboxData.mail_text, "base64")).toString('utf8')
                    let html = (Buffer.from(inboxData.mail_html, "base64")).toString('utf8')
                    let textAsHtml = (Buffer.from(inboxData.mail_text_as_html, "base64")).toString('utf8')
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
                        companyId : inboxData.company_id,
                        readStatus : inboxData.read_status
                    })
                }
                if(inboxArr.length > 0){
                    inboxArr = inboxArr.filter((value, index, self) =>
                    index === self.findIndex((t) => (
                        t.messageId === value.messageId 
                    ))
                    )
                    res.json({
                        status: 200,
                        success: false,
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

module.exports.sendEmail = async (req, res) => {
    try {
        let { id } = req.user
        let { emails, subject, message, cc } = req.body
        let s0 = dbScript(db_sql['Q10'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            let s1 = dbScript(db_sql['Q147'], { var1: checkAdmin.rows[0].company_id })
            let findCompanies = await connection.query(s1)
            if (findCompanies.rowCount > 0) {
                if (process.env.isLocalEmail == 'true') {
                    if (findCompanies.rows[0].email != null && findCompanies.rows[0].app_password != null) {
                        let senderEmail = {
                            email: findCompanies.rows[0].email,
                            password: findCompanies.rows[0].app_password
                        }
                        await sendEmailToContact2(emails, subject, message, cc, senderEmail);
                        res.json({
                            status: 200,
                            success: true,
                            message: "Email sent successfully!",
                        })
                    }else{
                        res.json({
                            status: 400,
                            success: false,
                            message: "Please add IMAP credentials"
                        })
                    }
                } else {
                    let emailSend = await sendEmailToContact(emails, subject, message, cc);
                    if (emailSend.status == 400) {
                        res.json({
                            status: 400,
                            success: false,
                            message: "Something went wrong",
                        })
                    } else {
                        res.json({
                            status: 200,
                            success: true,
                            message: "Email sent successfully",
                        })
                    }
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: 'Company not found'
                })
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

const setEmailRead = async(imapConfig, messageId, res) => {
    const imap = new Imap(imapConfig)
    imap.once('error', err => {
        console.log("fetch error :- ", err);
    })
    imap.once('ready',() => {
       imap.openBox('INBOX', false, () => {

            // here is how you fetch a single email by its messageId
            const criteria = ["HEADER", "message-id", messageId]

           imap.search([criteria],(err, results) => {
                if (err || results.length === 0) {
                    //throw "No email found for this ID"
                    res.json( {
                        status: 400,
                        success: false,
                        message: "No email found for this ID"
                    })
                }
                // set mail as read
                imap.setFlags(results, ['\\Seen'], async(err) => {
                    if (err) {
                        // throw err
                        res.json({
                            status: 400,
                            success: false,
                            message: err
                        })
                    } else {
                        await connection.query('BEGIN')
                        let s2 = dbScript(db_sql['Q148'],{var1 : messageId, var2 : true})
                        let updateReadStatus = await connection.query(s2)
                        if(updateReadStatus.rowCount > 0){
                            await connection.query('COMMIT')
                            res.json({
                                status: 200,
                                success: true,
                                message: "Message seen"
                            })
                        }else{
                            await connection.query('ROLLBACK')
                            res.json({
                                status: 400,
                                success: false,
                                message: "Something Went Wrong"
                            })
                        }  
                    }
                })
            })
        })
    })
    imap.once('close', () => {console.log("closed")})
    imap.connect()
   
}

module.exports.readEmail = async (req, res) => {
    let { id } = req.user
    let { messageId } = req.query
    let s0 = dbScript(db_sql['Q10'], { var1: id })
    let checkAdmin = await connection.query(s0)
    if (checkAdmin.rowCount > 0) {
        let s1 = dbScript(db_sql['Q147'], { var1: checkAdmin.rows[0].company_id })
        let findCompanies = await connection.query(s1)
        if (findCompanies.rowCount > 0) {
            if (findCompanies.rows[0].email != null && findCompanies.rows[0].app_password != null) {
                let imapConfig = {
                    user: findCompanies.rows[0].email,
                    password: findCompanies.rows[0].app_password,
                    host: 'imap.gmail.com',
                    port: 993,
                    tls: true,
                    tlsOptions: {
                        rejectUnauthorized: false
                    }
                };
                await setEmailRead(imapConfig, messageId, res)
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Please add IMAP credentials"
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Company not found"
            })
        }
    } else {
        res.json({
            status: 400,
            success: false,
            message: "Admin not found"
        })
    }
}

