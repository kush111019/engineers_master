const connection = require('../database/connection')
const uuid = require("node-uuid")
const { db_sql, dbScript } = require('../utils/db_scripts');
const stripe = require('stripe')(process.env.SECRET_KEY)
const jsonwebtoken = require("jsonwebtoken");

module.exports.plansList = async (req, res) => {
    try {
        let s2 = await dbScript(db_sql['Q111'], {})
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

let verifyTokenFn = async (req) => {
    let token = req.headers.authorization
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
            let s1 = dbScript(db_sql['Q4'], { var1: user.email })
            let checkuser = await connection.query(s1);
            if (checkuser.rows.length > 0) {
                let s2 = dbScript(db_sql['Q112'], { var1: planId })
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
                          exp_year:  expYear,
                          cvc: cvc,
                        },
                    });
                    const card = await stripe.customers.createSource(
                        customer.id,
                        {source: token.id}
                    ); 
                    const subscription = await stripe.subscriptions.create({
                        customer: customer.id,
                        items: [
                            { price: planData.rows[0].admin_price_id },
                            { price: planData.rows[0].user_price_id, quantity: userCount },
                        ],
                        payment_settings: {
                            payment_method_types: ['card'],
                            save_default_payment_method : "on_subscription"
                        },
                        coupon: (planData.rows[0].interval == 'year') ? 'Omgx6XvX' : ''
                    });
                    let totalAmount = 0
                    for(let data of subscription.items.data){
                            let totalPrice = data.price.unit_amount * data.quantity
                            totalAmount = totalAmount + totalPrice;
                    }
                    const charge = await stripe.charges.create({
                        amount: totalAmount,
                        currency: subscription.currency,
                        customer : customer.id,
                        source: card.id
                    });
                    if (charge && customer && subscription && token && card) {

                        let id = uuid.v4()
                        await connection.query('BEGIN')
                        let s4 = dbScript(db_sql['Q115'], {
                            var1: id, var2: user.id, var3: checkuser.rows[0].company_id,
                            var4: planId, var5: customer.id,var6: subscription.id, var7: card.id,
                            var8: token.id, var9 : charge.id, var10 : subscription.current_period_end,
                            var11 : userCount , var12 : charge.status
                        })
                        let saveTrasaction = await connection.query(s4)

                        let expiryDate = new Date(Number(subscription.current_period_end) * 1000).toISOString()
                        let _dt = new Date().toISOString();
                        
                        let s5 = dbScript(db_sql['Q122'],{var1: expiryDate, var2 : checkuser.rows[0].id , var3 : _dt })
                        let updateUserExpiryDate = await connection.query(s5)

                        let s6 = dbScript(db_sql['Q33'],{var1 : false, var2 : checkuser.rows[0].company_id, var3 : _dt })
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

// module.exports.onSuccess = async (req, res) => {
//     try {
//         let { sessionId } = req.params
//         const session = await stripe.checkout.sessions.retrieve(sessionId);
//         if (session.payment_status == 'paid') {
//             let s2 = dbScript(db_sql['Q117'], { var1: sessionId })
//             let updateSession = await connection.query(s2)
//             if (updateSession.rowCount > 0) {
//                 res.set("Content-Type", "text/html");
//                 res.send(
//                     Buffer.from(
//                         '<html><head head ><link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,400i,700,900&display=swap" rel="stylesheet"></head><style>body {text-align: center;padding: 40px 0;background: #EBF0F5;}h1 {color: #88B04B;font-family: "Nunito Sans", "Helvetica Neue", sans-serif;font-weight: 900;font-size: 40px;margin-bottom: 10px;p {color: #404F5E;font-family: "Nunito Sans", "Helvetica Neue", sans-serif;font-size:20px; margin: 0;} i{color: #9ABC66;font-size: 100px;line-height: 200px;margin-left:-15px;}.card {background: white;padding: 60px;border-radius: 4px;box-shadow: 0 2px 3px #C8D0D8;display: inline-block;margin: 0 auto;</style><body><div class="card"><div style="border-radius:200px; height:200px; width:200px; background: #F8FAF5; margin:0 auto;"><i style="color: #9ABC66;font-size: 100px;line-height: 200px;margin-left:-15px;" class="checkmark">✓</i></div><h1>Success</h1> <p>Your payment successfully done!</p><a href="http://143.198.102.134:8080/auth/login"><button style="color: #fff;background: #1F0757; height:50px; width:120px;font-size: 15px;" >Login</button></a></div></body></html>'
//                     )
//                 );
//             } else {
//                 res.json({
//                     status: 400,
//                     success: false,
//                     message: "Payment not completed",
//                     data: ""
//                 })
//             }
//         }
//         else {
//             res.json({
//                 status: 400,
//                 success: false,
//                 message: "Transaction in not Completed",
//             });
//         }
//     } catch (error) {
//         await connection.query('ROLLBACK')
//         res.json({
//             status: 400,
//             success: false,
//             message: error.message,
//             data: ""
//         })
//     }
// }

module.exports.subscribedUsersList = async(req,res) => {
    try {
        let sAEmail = req.user.email
        let s1 = dbScript(db_sql['Q106'], { var1: sAEmail })
        let checkSuperAdmin = await connection.query(s1)
        if (checkSuperAdmin.rowCount > 0) {

            let s2 = dbScript(db_sql['Q123'],{})
            let subscriptionUsers = await connection.query(s2)
            let subscriptionArr = []
            if(subscriptionUsers.rowCount > 0 ){
                for(data of subscriptionUsers.rows ){
                    const subscription = await stripe.subscriptions.retrieve(
                        data.stripe_subscription_id
                );
                subscriptionArr.push({
                    subscriptionId : subscription.id,

                })
                        
                    
                
            }
            }else{
                if(subscriptionUsers.rows.length == 0){
                    res.json({
                        status: 400,
                        success: false,
                        message: "Empty subscribed users List",
                        data: []
                    }) 
                }else{
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong",
                    })
                }
                
            }

        } else {
            res.json({
                status: 400,
                success: false,
                message: "Super Admin not found",
                data: ""
            })
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

//--------------------Company subscription details--------------------------------------

module.exports.subscriptionDetails = async (req, res) => {
    try {
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let user = await connection.query(s1)
        if (user.rows.length > 0) {
            let s2 = dbScript(db_sql['Q116'], { var1: user.rows[0].company_id })
            let transaction = await connection.query(s2)
            if (transaction.rowCount > 0) {
                let s3 = dbScript(db_sql['Q112'], { var1: transaction.rows[0].plan_id })
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
                            planType: (subscription.trial_end != null) ? "Trial Plan" : "Paid Plan"
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
                            planType: ""
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
            }else{
                let details = {
                    planName: "",
                    planInterval: "",
                    activeStatus: "",
                    description: "",
                    adminPrice: "",
                    userPrice: "",
                    userCount: "",
                    endsIn: "",
                    planType: ""
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


