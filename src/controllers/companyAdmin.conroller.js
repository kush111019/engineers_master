const connection = require('../database/connection')
const { issueJWT } = require("../utils/jwt")
const {
    resetPasswordMail,
    recurringPaymentMail,
    welcomeEmail,
    resetPasswordMail2,
    welcomeEmail2,
} = require("../utils/sendMail")
const { db_sql, dbScript } = require('../utils/db_scripts');
const jsonwebtoken = require("jsonwebtoken");
const uuid = require("node-uuid");
const { mysql_real_escape_string } = require('../utils/helper')

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

let createAdmin = async (bodyData, cId, res) => {
    let id = uuid.v4()
    let {
        name,
        companyLogo,
        emailAddress,
        mobileNumber,
        companyAddress,
        phoneNumber,
        encryptedPassword
    } = bodyData

    companyLogo = companyLogo == "" ? process.env.DEFAULT_LOGO : companyLogo;

    let s3 = dbScript(db_sql['Q4'], { var1: emailAddress })
    let findUser = await connection.query(s3)
    if (findUser.rowCount == 0) {
        await connection.query('BEGIN')
        let roleId = uuid.v4()
        let s4 = dbScript(db_sql['Q13'], { var1: roleId, var2: cId })
        let createRole = await connection.query(s4)

        let s9 = dbScript(db_sql['Q121'], {})
        let trialDays = await connection.query(s9)
        let expiryDate = '';
        if (trialDays.rowCount > 0) {
            let currentDate = new Date()
            expiryDate = new Date(currentDate.setDate(currentDate.getDate() + Number(trialDays.rows[0].trial_days))).toISOString()
        }

        let role_id = createRole.rows[0].id
        let s5 = dbScript(db_sql['Q3'], { var1: id, var2: mysql_real_escape_string(name), 
                    var3: cId, var4: companyLogo, var5: emailAddress, var6: mobileNumber, 
                    var7: phoneNumber, var8: encryptedPassword, var9: role_id, 
                    var10: mysql_real_escape_string(companyAddress), var11: expiryDate })
        let saveuser = await connection.query(s5)

        let s6 = dbScript(db_sql['Q7'], {})
        let findModules = await connection.query(s6)
        let moduleArr = []
        for (data of findModules.rows) {
            moduleArr.push(data.id)
            let perId = uuid.v4()
            let s7 = dbScript(db_sql['Q23'], { var1: perId, var2: role_id, var3: data.id, 
                        var4: saveuser.rows[0].id })
            var addPermission = await connection.query(s7)
        }
        let _dt = new Date().toISOString();
        let s8 = dbScript(db_sql['Q38'], { var1: JSON.stringify(moduleArr), var2: _dt, 
                    var3: role_id })
        let updateModule = await connection.query(s8)

        if (createRole.rowCount > 0 && addPermission.rowCount > 0 && saveuser.rowCount > 0 && updateModule.rowCount > 0) {
            await connection.query('COMMIT')
            const payload = {
                id: saveuser.rows[0].id,
                email: saveuser.rows[0].email_address
            }
            let token = await issueJWT(payload)
            link = `http://143.198.102.134:8080/auth/verify-email/${token}`
            if (process.env.isLocalEmail == 'true') {
                await welcomeEmail2(emailAddress, link, name);
                await connection.query('COMMIT')
                return res.json({
                    status: 201,
                    success: true,
                    message: ` User Created Successfully and verification link send on registered email `,
                })
            } else {
                let emailSent = await welcomeEmail(emailAddress, link, name);
                if (emailSent.status == 400) {
                    await connection.query('ROLLBACK')
                    return res.json({
                        status: 400,
                        success: false,
                        message: `Something went wrong`,
                    })
                }
                else {
                    await connection.query('COMMIT')
                    return res.json({
                        status: 201,
                        success: true,
                        message: ` User Created Successfully and verification link send on registered email `,
                    })
                }
            }
        } else {
            await connection.query('ROLLBACK')
            return res.json({
                status: 400,
                success: false,
                message: "Something Went Wrong",
                data: ""
            })
        }
    } else {
        //await connection.query('ROLLBACK')
        return res.json({
            status: 200,
            success: false,
            message: "User already exists",
            data: ""
        })
    }

}

module.exports.uploadLogo = async (req, res) => {
    try {
        let file = req.file
        let path = `http://143.198.102.134:3003/companyLogo/${file.originalname}`;
        res.json({
            status: 201,
            success: true,
            message: "Logo Uploaded successfully!",
            data: path
        })

    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
            data: ""
        })
    }
}

