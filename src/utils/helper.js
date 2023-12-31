const Imap = require('node-imap')
const jsonwebtoken = require("jsonwebtoken");
const stripe = require('stripe')(process.env.SECRET_KEY)
const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid")
const notificationEnum = require('../utils/notificationEnum')
const { notificationMail, notificationMail2 } = require('../utils/sendMail')
const { default: ical } = require('ical-generator');
const { DateTime } = require('luxon');
const moment = require('moment-timezone');


module.exports.checkParams = (req, res, next) => {
    const params = req.body || req.query || req.params;

    for (const key in params) {
        const value = params[key];
        if (value === undefined || value === null || value === 'undefined') {
            res.status(400).json({ message: 'Please provide all parameters.' });
            return;
        }
    }

    // If all parameters are valid, call the next middleware function or route handler
    next();
}

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

module.exports.mysql_real_escape_string2 = (str) => {
    return str.replace(/'/g, "''");
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
                        let s2 = dbScript(db_sql['Q126'], { var1: messageId, var2: true })
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
        proUserCount,
        cardNumber,
        expMonth,
        expYear,
        cvc
    } = req.body
    await connection.query('BEGIN')
    let s2 = dbScript(db_sql['Q93'], { var1: planId })
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
                { price: planData.rows[0].pro_user_price_id, quantity: proUserCount }
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

            let s3 = dbScript(db_sql['Q105'], {
                var1: transaction.rows[0].stripe_customer_id, var2: subscription.id,
                var3: card.id, var4: token.id, var5: charge.id, var6: subscription.current_period_end,
                var7: _dt, var8: transaction.rows[0].id, var9: Math.round(totalAmount), var10: true,
                var11: charge.receipt_url, var12: userCount, var13: planId, var14: "",
                var15: proUserCount, var16: false
            })
            let updateTransaction = await connection.query(s3)

            let expiryDate = new Date(Number(subscription.current_period_end) * 1000).toISOString()

            let s5 = dbScript(db_sql['Q102'], { var1: expiryDate, var2: user.rows[0].id, var3: _dt })
            let updateUserExpiryDate = await connection.query(s5)

            let s6 = dbScript(db_sql['Q197'], { var1: expiryDate, var2: userCount, var3: proUserCount, var4: _dt, var5: user.rows[0].company_id })
            let updateCompanyExpiryDate = await connection.query(s6)


            if (updateTransaction.rowCount > 0 && updateUserExpiryDate.rowCount > 0 && updateCompanyExpiryDate.rowCount > 0) {
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
            await connection.query('ROLLBACK')
            res.json({
                status: 400,
                success: false,
                message: 'something went wrong'
            })
        }
    } else {
        await connection.query('ROLLBACK')
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
        proUserCount,
        cardNumber,
        expMonth,
        expYear,
        cvc
    } = req.body
    await connection.query('BEGIN')
    let s2 = dbScript(db_sql['Q93'], { var1: planId })
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
                { price: planData.rows[0].pro_user_price_id, quantity: proUserCount },
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

            let s3 = dbScript(db_sql['Q135'], {
                var1: user.rows[0].id, var2: transaction.rows[0].company_id, var3: planId, var4: transaction.rows[0].stripe_customer_id, var5: subscription.id, var6: card.id, var7: token.id, var8: "", var9: subscription.current_period_end, var10: userCount, var11: "",
                var12: Math.round(totalAmount), var13: "", var14: proUserCount
            })
            let createUpgradedTransaction = await connection.query(s3)

            let s4 = dbScript(db_sql['Q105'], { var1: transaction.rows[0].stripe_customer_id, var2: transaction.rows[0].stripe_subscription_id, var3: transaction.rows[0].stripe_card_id, var4: transaction.rows[0].stripe_token_id, var5: transaction.rows[0].stripe_charge_id, var6: transaction.rows[0].expiry_date, var7: _dt, var8: transaction.rows[0].id, var9: transaction.rows[0].total_amount, var10: false, var11: transaction.rows[0].payment_receipt, var12: transaction.rows[0].user_count, var13: transaction.rows[0].plan_id, var14: createUpgradedTransaction.rows[0].id, var15: proUserCount , var16: false })
            let updateTransaction = await connection.query(s4)

            if (createUpgradedTransaction.rowCount > 0 && updateTransaction.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: 'Subscription will be upgrade on end of current subscription'
                })
            } else {
                await connection.query('ROLLBACk')
                res.json({
                    status: 400,
                    success: false,
                    message: 'Something went wrong'
                })
            }

        } else {
            await connection.query('ROLLBACk')
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
    let returnData = [];
    for (let i = 0; i < data.length; i++) {
        let found = 0;
        for (let j = 0; j < returnData.length; j++) {
            let date1 = new Date(data[i].date).toISOString();
            let date2 = new Date(returnData[j].date).toISOString();
            if (date1.slice(0, 10) === date2.slice(0, 10)) {
                let revenueOfJ = Number(returnData[j].revenue) + Number(data[i].revenue)
                returnData[j].revenue = revenueOfJ;
                found = 1;
            }
        }
        if (found === 0) {
            returnData.push(data[i]);
        }
    }
    return returnData
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
                booking_commission: groupedData.get(date).booking_commission + obj.booking_commission,
                commission: groupedData.get(date).commission + obj.commission
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
    const groupedData = new Map();

    data.forEach(obj => {
        const salesRep = obj.sales_rep;
        if (groupedData.has(salesRep)) {
            const mergedObj = {
                sales_rep: obj.sales_rep,
                revenue: Number(groupedData.get(salesRep).revenue) + Number(obj.revenue),
                commission: groupedData.get(salesRep).commission + obj.commission
            };
            groupedData.set(salesRep, mergedObj);
        } else {
            groupedData.set(salesRep, obj);
        }
    });

    const merged = [...groupedData.values()];
    return merged
}

