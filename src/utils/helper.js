const Imap = require('node-imap')
const jsonwebtoken = require("jsonwebtoken");
const stripe = require('stripe')(process.env.SECRET_KEY)
const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid")
const notificationEnum = require('../utils/notificationEnum')
const { notificationMail, notificationMail2 } = require('../utils/sendMail')

module.exports.mysql_real_escape_string = (str) => {
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
                return " ";
            case "\r":
                return "\\r";
            case "\"":
                return "\"" + char;
            case "'":
                return "'" + char;
            case "\\":
                return "'" + char;
            case "%":
                return "\%"; // prepends a backslash to backslash, percent,
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
        if (planData.rows[0].interval == 'year') {
            totalAmount = totalAmount - ((Number(process.env.DISCOUNT_PERCENTAGE) / 100) * totalAmount)
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
                var7: _dt, var8: transaction.rows[0].id, var9: Math.round(totalAmount), var10: true,
                var11: charge.receipt_url, var12: userCount, var13: planId, var14: ""
            })
            let updateTransaction = await connection.query(s3)

            let expiryDate = new Date(Number(subscription.current_period_end) * 1000).toISOString()

            let s5 = dbScript(db_sql['Q113'], { var1: expiryDate, var2: user.rows[0].id, var3: _dt })
            let updateUserExpiryDate = await connection.query(s5)

            let s6 = dbScript(db_sql['Q232'], { var1: expiryDate, var2: userCount, var3: _dt, var4: user.rows[0].company_id })
            let updateCompanyExpiryDate = await connection.query(s6)


            if (updateTransaction.rowCount > 0 && updateUserExpiryDate.rowCount  > 0 && updateCompanyExpiryDate.rowCount  > 0) {
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: 'something went wrong'
            })
        }
    } else {
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
        if (planData.rows[0].interval == 'year') {
            totalAmount = totalAmount - ((Number(process.env.DISCOUNT_PERCENTAGE) / 100) * totalAmount)
        }
        if (token && card && subscription) {
            let _dt = new Date().toISOString();

            let s3 = dbScript(db_sql['Q149'], {
                var1: user.rows[0].id, var2: transaction.rows[0].company_id, var3: planId, var4: transaction.rows[0].stripe_customer_id, var5: subscription.id, var6: card.id, var7: token.id, var8: "", var9: subscription.current_period_end, var10: userCount, var11: "",
                var12: Math.round(totalAmount), var13: ""
            })
            let createUpgradedTransaction = await connection.query(s3)

            let s4 = dbScript(db_sql['Q116'], { var1: transaction.rows[0].stripe_customer_id, var2: transaction.rows[0].stripe_subscription_id, var3: transaction.rows[0].stripe_card_id, var4: transaction.rows[0].stripe_token_id, var5: transaction.rows[0].stripe_charge_id, var6: transaction.rows[0].expiry_date, var7: _dt, var8: transaction.rows[0].id, var9: transaction.rows[0].total_amount, var10: false, var11: transaction.rows[0].payment_receipt, var12: transaction.rows[0].user_count, var13: transaction.rows[0].plan_id, var14: createUpgradedTransaction.rows[0].id })
            let updateTransaction = await connection.query(s4)

            if (createUpgradedTransaction.rowCount > 0 && updateTransaction.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Subscription will be upgrade on end of current subscription'
                })
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: 'Something went wrong'
                })
            }

        } else {
            res.json({
                status: 400,
                success: false,
                message: 'Something went wrong'
            })
        }

    } else {
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

module.exports.paginatedResults1 = (model, page, limit) => {

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
    // var months = endDate.getMonth() - startDate.getMonth()
    //     + (12 * (endDate.getFullYear() - startDate.getFullYear()));

    // if (endDate.getDate() < startDate.getDate()) {
    //     months--;
    // }
    // return months;
    let endD = new Date(endDate);
    let startD = new Date(startDate);
    endD.setDate(endD.getDate() + 1);
    let d1 = startD, d2 = new Date(endD);
    if (d2 < d1) {
        let dTmp = d2;
        d2 = d1;
        d1 = dTmp;
    }

    let months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();

    if (d1.getDate() <= d2.getDate()) months += 1;
    return months;
}

module.exports.getYearDifference = async (startDate, endDate) => {
    let difference = endDate.getTime() - startDate.getTime();
    let yearDifference = difference / (1000 * 60 * 60 * 24 * 365.25);
    let roundedYearDifference = Math.round(yearDifference);
    return Number(roundedYearDifference)
}

module.exports.reduceArray = async (data) => {

    const groupedData = new Map();

    data.forEach(obj => {
        const date = obj.date;
        if (groupedData.has(date)) {
            const mergedObj = {
                date: obj.date,
                revenue: Number(groupedData.get(date).revenue) + Number(obj.revenue)
            };
            groupedData.set(date, mergedObj);
        } else {
            groupedData.set(date, obj);
        }
    });

    const merged = [...groupedData.values()];
    return merged
}

module.exports.reduceArrayWithCommission = async (data) => {
    const groupedData = new Map();

    data.forEach(obj => {
        const date = obj.date;
        if (groupedData.has(date)) {
            const mergedObj = {
            booking: groupedData.get(date).booking + obj.booking,
            subscription_booking: groupedData.get(date).subscription_booking + obj.subscription_booking,
            revenue: groupedData.get(date).revenue + obj.revenue,
            date: obj.date,
            booking_commission:  groupedData.get(date).booking_commission + obj.booking_commission,
            commission:  groupedData.get(date).commission + obj.commission
            };
            groupedData.set(date, mergedObj);
        } else {
            groupedData.set(date, obj);
        }
    });

    const merged = [...groupedData.values()];

    return merged;
}

module.exports.reduceArrayWithName = async (data) => {
console.log(data,"data");
    const groupedData = new Map();

    data.forEach(obj => {
        console.log(obj,"obj");
        const salesRep = obj.sales_rep;
        if (groupedData.has(salesRep)) {
            const mergedObj = {
                sales_rep: obj.sales_rep,
                revenue: Number(groupedData.get(salesRep).revenue) + Number(obj.revenue),
                commission:  groupedData.get(salesRep).commission + obj.commission
            };
            groupedData.set(salesRep, mergedObj);
        } else {
            groupedData.set(salesRep, obj);
        }
    });

    const merged = [...groupedData.values()];
    return merged
}

module.exports.reduceArrayWithCustomer = async (data) => {

    const groupedData = new Map();

    data.forEach(obj => {
        const customer = obj.customer_name;
        if (groupedData.has(customer)) {
            const mergedObj = {
                customer_name: obj.customer_name,
                revenue: Number(groupedData.get(customer).revenue) + Number(obj.revenue)
            };
            groupedData.set(customer, mergedObj);
        } else {
            groupedData.set(customer, obj);
        }
    });

    const merged = [...groupedData.values()];
    return merged
}

module.exports.reduceArrayWithProduct = async (data) => {

    const groupedData = new Map();

    data.forEach(obj => {
        const product = obj.product_name;
        if (groupedData.has(product)) {
            const mergedObj = {
                product_name: obj.product_name,
                revenue: Number(groupedData.get(product).revenue) + Number(obj.revenue)
            };
            groupedData.set(product, mergedObj);
        } else {
            groupedData.set(product, obj);
        }
    });

    const merged = [...groupedData.values()];
    return merged
}

module.exports.getMinutesBetweenDates = async (startDate, endDate) => {
    var diff = endDate.getTime() - startDate.getTime();
    return (diff / 60000);
}

// get child roles and their user's list from this function 
module.exports.getUserAndSubUser = async (userData) => {
    let roleIds = []
    roleIds.push(userData.role_id)
    let getRoles = async (id) => {
        let s1 = dbScript(db_sql['Q16'], { var1: id })
        let getChild = await connection.query(s1);
        if (getChild.rowCount > 0) {
            for (let item of getChild.rows) {
                if (roleIds.includes(item.id) == false) {
                    roleIds.push(item.id)
                    await getRoles(item.id)
                }
            }
        }
    }
    await getRoles(userData.role_id)
    let returnData = [];
    returnData.push("'" + userData.id.toString() + "'")
    for (let id of roleIds) {
        let s2 = dbScript(db_sql['Q287'], { var1: id })
        let getUserData = await connection.query(s2);
        if (getUserData.rowCount > 0 && getUserData.rows[0].role_id != userData.role_id) {
            returnData.push("'" + getUserData.rows[0].id.toString() + "'")
        }
    }
    return returnData
}

// add notifications in this function 
module.exports.notificationsOperations = async (nfData, userId) => {
    let emailArray = [];
    if (nfData.notification_userId.length > 0) {
        let userName = '';
        for (let id of nfData.notification_userId) {
            //getting user name for create msg with name
            let s0 = dbScript(db_sql['Q8'], { var1: userId })
            let findUserName = await connection.query(s0)
            userName = findUserName.rows[0].full_name;
            //enter notifications in db
            let s1 = dbScript(db_sql['Q289'], { var1: findUserName.rows[0].full_name + notificationEnum.notificationMsg[nfData.msg], var2: nfData.notification_typeId, var3: id, var4: notificationEnum.notificationType[nfData.type] })
            let notificationsData = await connection.query(s1);

            //for getting captain and support user email's address
            let s2 = dbScript(db_sql['Q8'], { var1: id })
            let findUserEmail = await connection.query(s2)
            emailArray.push(findUserEmail.rows[0].email_address)

        }
        if (process.env.isLocalEmail == 'true') {
            await notificationMail2(emailArray, userName + notificationEnum.notificationMsg[nfData.msg])
        } else {
            await notificationMail(emailArray, userName + notificationEnum.notificationMsg[nfData.msg])
        }

    }

}