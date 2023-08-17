const connection = require('../database/connection')
const { issueJWT } = require("../utils/jwt")
const {
    resetPasswordMail,
    welcomeEmail,
    resetPasswordMail2,
    welcomeEmail2,
} = require("../utils/sendMail")
const { db_sql, dbScript } = require('../utils/db_scripts');
const { mysql_real_escape_string, verifyTokenFn, calculateQuarters, getUserAndSubUser, paginatedResults } = require('../utils/helper');
const { setPlayBook } = require('../../seeders/seedPlayBookData');


let createAdmin = async (bodyData, cId, res) => {
    let {
        name,
        emailAddress,
        mobileNumber,
        companyAddress,
        phoneNumber,
        encryptedPassword,
        startDate
    } = bodyData
    await connection.query('BEGIN')
    let avatar = process.env.DEFAULT_LOGO;

    let s3 = dbScript(db_sql['Q4'], { var1: emailAddress })
    let findUser = await connection.query(s3)
    if (findUser.rowCount == 0) {

        //creating role
        let s4 = dbScript(db_sql['Q11'], { var1: cId })
        let createRole = await connection.query(s4)

        let s9 = dbScript(db_sql['Q101'], {})
        let trialDays = await connection.query(s9)
        let expiryDate = '';
        if (trialDays.rowCount > 0) {
            let currentDate = new Date()
            expiryDate = new Date(currentDate.setDate(currentDate.getDate() + Number(trialDays.rows[0].trial_days))).toISOString()
            let role_id = createRole.rows[0].id
            let s5 = dbScript(db_sql['Q3'], {
                var1: mysql_real_escape_string(name),
                var2: cId, var3: avatar, var4: mysql_real_escape_string(emailAddress.toLowerCase()), var5: mobileNumber,
                var6: phoneNumber, var7: encryptedPassword, var8: role_id,
                var9: mysql_real_escape_string(companyAddress), var10: expiryDate
            })
            let saveuser = await connection.query(s5)
            if (saveuser.rowCount > 0) {
                let s6 = dbScript(db_sql['Q56'], {
                    var1: saveuser.rows[0].id,
                })
                let updateuser = await connection.query(s6)
            }

            let s10 = dbScript(db_sql['Q76'], { var1: "$", var2: "us", var3: "MM-DD-YYYY", var4: saveuser.rows[0].id, var5: cId, var6: 3, var7: 2 })
            let addConfig = await connection.query(s10)

            let s6 = dbScript(db_sql['Q6'], {})
            let findModules = await connection.query(s6)
            let moduleArr = []
            for (let data of findModules.rows) {
                moduleArr.push(data.id)
                let s7 = dbScript(db_sql['Q20'], { var1: createRole.rows[0].id, var2: data.id, var3: true, var4: true, var5: true, var6: true, var7: true, var8: saveuser.rows[0].id })
                var addPermission = await connection.query(s7)
            }
            let _dt = new Date().toISOString();
            let s8 = dbScript(db_sql['Q34'], {
                var1: JSON.stringify(moduleArr), var2: _dt,
                var3: role_id
            })
            let updateModule = await connection.query(s8)

            // updating company for config quarter
            let s9 = dbScript(db_sql['Q390'], { var1: startDate, var2: cId })
            let updateQuarter = await connection.query(s9)

            let setPlayBookData = await setPlayBook(cId, saveuser.rows[0].id)
            if (createRole.rowCount > 0 && addPermission.rowCount > 0 && saveuser.rowCount > 0 && updateModule.rowCount > 0 && addConfig.rowCount > 0 && updateQuarter.rowCount > 0 && setPlayBookData.rowCount > 0) {
                await connection.query('COMMIT')
                const payload = {
                    id: saveuser.rows[0].id,
                    email: saveuser.rows[0].email_address
                }
                let token = await issueJWT(payload)
                link = `${process.env.AUTH_LINK}/verify-email/${token}`
                if (process.env.isLocalEmail == 'true') {
                    await welcomeEmail2(emailAddress, link, name);
                    await connection.query('COMMIT')
                    return res.json({
                        status: 201,
                        success: true,
                        message: ` User Created Successfully and verification link send on ${emailAddress.toLowerCase()} `,
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
        await connection.query('ROLLBACK')
        return res.json({
            status: 200,
            success: false,
            message: "Email already exists",
            data: ""
        })
    }

}

//uploading company logo
module.exports.uploadLogo = async (req, res) => {
    try {
        let file = req.file
        let path = `${process.env.COMPANY_LOGO_LINK}/${file.filename}`;
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

//signup for main_admin and creating company
module.exports.signUp = async (req, res) => {
    try {
        let {
            companyName,
            companyLogo,
            companyAddress,
        } = req.body
        await connection.query('BEGIN')
        companyLogo = companyLogo == "" ? process.env.DEFAULT_LOGO : companyLogo;

        let s2 = dbScript(db_sql['Q1'], { var1: mysql_real_escape_string(companyName) })
        let checkCompany = await connection.query(s2);
        if (checkCompany.rows.length == 0) {

            let s9 = dbScript(db_sql['Q101'], {})
            let trialDays = await connection.query(s9)
            let expiryDate = '';
            if (trialDays.rowCount > 0) {
                let currentDate = new Date()
                expiryDate = new Date(currentDate.setDate(currentDate.getDate() + Number(trialDays.rows[0].trial_days))).toISOString()


                let s3 = dbScript(db_sql['Q2'], { var1: mysql_real_escape_string(companyName), var2: companyLogo, var3: mysql_real_escape_string(companyAddress), var4: expiryDate, var5: trialDays.rows[0].trial_users })
                let saveCompanyDetails = await connection.query(s3)

                if (saveCompanyDetails.rowCount > 0) {
                    //calling create admin api
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
                return res.json({
                    status: 400,
                    success: false,
                    message: "Trial days are not added by Super admin",
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

//setting password for user when admin has created user
module.exports.setPasswordForLogin = async (req, res) => {
    try {
        let {
            password
        } = req.body
        await connection.query('BEGIN')
        let user = await verifyTokenFn(req)
        if (user) {
            let s1 = dbScript(db_sql['Q8'], { var1: user.id })
            let checkuser = await connection.query(s1);
            if (checkuser.rows.length > 0) {

                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q5'], { var1: user.id, var2: password, var3: _dt, var4: checkuser.rows[0].company_id })
                let updateuser = await connection.query(s2)

                if (updateuser.rowCount == 1) {
                    await connection.query('COMMIT')
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

//verifying user
module.exports.verifyUser = async (req, res) => {
    try {
        let user = await verifyTokenFn(req)
        await connection.query('BEGIN')
        if (user) {
            let s1 = dbScript(db_sql['Q8'], { var1: user.id })
            let checkuser = await connection.query(s1)
            if (checkuser.rows.length > 0) {
                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q7'], { var1: user.id, var2: _dt })
                let updateuser = await connection.query(s2)

                if (updateuser.rowCount == 1) {
                    await connection.query('COMMIT')
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

//login user
module.exports.login = async (req, res) => {
    try {
        let { emailAddress, password } = req.body;
        let s1 = dbScript(db_sql['Q132'], { var1: mysql_real_escape_string(emailAddress) })
        let admin = await connection.query(s1)
        if (admin.rows.length > 0) {
            if (admin.rows[0].encrypted_password == password) {
                if (admin.rows[0].is_verified == true) {
                    if (admin.rows[0].is_locked == false) {
                        if (admin.rows[0].is_deactivated == false) {
                            let configuration = {}
                            configuration.id = admin.rows[0].config_id
                            configuration.currency = admin.rows[0].currency,
                                configuration.phoneFormat = admin.rows[0].phone_format,
                                configuration.dateFormat = admin.rows[0].date_format,
                                configuration.beforeClosingDays = (admin.rows[0].before_closing_days) ? admin.rows[0].before_closing_days : '',
                                configuration.afterClosingDays = (admin.rows[0].after_closing_days) ? admin.rows[0].after_closing_days : ''

                            let s2 = dbScript(db_sql['Q125'], { var1: admin.rows[0].id, var2: admin.rows[0].company_id })
                            let imapCreds = await connection.query(s2)
                            let isImapCred = (imapCreds.rowCount == 0) ? false : true

                            let moduleId = JSON.parse(admin.rows[0].module_ids)
                            let modulePemissions = []
                            for (let data of moduleId) {
                                let s3 = dbScript(db_sql['Q58'], { var1: data, var2: admin.rows[0].role_id })
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
                            let profileImage = admin.rows[0].avatar

                            res.send({
                                status: 200,
                                success: true,
                                message: "Login Successfull",
                                data: {
                                    token: jwtToken,
                                    id: admin.rows[0].id,
                                    name: admin.rows[0].full_name,
                                    isAdmin: admin.rows[0].is_admin,
                                    roleId: admin.rows[0].role_id,
                                    role: admin.rows[0].role_name,
                                    profileImage: profileImage,
                                    modulePermissions: modulePemissions,
                                    configuration: configuration,
                                    isImapCred: isImapCred,
                                    isImapEnable: admin.rows[0].is_imap_enable,
                                    isMarketingEnable: admin.rows[0].is_marketing_enable,
                                    expiryDate: (admin.rows[0].role_name == 'Admin') ? admin.rows[0].expiry_date : '',
                                    isMainAdmin: admin.rows[0].is_main_admin,
                                    companyName: admin.rows[0].company_name,
                                    companyLogo: admin.rows[0].company_logo
                                }
                            });
                        } else {
                            res.json({
                                status: 400,
                                success: false,
                                message: "deactivated user"
                            })
                        }
                    } else {
                        res.json({
                            status: 400,
                            success: false,
                            message: "Locked by super Admin/Plan Expired"
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
                message: "Invalid credentials"
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

            let s3 = dbScript(db_sql['Q393'], { var1: checkUser.rows[0].company_id, var2: '1' })
            let ShowquarterConfig = await connection.query(s3)
            if (companyData.rowCount > 0) {
                checkUser.rows[0].companyName = companyData.rows[0].company_name
                checkUser.rows[0].companyAddress = companyData.rows[0].company_address
                checkUser.rows[0].companyLogo = companyData.rows[0].company_logo,
                    checkUser.rows[0].startDate = companyData.rows[0].quarter

            } else {
                checkUser.rows[0].companyName = ""
                checkUser.rows[0].companyAddress = ""
                checkUser.rows[0].companyLogo = ""
                checkUser.rows[0].startDate = ""
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
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let user = await connection.query(s1)
        if (user.rows.length > 0) {
            if (user.rows[0].encrypted_password == oldPassword) {

                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q5'], { var1: user.rows[0].id, var2: newPassword, var3: _dt, var4: user.rows[0].company_id })
                let updatePass = await connection.query(s2)

                if (updatePass.rowCount > 0) {
                    await connection.query('COMMIT')
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
                await connection.query('ROLLBACK')
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
        let path = `${process.env.AVATAR_LOGO_LINK}/${file.filename}`;
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
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findUser = await connection.query(s1)

        if (findUser.rows.length > 0) {

            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q10'], { var1: mysql_real_escape_string(name), var2: avatar, var3: mysql_real_escape_string(emailAddress), var4: phoneNumber, var5: mobileNumber, var6: mysql_real_escape_string(address), var7: _dt, var8: userId, var9: findUser.rows[0].company_id })
            let updateUser = await connection.query(s2)

            if (updateUser.rowCount > 0) {
                await connection.query('COMMIT')
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
        let s1 = dbScript(db_sql['Q4'], { var1: mysql_real_escape_string(emailAddress) })
        let checkuser = await connection.query(s1);
        if (checkuser.rows.length > 0) {
            const payload = {
                id: checkuser.rows[0].id,
                email: checkuser.rows[0].email_address
            }
            let token = await issueJWT(payload)
            let link = `${process.env.AUTH_LINK}/reset-password/${token}`
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
        await connection.query('BEGIN')
        let user = await verifyTokenFn(req)
        if (user) {
            let s1 = dbScript(db_sql['Q8'], { var1: user.id })
            let checkuser = await connection.query(s1);
            if (checkuser.rows.length > 0) {

                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q5'], { var1: user.id, var2: password, var3: _dt, var4: checkuser.rows[0].company_id })
                let updateuser = await connection.query(s2)

                if (updateuser.rowCount == 1) {
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

module.exports.countryDetails = async (req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let checkUser = await connection.query(s1)
        if (checkUser.rows.length > 0) {
            let s1 = dbScript(db_sql['Q138'], {})
            let details = await connection.query(s1)
            if (details.rowCount > 0) {
                let countries = []
                let currencies = []
                let dateFormat = []
                for (let data of details.rows) {
                    countries.push({
                        countryName: data.country_name,
                        countryValue: data.country_value
                    })
                    currencies.push({
                        currencyName: data.currency_name,
                        currencySymbol: data.currency_symbol
                    })
                    dateFormat.push(data.date_format)
                }
                res.json({
                    status: 200,
                    success: true,
                    message: "Country details",
                    data: {
                        countries,
                        currencies,
                        dateFormat
                    }
                })
            } else {
                if (details.rowCount == 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty Country details",
                        data: {
                            countries: [],
                            currencies: [],
                            dateFormat: []
                        }
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
            data: ""
        })
    }
}

module.exports.updateCompanyLogo = async (req, res) => {
    try {
        let userId = req.user.id
        let file = req.file
        let path = `${process.env.COMPANY_LOGO_LINK}/${file.filename}`;
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findUser = await connection.query(s1)

        if (findUser.rows.length > 0) {

            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q214'], { var1: path, var2: _dt, var3: findUser.rows[0].company_id })
            let updateLogo = await connection.query(s2)

            if (updateLogo.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    success: true,
                    status: 200,
                    message: 'CompanyLogo updated successfully',
                    data: path
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
                message: "Admin not found",
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

module.exports.updateCompanyProfile = async (req, res) => {
    try {
        let userId = req.user.id
        let { startDate, companyAddress } = req.body
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let checkUser = await connection.query(s1)
        let _dt = new Date().toISOString();
        if (checkUser.rows.length > 0) {
            let _dt = new Date().toISOString();
            let s3 = dbScript(db_sql['Q394'], { var1: mysql_real_escape_string(companyAddress), var2: _dt, var3: checkUser.rows[0].company_id, var4: startDate })
            let updateCompanyAddress = await connection.query(s3)

            if (updateCompanyAddress.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Comapny configuration updated successfully."
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
                message: "Admin not found",
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

//SALES PLAYBOOK APIS

module.exports.uploadPlayBookProductImage = async (req, res) => {
    try {
        let file = req.file
        let path = `${process.env.PLAYBOOK_PRODUCT_IMAGE_PATH}/${file.filename}`;
        res.json({
            status: 201,
            success: true,
            message: "Product image Uploaded successfully!",
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

module.exports.uploadPlayBookVisionMission = async (req, res) => {
    try {
        let file = req.file
        let path = `${process.env.PLAYBOOK_VISIONMISSION_IMAGE_PATH}/${file.filename}`;
        res.json({
            status: 201,
            success: true,
            message: "Vision And Mission image Uploaded successfully!",
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

module.exports.createCompanyPlaybook = async (req, res) => {
    try {
        let userId = req.user.id
        let { resources, background, vision_mission, vision_mission_image, product_image, customer_profiling, lead_processes, sales_strategies, scenario_data, sales_best_practices, id } = req.body
        await connection.query("BEGIN")

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rowCount > 0 && findAdmin.rows[0].is_main_admin) {
            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q424'], { var1: findAdmin.rows[0].company_id, var2: findAdmin.rows[0].id, var3: JSON.stringify(resources), var4: mysql_real_escape_string(background), var5: mysql_real_escape_string(vision_mission), var6: vision_mission_image, var7: product_image, var8: JSON.stringify(customer_profiling), var9: mysql_real_escape_string(lead_processes), var10: mysql_real_escape_string(sales_strategies), var11: JSON.stringify(scenario_data), var12: mysql_real_escape_string(sales_best_practices), var13: _dt, var14: id })

            let updateMetaData = await connection.query(s2)
            if (updateMetaData.rowCount > 0) {
                await connection.query("COMMIT")
                res.json({
                    success: true,
                    status: 200,
                    message: 'Company Play Book updated successfully',
                })
            } else {
                await connection.query('ROLLBACK')
                res.json({
                    success: false,
                    status: 400,
                    message: "Something Went Wrong",
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "Unauthorized",
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

module.exports.showPlayBook = async (req, res) => {
    try {
        let userId = req.user.id;
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rowCount > 0) {
            let s2 = dbScript(db_sql['Q426'], { var1: findAdmin.rows[0].company_id })
            let playBookData = await connection.query(s2)

            playBookData.rows[0].resources = JSON.parse(playBookData.rows[0].resources);
            playBookData.rows[0].customer_profiling = JSON.parse(playBookData.rows[0].customer_profiling);
            playBookData.rows[0].sales_best_practices = JSON.parse(playBookData.rows[0].sales_best_practices);
            playBookData.rows[0].lead_processes = JSON.parse(playBookData.rows[0].lead_processes);
            let s3 = dbScript(db_sql['Q41'], { var1: process.env.PRODUCTS_MODULE, var2: userId })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view_global) {
                let s4 = dbScript(db_sql['Q84'], { var1: checkPermission.rows[0].company_id })
                let productList = await connection.query(s4)
                if (productList.rowCount > 0) {
                    playBookData.rows[0].productList = productList.rows;
                } else {
                    playBookData.rows[0].productList = [];
                }
            } else if (checkPermission.rows[0].permission_to_view_own) {
                let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
                let s5 = dbScript(db_sql['Q270'], { var1: roleUsers.join(",") })
                let productList = await connection.query(s5)
                if (productList.rowCount > 0) {
                    playBookData.rows[0].productList = productList.rows;
                } else {
                    playBookData.rows[0].productList = [];
                }
            } else {
                playBookData.rows[0]["productList"] = "You Don't Have Permission to View Products, Please Contact Your Admin."
            }
            let s6 = dbScript(db_sql['Q41'], { var1: process.env.CUSTOMERS_MODULE, var2: userId })
            let checkCustomerPermission = await connection.query(s6)
            if (checkCustomerPermission.rows[0].permission_to_view_global) {
                let s7 = dbScript(db_sql['Q427'], { var1: checkCustomerPermission.rows[0].company_id })
                let customerList = await connection.query(s7)
                if (customerList.rowCount > 0) {
                    const totalTargetAmount = customerList.rows.reduce((total, company) => total + company.total_target_amount, 0);

                    // Step 3: Calculate percentage for each company based on total_target_amount
                    const rawPercentages = customerList.rows.map((company) => ({
                        name: company.customer_name,
                        rawPercentage: (company.total_target_amount / totalTargetAmount) * 100,
                    }));

                    // Step 4: Adjust percentages to ensure the sum is 100
                    const sumRawPercentages = rawPercentages.reduce((sum, company) => sum + company.rawPercentage, 0);
                    const adjustedPercentages = rawPercentages.map((company) => ({
                        name: company.name,
                        percentage: (company.rawPercentage / sumRawPercentages) * 100,
                    }));

                    playBookData.rows[0].customerCompanies = adjustedPercentages
                } else {
                    playBookData.rows[0].customerCompanies = [];
                }
            } else if (checkCustomerPermission.rows[0].permission_to_view_own) {
                let roleUsers = await getUserAndSubUser(checkCustomerPermission.rows[0]);
                let s8 = dbScript(db_sql['Q428'], { var1: roleUsers.join(",") })
                let customerList = await connection.query(s8)
                if (customerList.rowCount > 0) {
                    const totalTargetAmount = customerList.rows.reduce((total, company) => total + company.total_target_amount, 0);

                    // Step 3: Calculate percentage for each company based on total_target_amount
                    const rawPercentages = customerList.rows.map((company) => ({
                        name: company.customer_name,
                        rawPercentage: (company.total_target_amount / totalTargetAmount) * 100,
                    }));

                    // Step 4: Adjust percentages to ensure the sum is 100
                    const sumRawPercentages = rawPercentages.reduce((sum, company) => sum + company.rawPercentage, 0);
                    const adjustedPercentages = rawPercentages.map((company) => ({
                        name: company.name,
                        percentage: (company.rawPercentage / sumRawPercentages) * 100,
                    }));

                    playBookData.rows[0].customerCompanies = adjustedPercentages
                } else {
                    playBookData.rows[0].customerCompanies = [];
                }
            } else {
                playBookData.rows[0].customerCompanies = "You Don't Have Permission to View Customer Companies, Please Contact Your Admin."
            }
            let s9 = dbScript(db_sql['Q41'], { var1: process.env.USERS_MODULE, var2: userId })
            let checkUserPermission = await connection.query(s9)
            if (checkUserPermission.rows[0].permission_to_view_global) {
                let s10 = dbScript(db_sql['Q429'], { var1: checkUserPermission.rows[0].company_id, var2: false })
                findUsers = await connection.query(s10);

                if (findUsers.rows.length > 0) {
                    let data = findUsers.rows
                    function buildHierarchy(users) {
                        const userMap = new Map();

                        for (const user of users) {
                            user.children = [];
                            userMap.set(user.id, user);
                        }

                        const hierarchy = [];

                        for (const user of users) {
                            if (user.created_by === user.id) {
                                hierarchy.push(user);
                            } else {
                                const parentUser = userMap.get(user.created_by);
                                if (parentUser) {
                                    parentUser.children.push(user);
                                }
                            }
                        }

                        return hierarchy;
                    }

                    function findMainAdmin(users) {
                        return users.find(user => (user.is_main_admin === true || user.is_main_admin === true));
                    }

                    function generateHierarchyArray(user, depth = 0) {
                        const hierarchyItem = {
                            full_name: user.full_name,
                            rolename: user.rolename,
                            avatar: user.avatar,
                            depth: depth,
                        };

                        const children = [];
                        for (const child of user.children) {
                            children.push(generateHierarchyArray(child, depth + 1));
                        }

                        if (children.length > 0) {
                            hierarchyItem.children = children;
                        }

                        return hierarchyItem;
                    }

                    const mainAdmin = findMainAdmin(data);
                    const hierarchy = buildHierarchy(data);
                    const hierarchyArray = [];
                    for (const user of hierarchy) {
                        hierarchyArray.push(generateHierarchyArray(user));
                    }
                    playBookData.rows[0].teamAndRoles = (hierarchyArray)

                } else {
                    playBookData.rows[0].teamAndRoles = []
                }
            } else if (checkUserPermission.rows[0].permission_to_view_own) {
                let roleUsers = await getUserAndSubUser(checkUserPermission.rows[0]);
                let s11 = dbScript(db_sql['Q430'], { var1: roleUsers.join(","), var2: false })
                findUsers = await connection.query(s11);
                if (userList.rowCount > 0) {
                    let data = findUsers.rows
                    function buildHierarchy(users) {
                        const userMap = new Map();

                        for (const user of users) {
                            user.children = [];
                            userMap.set(user.id, user);
                        }

                        const hierarchy = [];

                        for (const user of users) {
                            if (user.created_by === user.id) {
                                hierarchy.push(user);
                            } else {
                                const parentUser = userMap.get(user.created_by);
                                if (parentUser) {
                                    parentUser.children.push(user);
                                }
                            }
                        }

                        return hierarchy;
                    }

                    function findMainAdmin(users) {
                        return users.find(user => (user.is_main_admin === true || user.is_main_admin === true));
                    }

                    function generateHierarchyArray(user, depth = 0) {
                        const hierarchyItem = {
                            full_name: user.full_name,
                            rolename: user.rolename,
                            avatar: user.avatar,
                            depth: depth,
                        };

                        const children = [];
                        for (const child of user.children) {
                            children.push(generateHierarchyArray(child, depth + 1));
                        }

                        if (children.length > 0) {
                            hierarchyItem.children = children;
                        }

                        return hierarchyItem;
                    }

                    const mainAdmin = findMainAdmin(data);
                    const hierarchy = buildHierarchy(data);
                    const hierarchyArray = [];
                    for (const user of hierarchy) {
                        hierarchyArray.push(generateHierarchyArray(user));
                    }
                    playBookData.rows[0].teamAndRoles = (hierarchyArray)
                } else {
                    playBookData.rows[0].teamAndRoles = []
                }
            } else {
                playBookData.rows[0].teamAndRoles = "You Don't Have Permission to View Users, Please Contact Your Admin."
            }
            let s11 = dbScript(db_sql['Q431'], { var1: checkUserPermission.rows[0].company_id })
            let qualifiedLead = await connection.query(s11)
            if (qualifiedLead.rowCount > 0) {

                let data = qualifiedLead.rows
                const leadsBySource = data.reduce((acc, lead) => {
                    const { source_id, source_name, marketing_qualified_lead } = lead;
                    if (!acc[source_id]) {
                        acc[source_id] = {
                            source_name,
                            total: 0,
                            qualified: 0
                        };
                    }

                    acc[source_id].total++;
                    if (marketing_qualified_lead === true) {
                        acc[source_id].qualified++;
                    }
                    return acc;
                }, {});

                const response = [];
                for (const source_id in leadsBySource) {
                    const { source_name, total, qualified } = leadsBySource[source_id];
                    const percentage = ((qualified / total) * 100).toFixed(2);
                    response.push({ name: source_name, percentage: percentage });
                }
                playBookData.rows[0].qualifiedLeads = response
            } else {
                playBookData.rows[0].qualifiedLeads = []
            }
            res.json({
                success: true,
                status: 200,
                message: "data",
                data: playBookData.rows
            })
        } else {
            res.status(403).json({
                success: false,
                message: "UnAthorised"
            })
        }
    } catch (error) {
        res.json({
            success: false,
            status: 400,
            message: error.message,
        })
    }
}

module.exports.captainWiseSalesDetailsPlayBook = async (req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rowCount > 0) {
            let s2 = dbScript(db_sql['Q366'], { var1: userId })
            let salesIds = await connection.query(s2)
            if (salesIds.rowCount > 0) {
                let salesIdArr = []
                salesIds.rows.map((data) => {
                    if (data.sales_ids.length > 0) {
                        salesIdArr.push("'" + data.sales_ids.join("','") + "'")
                    }
                })
                let captainWiseSaleObj = {}
                let s3 = dbScript(db_sql['Q364'], { var1: userId, var2: salesIdArr.join(",") })
                let salesDetails = await connection.query(s3)

                if (salesDetails.rowCount > 0) {
                    let s4 = dbScript(db_sql['Q365'], { var1: userId, var2: salesIdArr.join(",") })
                    let notesCount = await connection.query(s4)

                    // create map of sales details by sales ID
                    let salesMap = {}
                    for (let sale of salesDetails.rows) {
                        salesMap[sale.id] = { ...sale, notes_count: 0 }
                    }

                    // update sales details with notes count
                    for (const note of notesCount.rows) {
                        const saleId = note.sales_id
                        const notesCount = Number(note.notes_count)
                        if (salesMap[saleId]) {
                            salesMap[saleId].notes_count = notesCount
                        }
                    }

                    // convert sales map back to array
                    const updatedSalesDetails = Object.values(salesMap)

                    // calculate aggregate note counts
                    let notesCountArr = updatedSalesDetails.map((detail) => Number(detail.notes_count || 0))

                    let count = notesCountArr.reduce((acc, val) => acc + val, 0)
                    let avgNotesCount = count / updatedSalesDetails.length
                    let maxNotesCount = Math.max(...notesCountArr)
                    let minNotesCount = Math.min(...notesCountArr)

                    let revenue = 0
                    let recognizedRevenue = []

                    let s5 = dbScript(db_sql['Q367'], { var1: salesIdArr.join(",") })
                    let recognizedAmount = await connection.query(s5)
                    if (recognizedAmount.rowCount > 0) {
                        recognizedAmount.rows.map(amount => {
                            revenue += Number(amount.recognized_amount)
                            recognizedRevenue.push(Number(amount.recognized_amount))
                        })
                    }
                    let days = 0
                    let durationDay = []
                    salesDetails.rows.map((detail) => {
                        days += Number(detail.duration_in_days)
                        durationDay.push(Number(detail.duration_in_days))
                    })
                    let avgClosingTime = days / salesDetails.rowCount
                    let maxClosingTime = Math.max(...durationDay);
                    let minClosingTime = Math.min(...durationDay);

                    let sciiAvg = avgClosingTime;
                    let aboveCount = 0;
                    let belowCount = 0;
                    let sciiCount = 0;
                    if (durationDay.length == 1) {
                        sciiCount = 1
                    } else {
                        for (let i = 0; i < durationDay.length; i++) {
                            if (durationDay[i] > sciiAvg) {
                                aboveCount++;
                            } else if (durationDay[i] < sciiAvg) {
                                belowCount++;
                            }
                        }
                        if (aboveCount == 0 && belowCount == 0) {
                            sciiCount = 0
                        } else if (aboveCount == 0 || belowCount == 0) {
                            sciiCount = 1
                        } else {
                            sciiCount = Number(belowCount / aboveCount)
                        }
                    }
                    let avgRecognizedRevenue = revenue / salesDetails.rowCount
                    let maxRecognizedRevenue = Math.max(...recognizedRevenue);
                    let minRecognizedRevenue = Math.min(...recognizedRevenue);

                    captainWiseSaleObj = {
                        salesDetails: updatedSalesDetails,
                        avgRecognizedRevenue: avgRecognizedRevenue,
                        maxRecognizedRevenue: maxRecognizedRevenue,
                        minRecognizedRevenue: minRecognizedRevenue,
                        avgClosingTime: avgClosingTime.toFixed(4),
                        maxClosingTime: maxClosingTime.toFixed(4),
                        minClosingTime: minClosingTime.toFixed(4),
                        avgNotesCount: avgNotesCount,
                        maxNotesCount: maxNotesCount,
                        minNotesCount: minNotesCount,
                        scii: sciiCount
                    }
                } else {
                    captainWiseSaleObj = {
                        salesDetails: [],
                        avgRecognizedRevenue: 0,
                        maxRecognizedRevenue: 0,
                        minRecognizedRevenue: 0,
                        avgClosingTime: 0,
                        maxClosingTime: 0,
                        minClosingTime: 0,
                        avgNotesCount: 0,
                        maxNotesCount: 0,
                        minNotesCount: 0,
                        sciiCount: 0
                    }
                }
                res.json({
                    status: 200,
                    success: true,
                    message: "Captain wise sales details",
                    data: captainWiseSaleObj
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Sales not found",
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "Unathorised"
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

module.exports.captainWiseGraphPlayBook = async (req, res) => {
    try {
        let userId = req.user.id
        let { page } = req.query
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rowCount > 0) {
            let s2 = dbScript(db_sql['Q366'], { var1: userId })
            let salesIds = await connection.query(s2)
            if (salesIds.rowCount > 0) {
                let salesIdArr = []
                salesIds.rows.map((data) => {
                    if (data.sales_ids.length > 0) {
                        salesIdArr.push("'" + data.sales_ids.join("','") + "'")
                    }
                })
                let s3 = dbScript(db_sql['Q364'], { var1: userId, var2: salesIdArr.join(",") })
                let salesDetails = await connection.query(s3)

                if (salesDetails.rowCount > 0) {
                    let s4 = dbScript(db_sql['Q365'], { var1: userId, var2: salesIdArr.join(",") })
                    let notesCount = await connection.query(s4)

                    // create map of sales details by sales ID
                    let salesMap = {}
                    for (let sale of salesDetails.rows) {
                        salesMap[sale.id] = { ...sale, notes_count: 0 }
                    }

                    // update sales details with notes count
                    for (const note of notesCount.rows) {
                        const saleId = note.sales_id
                        const notesCount = Number(note.notes_count)
                        if (salesMap[saleId]) {
                            salesMap[saleId].notes_count = notesCount
                        }
                    }

                    // convert sales map back to array
                    const updatedSalesDetails = Object.values(salesMap)

                    if (updatedSalesDetails.length > 0) {
                        let result = await paginatedResults(updatedSalesDetails, page)
                        res.json({
                            status: 200,
                            success: true,
                            message: "Sales Details",
                            data: result
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty sales details",
                        data: [],
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Sales not found",
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "Unathorised"
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



