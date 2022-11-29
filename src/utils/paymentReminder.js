const connection = require("../database/connection");
const stripe = require('stripe')(process.env.SECRET_KEY)
const { dbScript, db_sql } = require("./db_scripts");
const { recurringPaymentMail2, recurringPaymentMail } = require("../utils/sendMail")

module.exports.paymentReminder = async () => {
    let s1 = dbScript(db_sql['Q110'], {})
    let admindata = await connection.query(s1)
    for (let data of admindata.rows) {
        let s3 = dbScript(db_sql['Q12'], { var1: data.role_id })
        let checkRole = await connection.query(s3)
        if (checkRole.rows.length > 0) {
            if (checkRole.rows[0].role_name == 'Admin') {
                let s2 = dbScript(db_sql['Q15'], { var1: data.company_id })
                let transaction = await connection.query(s2)
                if (transaction.rowCount > 0) {
                    let currentDate = new Date()
                    let endDate = transaction.rows[0].expiry_date
                    let beforeOneDay = new Date(endDate.setDate(endDate.getDate() - 1))
                    let beforeThreeDays = new Date(endDate.setDate(endDate.getDate() - 2))
                    let beforeWeek = new Date(endDate.setDate(endDate.getDate() - 4))
                    if (currentDate == beforeWeek) {
                        if (process.env.isLocalEmail == 'true') {
                            await recurringPaymentMail2(data.emailAddress, data.full_name, endDate);
                        } else {
                            await recurringPaymentMail(data.emailAddress, data.full_name, endDate);
                        }
                    } else if (currentDate == beforeThreeDays) {
                        if (process.env.isLocalEmail == 'true') {
                            await recurringPaymentMail2(data.emailAddress, data.full_name, endDate);
                        } else {
                            await recurringPaymentMail(data.emailAddress, data.full_name, endDate);
                        }
                    } else if (currentDate == beforeOneDay) {
                        if (process.env.isLocalEmail == 'true') {
                            await recurringPaymentMail2(data.emailAddress, data.full_name, endDate);
                        } else {
                            await recurringPaymentMail(data.emailAddress, data.full_name, endDate);
                        }
                    } else if (currentDate ==  endDate) {
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