module.exports.signUp = async (req, res) => {
    try {
        let {
            companyName,
            companyLogo,
            companyAddress,
        } = req.body

        companyLogo = companyLogo == "" ? 'http://143.198.102.134:3003/companyLogo/user.jpg' : companyLogo;

        let s2 = dbScript(db_sql['Q1'], { var1: companyName })
        let checkCompany = await connection.query(s2);
        if (checkCompany.rows.length == 0) {
            let cId = uuid.v4()
            await connection.query('BEGIN')
            let s3 = dbScript(db_sql['Q2'], { var1: cId, var2: mysql_real_escape_string(companyName), var3: companyLogo, var4: mysql_real_escape_string(companyAddress) })
            let saveCompanyDetails = await connection.query(s3)
            if (saveCompanyDetails.rowCount > 0) {
                await createAdmin(req.body, saveCompanyDetails.rows[0].id, res)
            } else {
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: "Something Went Wrong",
                    data: ""
                })
            }
        } else {
            await connection.query('ROLLBACK')
            res.json({
                status: 400,
                success: false,
                message: "Company already exists",
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

module.exports.setPasswordForLogin = async (req, res) => {
    try {
        let {
            password
        } = req.body
        let user = await verifyTokenFn(req)
        if (user) {
            let s1 = dbScript(db_sql['Q4'], { var1: user.email })
            let checkuser = await connection.query(s1);
            if (checkuser.rows.length > 0) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q6'], { var1: user.email, var2: password, var3: _dt, var4: checkuser.rows[0].company_id })
                let updateuser = await connection.query(s2)
                await connection.query('COMMIT')
                if (updateuser.rowCount == 1) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "Password created Successfully",
                    })
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong",
                    })
                }

            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "This User Is Not Exits",
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
            success: false,
            status: 400,
            message: error.message,
            data: ""
        })
    }
}

module.exports.verifyUser = async (req, res) => {
    try {
        let user = await verifyTokenFn(req)
        if (user) {
            let s1 = dbScript(db_sql['Q4'], { var1: user.email })
            let checkuser = await connection.query(s1);
            if (checkuser.rows.length > 0) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q9'], { var1: user.email, var2: _dt })
                let updateuser = await connection.query(s2)
                await connection.query('COMMIT')
                if (updateuser.rowCount == 1) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "User verified Successfully"
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
                    message: "This User Is Not Exits"
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
            success: false,
            status: 400,
            message: error.message,
            data: ""
        })
    }
}

