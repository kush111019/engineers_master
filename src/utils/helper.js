const Imap = require('node-imap')
const jsonwebtoken = require("jsonwebtoken");
const stripe = require('stripe')(process.env.SECRET_KEY)
const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');

module.exports.mysql_real_escape_string = (str) =>{
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
                return "\"" + char;
            case "'":
            case "\\":
            case "%":
                return "'" + char; // prepends a backslash to backslash, percent,
            // and double/single quotes
        }
    })
}

module.exports.containsObject = (obj, list) => {
    for (let i = 0; i < list.length; i++) {
        if (list[i].message_id === obj.messageId) {
            return true;
        }
    }
    return false;
}

module.exports.setEmailRead = async (imapConfig, messageId, res) => {
    const imap = new Imap(imapConfig)
    imap.once('error', err => {
        console.log("fetch error :- ", err);
        res.json({
            status: 400,
            success: false,
            message: err.message
        })
    })
    imap.once('ready', () => {
        imap.openBox('INBOX', false, () => {

            // here is how you fetch a single email by its messageId
            const criteria = ["HEADER", "message-id", messageId]

            imap.search([criteria], (err, results) => {
                if (err || results.length === 0) {
                    //throw "No email found for this ID"
                    res.json({
                        status: 400,
                        success: false,
                        message: "No email found for this ID"
                    })
                }
                // set mail as read
                imap.setFlags(results, ['\\Seen'], async (err) => {
                    if (err) {
                        // throw err
                        res.json({
                            status: 400,
                            success: false,
                            message: err.message
                        })
                    } else {
                        await connection.query('BEGIN')
                        let s2 = dbScript(db_sql['Q148'], { var1: messageId, var2: true })
                        let updateReadStatus = await connection.query(s2)
                        if (updateReadStatus.rowCount > 0) {
                            await connection.query('COMMIT')
                            res.json({
                                status: 200,
                                success: true,
                                message: "Message seen"
                            })
                        } else {
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
    imap.once('close', () => { console.log("closed") })
    imap.connect()

}

module.exports.verifyTokenFn = async (req) => {
    let token = req.body && req.body.token ? req.body.token : req.headers.authorization
    let user = await jsonwebtoken.verify(token, 'KEy', function (err, decoded) {
        if (err) {
            return 0
        } else {
            var decoded = {
                id: decoded.id,
                email: decoded.email,
            };
            return decoded;
        }
    });
    return user
}

module.exports.immediateUpgradeSubFn = async (req, res, user, transaction) => {
    let {
        planId,
        userCount,
        cardNumber,
        expMonth,
        expYear,
        cvc
    } = req.body
    
    let s2 = dbScript(db_sql['Q112'], { var1: planId })
    let planData = await connection.query(s2)
    if (planData.rowCount > 0) {
        const token = await stripe.tokens.create({
            card: {
                number: cardNumber,
                exp_month: expMonth,
                exp_year: expYear,
                cvc: cvc,
            },
        });
        const card = await stripe.customers.createSource(
            transaction.rows[0].stripe_customer_id,
            { source: token.id }
        );
        const subscription = await stripe.subscriptions.create({
            customer: transaction.rows[0].stripe_customer_id,
            items: [
                { price: planData.rows[0].admin_price_id },
                { price: planData.rows[0].user_price_id, quantity: userCount },
            ],
            payment_settings: {
                payment_method_types: ['card'],
                save_default_payment_method: "on_subscription"
            }
        });
        let totalAmount = 0
        for (let data of subscription.items.data) {
            let totalPrice = data.price.unit_amount * data.quantity
            totalAmount = totalAmount + totalPrice;
        }
        if(planData.rows[0].interval == 'year'){
            totalAmount = totalAmount - ((Number(process.env.DISCOUNT_PERCENTAGE)/100) * totalAmount)   
        }
        const charge = await stripe.charges.create({
            amount: Math.round(totalAmount),
            currency: subscription.currency,
            customer: transaction.rows[0].stripe_customer_id,
            source: card.id
        });
        if (token && card && subscription && charge) {
            let _dt = new Date().toISOString();

            let s3 = dbScript(db_sql['Q125'], {
                var1: transaction.rows[0].stripe_customer_id, var2: subscription.id,
                var3: card.id, var4: token.id, var5: charge.id, var6: subscription.current_period_end,
                var7: _dt, var8: transaction.rows[0].id, var9:Math.round(totalAmount), var10: true,
                var11 : charge.receipt_url, var12 : userCount, var13 : planId
            })
            let updateTransaction = await connection.query(s3)

            let expiryDate = new Date(Number(subscription.current_period_end) * 1000).toISOString()

            let s5 = dbScript(db_sql['Q122'], { var1: expiryDate, var2: user.rows[0].id, var3: _dt })
            let updateUserExpiryDate = await connection.query(s5)

            if (updateTransaction.rowCount > 0 && updateUserExpiryDate.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: 'Subscription upgraded successfully',
                    data: charge.receipt_url
                })
            } else {
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: 'something went wrong'
                })
            }
        }else{
            res.json({
                status: 400,
                success: false,
                message: 'something went wrong'
            })
        }
    }else{
        res.json({
            status: 400,
            success: false,
            message: 'Plan not found'
        })
    }
}

module.exports.laterUpgradeSubFn = async (req, res, user, transaction) => {
    let {
        planId,
        userCount,
        cardNumber,
        expMonth,
        expYear,
        cvc
    } = req.body

    let s2 = dbScript(db_sql['Q112'], { var1: planId })
    let planData = await connection.query(s2)
    if (planData.rowCount > 0) {
        const token = await stripe.tokens.create({
            card: {
                number: cardNumber,
                exp_month: expMonth,
                exp_year: expYear,
                cvc: cvc,
            },
        });
        const card = await stripe.customers.createSource(
            transaction.rows[0].stripe_customer_id,
            { source: token.id }
        );
        const subscription = await stripe.subscriptions.create({
            customer: transaction.rows[0].stripe_customer_id,
            items: [
                { price: planData.rows[0].admin_price_id },
                { price: planData.rows[0].user_price_id, quantity: userCount },
            ],
            payment_settings: {
                payment_method_types: ['card'],
                save_default_payment_method: "on_subscription"
            }
        });
        let totalAmount = 0
        for (let data of subscription.items.data) {
            let totalPrice = data.price.unit_amount * data.quantity
            totalAmount = totalAmount + totalPrice;
        }
        if(planData.rows[0].interval == 'year'){
            totalAmount = totalAmount - ((Number(process.env.DISCOUNT_PERCENTAGE)/100) * totalAmount)   
        }
        if (token && card && subscription) {
            let _dt = new Date().toISOString();

            let s3 = dbScript(db_sql['Q125'], {
                var1: transaction.rows[0].stripe_customer_id, var2: subscription.id,
                var3: card.id, var4: token.id, var5: '', var6: subscription.current_period_end,
                var7: _dt, var8: transaction.rows[0].id, var9:Math.round(totalAmount), var10: false,
                var11 : '', var12: userCount, var13:planId
            })
            let updateTransaction = await connection.query(s3)
            if(updateTransaction.rowCount > 0){
                res.json({
                    status: 200,
                    success: true,
                    message: 'Subscription will be upgrade on end of current subscription'
                })
            }else{
                res.json({
                    status: 400,
                    success: false,
                    message: 'Something went wrong'
                })
            }

        }else{
            res.json({
                status: 400,
                success: false,
                message: 'Something went wrong'
            })
        }

    }else{
        res.json({
            status: 400,
            success: false,
            message: 'Plan not found'
        })
    }
}

module.exports.paginatedResults = (model, page) => {
    const limit = 10;

    // calculating the starting and ending index
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    if (endIndex < model.length) {
        results.next = {
            page: page + 1,
            limit: limit
        };
    }

    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit
        };
    }

    data = model.slice(startIndex, endIndex);
    return data
}

module.exports.getMonthDifference = async (startDate, endDate) => {
    var months = endDate.getMonth() - startDate.getMonth()
        + (12 * (endDate.getFullYear() - startDate.getFullYear()));

    if (endDate.getDate() < startDate.getDate()) {
        months--;
    }
    return months;
}

module.exports.getYearDifference = async (startDate, endDate) => {
    let years = endDate.getFullYear() - startDate.getFullYear();;
    return years;
}

