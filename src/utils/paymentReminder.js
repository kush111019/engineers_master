const connection = require("../database/connection");
const stripe = require('stripe')(process.env.SECRET_KEY)
const { dbScript, db_sql } = require("./db_scripts");
const { paymentReminderMail2, paymentReminderMail } = require("../utils/sendMail")
const moment = require('moment')

module.exports.paymentReminder = async () => {
    let s1 = dbScript(db_sql['Q110'], {})
    let admindata = await connection.query(s1)
    for (let data of admindata.rows) {
        if (data.is_admin && data.expiry_date != null) {
            let currentDate = new Date()
            currentDate = moment(currentDate).format('MM/DD/YYYY')
            let endDate = new Date(data.expiry_date);
            let beforeOneDay = endDate.setDate(endDate.getDate() - 1)
            beforeOneDay = moment(beforeOneDay).format('MM/DD/YYYY')
            let beforeThreeDays = endDate.setDate(endDate.getDate() - 2)
            beforeThreeDays = moment(beforeThreeDays).format('MM/DD/YYYY')
            let beforeWeek = endDate.setDate(endDate.getDate() - 4)
            beforeWeek = moment(beforeWeek).format('MM/DD/YYYY')
            if (currentDate == beforeWeek) {
                if (process.env.isLocalEmail == 'true') {
                    await paymentReminderMail2(data.email_address, data.full_name, new Date(data.expiry_date));
                } else {
                    await paymentReminderMail(data.email_address, data.full_name, new Date(data.expiry_date));
                }
            } else if (currentDate == beforeThreeDays) {
                if (process.env.isLocalEmail == 'true') {
                    await paymentReminderMail2(data.email_address, data.full_name, new Date(data.expiry_date));
                } else {
                    await paymentReminderMail(data.email_address, data.full_name, new Date(data.expiry_date));
                }
            } else if (currentDate == beforeOneDay) {
                if (process.env.isLocalEmail == 'true') {
                    await paymentReminderMail2(data.email_address, data.full_name, new Date(data.expiry_date));
                } else {
                    await paymentReminderMail(data.email_address, data.full_name, new Date(data.expiry_date));
                }
            } else if (currentDate == moment(new Date(data.expiry_date)).format('MM/DD/YYYY')) {
                let _dt = new Date().toISOString();
                await connection.query('BEGIN')
                let s3 = dbScript(db_sql['Q30'], { var1: true, var2: data.company_id, var3: _dt })
                let lockUser = await connection.query(s3)
                if (lockUser.rowCount > 0) {
                    await connection.query('COMMIT')
                }
            }
        }
    }
}

module.exports.upgradeSubscriptionCronFn = async () => {
    let s1 = dbScript(db_sql['Q114'], {})
    let transaction = await connection.query(s1)
    if (transaction.rowCount > 0) {
        for (let transactionData of transaction.rows) {
            let currentDate = new Date().toISOString();
            let expiryDate =  new Date(Number(transactionData.expiry_date) * 1000).toISOString()
            if (transactionData.immediate_upgrade == false && currentDate == expiryDate) {
                let s2 = dbScript(db_sql['Q150'], {var1 : transactionData.upgraded_transaction_id}) 
                let upgradedTransaction = await connection.query(s2)

                const subscription = await stripe.subscriptions.retrieve(
                    upgradedTransaction.rows[0].stripe_subscription_id
                );
                const charge = await stripe.charges.create({
                    amount: upgradedTransaction.rows[0].total_amount,
                    currency: subscription.currency,
                    customer: upgradedTransaction.rows[0].stripe_customer_id,
                    source: upgradedTransaction.rows[0].stripe_card_id
                });
                if (subscription && charge) {
                    let _dt = new Date().toISOString();
                    await connection.query('BEGIN')
                    let s3 = dbScript(db_sql['Q116'], { var1: upgradedTransaction.rows[0].stripe_customer_id, var2 : upgradedTransaction.rows[0].stripe_subscription_id, var3 : upgradedTransaction.rows[0].stripe_card_id, var4 : upgradedTransaction.rows[0].stripe_token_id, var5 : charge.id, var6 : upgradedTransaction.rows[0].expiry_date, var7 : _dt, var8 : transactionData.id, var9 : upgradedTransaction.rows[0].total_amount, var10 : true , var11 : charge.receipt_url, var12 : upgradedTransaction.rows[0].user_count, var13 : upgradedTransaction.rows[0].plan_id, var14 : ''})
                    let updateTransaction = await connection.query(s3)

                    let expiryDate = new Date(Number(upgradedTransaction.rows[0].expiry_date) * 1000).toISOString()

                    let s4 = dbScript(db_sql['Q113'], { var1: expiryDate, var2: upgradedTransaction.rows[0].user_id, var3: _dt })
                    let updateUserExpiryDate = await connection.query(s4)

                    let s5 = dbScript(db_sql['Q151'], { var1 : _dt, var2 : upgradedTransaction.rows[0].id})
                    let deleteUpgradedTransaction = await connection.query(s5)

                    if (updateTransaction.rowCount > 0 && updateUserExpiryDate.rowCount > 0 && updateUserExpiryDate.rowCount > 0 && deleteUpgradedTransaction.rowCount > 0) {
                        await connection.query('COMMIT')
                    } else {
                        await connection.query('ROLLBACK')
                    }
                }
            }
        }
    }
}