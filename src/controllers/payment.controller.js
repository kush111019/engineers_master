const connection = require('../database/connection')
const uuid = require("node-uuid")
const { db_sql, dbScript } = require('../utils/db_scripts');
const stripe = require('stripe')(process.env.SECRET_KEY)
const {verifyTokenFn, immediateUpgradeSubFn, laterUpgradeSubFn} = require('../utils/helper')

module.exports.plansList = async (req, res) => {
    try {
        let s2 = await dbScript(db_sql['Q103'], {})
        let planData = await connection.query(s2)
        if (planData.rowCount > 0) {
            res.json({
                status: 200,
                success: true,
                message: "Plans list",
                data: planData.rows
            })
        } else {
            if (planData.rows.length == 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty Plans list",
                    data: planData.rows
                })
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong",
                    data: ""
                })
            }
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.createPayment = async (req, res) => {
    try {
        let {
            planId,
            userCount,
            cardNumber,
            expMonth,
            expYear,
            cvc
        } = req.body
        let user = await verifyTokenFn(req)
        if (user) {
            let s1 = dbScript(db_sql['Q8'], { var1: user.id })
            let checkuser = await connection.query(s1);
            if (checkuser.rows.length > 0) {
                let s2 = dbScript(db_sql['Q104'], { var1: planId })
                let planData = await connection.query(s2)
                if (planData.rowCount > 0) {
                    const customer = await stripe.customers.create({
                        name: checkuser.rows[0].full_name,
                        email: checkuser.rows[0].email_address,
                        phone: checkuser.rows[0].mobile_number,
                        description: "Hirise-sales subscription",
                    });
                    const token = await stripe.tokens.create({
                        card: {
                            number: cardNumber,
                            exp_month: expMonth,
                            exp_year: expYear,
                            cvc: cvc,
                        },
                    });
                    const card = await stripe.customers.createSource(
                        customer.id,
                        { source: token.id }
                    );
                    const subscription = await stripe.subscriptions.create({
                        customer: customer.id,
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
                        customer: customer.id,
                        source: card.id
                    });
                    if (charge && customer && subscription && token && card) {

                        let id = uuid.v4()
                        await connection.query('BEGIN')
                        let s4 = dbScript(db_sql['Q107'], {
                            var1: id, var2: user.id, var3: checkuser.rows[0].company_id,
                            var4: planId, var5: customer.id, var6: subscription.id, var7: card.id,
                            var8: token.id, var9: charge.id, var10: subscription.current_period_end,
                            var11: userCount, var12: charge.status, var13: Math.round(totalAmount), var14: charge.receipt_url
                        })
                        let saveTrasaction = await connection.query(s4)

                        let expiryDate = new Date(Number(subscription.current_period_end) * 1000).toISOString()
                        let _dt = new Date().toISOString();

                        let s5 = dbScript(db_sql['Q113'], { var1: expiryDate, var2: checkuser.rows[0].id, var3: _dt })
                        let updateUserExpiryDate = await connection.query(s5)

                        let s6 = dbScript(db_sql['Q30'], { var1: false, var2: checkuser.rows[0].company_id, var3: _dt })
                        let unlockUsers = await connection.query(s6)

                        if (saveTrasaction.rowCount > 0 && updateUserExpiryDate.rowCount > 0 && unlockUsers.rowCount > 0) {
                            await connection.query('COMMIT')
                            res.json({
                                status: 201,
                                success: true,
                                message: 'Transaction Completed',
                                data: charge.receipt_url
                            })
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
                            message: 'something went wrong'
                        })
                    }

                } else {
                    res.json({
                        status: 400,
                        success: false,
                        message: "Plan not found",
                        data: ""
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "This user is not exits",
                    data: ""
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Token not found",
            });
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
            data: ""
        })
    }
}

