const Imap = require('node-imap')
const jsonwebtoken = require("jsonwebtoken");
const stripe = require('stripe')(process.env.SECRET_KEY)
const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid")

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
                return "'" + char;
            case "\\":
                return "'" + char;
            case "%":
                return "\%" + char; // prepends a backslash to backslash, percent,
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
                        let s2 = dbScript(db_sql['Q139'], { var1: messageId, var2: true })
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
    
    let s2 = dbScript(db_sql['Q104'], { var1: planId })
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

            let s3 = dbScript(db_sql['Q116'], {
                var1: transaction.rows[0].stripe_customer_id, var2: subscription.id,
                var3: card.id, var4: token.id, var5: charge.id, var6: subscription.current_period_end,
                var7: _dt, var8: transaction.rows[0].id, var9:Math.round(totalAmount), var10: true,
                var11 : charge.receipt_url, var12 : userCount, var13 : planId, var14 : ""
            })
            let updateTransaction = await connection.query(s3)

            let expiryDate = new Date(Number(subscription.current_period_end) * 1000).toISOString()

            let s5 = dbScript(db_sql['Q113'], { var1: expiryDate, var2: user.rows[0].id, var3: _dt })
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

    let s2 = dbScript(db_sql['Q104'], { var1: planId })
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
            let upTransId = uuid.v4()

            let s3 = dbScript(db_sql['Q149'], {var1 : upTransId, var2 : user.rows[0].id, var3:   transaction.rows[0].company_id, var4: planId, var5: transaction.rows[0].stripe_customer_id, var6: subscription.id, var7: card.id, var8: token.id, var9: "", var10: subscription.current_period_end, var11: userCount, var12: "",
            var13: Math.round(totalAmount), var14: "" })
            let createUpgradedTransaction = await connection.query(s3)

            let s4 = dbScript(db_sql['Q116'], { var1: transaction.rows[0].stripe_customer_id, var2 : transaction.rows[0].stripe_subscription_id, var3 : transaction.rows[0].stripe_card_id, var4 : transaction.rows[0].stripe_token_id, var5 : transaction.rows[0].stripe_charge_id, var6 : transaction.rows[0].expiry_date, var7 : _dt, var8 : transaction.rows[0].id, var9 : transaction.rows[0].total_amount, var10 : false, var11 : transaction.rows[0].payment_receipt, var12 : transaction.rows[0].user_count, var13 : transaction.rows[0].plan_id, var14 : createUpgradedTransaction.rows[0].id})
            let updateTransaction = await connection.query(s4)

            if(createUpgradedTransaction.rowCount > 0 && updateTransaction.rowCount > 0){
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

module.exports.removeDuplicates = async(originalArray, prop) => {
    var newArray = [];
    var lookupObject  = {};

    for(var i in originalArray) {
       let mainValue =0;
       if(lookupObject[originalArray[i][prop]]){
           mainValue = lookupObject[originalArray[i][prop]].revenue + originalArray[i].revenue;
           originalArray[i].revenue = mainValue;
       }
       lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for(i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
     return newArray;
}

module.exports.reduceArray = async(arr) =>{
    const reducedArray = arr.reduce((acc, next) => { // acc stands for accumulator
        const lastItemIndex = acc.length -1;
        const accHasContent = acc.length >= 1;
        if(accHasContent && acc[lastItemIndex].date == next.date) {
          acc[lastItemIndex].revenue += next.revenue;
          acc[lastItemIndex].commission += next.commission;

        } else {
          // first time seeing this entry. add it!
          acc[lastItemIndex +1] = next;
        }
        return acc;
    }, []);
    return reducedArray
}