module.exports.login = async (req, res) => {
    try {
        let { emailAddress, password } = req.body;
        let s1 = dbScript(db_sql['Q4'], { var1: emailAddress })
        let admin = await connection.query(s1)
        if (admin.rows.length > 0) {
            if (admin.rows[0].encrypted_password == password) {
                if (admin.rows[0].is_verified == true) {
                    if (admin.rows[0].is_locked == false) {

                        let s2 = dbScript(db_sql['Q11'], { var1: admin.rows[0].company_id })
                        let company = await connection.query(s2)

                        let s3 = dbScript(db_sql['Q14'], { var1: admin.rows[0].role_id })
                        let checkRole = await connection.query(s3)

                        let s4 = dbScript(db_sql['Q90'], { var1: admin.rows[0].company_id })
                        let configs = await connection.query(s4)
                        let configuration = {}
                        if (configs.rowCount > 0) {
                            configuration.id = configs.rows[0].id
                            configuration.currency = configs.rows[0].currency,
                                configuration.phoneFormat = configs.rows[0].phone_format,
                                configuration.dateFormat = configs.rows[0].date_format,
                                configuration.graphType = configs.rows[0].graph_type

                        } else {

                            configuration.id = "",
                                configuration.currency = "",
                                configuration.phoneFormat = "",
                                configuration.dateFormat = "",
                                configuration.graphType = ""
                        }

                        let moduleId = JSON.parse(checkRole.rows[0].module_ids)
                        let modulePemissions = []
                        for (data of moduleId) {

                            let s4 = dbScript(db_sql['Q8'], { var1: data })
                            let modules = await connection.query(s4)

                            let s5 = dbScript(db_sql['Q39'], { var1: checkRole.rows[0].id, var2: data })
                            let findModulePermissions = await connection.query(s5)

                            modulePemissions.push({
                                moduleId: data,
                                moduleName: modules.rows[0].module_name,
                                permissions: findModulePermissions.rows
                            })
                        }

                        // let s6 = dbScript(db_sql['Q116'], { var1: admin.rows[0].company_id })
                        // let payment = await connection.query(s6)
                        // let paymentStatus = 'pending';
                        // if (payment.rowCount > 0) {
                        //     paymentStatus = payment.rows[0].payment_status
                        // }
                        let payload = {
                            id: admin.rows[0].id,
                            email: admin.rows[0].email_address,
                        }
                        let jwtToken = await issueJWT(payload);
                        let profileImage = (checkRole.rows[0].role_name == "Admin") ? company.rows[0].company_logo : admin.rows[0].avatar

                        res.send({
                            status: 200,
                            success: true,
                            message: "Login Successfull",
                            data: {
                                token: jwtToken,
                                id: admin.rows[0].id,
                                name: admin.rows[0].full_name,
                                isAdmin: admin.rows[0].is_admin,
                                role: checkRole.rows[0].role_name,
                                profileImage: profileImage,
                                modulePermissions: modulePemissions,
                                configuration: configuration,
                                //paymentStatus: paymentStatus,
                                expiryDate: (checkRole.rows[0].role_name == 'Admin') ? admin.rows[0].expiry_date : ''
                            }
                        });
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
                        message: "Please verify before login"
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Incorrect password"
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
            })
        }
    }
    catch (error) {
        res.json({
            status: 500,
            success: false,
            message: error.message
        })
    }
}

module.exports.showProfile = async (req, res) => {
    try {
        let userEmail = req.user.email

        let s2 = dbScript(db_sql['Q5'], { var1: userEmail })
        let checkUser = await connection.query(s2)
        if (checkUser.rows.length > 0) {
            let s3 = dbScript(db_sql['Q11'], { var1: checkUser.rows[0].company_id })
            let companyData = await connection.query(s3)
            if (companyData.rowCount > 0) {
                checkUser.rows[0].companyName = companyData.rows[0].company_name
                checkUser.rows[0].companyAddress = companyData.rows[0].company_address
                checkUser.rows[0].companyLogo = companyData.rows[0].company_logo
            } else {
                checkUser.rows[0].companyName = ""
                checkUser.rows[0].companyAddress = ""
                checkUser.rows[0].companyLogo = ""
            }
            res.json({
                status: 200,
                success: true,
                message: 'User data',
                data: checkUser.rows[0]
            })
        } else {
            res.json({
                status: 200,
                success: false,
                message: "User not found",
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

module.exports.changePassword = async (req, res) => {
    try {
        let userEmail = req.user.email
        const { oldPassword, newPassword } = req.body;
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let user = await connection.query(s1)
        if (user.rows.length > 0) {
            if (user.rows[0].encrypted_password == oldPassword) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q6'], { var1: userEmail, var2: newPassword, var3: _dt, var4: user.rows[0].company_id })
                let updatePass = await connection.query(s2)
                await connection.query('COMMIT')
                if (updatePass.rowCount > 0) {
                    res.send({
                        status: 201,
                        success: true,
                        message: "Password Changed Successfully!",
                    });
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
                    message: "Incorrect Old Password"
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
            })
        }
    }
    catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 500,
            success: false,
            message: error.message
        })
    }
}

module.exports.upload = async (req, res) => {
    try {
        let file = req.file
        let path = `http://143.198.102.134:3003/avatar/${file.originalname}`;
        res.json({
            success: true,
            status: 201,
            message: "User profile uploaded successfully!",
            data: path
        })
    } catch (error) {
        res.json({
            success: false,
            status: 400,
            message: error.message
        })
    }
}

module.exports.updateUserProfile = async (req, res) => {
    try {
        let userMail = req.user.email
        let {
            name,
            avatar,
            emailAddress,
            mobileNumber,
            phoneNumber,
            address
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userMail })
        let findUser = await connection.query(s1)

        if (findUser.rows.length > 0) {
            await connection.query('BEGIN')
            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q12'], { var1: mysql_real_escape_string(name), var2: avatar, var3: emailAddress, var4: phoneNumber, var5: mobileNumber, var6: mysql_real_escape_string(address), var7: _dt, var8: userMail, var9: findUser.rows[0].company_id })
            let updateUser = await connection.query(s2)
            await connection.query('COMMIT')
            if (updateUser.rowCount > 0) {
                res.json({
                    success: true,
                    status: 200,
                    message: 'User updated successfully',
                })
            } else {
                await connection.query('ROLLBACK')
                res.json({
                    success: false,
                    status: 400,
                    message: "Something Went Wrong",
                    data: ""
                })
            }

        } else {
            res.json({
                success: false,
                status: 200,
                message: "user not found",
                data: ""
            })
        }

    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            success: false,
            status: 400,
            message: error.message,
        })
    }
}

