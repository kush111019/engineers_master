const connection = require("../database/connection");
const { dbScript, db_sql } = require("./db_scripts");
const { tagetClosingDateReminderMail2, tagetClosingDateReminderMail,
    recurringSalesReminderMail, recurringSalesReminderMail2 } = require("../utils/sendMail")
const moment = require('moment')

module.exports.targetDateReminder = async () => {
    let s1 = dbScript(db_sql['Q99'], {})
    let companies = await connection.query(s1)
    for (let data of companies.rows) {
        let s2 = dbScript(db_sql['Q84'], { var1: data.id })
        let configList = await connection.query(s2)
        let beforeTargetDays = (configList.rowCount > 0) ? Number(configList.rows[0].before_closing_days) : 0
        let afterTargetDays = (configList.rowCount > 0) ? Number(configList.rows[0].after_closing_days) : 0

        let s3 = dbScript(db_sql['Q54'], { var1: data.id })
        let salesData = await connection.query(s3)
        if (salesData.rowCount > 0) {
            for (let sData of salesData.rows) {
                if (sData.closed_at != '') {
                    let emailsArr = []
                    if (sData.sales_users) {
                        sData.sales_users.map(user => {
                            emailsArr.push(user.email)
                        })
                    }
                    let currentDate = new Date()
                    currentDate = moment(currentDate).format('MM/DD/YYYY')
                    if (sData.sales_type == "Perpetual") {
                        let targetDate = new Date(sData.target_closing_date);
                        
                        let beforeDays = new Date(targetDate.getTime() - beforeTargetDays * 24 * 60 * 60 * 1000);

                        let closingBeforeDays = moment(beforeDays).format('MM/DD/YYYY')

                        let afterDays = new Date(targetDate.getTime() - afterTargetDays * 24 * 60 * 60 * 1000);
                        let closingAfterDays = moment(afterDays).format('MM/DD/YYYY')

                        if (currentDate == closingBeforeDays) {
                            if (process.env.isLocalEmail == 'true') {
                                await tagetClosingDateReminderMail2(emailsArr, sData.customer_name, sData.target_closing_date)
                            } else {
                                await tagetClosingDateReminderMail(emailsArr, sData.customer_name, sData.target_closing_date)
                            }
                        }else if(currentDate == moment(targetDate).format('MM/DD/YYYY')){
                            if (process.env.isLocalEmail == 'true') {
                                await tagetClosingDateReminderMail2(emailsArr, sData.customer_name, sData.target_closing_date)
                            } else {
                                await tagetClosingDateReminderMail(emailsArr, sData.customer_name, sData.target_closing_date)
                            }
                        }else if(currentDate == closingAfterDays){
                            if (process.env.isLocalEmail == 'true') {
                                await tagetClosingDateReminderMail2(emailsArr, sData.customer_name, sData.target_closing_date)
                            } else {
                                await tagetClosingDateReminderMail(emailsArr, sData.customer_name, sData.target_closing_date)
                            }
                        }
                    } else {
                        let recurringDate = new Date(sData.recurring_date)

                        let daysBefore = new Date(recurringDate.getTime() - beforeTargetDays * 24 * 60 * 60 * 1000);

                        let forDaysBefore = moment(daysBefore).format('MM/DD/YYYY')

                        let daysAfter = new Date(recurringDate.getTime() - afterTargetDays * 24 * 60 * 60 * 1000);

                        let forDaysAfter = moment(daysAfter).format('MM/DD/YYYY')

                        if (currentDate == forDaysBefore) {
                            if (process.env.isLocalEmail == 'true') {
                                await recurringSalesReminderMail2(emailsArr, sData.customer_name, sData.recurring_date)
                            } else {
                                await recurringSalesReminderMail(emailsArr, sData.customer_name, sData.recurring_date)
                            }
                        }else if(currentDate == moment(recurringDate).format('MM/DD/YYYY')){
                            if (process.env.isLocalEmail == 'true') {
                                await recurringSalesReminderMail2(emailsArr, sData.customer_name, sData.recurring_date)
                            } else {
                                await recurringSalesReminderMail(emailsArr, sData.customer_name, sData.recurring_date)
                            }
                        }else if(currentDate == forDaysAfter){
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
}