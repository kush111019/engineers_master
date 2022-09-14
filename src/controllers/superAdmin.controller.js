const connection = require('../database/connection')
const uuid = require("node-uuid")
const { issueJWT } = require("../utils/jwt")
const { resetPasswordMail, resetPasswordMail2 } = require("../utils/sendMail")
const { db_sql, dbScript } = require('../utils/db_scripts');
const jsonwebtoken = require("jsonwebtoken");

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        let s1 = dbScript(db_sql['Q106'], { var1: email })
        let admin = await connection.query(s1)
        if (admin.rows.length > 0) {
            if (admin.rows[0].encrypted_password == password) {
                let jwtToken = await issueJWT(admin.rows[0]);
                res.send({
                    status: 200,
                    success: true,
                    message: "Login successfull",
                    data: {
                        token: jwtToken
                    }
                });
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Incorrect Password"
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Super Admin not found"
            })
        }
    }
    catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }
}

module.exports.showProfile = async (req, res) => {
    try {
        let sAEmail = req.user.email
        let s1 = dbScript(db_sql['Q106'], { var1: sAEmail })
        let checkSuperAdmin = await connection.query(s1)
        if (checkSuperAdmin.rowCount > 0) {
            let admin = {
                id: checkSuperAdmin.rows[0].id,
                name: checkSuperAdmin.rows[0].name,
                email: checkSuperAdmin.rows[0].email
            }
            res.json({
                status: 200,
                success: true,
                message: 'Super admin data',
                data: admin
            })
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Super admin not found",
                data: ""
            })
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.forgotPassword = async (req, res) => {
    try {
        let {
            email
        } = req.body
        let s1 = dbScript(db_sql['Q106'], { var1: email })
        let findSuperAdmin = await connection.query(s1);
        if (findSuperAdmin.rowCount > 0) {
            const payload = {
                id: findSuperAdmin.rows[0].id,
                email: findSuperAdmin.rows[0].email
            }
            let token = await issueJWT(payload)
            let link = `http://143.198.102.134:8080/auth/reset-password/${token}`
            if (process.env.isLocalEmail == 'true') {
                await resetPasswordMail2(email, link, findSuperAdmin.rows[0].name);
                res.json({
                    status: 200,
                    success: true,
                    message: "New link sent to your email address",
                })
            } else {
                let emailSend = await resetPasswordMail(email, link, findSuperAdmin.rows[0].name);
                if (emailSend.status == 400) {
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong",
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "New link sent to your email address",
                    })
                }
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Super admin is not exits",
                data: ""
            })
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
            data: ""
        })
    }
}

