const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const { sendEmailToContact2, sendEmailToContact } = require("../utils/sendMail")
const uuid = require("node-uuid");
const {simpleParser} = require('mailparser');
// const io = require('../utils/socket')
const Imap = require('imap')

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
            for (let company of findCompanies.rows) {
                if (company.email != null && company.app_password != null) {
                    let imap = new Imap({
                        user: company.email,
                        password: company.app_password,
                        host: 'imap.gmail.com',
                        port: 993,
                        tls: true,
                        tlsOptions: {
                            rejectUnauthorized: false
                        }
                    });
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
                                let f = imap.fetch('1:*', { bodies: '' });
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
                                            for (emailData of getEmails.rows) {
                                                if (emailData.message_id != parsed.messageId) {
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
                                                    message: "No email recieved"
                                                })
                                                clearInterval(interval)
                                            }
                                        }
                                    }, 1000);
                                });
                            }
                        });
                    })
                    imap.connect();
                }
            }
        }
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
                        companyId : inboxData.company_id
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
            if (process.env.isLocalEmail == 'true') {
                await sendEmailToContact2(emails, subject, message, cc);
                res.json({
                    status: 200,
                    success: true,
                    message: "Email sent successfully!",
                })
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