module.exports.subscriptionDetails = async (req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let user = await connection.query(s1)
        if (user.rows.length > 0) {
            let s2 = dbScript(db_sql['Q108'], { var1: user.rows[0].company_id })
            let transaction = await connection.query(s2)
            if (transaction.rowCount > 0) {
                let s3 = dbScript(db_sql['Q104'], { var1: transaction.rows[0].plan_id })
                let planData = await connection.query(s3)

                if (planData.rowCount > 0) {
                    const product = await stripe.products.retrieve(
                        planData.rows[0].product_id
                    );

                    const subscription = await stripe.subscriptions.retrieve(
                        transaction.rows[0].stripe_subscription_id
                    );

                    let endDate = new Date(subscription.current_period_end * 1000)
                    let timeDifference = endDate.getTime() - new Date().getTime();
                    //calculate days difference by dividing total milliseconds in a day  
                    let daysDifference = timeDifference / (1000 * 60 * 60 * 24);
                    let days = daysDifference.toString().split('.')

                    if (product && subscription) {
                        let details = {
                            planName: product.name,
                            planInterval: subscription.items.data[0].plan.interval,
                            activeStatus: product.active,
                            description: product.description,
                            adminPrice: subscription.items.data[0].price.unit_amount,
                            userPrice: subscription.items.data[1].price.unit_amount,
                            userCount: subscription.items.data[1].quantity,
                            endsIn: Number(days[0]),
                            planType: (subscription.trial_end != null) ? "Trial Plan" : "Paid Plan",
                            isCanceled : transaction.rows[0].is_canceled,
                            paymentReceipt : transaction.rows[0].payment_receipt
                        }
                        res.json({
                            status: 200,
                            success: true,
                            message: "Subscription details",
                            data: details
                        })
                    } else {
                        let details = {
                            planName: "",
                            planInterval: "",
                            activeStatus: "",
                            description: "",
                            adminPrice: "",
                            userPrice: "",
                            userCount: "",
                            endsIn: "",
                            planType: "",
                            isCanceled : "",
                            paymentReceipt : ""
                        }
                        res.json({
                            status: 200,
                            success: false,
                            message: "Empty Subscription details",
                            data: details
                        })
                    }

                } else {
                    res.json({
                        status: 400,
                        success: false,
                        message: "No Subscription details found"
                    })
                }
            } else {
                let details = {
                    planName: "",
                    planInterval: "",
                    activeStatus: "",
                    description: "",
                    adminPrice: "",
                    userPrice: "",
                    userCount: "",
                    endsIn: "",
                    planType: "",
                    isCanceled : "",
                    paymentReceipt : ""
                }
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Subscription details",
                    data: details
                })
            }

        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
            })
        }

    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 500,
            success: false,
            message: error.message
        })
    }
}

module.exports.cancelSubscription = async (req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let user = await connection.query(s1)
        if (user.rows.length > 0) {
            if (user.rows[0].is_admin == true) {
                let s2 = dbScript(db_sql['Q108'], { var1: user.rows[0].company_id })
                let transaction = await connection.query(s2)
                if (transaction.rowCount > 0) {
                    let subscriptionId = transaction.rows[0].stripe_subscription_id
                    let cancelSubscription = await stripe.subscriptions.update(
                        subscriptionId,
                        { cancel_at_period_end: true }
                    );
                    if (cancelSubscription) {
                        let _dt = new Date().toISOString();
                        await connection.query('BEGIN')
                        let s2 = dbScript(db_sql['Q118'], { var1: true, var2: _dt, var3: transaction.rows[0].id })
                        let updateTransaction = await connection.query(s2)
                        if (updateTransaction.rowCount > 0) {
                            await connection.query('COMMIT')
                            res.json({
                                status: 200,
                                success: true,
                                message: "Subscription will be canceled on end of current plan"
                            })
                        } else {
                            await connection.query('ROLLBACK')
                            res.json({
                                status: 400,
                                success: false,
                                message: "Something went wrong"
                            })
                        }

                    } else {
                        res.json({
                            status: 400,
                            success: false,
                            message: "Something went wrong"
                        })
                    }
                } else {
                    if (transaction.rows.length == 0) {
                        res.json({
                            status: 200,
                            success: false,
                            message: "Not subscribed for any plan"
                        })
                    } else {
                        res.json({
                            status: 400,
                            success: false,
                            message: "Something went wrong"
                        })
                    }
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Not an admin"
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
            })
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 500,
            success: false,
            message: error.message
        })
    }
}

//---------------------------------------------------------------------------------------

module.exports.upgradeSubscription = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            immediateUpgrade
        } = req.body
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let user = await connection.query(s1)
        if (user.rows.length > 0) {
            let s2 = dbScript(db_sql['Q108'], { var1: user.rows[0].company_id })
            let transaction = await connection.query(s2)
            if (transaction.rowCount > 0) {
                let subscriptionId = transaction.rows[0].stripe_subscription_id
                if (immediateUpgrade == true) {
                    const deleted = await stripe.subscriptions.del(
                        subscriptionId
                    );
                    if(deleted){
                        await immediateUpgradeSubFn(req, res, user, transaction)
                    }
                } else if (immediateUpgrade == false) {
                    let cancelSubscription = await stripe.subscriptions.update(
                        subscriptionId,
                        { cancel_at_period_end: true }
                    );
                    if(cancelSubscription){
                        await laterUpgradeSubFn(req, res, user, transaction)
                    }
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "not subscribed for any plan"
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
            })
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 500,
            success: false,
            message: error.message
        })
    }
}