module.exports.reduceArrayWithName1 = async (data) => {
    const groupedData = new Map();

    data.forEach(obj => {
        const salesRep = obj.sales_rep;
        if (groupedData.has(salesRep)) {
            const mergedObj = {
                sales_rep: obj.sales_rep,
                revenue: Number(groupedData.get(salesRep).revenue) + Number(obj.revenue),
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
    roleIds.push(userData.role_id);
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
    await getRoles(userData.role_id);
    let returnData = [];
    returnData.push("'" + userData.id.toString() + "'");
    for (let id of roleIds) {
        let s2 = dbScript(db_sql['Q243'], { var1: id })
        let getUserData = await connection.query(s2);
        for(let item of getUserData.rows){
            if (item.role_id != userData.role_id) {
                returnData.push("'" + getUserData.rows[0].id.toString() + "'")
            }
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
            let s1 = dbScript(db_sql['Q245'], { var1: this.mysql_real_escape_string(findUserName.rows[0].full_name) + notificationEnum.notificationMsg[nfData.msg], var2: nfData.notification_typeId, var3: id, var4: notificationEnum.notificationType[nfData.type] })
            let notificationsData = await connection.query(s1);
            //for getting captain and support user email's address
            let s2 = dbScript(db_sql['Q8'], { var1: id });
            let findUserEmail = await connection.query(s2);
            if (findUserEmail.rows[0].email_address) {
                emailArray.push(findUserEmail.rows[0].email_address)
            }
        }
        if (process.env.isLocalEmail == 'true') {
            await notificationMail2(emailArray, userName + notificationEnum.notificationMsg[nfData.msg])
        } else {
            await notificationMail(emailArray, userName + notificationEnum.notificationMsg[nfData.msg])
        }

    }

}

// get notifications for socket conversion
module.exports.instantNotificationsList = async (newNotificationRecieved, socket) => {
    let s1 = dbScript(db_sql['Q292'], { var1: newNotificationRecieved.id, var2: newNotificationRecieved.type })
    let notificationList = await connection.query(s1);
    if (notificationList.rowCount > 0) {
        notificationList.rows.forEach(element => {
            socket.in(element.user_id).emit("notificationRecieved", element);
        });
    }
}

// get perent roles and their user's list from this function 
module.exports.getParentUserList = async (userData, company_id) => {
    let roleIds = []
    let getRoles = async (id) => {
        let s1 = dbScript(db_sql['Q12'], { var1: id })
        let getParent = await connection.query(s1);
        if (getParent.rowCount > 0) {
            for (let item of getParent.rows) {
                if (roleIds.includes(item.id) == false) {
                    roleIds.push(item.id)
                    if (item.reporter != '') {
                        await getRoles(item.reporter)
                    }
                }
            }
        }
    }
    await getRoles(userData.reporter)
    let returnData = [];
    for (let id of roleIds) {
        let s2 = dbScript(db_sql['Q21'], { var1: id, var2: company_id })
        let getUserData = await connection.query(s2);
        if (getUserData.rowCount > 0) {
            returnData.push(getUserData.rows[0])
        }
    }
    return returnData
}

//this function is coverting one form of array to different form of array according to need
module.exports.tranformAvailabilityArray = async (arr) => {

    const outputArray = arr.map(obj => {
        if (obj.time_slots) {
            const newTimeSlots = obj.time_slots.reduce((acc, curr) => {
                const existingSlot = acc.find(slot => slot.days === curr.days);
                if (existingSlot) {
                    existingSlot.time_slot.push({
                        id: curr.id,
                        start_time: curr.start_time,
                        end_time: curr.end_time
                    });
                } else {
                    acc.push({
                        days: curr.days,
                        availability_id: curr.availability_id,
                        company_id: curr.company_id,
                        created_at: curr.created_at,
                        updated_at: curr.updated_at,
                        deleted_at: curr.deleted_at,
                        checked: curr.checked,
                        isAvailabilityAdded: curr.isAvailabilityAdded,
                        time_slot: (curr.checked) ? [{
                            id: curr.id,
                            start_time: curr.start_time,
                            end_time: curr.end_time
                        }] : []
                    });
                }
                return acc;
            }, []);
            return {
                ...obj,
                time_slots: newTimeSlots
            };
        } else {
            return {
                ...obj,
                time_slots: []
            };
        }
    });

    return outputArray;
}

module.exports.getIcalObjectInstance = async (startTime, endTime, eventName, description, location, meetLink, leadName, leadEmail, timezone) => {
    const cal = ical({
        domain: 'hirisetech.com',
        name: eventName,
        timezone: timezone,
    });

    cal.createEvent({
        start: startTime,
        end: endTime,
        summary: eventName,
        description: description,
        location: location,
        url: meetLink,
        organizer: {
            name: leadName,
            email: leadEmail,
        },
    });

    return cal;
}

module.exports.dateFormattor1 = async (date, startTime, endTime, timezone) => {
    const startDate = moment.tz(`${date} ${startTime}`, `${timezone}`);
    const endDate = moment.tz(`${date} ${endTime}`, `${timezone}`);
    const localStartDate = startDate.clone().local();
    const localEndDate = endDate.clone().local();
    return { startDate: localStartDate.format(), endDate: localEndDate.format() };
}

// converting local time to utc time
module.exports.convertToLocal = async (starttime, endtime, timezone) => {
    const format = 'h:mm a';
    const dt = DateTime.fromFormat(starttime, format, { zone: timezone });
    const utcStart = dt.toUTC().toISO();

    const dt2 = DateTime.fromFormat(endtime, format, { zone: timezone });
    const utcEnd = dt2.toUTC().toISO();

    return { utcStart, utcEnd };
}

// converting utc time to local time
module.exports.convertToTimezone = async (utcStart, utcEnd, targetTimezone) => {
    const dtStart = DateTime.fromISO(utcStart, { zone: 'utc' }).setZone(targetTimezone);
    const dtEnd = DateTime.fromISO(utcEnd, { zone: 'utc' }).setZone(targetTimezone);
    const options = { hour: '2-digit', minute: '2-digit', hourCycle: 'h12' };
    const localStart = dtStart.toLocaleString(options).toLowerCase();
    const localEnd = dtEnd.toLocaleString(options).toLowerCase();
    return { localStart, localEnd };
}

module.exports.convertTimeToTargetedTz = async (startTime, endTime, timezone, date, targetedTimezone) => {
    // Create a Moment object for the start time with the provided timezone and date
    const startMoment = moment.tz(`${date} ${startTime}`, "YYYY-MM-DD hh:mm a", timezone);

    // Create a Moment object for the end time with the provided timezone and date
    const endMoment = moment.tz(`${date} ${endTime}`, "YYYY-MM-DD hh:mm a", timezone);

    // Convert the Moment objects to UTC timezone
    const startUtc = startMoment.utc();
    const endUtc = endMoment.utc();

    // Convert the UTC start time and end time to the targeted time zone with the specified date
    const startTargetedTimezone = startUtc.tz(targetedTimezone);
    const endTargetedTimezone = endUtc.tz(targetedTimezone);

    // Format the output strings
    const startTargetedTimezoneString = startTargetedTimezone.format("YYYY-MM-DD hh:mm a");
    const endTargetedTimezoneString = endTargetedTimezone.format("YYYY-MM-DD hh:mm a");

    const startTargetedTimezoneStringIso = startTargetedTimezone.toISOString();
    const endTargetedTimezoneStringIso = endTargetedTimezone.toISOString();

    // Return the results
    return {
        startTimeTargetedTimezone: startTargetedTimezoneString,
        endTimeTargetedTimezone: endTargetedTimezoneString,
        startTargetedTimezoneStringIso: startTargetedTimezoneStringIso,
        endTargetedTimezoneStringIso: endTargetedTimezoneStringIso
    };
}


module.exports.calculateCommission = async (slabId, amount) => {
    let totalCommission = 0; //findSales.rows[0].slab_id
    let s4 = dbScript(db_sql['Q161'], { var1: slabId })
    let slab = await connection.query(s4)

    let remainingAmount = Number(amount); //recognizeRevenue.rows[0].amount  //100000 //95000 //90000
    let commission = 0
    //if remainning amount is 0 then no reason to check 
    for (let i = 0; i < slab.rows.length && remainingAmount > 0; i++) {
        let slab_percentage = Number(slab.rows[i].percentage) //3  //5 //7
        let slab_maxAmount = Number(slab.rows[i].max_amount) //5000  //10000 //100000
        let slab_minAmount = Number(slab.rows[i].min_amount) //0  //5001 //10001
        if (slab.rows[i].is_max) {
            // Reached the last slab
            commission += ((slab_percentage / 100) * remainingAmount)
            break;
        }
        else {
            // This is not the last slab
            let diff = slab_minAmount == 0 ? 0 : 1   //0 //1 //1
            let slab_diff = (slab_maxAmount - slab_minAmount + diff) //5000-0+0 //10000-5001+1 //10000-10001 + 1
            slab_diff = (slab_diff > remainingAmount) ? remainingAmount : slab_diff  //5000 //5000 //90000
            commission += ((slab_percentage / 100) * slab_diff) //(0+3/100)*5000 = 150 //250 //6300 =>6700
            remainingAmount -= slab_diff //100000-5000 // 95000-5000 //90000-90000
            if (remainingAmount <= 0) {
                break;
            }
        }
    }
    totalCommission = totalCommission + commission;

    return totalCommission
}

module.exports.calculateQuarters = async (startDate) => {
    const quarters = [];
    const startUtcDate = new Date(startDate);
    const startLocalDate = new Date(startUtcDate.toLocaleDateString());

    const startYear = startLocalDate.getFullYear();
    const startMonth = startLocalDate.getMonth() + 1; // Add 1 because months are zero-based
    const startDay = startLocalDate.getDate();

    for (let i = 0; i < 4; i++) {
        const quarterStartDate = new Date(startYear, startMonth - 1 + (i * 3), startDay);
        const quarterEndDate = new Date(startYear, startMonth - 1 + (i * 3) + 3, startDay - 1);
        const quarterName = `${i + 1}`;

        quarters.push({
            start_date: quarterStartDate.toISOString(),
            end_date: quarterEndDate.toISOString(),
            quarter: quarterName
        });

    }
    return quarters;
};

// module.exports.getQuarterMonthsDates = async(start_date, end_date) => {

//     const startDate = new Date(start_date);
//     const endDate = new Date(end_date);

//     const startMonth = startDate.getMonth();
//     const endMonth = endDate.getMonth();

//     const dates = [];

//     for (let month = startMonth; month <= endMonth; month++) {
//       const tempDate = new Date(startDate);
//       tempDate.setMonth(month);
//       const startOfMonth = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1);
//       const endOfMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0);

//       dates.push({
//         start_date: startOfMonth.toISOString(),
//         end_date: endOfMonth.toISOString()
//       });
//     }

//     return dates;
// };

module.exports.getQuarterMonthsDates = async (start_date, end_date) => {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();

    const dates = [];

    for (let month = startMonth; month <= endMonth; month++) {
        const tempDate = new Date(startDate);
        tempDate.setMonth(month);
        const startOfMonth = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1);
        const endOfMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0);

        const formattedStartDate = new Date(startOfMonth.getTime() + 86400000).toISOString().split('T')[0];
        const formattedEndDate = new Date(endOfMonth.getTime() + 86400000).toISOString().split('T')[0];

        dates.push({
            start_date: formattedStartDate,
            end_date: formattedEndDate
        });
    }
    return dates;
};


module.exports.calculateEOLProducts = async (resultSet) => {
    // Object to store combined data by sales_id
    const combinedData = {};

    // Process the result set
    for (const result of resultSet) {
        const { sales_id, customer_name, product_names, end_of_life, target_amount } = result;

        // If sales_id already exists in combinedData, append product_names and end_of_life
        if (combinedData[sales_id]) {
            combinedData[sales_id].product_names.push(...product_names);
            combinedData[sales_id].end_of_life.push(end_of_life);
        } else {
            // Create a new entry in combinedData for the sales_id
            combinedData[sales_id] = {
                sales_id,
                customer_name,
                target_amount,
                product_names: [...product_names],
                end_of_life: [end_of_life]
            };
        }
    }

    // Convert combinedData object to an array
    const combinedResult = Object.values(combinedData);

    const highRiskEolSale = [];
    const lowRiskEolSale = [];

    // Get the current date
    const currentDate = new Date();

    // Iterate over each sale
    combinedResult.forEach((sale) => {
        const { sales_id, customer_name, product_names, end_of_life, target_amount } = sale;

        // Check if product_names and end_of_life exist
        if (product_names && end_of_life) {
            // Flag to track if any product is within 15 days of end_of_life
            let isHighRisk = false;

            // Iterate over each product
            for (let i = 0; i < product_names.length; i++) {
                const eolDateParts = end_of_life[i].split(/[/-]/);
                const eolDate = new Date(
                    Number(eolDateParts[2]),
                    Number(eolDateParts[0]) - 1,
                    Number(eolDateParts[1])
                );

                // Calculate the difference in days
                const timeDiff = eolDate.getTime() - currentDate.getTime();
                const diffInDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

                // Check if the product is within 15 days of end_of_life
                if (diffInDays <= 15) {
                    isHighRisk = true;
                    break;
                }
            }

            // Categorize the sale based on the end_of_life of products
            if (isHighRisk) {
                highRiskEolSale.push({ sales_id, customer_name, target_amount });
            } else {
                lowRiskEolSale.push({ sales_id, customer_name, target_amount });
            }
        } else {
            // Handle the case where product_names or end_of_life is missing
            lowRiskEolSale.push({ sales_id, customer_name, target_amount });
        }
    });


    return { highRiskEolSale, lowRiskEolSale };
}

module.exports.escapedArray = (array) => {
  let newArr = array.map(obj => {
        const escapedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                escapedObj[key] = this.mysql_real_escape_string(obj[key]);
            }
        }
        return escapedObj;
    })
    return newArr
}