module.exports.forgotPassword = async (req, res) => {
    try {
        let {
            emailAddress
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: emailAddress })
        let checkuser = await connection.query(s1);
        if (checkuser.rows.length > 0) {
            const payload = {
                id: checkuser.rows[0].id,
                email: checkuser.rows[0].email_address
            }
            let token = await issueJWT(payload)
            let link = `http://143.198.102.134:8080/auth/reset-password/${token}`
            if (process.env.isLocalEmail == 'true') {
                await resetPasswordMail2(emailAddress, link, checkuser.rows[0].full_name);
                res.json({
                    status: 200,
                    success: true,
                    message: "New link sent to your email address",
                })
            } else {
                console.log('2222222222222222222222');
                let emailSend = await resetPasswordMail(emailAddress, link, checkuser.rows[0].full_name);
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
                message: "This user is not exits",
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

module.exports.resetPassword = async (req, res) => {
    try {
        let {
            password
        } = req.body
        let user = await verifyTokenFn(req)
        if (user) {
            let s1 = dbScript(db_sql['Q4'], { var1: user.email })
            let checkuser = await connection.query(s1);
            if (checkuser.rows.length > 0) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q6'], { var1: user.email, var2: password, var3: _dt, var4: checkuser.rows[0].company_id })
                let updateuser = await connection.query(s2)
                await connection.query('COMMIT')
                if (updateuser.rowCount == 1) {
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


//------------------------------------------cron job ----------------------------------------

// module.exports.recurringPaymentCron = async () => {

//     let s1 = dbScript(db_sql['Q88'], {})
//     let salesCommissionList = await connection.query(s1)
//     if (salesCommissionList.rowCount > 0) {
//         for (let data of salesCommissionList.rows) {
//             if (data.sales_type == "Subscription") {

//                 const str = data.recurring_date;
//                 const [month, day, year] = str.split('/');

//                 const recurringDate = new Date(+year, month - 1, +day);
//                 let currentDate = new Date()
//                 let currentDate1 = currentDate.toISOString().split('T');

//                 if (data.subscription_plan == "Monthly") {
//                     let date = currentDate.getDate()
//                     let day = recurringDate.getDate()
//                     if (date == day) {
//                         let s2 = dbScript(db_sql['Q60'], { var1: data.customer_id })
//                         let customers = await connection.query(s2)
//                         for (let customerData of customers) {
//                             let s3 = dbScript(db_sql['Q10'], { var1: customerData.user_id })
//                             let userData = await connection.query(s3)
//                             let s4 = dbScript(db_sql['Q14'], { var1: userData.rows[0].role_id })
//                             let role = await connection.query(s4)
//                             if (role.rows[0].role_name == 'Admin') {
//                                 await recurringPaymentMail(userData.email_address, customerData.customer_name)
//                             } else {
//                                 let s5 = dbScript(db_sql['Q16'], { var1: userData.rows[0].company_id })
//                                 let roleData = await connection.query(s5)
//                                 for (role of roleData) {
//                                     if (role.role_name == 'Admin') {
//                                         let s6 = dbScript(db_sql['Q24'], { var1: role.id, var2: userData.rows[0].company_id })
//                                         let adminData = await connection.query(s6)
//                                         await recurringPaymentMail(adminData.rows[0].email_address, customerData.customer_name)
//                                         await recurringPaymentMail(userData.email_address, customerData.customer_name)
//                                     }

//                                 }

//                             }



//                         }
//                     }
//                 }
//                 if (data.subscription_plan == "Yearly") {
//                     let difference = await getYearDifference(recurringDate, currentDate)
//                     let futureDate = new Date(recurringDate.setFullYear(recurringDate.getFullYear() + difference))
//                     let recurringDate1 = futureDate.toISOString().split('T');
//                     if (currentDate1[0] == recurringDate1[0]) {
//                         let s2 = dbScript(db_sql['Q60'], { var1: data.customer_id })
//                         let customers = await connection.query(s2)
//                         for (let customerData of customers) {
//                             let s3 = dbScript(db_sql['Q10'], { var1: customerData.user_id })
//                             let userData = await connection.query(s3)
//                             let s4 = dbScript(db_sql['Q14'], { var1: userData.rows[0].role_id })
//                             let role = await connection.query(s4)
//                             if (role.rows[0].role_name == 'Admin') {
//                                 await recurringPaymentMail(userData.email_address, customerData.customer_name)
//                             } else {
//                                 let s5 = dbScript(db_sql['Q16'], { var1: userData.rows[0].company_id })
//                                 let roleData = await connection.query(s5)
//                                 for (role of roleData) {
//                                     if (role.role_name == 'Admin') {
//                                         let s6 = dbScript(db_sql['Q24'], { var1: role.id })
//                                         let adminData = await connection.query(s6)
//                                         await recurringPaymentMail(adminData.rows[0].email_address, customerData.customer_name)
//                                         await recurringPaymentMail(userData.email_address, customerData.customer_name)
//                                     }

//                                 }

//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     }
//}




