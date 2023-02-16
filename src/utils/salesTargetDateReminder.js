const connection = require("../database/connection");
const { dbScript, db_sql } = require("./db_scripts");
const { tagetClosingDateReminderMail2, tagetClosingDateReminderMail,
    recurringSalesReminderMail, recurringSalesReminderMail2 } = require("../utils/sendMail")
const moment = require('moment')

module.exports.targetDateReminder = async () => {
    let s1 = dbScript(db_sql['Q99'], {})
    let companies = await connection.query(s1)
    for (let data of companies.rows) {
        let s2 = dbScript(db_sql['Q54'], { var1: data.id })
        let salesData = await connection.query(s2)
        if (salesData.rowCount > 0) {
            for (let sData of salesData.rows) {
                let emailsArr = []
                if(sData.creator_email){
                    emailsArr.push(sData.creator_email)
                }
                if(sData.closer_email && !emailsArr.includes(sData.closer_email) ){
                    emailsArr.push(sData.closer_email)
                }
                if (sData.supporters) {
                    for (let supporterData of sData.supporters) {
                        if(supporterData.email && !emailsArr.includes(supporterData.email)){
                            emailsArr.push(supporterData.email)
                        }
                    }
                }
                let currentDate = new Date()
                currentDate = moment(currentDate).format('MM/DD/YYYY')
                if (sData.sales_type == "Perpectual") {
                    let targetDate = new Date(sData.target_closing_date);
                    let fifteenDaysBefore = new Date(targetDate.getTime() - 15 * 24 * 60 * 60 * 1000);
                    let sevenDaysBefore = new Date(targetDate.getTime() - 7 * 24 * 60 * 60 * 1000);

                    let forFifteenDaysBefore = moment(fifteenDaysBefore).format('MM/DD/YYYY')
                    let forSevenDaysBefore = moment(sevenDaysBefore).format('MM/DD/YYYY')
                    if (currentDate == forFifteenDaysBefore) {
                        if (process.env.isLocalEmail == 'true') {
                            await tagetClosingDateReminderMail2(emailsArr, sData.customer_name, sData.target_closing_date)
                        } else {
                            await tagetClosingDateReminderMail(emailsArr, sData.customer_name, sData.target_closing_date)
                        }

                    } else if (currentDate == forSevenDaysBefore) {
                        if (process.env.isLocalEmail == 'true') {
                            await tagetClosingDateReminderMail2(emailsArr, sData.customer_name, sData.target_closing_date)
                        } else {
                            await tagetClosingDateReminderMail(emailsArr, sData.customer_name, sData.target_closing_date)
                        }
                    }
                } else {
                    let recurringDate = new Date(sData.recurring_date)

                    let fifteenDaysBefore = new Date(recurringDate.getTime() - 15 * 24 * 60 * 60 * 1000);
                    let sevenDaysBefore = new Date(recurringDate.getTime() - 7 * 24 * 60 * 60 * 1000);

                    let forFifteenDaysBefore = moment(fifteenDaysBefore).format('MM/DD/YYYY')
                    let forSevenDaysBefore = moment(sevenDaysBefore).format('MM/DD/YYYY')

                    if (currentDate == forFifteenDaysBefore) {
                        if (process.env.isLocalEmail == 'true') {
                            await recurringSalesReminderMail2(emailsArr, sData.customer_name, sData.recurring_date)
                        } else {
                            await recurringSalesReminderMail(emailsArr, sData.customer_name, sData.recurring_date)
                        }

                    } else if (currentDate == forSevenDaysBefore) {
                        if (process.env.isLocalEmail == 'true') {
                            await recurringSalesReminderMail2(emailsArr, sData.customer_name, sData.recurring_date)
                        } else {
                            await recurringSalesReminderMail(emailsArr, sData.customer_name, sData.recurring_date)
                        }
                    }
                }
            }
        }
    }
}