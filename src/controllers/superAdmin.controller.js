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
            res.json({
                status: 200,
                success: true,
                message: 'Super admin data',
                data: checkSuperAdmin.rows[0]
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
            let s4 = dbScript(db_sql['Q107'],{})
            let companies = await connection.query(s4)
            let revenue = []
            for(let data of companies.rows){
                let companyWiseRevenue = {}
                let s2 = dbScript(db_sql['Q98'], { var1: data.id})
                let companyRevenue = await connection.query(s2)
                let sum = 0
                if (companyRevenue.rowCount > 0) {
                    for (let companyData of companyRevenue.rows) {
                        let s3 = dbScript(db_sql['Q60'], { var1: companyData.customer_id })
                        let closedCustomer = await connection.query(s3)
                        for (let customerData of closedCustomer.rows) {
                            if (customerData.closed_at != null) {
                                sum = sum + Number(companyData.target_amount)
                            }
                        }
                        companyWiseRevenue.companyName = data.company_name
                        companyWiseRevenue.companyId = data.id
                        companyWiseRevenue.totalRevenue = sum
                        revenue.push(companyWiseRevenue)
                       
                    }
                   
                } 
                
                
                
                
            }
            
            if(revenue.length > 0){
                res.json({
                    status: 200,
                    success: true,
                    message: "Company wise total revenue",
                    data: revenue
                })
            
            }else{
                res.json({
                    status: 400,
                    success: false,
                    message: "Empty Company wise total revenue",
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






