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
                req.json({
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
    let { token } = req.body
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
            planId
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
                    const createSession = await stripe.checkout.sessions.create({
                        mode: 'subscription',
                        customer: customer.id,
                        line_items: [
                            {
                                price: planData.rows[0].plan_id,
                                quantity: 1,
                            },
                        ],
                        success_url: 'http://143.198.102.134:3003/api/v1/companyAdmin/success/{CHECKOUT_SESSION_ID}',
                        cancel_url: 'https://example.com/cancel'
                    });

                    if (createSession && customer) {
                        let id = uuid.v4()
                        await connection.query('BEGIN')
                        let s4 = dbScript(db_sql['Q115'], {
                            var1: id, var2: user.id, var3: checkuser.rows[0].company_id,
                            var4: planId, var5: createSession.id, var6: createSession.mode, var7: customer.id
                        })
                        let saveTrasaction = await connection.query(s4)

                        if (saveTrasaction.rowCount > 0) {
                            await connection.query('COMMIT')
                            res.json({
                                status: 201,
                                success: true,
                                message: 'Transaction initiated',
                                data: createSession.url
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

module.exports.onSuccess = async (req, res) => {
    try {
        let { sessionId } = req.params
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status == 'paid') {
            let s2 = dbScript(db_sql['Q117'], { var1: sessionId })
            let updateSession = await connection.query(s2)
            if (updateSession.rowCount > 0) {
                res.set("Content-Type", "text/html");
                res.send(
                    Buffer.from(
                        '<html><head head ><link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,400i,700,900&display=swap" rel="stylesheet"></head><style>body {text-align: center;padding: 40px 0;background: #EBF0F5;}h1 {color: #88B04B;font-family: "Nunito Sans", "Helvetica Neue", sans-serif;font-weight: 900;font-size: 40px;margin-bottom: 10px;p {color: #404F5E;font-family: "Nunito Sans", "Helvetica Neue", sans-serif;font-size:20px; margin: 0;} i{color: #9ABC66;font-size: 100px;line-height: 200px;margin-left:-15px;}.card {background: white;padding: 60px;border-radius: 4px;box-shadow: 0 2px 3px #C8D0D8;display: inline-block;margin: 0 auto;</style><body><div class="card"><div style="border-radius:200px; height:200px; width:200px; background: #F8FAF5; margin:0 auto;"><i style="color: #9ABC66;font-size: 100px;line-height: 200px;margin-left:-15px;" class="checkmark">✓</i></div><h1>Success</h1> <p>Your payment successfully done!</p></div></body></html > '
                    )
                );
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Payment not completed",
                    data: ""
                })
            }
        }
        else {
            res.json({
                status: 400,
                success: false,
                message: "Transaction in not Completed",
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

// module.exports.onCancel = async(req, res) => {

// }