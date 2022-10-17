const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const {
    sendEmailToContact2,sendEmailToContact
} = require("../utils/sendMail")


module.exports.sendEmail = async (req, res) => {
    try {
        let { id } = req.user
        let { emails, subject, message } = req.body
        let s0 = dbScript(db_sql['Q10'], { var1: id })
        let checkAdmin = await connection.query(s0)
        if (checkAdmin.rowCount > 0) {
            if(process.env.isLocalEmail == 'true'){
                await sendEmailToContact2(emails, subject, message);
                res.json({
                    status: 200,
                    success: true,
                    message: "Email sent successfully",
                })
            } else {
                let emailSend = await sendEmailToContact(emails, subject, message);
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
