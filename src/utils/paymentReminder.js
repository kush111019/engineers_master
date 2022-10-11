const connection = require("../database/connection");
const stripe = require('stripe')(process.env.SECRET_KEY)
const { dbScript, db_sql } = require("./db_scripts");
const { recurringPaymentMail2, recurringPaymentMail } = require("../utils/sendMail")

module.exports.paymentReminder = async () => {

    let s1 = dbScript(db_sql['Q119'], {})
    let admindata = await connection.query(s1)
    for (let data of admindata.rows) {
        let s3 = dbScript(db_sql['Q14'], { var1: data.role_id })
        let checkRole = await connection.query(s3)
        if (checkRole.rows.length > 0) {
            if (checkRole.rows[0].role_name == 'Admin') {
                let s2 = dbScript(db_sql['Q17'], { var1: data.company_id })
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
                        let s3 = dbScript(db_sql['Q33'], { var1: true, var2: data.company_id, var3: _dt })
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

    let s1 = dbScript(db_sql['Q123'], {})
    let transaction = await connection.query(s1)
    if (transaction.rowCount > 0) {
        for (let transactionData of transaction.rows) {
            let currentDate = new Date().toISOString();
            let expiryDate =  new Date(Number(transactionData.expiry_date) * 1000).toISOString()
            if (transactionData.immediate_upgrade == false && currentDate == expiryDate) {
                const subscription = await stripe.subscriptions.retrieve(
                    transactionData.stripe_subscription_id
                );
                const charge = await stripe.charges.create({
                    amount: transactionData.total_amount,
                    currency: subscription.currency,
                    customer: transactionData.stripe_customer_id,
                    source: transactionData.stripe_card_id
                });
                if (subscription && charge) {
                    let _dt = new Date().toISOString();
                    await connection.query('BEGIN')
                    let s2 = dbScript(db_sql['Q126'], { var1: charge.id, var2: _dt, var3: transactionData.id, var4:charge.receipt_url })
                    let updateTransaction = await connection.query(s2)
                    if (updateTransaction.rowCount > 0) {
                        await connection.query('COMMIT')
                    } else {
                        await connection.query('ROLLBACK')
                    }
                }
            }
        }
    }
}