let verifyTokenFn = async (req) => {
    let { token } = req.body
    let superAdmin = await jsonwebtoken.verify(token, 'KEy', function (err, decoded) {
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
    return superAdmin
}

module.exports.resetPassword = async (req, res) => {
    try {
        let {
            password
        } = req.body
        let superAdmin = await verifyTokenFn(req)
        if (superAdmin) {
            let s1 = dbScript(db_sql['Q106'], { var1: superAdmin.email })
            let checksuperAdmin = await connection.query(s1);
            if (checksuperAdmin.rowCount > 0) {
                await connection.query('BEGIN')
                let s2 = dbScript(db_sql['Q108'], { var1: superAdmin.email, var2: password })
                let updatesuperAdmin = await connection.query(s2)
                if (updatesuperAdmin.rowCount == 1) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Password changed successfully",
                        data: ""
                    })
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong",
                        data: ""
                    })
                }

            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "superAdmin not found",
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

module.exports.companiesList = async (req, res) => {
    try {
        let email = req.user.email

        let s1 = dbScript(db_sql['Q106'], { var1: email })
        let checkSuperAdmin = await connection.query(s1);
        console.log(checkSuperAdmin.rows);
        if (checkSuperAdmin.rowCount != 0) {
            let s2 = dbScript(db_sql['Q107'], {})
            let findCompanies = await connection.query(s2);
            if (findCompanies.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Companies List',
                    data: findCompanies.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty Company list",
                    data: []
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Super Admin not found",
            })
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.showUsersByCompanyId = async (req, res) => {
    try {
        let sAEmail = req.user.email
        let {
            companyId,
        } = req.query
        console.log(req.query);
        let s1 = dbScript(db_sql['Q106'], { var1: sAEmail })
        let checkSuperAdmin = await connection.query(s1)
        if (checkSuperAdmin.rowCount > 0) {
            let s2 = dbScript(db_sql['Q17'], { var1: companyId })
            let findUser = await connection.query(s2);
            if (findUser.rowCount > 0) {
                let role;
                for (let userData of findUser.rows) {
                    let s3 = dbScript(db_sql['Q14'], { var1: userData.role_id })
                    role = await connection.query(s3);
                    userData.roleName = role.rows[0].role_name
                }
                if (role.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Company users list',
                        data: findUser.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty company users list",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Something went wrong"
                })
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
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.companyWiseTotalRevenue = async (req, res) => {
    try {
        let sAEmail = req.user.email
        let s1 = dbScript(db_sql['Q106'], { var1: sAEmail })
        let checkSuperAdmin = await connection.query(s1)
        if (checkSuperAdmin.rowCount > 0) {
            let s2 = dbScript(db_sql['Q107'], {})
            let companies = await connection.query(s2)
            let revenue = []
            for (let data of companies.rows) {
                let s3 = dbScript(db_sql['Q109'], { var1: data.id })
                let revenueByCompany = await connection.query(s3)
                let sum = 0
                if (revenueByCompany.rowCount > 0) {
                    for (amount of revenueByCompany.rows) {
                        sum = sum + Number(amount.target_amount)
                    }
                    revenue.push({
                        companyId: revenueByCompany.rows[0].company_id,
                        companyName: revenueByCompany.rows[0].company_name,
                        revenue: sum
                    })
                }
            }
            if (revenue.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Company wise total revenue",
                    data: revenue
                })
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Empty Company wise total revenue",
                    data: revenue
                })
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
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.userWiseCompanyRevenue = async (req, res) => {
    try {
        let sAEmail = req.user.email
        let { companyId } = req.query
        let s1 = dbScript(db_sql['Q106'], { var1: sAEmail })
        let checkSuperAdmin = await connection.query(s1)
        if (checkSuperAdmin.rowCount > 0) {
            let salesRepArr = []
            let s4 = dbScript(db_sql['Q98'], { var1: companyId })
            let salesData = await connection.query(s4)
            if (salesData.rowCount > 0) {
                let holder = {};
                let newArr = []
                for (let sales of salesData.rows) {
                    let s5 = dbScript(db_sql['Q92'], { var1: sales.id })
                    let salesRep = await connection.query(s5)
                    if (salesRep.rows.length > 0) {
                        salesRepArr.push({
                            user: salesRep.rows[0].full_name,
                            revenue: sales.target_amount
                        })
                    }
                }
                salesRepArr.forEach((d) => {
                    if (holder.hasOwnProperty(d.user)) {
                        holder[d.user] = holder[d.user] + Number(d.revenue);
                    } else {
                        holder[d.user] = Number(d.revenue);
                    }
                });
                for (let prop in holder) {
                    newArr.push({ user: prop, revenue: holder[prop] });
                }
                if (newArr.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Revenue per user",
                        data: newArr
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty revenue per user",
                        data: newArr
                    })
                }
            } else {
                if (salesData.rows.length == 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty revenue per user",
                        data: []
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
                message: "Super Admin not found",
                data: ""
            })
        }

    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.dashboard = async (req, res) => {
    try {
        let sAEmail = req.user.email
        let s1 = dbScript(db_sql['Q106'], { var1: sAEmail })
        let checkSuperAdmin = await connection.query(s1)
        if (checkSuperAdmin.rowCount > 0) {
            let s2 = dbScript(db_sql['Q107'], {})
            let companyData = await connection.query(s2)
            let totalCommission = 0;
            let revenueCommission = []
            let totalRevenue = 0;
            if (companyData.rowCount > 0) {
                for (let data of companyData.rows) {
                    let targetAmount = 0;
                    let commission = 0;
                    let revenueCommissionObj = {}
                    let s3 = dbScript(db_sql['Q93'], { var1: data.id })
                    let customers = await connection.query(s3)
                    if (customers.rowCount > 0) {
                        for (customerData of customers.rows) {
                            if (customerData.closed_at != null) {
                                targetAmount = targetAmount + Number(customerData.target_amount)
                                let s5 = dbScript(db_sql['Q19'], { var1: data.id })
                                let slab = await connection.query(s5)
                                if (slab.rowCount > 0) {
                                    for (slabData of slab.rows) {

                                        if ((Number(customerData.target_amount) >= Number(slabData.min_amount)) && slabData.is_max == true) {
                                            console.log(slabData,"slabData");
                                            let percentage = slabData.percentage
                                            let amount = ((Number(percentage) / 100) * Number(customerData.target_amount))
                                            console.log(amount,"amount");
                                            commission = commission + amount
                                        }
                                        else if ((Number(customerData.target_amount) >= Number(slabData.min_amount)) && (Number(customerData.target_amount) <= Number(slabData.max_amount))) {

                                            let percentage = slabData.percentage
                                            let amount = ((Number(percentage) / 100) * Number(customerData.target_amount))
                                            commission = commission + amount
                                        }
                                    }
                                } else {
                                    res.json({
                                        status: 400,
                                        success: false,
                                        message: "Slab not found"
                                    })
                                }
                                
                            }
                            

                        } 
                        revenueCommissionObj.name = data.company_name
                        revenueCommissionObj.revenue = targetAmount
                        revenueCommissionObj.commission = commission
                        revenueCommissionObj.date = data.created_at
                        revenueCommission.push(revenueCommissionObj)
                    }
                    totalRevenue = totalRevenue + targetAmount
                    totalCommission = totalCommission + commission
                }
                if (revenueCommission.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "total revenue and total commission",
                        data: {
                            totalRevenue: totalRevenue,
                            totalCommission: totalCommission,
                            revenueCommission: revenueCommission

                        }
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty total revenue and total commission",
                        data: {
                            totalRevenue: 0,
                            totalCommission: 0,
                            revenueCommission: revenueCommission

                        }
                    })
                }


            } else {
                if (companyData.rows.length == 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty total revenue and total commission",
                        data: []
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
                message: "Super Admin not found",
                data: ""
            })
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}



