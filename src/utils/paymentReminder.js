const connection = require("../database/connection");
const { dbScript, db_sql } = require("./db_scripts");
const {recurringPaymentMail2,recurringPaymentMail } = require("../utils/sendMail")

module.exports.paymentReminder = async () => {
    try {
        let s1 = dbScript(db_sql['Q119'], {})
        let admindata = await connection.query(s1)
        for (let data of admindata.rows) {
            let s3 = dbScript(db_sql['Q14'], { var1: data.role_id })
            let checkRole = await connection.query(s3)
            if (checkRole.rows.length > 0) {
                if (checkRole.rows[0].role_name == 'Admin') {
                    let s2 = dbScript(db_sql['Q116'], { var1 : data.company_id })
                    let transaction = await connection.query(s2)
                    if (transaction.rowCount > 0) {
                        let currentDate = new Date()
                        let endDate = new Date(Number(transaction.rows[0].trial_end_date) * 1000)
                        let beforeWeek = new Date(endDate.setDate(endDate.getDate() - 7))
                        let beforeThreeDays = new Date(endDate.setDate(endDate.getDate() - 3))
                        let beforeOneDay = new Date(endDate.setDate(endDate.getDate() - 1))
                        if (currentDate == beforeWeek) {
                            if (process.env.isLocalEmail == 'true') {
                                await recurringPaymentMail2(emailAddress, data.full_name, endDate);
                            } else {
                                await recurringPaymentMail(emailAddress, data.full_name, endDate);
                            }
                        } else if (currentDate == beforeThreeDays) {
                            if (process.env.isLocalEmail == 'true') {
                                await recurringPaymentMail2(emailAddress, data.full_name, endDate);
                            } else {
                                await recurringPaymentMail(emailAddress, data.full_name, endDate);
                            }
                        } else if (currentDate == beforeOneDay) {
                            if (process.env.isLocalEmail == 'true') {
                                await recurringPaymentMail2(emailAddress, data.full_name, endDate);
                            } else {
                                await recurringPaymentMail(emailAddress, data.full_name, endDate);
                            }
                        }
                    }
                }
            }
        }

    } catch (error) {

    }
}