const connection = require('../database/connection')
const { issueJWT } = require("../utils/jwt")
const {
    resetPasswordMail,
    welcomeEmail,
    resetPasswordMail2,
    welcomeEmail2,
} = require("../utils/sendMail")
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string, verifyTokenFn } = require('../utils/helper')


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
        let s4 = dbScript(db_sql['Q11'], { var1: roleId, var2: cId })
        let createRole = await connection.query(s4)

        let s9 = dbScript(db_sql['Q112'], {})
        let trialDays = await connection.query(s9)
        let expiryDate = '';
        if (trialDays.rowCount > 0) {
            let currentDate = new Date()
            expiryDate = new Date(currentDate.setDate(currentDate.getDate() + Number(trialDays.rows[0].trial_days))).toISOString()


            let role_id = createRole.rows[0].id
            let s5 = dbScript(db_sql['Q3'], {
                var1: id, var2: mysql_real_escape_string(name),
                var3: cId, var4: companyLogo, var5: emailAddress, var6: mobileNumber,
                var7: phoneNumber, var8: encryptedPassword, var9: role_id,
                var10: mysql_real_escape_string(companyAddress), var11: expiryDate
            })
            let saveuser = await connection.query(s5)

            let configId = uuid.v4()
            let s10 = dbScript(db_sql['Q83'], { var1: configId, var2: "$", var3: "us", var4: "MM-DD-YYYY", var5: saveuser.rows[0].id, var6: cId })
            let addConfig = await connection.query(s10)

            let s6 = dbScript(db_sql['Q6'], {})
            let findModules = await connection.query(s6)
            let moduleArr = []
            for (data of findModules.rows) {
                moduleArr.push(data.id)
                let perId = uuid.v4()
                let s7 = dbScript(db_sql['Q20'], { var1: perId, var2: createRole.rows[0].id, var3: data.id, var4: true, var5: true, var6: true, var7: true, var8: saveuser.rows[0].id })
                var addPermission = await connection.query(s7)
            }
            let _dt = new Date().toISOString();
            let s8 = dbScript(db_sql['Q34'], {
                var1: JSON.stringify(moduleArr), var2: _dt,
                var3: role_id
            })
            let updateModule = await connection.query(s8)

            if (createRole.rowCount > 0 && addPermission.rowCount > 0 && saveuser.rowCount > 0 && updateModule.rowCount > 0 && addConfig.rowCount > 0) {
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
            await connection.query('ROLLBACK')
            return res.json({
                status: 400,
                success: false,
                message: "Trial days are not added by Super admin",
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
                console.log(saveCompanyDetails.rows,"saveCompanyDetails.rows");
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
            let s1 = dbScript(db_sql['Q8'], { var1: user.id })
            let checkuser = await connection.query(s1);
            if (checkuser.rows.length > 0) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q5'], { var1: user.id, var2: password, var3: _dt, var4: checkuser.rows[0].company_id })
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
            let s1 = dbScript(db_sql['Q8'], { var1: user.id })
            let checkuser = await connection.query(s1)
            if (checkuser.rows.length > 0) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q7'], { var1: user.id, var2: _dt })
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
        let s1 = dbScript(db_sql['Q145'], { var1: emailAddress })
        let admin = await connection.query(s1)
        if (admin.rows.length > 0) {
            if (admin.rows[0].encrypted_password == password) {
                if (admin.rows[0].is_verified == true) {
                    if (admin.rows[0].is_locked == false) {
                        let configuration = {}
                        configuration.id = admin.rows[0].config_id
                        configuration.currency = admin.rows[0].currency,
                        configuration.phoneFormat = admin.rows[0].phone_format,
                        configuration.dateFormat = admin.rows[0].date_format

                        let s2 = dbScript(db_sql['Q138'],{var1: admin.rows[0].id, var2: admin.rows[0].company_id })
                        let imapCreds = await connection.query(s2)
                        let isImapCred = (imapCreds.rowCount == 0) ? false : true

                        let moduleId = JSON.parse(admin.rows[0].module_ids)
                        let modulePemissions = []
                        for (data of moduleId) {
                            let s3 = dbScript(db_sql['Q35'], { var1: data, var2: admin.rows[0].role_id })
                            let findModulePermissions = await connection.query(s3)
                            modulePemissions.push({
                                moduleId: data,
                                moduleName: findModulePermissions.rows[0].module_name,
                                permissions: findModulePermissions.rows
                            })
                        }

                        let payload = {
                            id: admin.rows[0].id,
                            email: admin.rows[0].email_address,
                        }
                        let jwtToken = await issueJWT(payload);
                        let profileImage = (admin.rows[0].role_name == "Admin") ? admin.rows[0].company_logo : admin.rows[0].avatar

                        res.send({
                            status: 200,
                            success: true,
                            message: "Login Successfull",
                            data: {
                                token: jwtToken,
                                id: admin.rows[0].id,
                                name: admin.rows[0].full_name,
                                isAdmin: admin.rows[0].is_admin,
                                role: admin.rows[0].role_name,
                                profileImage: profileImage,
                                modulePermissions: modulePemissions,
                                configuration: configuration,
                                isImapCred : isImapCred,
                                isImapEnable : admin.rows[0].is_imap_enable,
                                expiryDate: (admin.rows[0].role_name == 'Admin') ? admin.rows[0].expiry_date : ''
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
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let checkUser = await connection.query(s1)
        if (checkUser.rows.length > 0) {
            let s2 = dbScript(db_sql['Q9'], { var1: checkUser.rows[0].company_id })
            let companyData = await connection.query(s2)
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
                let s2 = dbScript(db_sql['Q5'], { var1: user.rows[0].id, var2: newPassword, var3: _dt, var4: user.rows[0].company_id })
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
        let userId = req.user.id
        let {
            name,
            avatar,
            emailAddress,
            mobileNumber,
            phoneNumber,
            address
        } = req.body

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findUser = await connection.query(s1)

        if (findUser.rows.length > 0) {
            await connection.query('BEGIN')
            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q10'], { var1: mysql_real_escape_string(name), var2: avatar, var3: emailAddress, var4: phoneNumber, var5: mobileNumber, var6: mysql_real_escape_string(address), var7: _dt, var8: userId, var9: findUser.rows[0].company_id })
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
            let s1 = dbScript(db_sql['Q8'], { var1: user.id })
            let checkuser = await connection.query(s1);
            if (checkuser.rows.length > 0) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q5'], { var1: user.id, var2: password, var3: _dt, var4: checkuser.rows[0].company_id })
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

module.exports.countryDetails = async(req, res) => {
    try {
        let s1 = dbScript(db_sql['Q152'], {})
        let details = await connection.query(s1)
        if(details.rowCount > 0){
            let countries = []
            let currencies = []
            let dateFormat = []
            for(let data of details.rows){
                countries.push({
                    countryName : data.country_name,
                    countryValue : data.country_value
                })
                currencies.push({
                    currencyName : data.currency_name,
                    currencySymbol : data.currency_symbol
                })
                dateFormat.push(data.date_format)
            }

            res.json({
                status: 200,
                success: true,
                message: "Country details",
                data:  {
                    countries,
                    currencies,
                    dateFormat
                }
            })
        }else{
            if(details.rowCount == 0){
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty Country details",
                    data: []
                })
            }else{
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong"
                })
            }
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




