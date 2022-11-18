const connection = require('../database/connection')
const {
    contactUsMail,
    contactUsMail2
} = require("../utils/sendMail")
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string } = require('../utils/helper')

module.exports.contactUs = async (req, res) => {
    try {
        let {
            fullName,
            email,
            subject,
            message,
            address
        } = req.body

        await connection.query('BEGIN')
        let id = uuid.v4()
        let s1 = dbScript(db_sql['Q91'], { var1: id, var2: fullName, var3: email, var4: subject, var5: mysql_real_escape_string(message), var6: address })

        let addContactUs = await connection.query(s1)
        if (addContactUs.rowCount > 0) {
            if(process.env.isLocalEmail == 'true'){
                await contactUsMail2(email, fullName, subject, message, address)
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "Query added successfully"
                })
            }else{
                let emailSent = await contactUsMail(email, fullName, subject, message, address)
                if(emailSent.status == 400){
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }else{
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: "Query added successfully"
                    })
                }
            }
                
        } else {
            await connection.query('ROLLBACK')
            res.json({
                status: 400,
                success: false,
                message: "Something went wrong"
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