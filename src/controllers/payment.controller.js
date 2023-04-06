const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const stripe = require('stripe')(process.env.SECRET_KEY)
const { verifyTokenFn, immediateUpgradeSubFn, laterUpgradeSubFn } = require('../utils/helper')

module.exports.plansList = async (req, res) => {
    try {
        let s2 = await dbScript(db_sql['Q92'], {})
        let planData = await connection.query(s2)
        if (planData.rowCount > 0) {
            planData.rows.map(plan => {
                plan.discount_percentage = (plan.interval == 'year') ? Number(process.env.DISCOUNT_PERCENTAGE) : 0
            })
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
            proUserCount,
            cardNumber,
            expMonth,
            expYear,
            cvc
        } = req.body
        await connection.query('BEGIN')
        let user = await verifyTokenFn(req)
        if (user) {
            let s1 = dbScript(db_sql['Q8'], { var1: user.id })
            let checkuser = await connection.query(s1);
            if (checkuser.rows.length > 0) {
                let s2 = dbScript(db_sql['Q93'], { var1: planId })
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
                        customer: customer.id,
                        source: card.id
                    });
                    if (charge && customer && subscription && token && card) {

                        let s4 = dbScript(db_sql['Q96'], {
                            var1: user.id, var2: checkuser.rows[0].company_id,
                            var3: planId, var4: customer.id, var5: subscription.id, var6: card.id,
                            var7: token.id, var8: charge.id, var9: subscription.current_period_end,
                            var10: userCount, var11: charge.status, var12: Math.round(totalAmount), var13: charge.receipt_url, var14: proUserCount
                        })
                        let saveTrasaction = await connection.query(s4)

                        let expiryDate = new Date(Number(subscription.current_period_end) * 1000).toISOString()
                        let _dt = new Date().toISOString();

                        let s5 = dbScript(db_sql['Q102'], { var1: expiryDate, var2: checkuser.rows[0].id, var3: _dt })
                        let updateUserExpiryDate = await connection.query(s5)

                        let s7 = dbScript(db_sql['Q197'], { var1: expiryDate, var2: (Number(userCount) + 1), var3: proUserCount, var4: _dt, var5: checkuser.rows[0].company_id })
                        let updateCompanyExpiryDate = await connection.query(s7)

                        let s8 = dbScript(db_sql['Q328'], { var1: checkuser.rows[0].company_id, var2 : true })
                        let updateAdminToPro = await connection.query(s8)
                        
                        let s6 = dbScript(db_sql['Q30'], { var1: false, var2: checkuser.rows[0].company_id, var3: _dt })
                        let unlockUsers = await connection.query(s6)

                        if (saveTrasaction.rowCount > 0 && updateUserExpiryDate.rowCount > 0 && updateCompanyExpiryDate.rowCount > 0 && updateAdminToPro.rowCount>0 ) {
                            await connection.query('COMMIT')
                            res.json({
                                status: 201,
                                success: true,
                                message: 'Transaction Completed',
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
                        message: "Plan not found",
                        data: ""
                    })
                }
            } else {
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: "This user is not exits",
                    data: ""
                })
            }
        } else {
            await connection.query('ROLLBACK')
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
            let s2 = dbScript(db_sql['Q97'], { var1: user.rows[0].company_id })
            let transaction = await connection.query(s2)
            if (transaction.rowCount > 0) {
                let s3 = dbScript(db_sql['Q93'], { var1: transaction.rows[0].plan_id })
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
                            proUserPrice: subscription.items.data[2].price.unit_amount,
                            proUserCount: subscription.items.data[2].quantity,
                            endsIn: Number(days[0]),
                            planType: (subscription.trial_end != null) ? "Trial Plan" : "Paid Plan",
                            isCanceled: transaction.rows[0].is_canceled,
                            paymentReceipt: transaction.rows[0].payment_receipt
                        }
                        console.log(details);
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
                            proUserPrice: "",
                            proUserCount: "",
                            endsIn: "",
                            planType: "",
                            isCanceled: "",
                            paymentReceipt: ""
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
                let s4 = dbScript(db_sql['Q9'], { var1: user.rows[0].company_id })
                let companyDetails = await connection.query(s4)

                let endDate = new Date(companyDetails.rows[0].expiry_date)
                let timeDifference = endDate.getTime() - new Date().getTime();
                //calculate days difference by dividing total milliseconds in a day  
                let daysDifference = timeDifference / (1000 * 60 * 60 * 24);
                let days = daysDifference.toString().split('.')

                let details = {
                    planName: "",
                    planInterval: "",
                    activeStatus: "",
                    description: "",
                    adminPrice: "",
                    userPrice: "",
                    proUserPrice: "",
                    proUserCount: "",
                    userCount: Number(companyDetails.rows[0].user_count),
                    endsIn: Number(days[0]),
                    planType: "",
                    isCanceled: "",
                    paymentReceipt: ""
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
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let user = await connection.query(s1)
        if (user.rows.length > 0) {
            if (user.rows[0].is_admin == true) {
                let s2 = dbScript(db_sql['Q97'], { var1: user.rows[0].company_id })
                let transaction = await connection.query(s2)
                if (transaction.rowCount > 0) {
                    let subscriptionId = transaction.rows[0].stripe_subscription_id
                    let cancelSubscription = await stripe.subscriptions.update(
                        subscriptionId,
                        { cancel_at_period_end: true }
                    );
                    if (cancelSubscription) {
                        let _dt = new Date().toISOString();

                        let s2 = dbScript(db_sql['Q106'], { var1: true, var2: _dt, var3: transaction.rows[0].id })
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
                        await connection.query('ROLLBACK')
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
            let s2 = dbScript(db_sql['Q97'], { var1: user.rows[0].company_id })
            let transaction = await connection.query(s2)
            if (transaction.rowCount > 0) {
                let subscriptionId = transaction.rows[0].stripe_subscription_id
                if (immediateUpgrade == true) {
                    const deleted = await stripe.subscriptions.del(
                        subscriptionId
                    );
                    if (deleted) {
                        await immediateUpgradeSubFn(req, res, user, transaction)
                    }
                } else if (immediateUpgrade == false) {
                    let cancelSubscription = await stripe.subscriptions.update(
                        subscriptionId,
                        { cancel_at_period_end: true }
                    );
                    if (cancelSubscription) {
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
        res.json({
            status: 500,
            success: false,
            message: error.message
        })
    }
}


