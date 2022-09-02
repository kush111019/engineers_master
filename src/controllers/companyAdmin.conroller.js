const connection = require('../database/connection')
const { issueJWT } = require("../utils/jwt")
const {
    resetPasswordMail,
    setPasswordMail,
    recurringPaymentMail,
    welcomeEmail,
    contactUsMail
} = require("../utils/sendMail")
const { db_sql, dbScript } = require('../utils/db_scripts');
const jsonwebtoken = require("jsonwebtoken");
const uuid = require("node-uuid");
const { mysql_real_escape_string } = require('../utils/helper')
const fs = require("fs");
const fastcsv = require("fast-csv");


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

    companyLogo = companyLogo == "" ? 'http://143.198.102.134:3003/companyLogo/user.jpg' : companyLogo;

    let s3 = dbScript(db_sql['Q4'], { var1: emailAddress })
    let findUser = await connection.query(s3)
    if (findUser.rowCount == 0) {
        // await connection.query('BEGIN')
        let roleId = uuid.v4()
        let s4 = dbScript(db_sql['Q18'], { var1: roleId, var2: cId })
        let createRole = await connection.query(s4)

        let role_id = createRole.rows[0].id
        let s5 = dbScript(db_sql['Q3'], { var1: id, var2: mysql_real_escape_string(name), var3: cId, var4: companyLogo, var5: emailAddress, var6: mobileNumber, var7: phoneNumber, var8: encryptedPassword, var9: role_id, var10: mysql_real_escape_string(companyAddress) })
        let saveuser = await connection.query(s5)

        let s6 = dbScript(db_sql['Q8'], {})
        let findModules = await connection.query(s6)
        let moduleArr = []
        for (data of findModules.rows) {
            moduleArr.push(data.id)
            let perId = uuid.v4()
            let s7 = dbScript(db_sql['Q33'], { var1: perId, var2: role_id, var3: data.id, var4: saveuser.rows[0].id })
            var addPermission = await connection.query(s7)

        }
        let _dt = new Date().toISOString();
        let s8 = dbScript(db_sql['Q65'], { var1: JSON.stringify(moduleArr), var2: _dt, var3: role_id })
        let updateModule = await connection.query(s8)

        await connection.query('COMMIT')
        if (createRole.rowCount > 0 && addPermission.rowCount > 0 && saveuser.rowCount > 0 && updateModule.rowCount > 0) {
            const payload = {
                id: saveuser.rows[0].id,
                email: saveuser.rows[0].email_address
            }
            let token = await issueJWT(payload)
            link = `http://143.198.102.134:8080/auth/verify-email/${token}`
            await welcomeEmail(emailAddress, link, name);
            await connection.query('COMMIT')
            return res.json({
                status: 201,
                success: true,
                message: ` User Created Successfully and verification link send on registered email `,
            })
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
            status: 200,
            success: false,
            message: "user Already Exists",
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
                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q7'], { var1: user.email, var2: password, var3: _dt, var4: checkuser.rows[0].company_id })
                let updateuser = await connection.query(s2)
                if (updateuser.rowCount == 1){
                    res.json({
                        status: 201,
                        success: true,
                        message: "Password created Successfully",
                    })
                }else{
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
                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q10'], { var1: user.email, var2: _dt })
                let updateuser = await connection.query(s2)
                if (updateuser.rowCount == 1)
                    res.json({
                        status: 200,
                        success: true,
                        message: "User verified Successfully"
                    })
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

                    let s2 = dbScript(db_sql['Q14'], { var1: admin.rows[0].company_id })
                    let company = await connection.query(s2)

                    let s3 = dbScript(db_sql['Q19'], { var1: admin.rows[0].role_id })
                    let checkRole = await connection.query(s3)

                    let s4 = dbScript(db_sql['Q125'], { var1: admin.rows[0].company_id })
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

                        let s4 = dbScript(db_sql['Q9'], { var1: data })
                        let modules = await connection.query(s4)

                        let s5 = dbScript(db_sql['Q66'], { var1: checkRole.rows[0].id, var2: data })
                        let findModulePermissions = await connection.query(s5)

                        modulePemissions.push({
                            moduleId: data,
                            moduleName: modules.rows[0].module_name,
                            permissions: findModulePermissions.rows
                        })
                    }

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
                            configuration: configuration
                        }
                    });
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

        let s2 = dbScript(db_sql['Q6'], { var1: userEmail })
        let checkUser = await connection.query(s2)
        if (checkUser.rows.length > 0) {
            let s3 = dbScript(db_sql['Q14'], { var1: checkUser.rows[0].company_id })
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
                let s2 = dbScript(db_sql['Q7'], { var1: userEmail, var2: newPassword, var3: _dt, var4: user.rows[0].company_id })
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
            let s2 = dbScript(db_sql['Q17'], { var1: mysql_real_escape_string(name), var2: avatar, var3: emailAddress, var4: phoneNumber, var5: mobileNumber, var6: mysql_real_escape_string(address), var7: _dt, var8: userMail, var9: findUser.rows[0].company_id })
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
            let emailSend = await resetPasswordMail(emailAddress, link, checkuser.rows[0].full_name);
            res.json({
                status: 200,
                success: true,
                message: "New link sent to your email address",
            })

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
                let s2 = dbScript(db_sql['Q7'], { var1: user.email, var2: password, var3: _dt })
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

//---------------------------------------MOdules----------------------------------------------

module.exports.moduleList = async (req, res) => {
    try {
        userEmail = req.user.email

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            let s3 = dbScript(db_sql['Q8'], {})
            let moduleList = await connection.query(s3)

            if (moduleList.rows.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Module list",
                    data: moduleList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty module list",
                    data: []
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

//-------------------------------------Roles-------------------------------------------------
module.exports.rolesList = async (req, res) => {
    try {
        userEmail = req.user.email

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            let list = []
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)

            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q21'], { var1: findAdmin.rows[0].company_id })
                let RolesList = await connection.query(s4)
                for (let data of RolesList.rows) {
                    let modulePermissions = []

                    let s8 = dbScript(db_sql['Q34'], { var1: data.id, var2: findAdmin.rows[0].company_id })
                    let getUser = await connection.query(s8)

                    if (data.reporter != '') {
                        for (let moduleId of JSON.parse(data.module_ids)) {
                            let s5 = dbScript(db_sql['Q66'], { var1: data.id, var2: moduleId })
                            let permissionList = await connection.query(s5)

                            for (permissionData of permissionList.rows) {
                                modulePermissions.push({
                                    moduleId: moduleId,
                                    permissionToCreate: permissionData.permission_to_create,
                                    permissionToUpdate: permissionData.permission_to_update,
                                    permissionToView: permissionData.permission_to_view,
                                    permissionToDelete: permissionData.permission_to_delete
                                })
                            }
                        }
                        let s7 = dbScript(db_sql['Q19'], { var1: data.reporter })
                        let reporterRole = await connection.query(s7)

                        list.push({
                            roleId: data.id,
                            roleName: data.role_name,
                            reporterId: reporterRole.rows[0].id,
                            reporterRole: reporterRole.rows[0].role_name,
                            modulePermissions: modulePermissions,
                            isUserAssigned: (getUser.rowCount > 0) ? true : false
                        })
                    } else {
                        for (moduleId of JSON.parse(data.module_ids)) {
                            let s5 = dbScript(db_sql['Q66'], { var1: data.id, var2: moduleId })
                            let permissionList = await connection.query(s5)

                            for (permissionData of permissionList.rows) {
                                modulePermissions.push({
                                    moduleId: moduleId,
                                    permissionToCreate: permissionData.permission_to_create,
                                    permissionToUpdate: permissionData.permission_to_update,
                                    permissionToView: permissionData.permission_to_view,
                                    permissionToDelete: permissionData.permission_to_delete
                                })
                            }
                        }
                        list.push({
                            roleId: data.id,
                            roleName: data.role_name,
                            reporterId: "",
                            reporterRole: "",
                            modulePermissions: modulePermissions,
                            isUserAssigned: (getUser.rowCount > 0) ? true : false
                        })
                    }
                }
                if (list.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Role list",
                        data: list
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty role list",
                        data: []
                    })
                }

            } else {
                res.status(403).json({
                    success: false,
                    message: "UnAthorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.createRole = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            roleName,
            reporter,
            modulePermissions
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')
                let roleId = uuid.v4()

                let s4 = dbScript(db_sql['Q20'], { var1: roleId, var2: mysql_real_escape_string(roleName), var3: reporter, var4: findAdmin.rows[0].company_id })

                createRole = await connection.query(s4)

                let moduleIds = []
                for (let moduleData of modulePermissions) {

                    moduleIds.push(moduleData.moduleId)

                    let permissionId = uuid.v4()
                    let s5 = dbScript(db_sql['Q32'], { var1: permissionId, var2: createRole.rows[0].id, var3: moduleData.moduleId, var4: moduleData.permissionToCreate, var5: moduleData.permissionToUpdate, var6: moduleData.permissionToDelete, var7: moduleData.permissionToView, var8: findAdmin.rows[0].id })

                    addPermission = await connection.query(s5)
                }

                let _dt = new Date().toISOString();
                let s6 = dbScript(db_sql['Q65'], { var1: JSON.stringify(moduleIds), var2: _dt, var3: createRole.rows[0].id })
                updateRole = await connection.query(s6)

                await connection.query('COMMIT')

                if (createRole.rowCount > 0 && addPermission.rowCount > 0 && updateRole.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "Role created successfully",
                        data: {
                            roleId: createRole.rows[0].id
                        }
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.updateRole = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            roleId,
            roleName,
            reporter,
            modulePermissions
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q42'], { var1: mysql_real_escape_string(roleName), var2: reporter, var3: roleId, var4: _dt, var5: findAdmin.rows[0].company_id })

                let updateRole = await connection.query(s4)

                for (let moduleData of modulePermissions) {

                    let s5 = dbScript(db_sql['Q43'], { var1: moduleData.permissionToCreate, var2: moduleData.permissionToView, var3: moduleData.permissionToUpdate, var4: moduleData.permissionToDelete, var5: roleId, var6: _dt, var7: moduleData.moduleId })
                    updatePermission = await connection.query(s5)
                }

                await connection.query('COMMIT')

                if (updateRole.rowCount > 0 && updatePermission.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Role updated successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.deleteRole = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            roleId,
            status
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {

                let _dt = new Date().toISOString();

                await connection.query('BEGIN')

                let updateRole;
                let updatePermission;

                if (status.toLowerCase() == "child") {
                    let s4 = dbScript(db_sql['Q24'], { var1: roleId })
                    let roleData = await connection.query(s4)
                    if (roleData.rowCount > 0) {

                        for (data of roleData.rows) {

                            let s5 = dbScript(db_sql['Q44'], { var1: data.id, var2: _dt })
                            updateRole = await connection.query(s5)

                            let s6 = dbScript(db_sql['Q45'], { var1: data.id, var2: _dt })
                            updatePermission = await connection.query(s6)
                        }
                        if (updateRole.rowCount > 0 && updatePermission.rowCount > 0) {
                            await connection.query('COMMIT')
                            res.json({
                                status: 200,
                                success: true,
                                message: "Role deleted successfully"
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
                            message: "No child available for given role"
                        })
                    }
                } else if (status.toLowerCase() == "all") {
                    let s7 = dbScript(db_sql['Q44'], { var1: roleId, var2: _dt })
                    updateRole = await connection.query(s7)

                    let s9 = dbScript(db_sql['Q77'], { var1: roleId, var2: _dt })
                    updateChildRole = await connection.query(s9)

                    let s10 = dbScript(db_sql['Q45'], { var1: roleId, var2: _dt })
                    updatePermission = await connection.query(s10)

                    if (updateRole.rowCount > 0 && updatePermission.rowCount > 0) {
                        await connection.query('COMMIT')
                        res.json({
                            status: 200,
                            success: true,
                            message: "Role deleted successfully"
                        })
                    } else {
                        await connection.query('ROLLBACK')
                        res.json({
                            status: 400,
                            success: false,
                            message: "Something went wrong"
                        })
                    }
                }

            } else {
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.userWiseRoleList = async (req, res) => {
    try {
        userEmail = req.user.email

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q56'], { var1: findAdmin.rows[0].company_id })
                let RolesList = await connection.query(s4)

                if (RolesList.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Role list",
                        data: RolesList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty roles list",
                        data: []
                    })
                }

            } else {
                res.status(403).json({
                    success: false,
                    message: "UnAthorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

//-------------------------------------Users-------------------------------------------------

module.exports.addUser = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            name,
            emailAddress,
            mobileNumber,
            address,
            roleId,
            avatar,
            encryptedPassword
        } = req.body

        avatar = (avatar == "") ? 'http://143.198.102.134:3003/companyLogo/user.jpg' : avatar;

        let id = uuid.v4()
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'users'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q4'], { var1: emailAddress })
            let findUser = await connection.query(s2)
            if (findUser.rowCount == 0) {
                let s3 = dbScript(db_sql['Q72'], { var1: moduleName })
                let findModule = await connection.query(s3)
                let s4 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
                let checkPermission = await connection.query(s4)
                if (checkPermission.rows[0].permission_to_create) {
                    await connection.query('BEGIN')
                    let s5 = dbScript(db_sql['Q76'], { var1: id, var2: mysql_real_escape_string(name), var3: findAdmin.rows[0].company_id, var4: avatar, var5: emailAddress, var6: mobileNumber, var7: encryptedPassword, var8: roleId, var9: mysql_real_escape_string(address) })
                    let addUser = await connection.query(s5)
                    let _dt = new Date().toISOString();
                    let s6 = dbScript(db_sql['Q64'], { var1: roleId, var2: addUser.rows[0].id, var3: _dt })
                    let addPermission = await connection.query(s6)
                    await connection.query('COMMIT')
                    if (addUser.rowCount > 0 && addPermission.rowCount > 0) {
                        const payload = {
                            id: addUser.rows[0].id,
                            email: addUser.rows[0].email_address
                        }
                        let token = await issueJWT(payload)
                        link = `http://143.198.102.134:8080/auth/reset-password/${token}`
                        await setPasswordMail(emailAddress, link, name);
                        res.json({
                            status: 201,
                            success: true,
                            message: `User created successfully and link send for set password on ${emailAddress} `
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
                    res.status(403).json({
                        success: false,
                        message: "Unathorised"
                    })
                }
            } else {
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: "user already exists"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.showUserById = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { userId } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'users'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let s4 = dbScript(db_sql['Q41'], { var1: userId })
                let findUser = await connection.query(s4)
                if (findUser.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "User data",
                        data: findUser.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty user data",
                        data: []
                    })
                }
            } else {
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.usersListByRoleId = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            roleId
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'users'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q34'], { var1: roleId })
                let userList = await connection.query(s4)

                if (userList.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Users list",
                        data: userList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty users list",
                        data: []
                    })
                }
            } else {
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.usersList = async (req, res) => {
    try {
        let email = req.user.email
        let s1 = dbScript(db_sql['Q6'], { var1: email })
        let findAdmin = await connection.query(s1);
        let moduleName = 'users'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q23'], { var1: findAdmin.rows[0].company_id })
                let findUsers = await connection.query(s4);
                if (findUsers.rows.length > 0) {

                    for (data of findUsers.rows) {
                        let s5 = dbScript(db_sql['Q19'], { var1: data.role_id })
                        let findRole = await connection.query(s5);
                        if (findRole.rowCount > 0) {

                            data.roleName = findRole.rows[0].role_name

                        } else {
                            data.roleName = null
                        }
                    }
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Users list',
                        data: findUsers.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty users list",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 403,
                    success: false,
                    message: "Unathorized",
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found",
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

module.exports.updateUser = async (req, res) => {

    try {
        let userEmail = req.user.email
        let {
            userId,
            emailAddress,
            name,
            mobileNumber,
            address,
            roleId,
            avatar
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'users'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                let _dt = new Date().toISOString();
                await connection.query('BEGIN')
                let s4 = dbScript(db_sql['Q39'], { var1: emailAddress, var2: mysql_real_escape_string(name), var3: mobileNumber, var4: mysql_real_escape_string(address), var5: roleId, var6: userId, var7: _dt, var8: avatar, var9: findAdmin.rows[0].company_id })
                let updateUser = await connection.query(s4)
                await connection.query('COMMIT')
                if (updateUser.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "User Updated successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.lockUserAccount = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            userId,
            isLocked
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'users'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {
                let _dt = new Date().toISOString();
                await connection.query('BEGIN')
                let s4 = dbScript(db_sql['Q52'], { var1: isLocked, var2: userId, var3: _dt })
                let updateUser = await connection.query(s4)
                await connection.query('COMMIT')
                if (updateUser.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "user locked successfully"
                    })
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "something went wrong"
                    })
                }
            } else {
                res.status(403).json({
                    success: false,
                    message: "UnAthorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.deleteUser = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            userId
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'users'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {
                let _dt = new Date().toISOString();
                await connection.query('BEGIN')
                let s4 = dbScript(db_sql['Q40'], { var1: _dt, var2: userId, var3: findAdmin.rows[0].company_id })
                let updateUser = await connection.query(s4)
                await connection.query('COMMIT')
                if (updateUser.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "User deleted successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}


module.exports.createSlab = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            slabs
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Slab Configuration'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();

                let s4 = dbScript(db_sql['Q31'], { var1: findAdmin.rows[0].company_id, var2: _dt })
                let slabList = await connection.query(s4)

                for (data of slabs) {
                    id = uuid.v4()
                    let s5 = dbScript(db_sql['Q28'], { var1: id, var2: data.minAmount, var3: data.maxAmount, var4: data.percentage, var5: data.isMax, var6: findAdmin.rows[0].company_id })
                    var createSlab = await connection.query(s5)

                    await connection.query('COMMIT')
                }

                if (createSlab.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "Slab added successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.slabList = async (req, res) => {
    try {
        userEmail = req.user.email
        let id = uuid.v4()
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Slab Configuration'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)

            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q25'], { var1: findAdmin.rows[0].company_id })
                let slabList = await connection.query(s4)
                if (slabList.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Slab list",
                        data: slabList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty Slab list",
                        data: []
                    })
                }

            } else {
                res.status(403).json({
                    success: false,
                    message: "UnAthorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}


module.exports.deleteSlab = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { slabId } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Slab Configuration'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {
                await connection.query('BEGIN')

                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q47'], { var1: _dt, var2: slabId, var3: findAdmin.rows[0].company_id })
                var deleteSlab = await connection.query(s4)

                await connection.query('COMMIT')

                if (deleteSlab.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Slab deleted Successfully"
                    })
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "something went wrong"
                    })

                }

            } else {
                res.status(403).json({
                    success: false,
                    message: "UnAthorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

// ---------------------------------------customer Management-------------------------------

module.exports.createCustomer = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            companyId,
            customerName,
            source,
            businessContact,
            revenueContact,
            address
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {

                await connection.query('BEGIN')
                let compId = ''
                let s4 = dbScript(db_sql['Q69'], { var1: companyId })
                let findCustomerCom = await connection.query(s4)
                if (findCustomerCom.rowCount == 0) {
                    let comId = uuid.v4()
                    let s5 = dbScript(db_sql['Q68'], { var1: comId, var2: mysql_real_escape_string(customerName), var3: findAdmin.rows[0].company_id })
                    let addCustomerCom = await connection.query(s5)

                    if (addCustomerCom.rowCount > 0) {
                        compId = addCustomerCom.rows[0].id
                    }

                } else {

                    compId = findCustomerCom.rows[0].id
                }
                let bId = [];
                let rId = [];
                for (businessData of businessContact) {
                    if (businessData.businessId == '') {
                        let businessId = uuid.v4()
                        let s6 = dbScript(db_sql['Q111'], { var1: businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: compId })
                        let addBusinessContact = await connection.query(s6)
                        bId.push(addBusinessContact.rows[0].id)
                    } else {
                        let _dt = new Date().toISOString();
                        let s8 = dbScript(db_sql['Q113'], { var1: businessData.businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: _dt })
                        let updateBusinessContact = await connection.query(s8)
                        bId.push(updateBusinessContact.rows[0].id)
                    }
                }
                for (revenueData of revenueContact) {
                    if (revenueData.revenueId == '') {
                        let revenueId = uuid.v4()
                        let s7 = dbScript(db_sql['Q112'], { var1: revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: compId })
                        let addRevenueContact = await connection.query(s7)
                        rId.push(addRevenueContact.rows[0].id)
                    } else {
                        let _dt = new Date().toISOString();
                        let s9 = dbScript(db_sql['Q114'], { var1: revenueData.revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: _dt })
                        let updateRevenueContact = await connection.query(s9)
                        rId.push(updateRevenueContact.rows[0].id)
                    }
                }
                let id = uuid.v4()
                let s10 = dbScript(db_sql['Q67'], { var1: id, var2: findAdmin.rows[0].id, var3: compId, var4: mysql_real_escape_string(customerName), var5: mysql_real_escape_string(source), var6: findAdmin.rows[0].company_id, var7: JSON.stringify(bId), var8: JSON.stringify(rId), var9: mysql_real_escape_string(address) })
                let createCustomer = await connection.query(s10)

                await connection.query('COMMIT')
                if (createCustomer.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "Customer created successfully"
                    })

                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "something went wrong"
                    })
                }

            } else {
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.closeCustomer = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            customerId
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q71'], { var1: _dt, var2: _dt, var3: customerId })
                let closeCustomer = await connection.query(s4)

                if (closeCustomer.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Customer closed successfully"
                    })
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "something went wrong"
                    })
                }

            } else {
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.customerList = async (req, res) => {

    try {

        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            if (findModule.rowCount > 0) {

                let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
                let checkPermission = await connection.query(s3)
                if (checkPermission.rows[0].permission_to_view) {
                    let customerArr = []
                    let s4 = dbScript(db_sql['Q70'], { var1: findAdmin.rows[0].company_id })
                    let customerList = await connection.query(s4)

                    if (customerList.rowCount > 0) {
                        for (data of customerList.rows) {

                            let s5 = dbScript(db_sql['Q12'], { var1: data.user_id })
                            let createdBy = await connection.query(s5)

                            if (createdBy.rowCount > 0) {
                                data.createdBy = createdBy.rows[0].full_name
                            } else {
                                data.createdBy = ""
                            }

                            let s4 = dbScript(db_sql['Q88'], { var1: data.id })
                            let contactDetails = await connection.query(s4)
                            if (contactDetails.rowCount > 0) {
                                if (contactDetails.rows[0].business_id != null && contactDetails.rows[0].revenue_id != null) {

                                    let businessIds = JSON.parse(contactDetails.rows[0].business_id)
                                    let revenueIds = JSON.parse(contactDetails.rows[0].revenue_id)
                                    let businessContact = [];
                                    let revenueContact = [];
                                    for (id of businessIds) {
                                        let s5 = dbScript(db_sql['Q117'], { var1: id })
                                        let businessData = await connection.query(s5)
                                        businessContact.push(businessData.rows[0])
                                    }
                                    for (id of revenueIds) {
                                        let s5 = dbScript(db_sql['Q118'], { var1: id })
                                        let revenueData = await connection.query(s5)
                                        revenueContact.push(revenueData.rows[0])
                                    }
                                    data.businessContact = businessContact
                                    data.revenueContact = revenueContact

                                } else {
                                    data.businessContact = [];
                                    data.revenueContact = [];
                                }
                            } else {
                                data.businessContact = [];
                                data.revenueContact = [];
                            }
                            customerArr.push(data);
                        }
                    }

                    if (customerArr.length > 0) {
                        res.json({
                            status: 200,
                            success: true,
                            message: 'Customers list',
                            data: customerArr
                        })
                    } else {
                        res.json({
                            status: 200,
                            success: false,
                            message: 'Empty customers list',
                            data: customerArr
                        })
                    }
                } else {
                    res.status(403).json({
                        success: false,
                        message: "UnAthorised"
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Module not found"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.editCustomer = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            customerId,
            customerName,
            source,
            businessContact,
            revenueContact,
            address
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                await connection.query('BEGIN')
                let bId = [];
                let rId = [];
                let compId = ''
                let s4 = dbScript(db_sql['Q88'], { var1: customerId })
                let findCustomerCom = await connection.query(s4)
                if (findCustomerCom.rowCount > 0) {
                    compId = findCustomerCom.rows[0].customer_company_id

                    for (businessData of businessContact) {
                        if (businessData.businessId == '') {
                            let businessId = uuid.v4()
                            let s6 = dbScript(db_sql['Q111'], { var1: businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: compId })
                            let addBusinessContact = await connection.query(s6)
                            bId.push(addBusinessContact.rows[0].id)
                        } else {
                            let _dt = new Date().toISOString();
                            let s8 = dbScript(db_sql['Q113'], { var1: businessData.businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: _dt })
                            let updateBusinessContact = await connection.query(s8)
                            bId.push(updateBusinessContact.rows[0].id)
                        }
                    }
                    for (revenueData of revenueContact) {
                        if (revenueData.revenueId == '') {
                            let revenueId = uuid.v4()
                            let s7 = dbScript(db_sql['Q112'], { var1: revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: compId })
                            let addRevenueContact = await connection.query(s7)
                            rId.push(addRevenueContact.rows[0].id)
                        } else {
                            let _dt = new Date().toISOString();
                            let s9 = dbScript(db_sql['Q114'], { var1: revenueData.revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: _dt })
                            let updateRevenueContact = await connection.query(s9)
                            rId.push(updateRevenueContact.rows[0].id)
                        }
                    }

                }

                let _dt = new Date().toISOString();
                let s5 = dbScript(db_sql['Q73'], { var1: mysql_real_escape_string(customerName), var2: mysql_real_escape_string(source), var3: _dt, var6: customerId, var4: JSON.stringify(bId), var5: JSON.stringify(rId), var7: mysql_real_escape_string(address), var8: findAdmin.rows[0].company_id })
                let updateCustomer = await connection.query(s5)
                if (updateCustomer.rowCount > 0) {

                    res.json({
                        status: 200,
                        success: true,
                        message: "Customer updated successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.deleteContactForCustomer = async (req, res) => {
    try {

        userEmail = req.user.email
        let {
            type,
            id,
            customerId
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {

                let s4 = dbScript(db_sql['Q88'], { var1: customerId })
                let customerData = await connection.query(s4)

                if (customerData.rowCount > 0) {
                    let updateCustomer
                    await connection.query('BEGIN')
                    if (type == 'business') {
                        let businessIds = JSON.parse(customerData.rows[0].business_id)
                        let index = businessIds.indexOf(id);
                        businessIds.splice(index, 1)

                        let s5 = dbScript(db_sql['Q120'], { var1: customerId, var2: JSON.stringify(businessIds) })
                        updateCustomer = await connection.query(s5)
                    }
                    else if (type == 'revenue') {
                        let revenueIds = JSON.parse(customerData.rows[0].revenue_id)
                        let index = revenueIds.indexOf(id);
                        revenueIds.splice(index, 1)

                        let s6 = dbScript(db_sql['Q121'], { var1: customerId, var2: JSON.stringify(revenueIds) })
                        updateCustomer = await connection.query(s6)
                    }
                    await connection.query('COMMIT')
                    if (updateCustomer.rowCount > 0) {
                        res.json({
                            status: 200,
                            success: true,
                            message: `${type} deleted successfully`
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.customerCompanyList = async (req, res) => {

    try {
        let { companyName } = req.query
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q79'], { var1: findAdmin.rows[0].company_id, var2: companyName })
                let customerList = await connection.query(s4)

                if (customerList.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Customer company list',
                        data: customerList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: 'Empty customer company list',
                        data: []
                    })
                }
            } else {
                res.status(403).json({
                    success: false,
                    message: "UnAthorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.customerContactDetails = async (req, res) => {

    try {
        let { customerCompanyId } = req.query
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let customerContactDetails = {};

                let s4 = dbScript(db_sql['Q115'], { var1: customerCompanyId })
                let businessDetails = await connection.query(s4)

                let s5 = dbScript(db_sql['Q116'], { var1: customerCompanyId })
                let revenueDetails = await connection.query(s5)

                customerContactDetails.businessDetails = (businessDetails.rowCount > 0) ? businessDetails.rows : []
                customerContactDetails.revenueDetails = (revenueDetails.rowCount > 0) ? revenueDetails.rows : []

                res.json({
                    status: 200,
                    success: true,
                    message: 'Customer contact details',
                    data: customerContactDetails
                })

            } else {
                res.status(403).json({
                    success: false,
                    message: "UnAthorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }


}

module.exports.deleteCustomer = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            customerId
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {

                await connection.query('BEGIN')

                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q80'], { var1: _dt, var2: customerId, var3: findAdmin.rows[0].company_id })
                let deleteCustomer = await connection.query(s4)

                await connection.query('COMMIT')

                if (deleteCustomer.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Customer deleted successfully"
                    })
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "something went wrong"
                    })
                }

            } else {
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

//-------------------------------------sales_config----------------------------------------

module.exports.commissionSplit = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            closerPercentage,
            supporterPercentage
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Commission'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')

                let id = uuid.v4()
                let s4 = dbScript(db_sql['Q81'], { var1: id, var2: closerPercentage, var3: supporterPercentage, var4: findAdmin.rows[0].company_id })
                var createSlab = await connection.query(s4)

                await connection.query('COMMIT')

                if (createSlab.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "Commission created successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.updatecommissionSplit = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            commissionId,
            closerPercentage,
            supporterPercentage
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Commission'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q82'], { var1: closerPercentage, var2: supporterPercentage, var3: commissionId, var4: _dt, var5: findAdmin.rows[0].company_id })

                var updatecommission = await connection.query(s4)

                await connection.query('COMMIT')

                if (updatecommission.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Commission updated Successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.commissionSplitList = async (req, res) => {
    try {
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Commission'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q83'], { var1: findAdmin.rows[0].company_id })
                let commissionList = await connection.query(s4)


                if (commissionList.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Commission split list",
                        data: commissionList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty commission split list",
                        data: []
                    })
                }

            } else {
                res.status(403).json({
                    success: false,
                    message: "UnAthorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.deletecommissionSplit = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            commissionId
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Commission'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q84'], { var1: _dt, var2: commissionId, var3: findAdmin.rows[0].company_id })
                var deleteSlab = await connection.query(s4)
                await connection.query('COMMIT')

                if (deleteSlab.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Commission deleted Successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}
//----------------------------------Products--------------------------------------------

module.exports.addProduct = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            productName,
            productImage,
            description,
            availableQuantity,
            price,
            tax
        } = req.body

        productImage = (productImage == "") ? 'http://143.198.102.134:3003/productImages/defaultproductImage.png' : productImage;

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Products'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')
                let id = uuid.v4()
                let s4 = dbScript(db_sql['Q135'], { var1: id, var2: productName, var3: productImage, var4: mysql_real_escape_string(description), var5: availableQuantity, var6: price, var7: tax, var8: findAdmin.rows[0].company_id })
                let addProduct = await connection.query(s4)
                if (addProduct.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: "Product added successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.updateProduct = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            productId,
            productName,
            productImage,
            description,
            availableQuantity,
            price,
            tax
        } = req.body

        productImage = (productImage == "") ? 'http://143.198.102.134:3003/productImages/defaultproductImage.png' : productImage;

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Products'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q136'], { var1: productId, var2: productName, var3: productImage, var4: mysql_real_escape_string(description), var5: availableQuantity, var6: price, var7: tax, var8: _dt, var9: findAdmin.rows[0].company_id })
                let updateProduct = await connection.query(s4)
                if (updateProduct.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Product updated successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.productList = async (req, res) => {
    try {
        userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Products'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let s4 = dbScript(db_sql['Q137'], { var1: findAdmin.rows[0].company_id })
                let productList = await connection.query(s4)
                if (productList.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Product List",
                        data: productList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty product list",
                        data: []
                    })
                }
            } else {
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.deleteProduct = async (req, res) => {
    try {
        userEmail = req.user.email
        let { productId } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Products'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q138'], { var1: productId, var2: _dt, var3: findAdmin.rows[0].company_id })
                let deleteProduct = await connection.query(s4)
                if (deleteProduct.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: "Product deleted successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.uploadProductImage = async (req, res) => {
    try {
        let file = req.file
        let path = `http://143.198.102.134:3003/productImages/${file.originalname}`;
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

module.exports.uploadProductFile = async (req, res) => {
    try {
        userEmail = req.user.email
        let file = req.file

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Products'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {

                let promise = new Promise((resolve, reject) => {
                    let stream = fs.createReadStream(file.path);
                    let csvData = [];
                    //.on('data') is triggered when a record is parsed,
                    // so we will get the record (data) in the handler function.
                    // Each record is pushed to csvData array.
                    //on('end') is triggered after the parsing is done,
                    // at the time that we have all records.
                    let csvStream = fastcsv.parse().on("data", (data) => {
                        csvData.push(data)
                    }).on("end", () => {
                        // remove the first line: header
                        csvData.shift();
                        // connect to the PostgreSQL database
                        // insert csvData into DB 
                        csvData.forEach(row => {
                            //defualt product image 
                            (row[1] == "") ? row[1] = 'http://143.198.102.134:3003/productImages/defaultproductImage.png' : row[1];
                            
                            //unique id for every row 
                            id = uuid.v4()
                            let s4 = dbScript(db_sql['Q140'], { var1: id, var2: findAdmin.rows[0].company_id })
                            connection.query(s4, row, (err, res) => {
                                if (err) {
                                    
                                    throw err
                                }
                            });
                        });
                    })
                    let exportedData = stream.pipe(csvStream);
                    if (exportedData) {
                        resolve(file);
                    } else {
                        reject(false)
                    }
                })
                promise.then((file) => {
                    fs.unlink(file.path, (err) => {
                        if (err) {
                            throw err
                        }
                    })
                }).catch(err => {
                    throw err
                })

                res.json({
                    status: 201,
                    success: true,
                    message: "Products exported to DB"
                })

            } else {
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

//----------------------------------Sales commission-------------------------------------

module.exports.customerListforSales = async (req, res) => {

    try {

        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q85'], { var1: findAdmin.rows[0].company_id })
                let customerList = await connection.query(s4)
                let customerArr = []

                if (customerList.rowCount > 0) {
                    for (data of customerList.rows) {
                        let s5 = dbScript(db_sql['Q12'], { var1: data.user_id })
                        let createdBy = await connection.query(s5)
                        if (createdBy.rows[0].full_name) {
                            data.createdBy = createdBy.rows[0].full_name
                        }
                        customerArr.push(data)
                    }
                    if (customerArr.length > 0) {
                        res.json({
                            status: 200,
                            success: true,
                            message: 'Customers list',
                            data: customerArr
                        })
                    } else {
                        res.json({
                            status: 200,
                            success: false,
                            message: 'Empty customers list',
                            data: []
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: 'Empty customers list',
                        data: []
                    })
                }
            } else {
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.customerContactDetailsForSales = async (req, res) => {

    try {
        let { customerId } = req.query
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {


                let s4 = dbScript(db_sql['Q88'], { var1: customerId })
                let contactDetails = await connection.query(s4)
                if (contactDetails.rowCount > 0) {
                    let customerContactDetails = {};

                    let s4 = dbScript(db_sql['Q115'], { var1: contactDetails.rows[0].customer_company_id })
                    let businessDetails = await connection.query(s4)

                    let s5 = dbScript(db_sql['Q116'], { var1: contactDetails.rows[0].customer_company_id })
                    let revenueDetails = await connection.query(s5)

                    customerContactDetails.businessDetails = (businessDetails.rowCount > 0) ? businessDetails.rows : []
                    customerContactDetails.revenueDetails = (revenueDetails.rowCount > 0) ? revenueDetails.rows : []

                    res.json({
                        status: 200,
                        success: true,
                        message: 'Customer contact details',
                        data: customerContactDetails
                    })
                } else {
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }

            } else {
                res.status(403).json({
                    success: false,
                    message: "UnAthorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }


}

module.exports.createSalesCommission = async (req, res) => {

    try {
        let userEmail = req.user.email
        let {
            customerId,
            customerCloserId,
            customerCommissionSplitId,
            supporters,
            is_overwrite,
            closerPercentage,
            qualification,
            is_qualified,
            targetAmount,
            products,
            targetClosingDate,
            businessId,
            revenueId,
            salesType,
            subscriptionPlan,
            recurringDate,
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                let supporterIds = []
                await connection.query('BEGIN')

                businessId = (businessId == '') ? '' : businessId
                revenueId = (revenueId == '') ? '' : revenueId

                let id = uuid.v4()
                let s5 = dbScript(db_sql['Q86'], { var1: id, var2: customerId, var3: customerCommissionSplitId, var4: is_overwrite, var5: findAdmin.rows[0].company_id, var6: businessId, var7: revenueId, var8: mysql_real_escape_string(qualification), var9: is_qualified, var10: targetAmount, var11: targetClosingDate, var12: JSON.stringify(products), var13: salesType, var14: subscriptionPlan, var15: recurringDate })
                let createSalesConversion = await connection.query(s5)

                let s6 = dbScript(db_sql['Q89'], { var1: customerCommissionSplitId, var2: findAdmin.rows[0].company_id })
                let findSalescommission = await connection.query(s6)
                let closer_percentage = is_overwrite ? closerPercentage : findSalescommission.rows[0].closer_percentage

                let closerId = uuid.v4()
                let s7 = dbScript(db_sql['Q93'], { var1: closerId, var2: customerCloserId, var3: closer_percentage, var4: customerCommissionSplitId, var5: createSalesConversion.rows[0].id, var6: findAdmin.rows[0].company_id })
                let addSalesCloser = await connection.query(s7)

                if (supporters.length > 0) {

                    for (let supporterData of supporters) {
                        let supporterId = uuid.v4()
                        let s8 = dbScript(db_sql['Q91'], { var1: supporterId, var2: customerCommissionSplitId, var3: supporterData.id, var4: supporterData.percentage, var5: createSalesConversion.rows[0].id, var6: findAdmin.rows[0].company_id })
                        addSalesSupporter = await connection.query(s8)
                        supporterIds.push(addSalesSupporter.rows[0].id)
                    }
                }

                let logId = uuid.v4()
                let s9 = dbScript(db_sql['Q74'], { var1: logId, var2: createSalesConversion.rows[0].id, var3: customerCommissionSplitId, var4: mysql_real_escape_string(qualification), var5: is_qualified, var6: targetAmount, var7: JSON.stringify(products), var8: targetClosingDate, var9: customerId, var10: is_overwrite, var11: findAdmin.rows[0].company_id, var12: revenueId, var13: businessId, var14: customerCloserId, var15: JSON.stringify(supporterIds), var16: salesType, var17: subscriptionPlan, var18: recurringDate })
                let createLog = await connection.query(s9)



                if (createSalesConversion.rowCount > 0 && findSalescommission.rowCount > 0 && addSalesCloser.rowCount > 0 && createLog.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: "Sales commission created successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.salesCommissionList = async (req, res) => {

    try {
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q87'], { var1: findAdmin.rows[0].company_id })
                let salesCommissionList = await connection.query(s4)
                let commissionList = []
                for (data of salesCommissionList.rows) {
                    let closer = {}
                    let supporters = []

                    let s5 = dbScript(db_sql['Q88'], { var1: data.customer_id })
                    let customerName = await connection.query(s5)

                    let s6 = dbScript(db_sql['Q12'], { var1: data.closer_id })
                    let closerName = await connection.query(s6)

                    let s7 = dbScript(db_sql['Q94'], { var1: data.id })
                    let supporter = await connection.query(s7)
                    if (supporter.rowCount > 0) {
                        if (supporter.rows[0].supporter_id != "") {
                            for (supporterData of supporter.rows) {

                                let s8 = dbScript(db_sql['Q12'], { var1: supporterData.supporter_id })
                                let supporterName = await connection.query(s8)
                                supporters.push({
                                    id: supporterData.supporter_id,
                                    name: supporterName.rows[0].full_name,
                                    percentage: supporterData.supporter_percentage
                                })

                            }
                        }
                    }

                    let products = JSON.parse(data.products)
                    let productName = []
                    for (let productIds of products) {
                        let s10 = dbScript(db_sql['Q139'], { var1: productIds, var2: findAdmin.rows[0].company_id })
                        let product = await connection.query(s10)
                        productName.push({
                            id: product.rows[0].id,
                            name: product.rows[0].product_name
                        })
                    }
                    if (data.business_id != '' && data.revenue_id != '') {

                        let s8 = dbScript(db_sql['Q117'], { var1: data.business_id })
                        let businessData = await connection.query(s8);

                        closer.businessContactId = businessData.rows[0].id,
                            closer.businessContactName = businessData.rows[0].business_contact_name

                        let s9 = dbScript(db_sql['Q118'], { var1: data.revenue_id })
                        let revenueData = await connection.query(s9);

                        closer.revenueContactId = revenueData.rows[0].id,
                            closer.revenueContactName = revenueData.rows[0].revenue_contact_name
                    } else {
                        closer.businessContactId = ""
                        closer.businessContactName = ""
                        closer.revenueContactId = ""
                        closer.revenueContactName = ""
                    }
                    closer.id = data.id
                    closer.customerId = data.customer_id
                    closer.customerName = (customerName.rowCount > 0) ? customerName.rows[0].customer_name : ''
                    closer.commissionSplitId = data.customer_commission_split_id
                    closer.qualification = data.qualification
                    closer.is_qualified = data.is_qualified
                    closer.targetAmount = data.target_amount
                    closer.targetClosingDate = data.target_closing_date
                    closer.productMatch = data.product_match
                    closer.is_overwrite = data.is_overwrite
                    closer.closerId = data.closer_id
                    closer.closerName = (closerName.rowCount > 0) ? closerName.rows[0].full_name : ''
                    closer.closerPercentage = data.closer_percentage
                    closer.supporters = supporters
                    closer.createdAt = data.created_at
                    closer.closedAt = (customerName.rowCount > 0) ? customerName.rows[0].closed_at : ''
                    closer.salesType = data.sales_type
                    closer.subscriptionPlan = data.subscription_plan
                    closer.recurringDate = data.recurring_date
                    closer.products = productName

                    commissionList.push(closer)
                }
                if (commissionList.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Sales commission list',
                        data: commissionList
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: 'Empty sales commission list',
                        data: []
                    })
                }

            } else {
                res.status(403).json({
                    success: false,
                    message: "UnAthorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }

}

module.exports.updateSalesCommission = async (req, res) => {

    try {
        let userEmail = req.user.email
        let {
            salesCommissionId,
            customerId,
            customerCommissionSplitId,
            customerCloserId,
            qualification,
            is_qualified,
            targetAmount,
            products,
            targetClosingDate,
            supporters,
            is_overwrite,
            closerPercentage,
            businessId,
            revenueId,
            salesType,
            subscriptionPlan,
            recurringDate

        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {
                let supporterIds = []
                await connection.query('BEGIN')

                let _dt = new Date().toISOString();

                let s5 = dbScript(db_sql['Q98'], { var1: customerId, var2: customerCommissionSplitId, var3: is_overwrite, var4: _dt, var5: salesCommissionId, var6: findAdmin.rows[0].company_id, var7: businessId, var8: revenueId, var9: qualification, var10: is_qualified, var11: targetAmount, var12: targetClosingDate, var13: JSON.stringify(products), var14: salesType, var15: subscriptionPlan, var16: recurringDate })
                let updateSalesCommission = await connection.query(s5)

                let s6 = dbScript(db_sql['Q89'], { var1: customerCommissionSplitId, var2: findAdmin.rows[0].company_id })
                let findSalesCommission = await connection.query(s6)

                let closer_percentage = is_overwrite ? closerPercentage : findSalesCommission.rows[0].closer_percentage

                let s7 = dbScript(db_sql['Q99'], { var1: customerCloserId, var2: closer_percentage, var3: customerCommissionSplitId, var4: _dt, var5: salesCommissionId, var6: findAdmin.rows[0].company_id })
                let updateSalesCloser = await connection.query(s7)

                let s8 = dbScript(db_sql['Q100'], { var1: salesCommissionId, var2: findAdmin.rows[0].company_id, var3: _dt })
                let updateSupporter = await connection.query(s8)

                for (let supporterData of supporters) {

                    let supporterId = uuid.v4()
                    let s9 = dbScript(db_sql['Q91'], { var1: supporterId, var2: customerCommissionSplitId, var3: supporterData.id, var4: supporterData.percentage, var5: salesCommissionId, var6: findAdmin.rows[0].company_id })
                    updateSalesSupporter = await connection.query(s9)
                    supporterIds.push(updateSalesSupporter.rows[0].id)

                }

                let logId = uuid.v4()
                let s10 = dbScript(db_sql['Q74'], { var1: logId, var2: updateSalesCommission.rows[0].id, var3: customerCommissionSplitId, var4: mysql_real_escape_string(qualification), var5: is_qualified, var6: targetAmount, var7: JSON.stringify(products), var8: targetClosingDate, var9: customerId, var10: is_overwrite, var11: findAdmin.rows[0].company_id, var12: revenueId, var13: businessId, var14: customerCloserId, var15: JSON.stringify(supporterIds), var16: salesType, var17: subscriptionPlan, var18: recurringDate })
                let createLog = await connection.query(s10)

                if (updateSalesCommission.rowCount > 0 && findSalesCommission.rowCount > 0 && updateSalesCloser.rowCount > 0 && updateSalesSupporter.rowCount > 0 && createLog.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Sales commission updated successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }

}

module.exports.deleteSalesCommission = async (req, res) => {

    try {
        let userEmail = req.user.email
        let {
            salesCommissionId
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {

                await connection.query('BEGIN')

                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q95'], { var1: _dt, var2: salesCommissionId, var3: findAdmin.rows[0].company_id })
                let deleteSalesConversion = await connection.query(s4)

                let s5 = dbScript(db_sql['Q96'], { var1: _dt, var2: salesCommissionId, var3: findAdmin.rows[0].company_id })
                let deleteSalesSupporter = await connection.query(s5)

                let s6 = dbScript(db_sql['Q97'], { var1: _dt, var2: salesCommissionId, var3: findAdmin.rows[0].company_id })
                let deleteSalesCloser = await connection.query(s6)

                await connection.query('COMMIT')

                if (deleteSalesConversion.rowCount > 0 && deleteSalesSupporter.rowCount >= 0, deleteSalesCloser.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Sales commission deleted successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }

}

module.exports.salesCommissionLogsList = async (req, res) => {

    try {
        let { salesCommissionId } = req.query
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let commissionList = []
                let s4 = dbScript(db_sql['Q75'], { var1: salesCommissionId })
                let salesCommissionlogList = await connection.query(s4)
                for (data of salesCommissionlogList.rows) {
                    let closer = {}
                    let supporters = []

                    let s5 = dbScript(db_sql['Q88'], { var1: data.customer_id })
                    let customerName = await connection.query(s5)

                    let s6 = dbScript(db_sql['Q12'], { var1: data.closer_id })
                    let closerName = await connection.query(s6)

                    let s10 = dbScript(db_sql['Q127'], { var1: salesCommissionId })
                    let closerPercentage = await connection.query(s10)

                    for (let supporterId of JSON.parse(data.supporter_id)) {

                        let s7 = dbScript(db_sql['Q122'], { var1: supporterId })
                        let supporter = await connection.query(s7)

                        if (supporter.rowCount > 0) {

                            let s8 = dbScript(db_sql['Q12'], { var1: supporter.rows[0].supporter_id })
                            let supporterName = await connection.query(s8)
                            supporters.push({
                                id: supporter.rows[0].supporter_id,
                                name: supporterName.rows[0].full_name,
                                percentage: supporter.rows[0].supporter_percentage
                            })
                        }

                    }

                    let products = JSON.parse(data.products)
                    let productName = []
                    for (let productIds of products) {
                        let s10 = dbScript(db_sql['Q139'], { var1: productIds, var2: findAdmin.rows[0].company_id })
                        let product = await connection.query(s10)
                        productName.push({
                            id: product.rows[0].id,
                            name: product.rows[0].product_name
                        })
                    }

                    if (data.business_id != '' && data.revenue_id != '') {


                        let s8 = dbScript(db_sql['Q117'], { var1: data.business_id })
                        let businessData = await connection.query(s8);

                        closer.businessContactId = businessData.rows[0].id,
                            closer.businessContactName = businessData.rows[0].business_contact_name

                        let s9 = dbScript(db_sql['Q118'], { var1: data.revenue_id })
                        let revenueData = await connection.query(s9);

                        closer.revenueContactId = revenueData.rows[0].id,
                            closer.revenueContactName = revenueData.rows[0].revenue_contact_name
                    } else {
                        closer.businessContactId = ""
                        closer.businessContactName = ""
                        closer.revenueContactId = ""
                        closer.revenueContactName = ""
                    }
                    closer.id = data.id
                    closer.customerId = data.customer_id
                    closer.customerName = (customerName.rowCount > 0) ? customerName.rows[0].customer_name : ''
                    closer.commissionSplitId = data.customer_commission_split_id
                    closer.qualification = data.qualification
                    closer.is_qualified = data.is_qualified
                    closer.targetAmount = data.target_amount
                    closer.targetClosingDate = data.target_closing_date
                    closer.productMatch = data.product_match
                    closer.is_overwrite = data.is_overwrite
                    closer.closerId = data.closer_id
                    closer.closerName = closerName.rows[0].full_name
                    closer.closerPercentage = (closerPercentage.rowCount > 0) ? closerPercentage.rows[0].closer_percentage : '';
                    closer.supporters = supporters
                    closer.createdAt = data.created_at
                    closer.closedAt = (customerName.rowCount > 0) ? customerName.rows[0].closed_at : ''
                    closer.salesType = data.sales_type
                    closer.subscriptionPlan = data.subscription_plan
                    closer.recurringDate = data.recurring_date
                    closer.products = productName

                    commissionList.push(closer)
                }


                if (commissionList.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Sales Commission log list',
                        data: commissionList
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: 'Empty Sales Commission log list',
                        data: []
                    })
                }
            } else {
                res.status(403).json({
                    success: false,
                    message: "UnAthorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.addfollowUpNotes = async (req, res) => {
    try {
        userEmail = req.user.email
        let { note, salesCommissionId } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {

                let id = uuid.v4()
                let s4 = dbScript(db_sql['Q61'], { var1: id, var2: salesCommissionId, var3: findAdmin.rows[0].company_id, var4: findAdmin.rows[0].id, var5: mysql_real_escape_string(note) })
                let addNote = await connection.query(s4)

                if (addNote.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "Note created successfully"
                    })

                } else {
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }
            } else {
                res.status(403).json({
                    success: false,
                    message: "UnAthorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.notesList = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { salesCommissionId } = req.query

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let s4 = dbScript(db_sql['Q62'], { var1: salesCommissionId })
                let findNOtes = await connection.query(s4)
                if (findNOtes.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Notes list',
                        data: findNOtes.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: 'Empty notes list',
                        data: []
                    })
                }
            } else {
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.deleteNote = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            noteId
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {

                await connection.query('BEGIN')

                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q105'], { var1: _dt, var2: noteId })
                let deleteDeal = await connection.query(s4)

                await connection.query('COMMIT')

                if (deleteDeal.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Note deleted successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

//-------------------------------------------Reports-------------------------------------------

module.exports.revenuePerCustomer = async (req, res) => {
    try {
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Reports'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let revenuePerCustomer = []
                let s4 = dbScript(db_sql['Q130'], { var1: findAdmin.rows[0].company_id })
                let customerCompanies = await connection.query(s4)
                if (customerCompanies.rowCount > 0) {
                    for (company of customerCompanies.rows) {
                        let s5 = dbScript(db_sql['Q131'], { var1: company.id })
                        let customers = await connection.query(s5)
                        if (customers.rows.length > 0) {
                            let revenue = 0
                            let obj = {}
                            for (data of customers.rows) {
                                let s6 = dbScript(db_sql['Q132'], { var1: data.id })
                                let amount = await connection.query(s6)
                                if (amount.rowCount > 0) {
                                    revenue = revenue + Number(amount.rows[0].target_amount)
                                }
                            }
                            obj.customerId = company.id
                            obj.customerName = company.customer_company_name
                            obj.revenue = revenue
                            revenuePerCustomer.push(obj)
                        }
                    }
                    if (revenuePerCustomer.length > 0) {
                        res.json({
                            status: 200,
                            success: true,
                            message: "Revenue per customer",
                            data: revenuePerCustomer
                        })
                    } else {
                        res.json({
                            status: 200,
                            success: true,
                            message: "Empty revenue per customer",
                            data: revenuePerCustomer
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.revenuePerProduct = async (req, res) => {
    try {
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Reports'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let s4 = dbScript(db_sql['Q128'], { var1: findAdmin.rows[0].company_id })
                let customers = await connection.query(s4)
                if (customers.rowCount > 0) {
                    let revenuePerProduct = []
                    for (data of customers.rows) {
                        if (data.closed_at != null) {
                            let products = JSON.parse(data.products)
                            for (let productIds of products) {
                                let s10 = dbScript(db_sql['Q139'], { var1: productIds, var2: findAdmin.rows[0].company_id })
                                let product = await connection.query(s10)
                                revenuePerProduct.push({
                                    productName: product.rows[0].product_name,
                                    revenue: data.target_amount
                                })
                            }
                        }
                    }
                    if (revenuePerProduct.length > 0) {
                        res.json({
                            status: 200,
                            success: true,
                            message: "Revenue per product",
                            data: revenuePerProduct
                        })
                    } else {
                        res.json({
                            status: 200,
                            success: true,
                            message: "Empty revenue per product",
                            data: revenuePerProduct
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.revenuePerSalesRep = async (req, res) => {
    try {
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Reports'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let salesRepArr = []
                let s4 = dbScript(db_sql['Q133'], { var1: findAdmin.rows[0].company_id })
                let salesData = await connection.query(s4)
                if (salesData.rowCount > 0) {
                    let holder = {};
                    let newArr = []
                    for (let sales of salesData.rows) {
                        let s5 = dbScript(db_sql['Q127'], { var1: sales.id })
                        let salesRep = await connection.query(s5)
                        if (salesRep.rows.length > 0) {
                            salesRepArr.push({
                                salesRep: salesRep.rows[0].full_name,
                                revenue: sales.target_amount
                            })
                        }
                    }
                    salesRepArr.forEach((d) => {
                        if (holder.hasOwnProperty(d.salesRep)) {
                            holder[d.salesRep] = holder[d.salesRep] + Number(d.revenue);
                        } else {
                            holder[d.salesRep] = Number(d.revenue);
                        }
                    });
                    for (let prop in holder) {
                        newArr.push({ salesRep: prop, revenue: holder[prop] });
                    }
                    if (newArr.length > 0) {
                        res.json({
                            status: 200,
                            success: true,
                            message: "Revenue per sales representative",
                            data: newArr
                        })
                    } else {
                        res.json({
                            status: 200,
                            success: true,
                            message: "Empty revenue per sales representative",
                            data: newArr
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.totalRevenue = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { status } = req.query
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Reports'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                totalRevenue = [];
                let format = (status == 'Monthly') ? 'month' : (status == 'Quarterly') ? 'quarter' : 'year'
                let s4 = dbScript(db_sql['Q129'], { var1: findAdmin.rows[0].company_id, var2: format })
                let targetData = await connection.query(s4)
                if (targetData.rowCount > 0) {
                    for (data of targetData.rows) {
                        totalRevenue.push({
                            revenue: data.target_amount,
                            date: data.date
                        })
                    }
                    if (totalRevenue.length > 0) {
                        res.json({
                            status: 200,
                            success: true,
                            message: "Total revenue",
                            data: totalRevenue
                        })
                    } else {
                        res.json({
                            status: 200,
                            success: true,
                            message: "Empty total revenue",
                            data: totalRevenue
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

//----------------------------------------DashBoard Counts -----------------------------------

module.exports.revenues = async (req, res) => {

    try {
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Dashboard'
        if (findAdmin.rows.length > 0) {

            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let counts = {}
                let revenueCommissionBydate = []

                let s4 = dbScript(db_sql['Q128'], { var1: findAdmin.rows[0].company_id })
                let customers = await connection.query(s4)
                if (customers.rowCount > 0) {

                    let expectedRevenue = 0;
                    let totalRevenue = 0;
                    let totalCommission = 0;

                    for (data of customers.rows) {
                        if (data.closed_at == null) {
                            expectedRevenue = Number(expectedRevenue) + Number(data.target_amount);
                        } else {
                            let revenueCommissionByDateObj = {}

                            revenueCommissionByDateObj.revenue = Number(data.target_amount)
                            revenueCommissionByDateObj.date = data.closed_at

                            totalRevenue = Number(totalRevenue) + Number(data.target_amount);

                            let s5 = dbScript(db_sql['Q25'], { var1: findAdmin.rows[0].company_id })
                            let slab = await connection.query(s5)
                            if (slab.rowCount > 0) {

                                for (slabData of slab.rows) {

                                    if ((Number(data.target_amount) >= Number(slabData.min_amount)) && slabData.is_max == true) {

                                        let percentage = slabData.percentage
                                        let amount = ((Number(percentage) / 100) * Number(data.target_amount))

                                        revenueCommissionByDateObj.commission = amount

                                        totalCommission = totalCommission + amount
                                    }
                                    else if ((Number(data.target_amount) >= Number(slabData.min_amount)) && (Number(data.target_amount) <= Number(slabData.max_amount))) {

                                        let percentage = slabData.percentage
                                        let amount = ((Number(percentage) / 100) * Number(data.target_amount))

                                        revenueCommissionByDateObj.commission = amount

                                        totalCommission = totalCommission + amount

                                    }
                                }

                            } else {
                                res.json({
                                    status: 400,
                                    success: false,
                                    message: "Slab not found"
                                })
                            }
                            revenueCommissionBydate.push(revenueCommissionByDateObj)

                        }

                    }
                    counts.expectedRevenue = expectedRevenue
                    counts.totalRevenue = totalRevenue
                    counts.totalCommission = totalCommission
                    counts.revenueCommissionBydate = revenueCommissionBydate


                } else {
                    counts.totalRevenue = 0
                    counts.expectedRevenue = 0
                    counts.totalCommission = 0
                    counts.revenueCommissionBydate = revenueCommissionBydate
                }

                res.json({
                    status: 200,
                    success: true,
                    message: "Revenues and Commissions",
                    data: counts
                })

            } else {
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }


}

//------------------------------------Revenue forecast--------------------------------------

module.exports.createRevenueForecast = async (req, res) => {

    try {
        let userEmail = req.user.email
        let {
            timeline,
            revenue,
            growthWindow,
            growthPercentage,
            startDate,
            endDate
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Revenue Management'
        if (findAdmin.rows.length > 0) {

            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')

                let id = uuid.v4()
                let s4 = dbScript(db_sql['Q106'], { var1: id, var2: timeline, var3: revenue, var4: growthWindow, var5: growthPercentage, var6: startDate, var7: endDate, var8: findAdmin.rows[0].id, var9: findAdmin.rows[0].company_id })

                let createForecast = await connection.query(s4)

                await connection.query('COMMIT')
                if (createForecast.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: 'Revenue forecast created successfully'
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }

}

module.exports.revenueForecastList = async (req, res) => {
    try {
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Revenue Management'
        if (findAdmin.rows.length > 0) {

            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q107'], { var1: findAdmin.rows[0].company_id })
                let revenueForecastList = await connection.query(s4)

                if (revenueForecastList.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Revenue forecast list',
                        data: revenueForecastList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Empty revenue forecast list',
                        data: []
                    })
                }

            } else {
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.updateRevenueForecast = async (req, res) => {

    try {
        let userEmail = req.user.email
        let {
            revenueForecastId,
            timeline,
            revenue,
            growthWindow,
            growthPercentage,
            startDate,
            endDate
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Revenue Management'
        if (findAdmin.rows.length > 0) {

            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {
                await connection.query('BEGIN')

                let _dt = new Date().toISOString();

                let s4 = dbScript(db_sql['Q108'], { var1: revenueForecastId, var2: timeline, var3: revenue, var4: growthWindow, var5: growthPercentage, var6: startDate, var7: endDate, var8: _dt, var9: findAdmin.rows[0].company_id })

                let updateForecast = await connection.query(s4)

                await connection.query('COMMIT')
                if (updateForecast.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: 'Revenue forecast updated successfully'
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }

}

let getMonthDifference = async (startDate, endDate) => {
    var months = endDate.getMonth() - startDate.getMonth()
        + (12 * (endDate.getFullYear() - startDate.getFullYear()));

    if (endDate.getDate() < startDate.getDate()) {
        months--;
    }
    return months;
}

let getYearDifference = async (startDate, endDate) => {
    let years = endDate.getFullYear() - startDate.getFullYear();;
    return years;
}

module.exports.actualVsForecast = async (req, res) => {
    try {
        let { id } = req.query

        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Revenue Management'
        if (findAdmin.rows.length > 0) {

            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let actualVsForecastObj = {}
                let revenueData = [];
                let actualData = []
                let dateArr = []

                let s4 = dbScript(db_sql['Q109'], { var1: id, var2: findAdmin.rows[0].company_id })
                let forecastRevenue = await connection.query(s4)
                if (forecastRevenue.rowCount > 0) {
                    let revenue = forecastRevenue.rows[0].revenue
                    let growthWindow = forecastRevenue.rows[0].growth_window
                    let growthPercentage = forecastRevenue.rows[0].growth_percentage
                    let timeline = forecastRevenue.rows[0].timeline
                    let startDate = forecastRevenue.rows[0].start_date
                    let endDate = forecastRevenue.rows[0].end_date

                    let toDate = new Date(startDate)
                    let fromDate = new Date(endDate)
                    let difference = await getMonthDifference(toDate, fromDate)
                    let yearDifference = await getYearDifference(toDate, fromDate)
                    let count = 0;
                    switch (timeline) {
                        case 'Monthly':
                            let month = (toDate.getMonth() + 1);
                            for (let i = 1; i <= difference; i++) {
                                let sum = 0
                                if (i == 1) {
                                    dateArr.push(new Date(toDate))
                                    revenueData.push(Number(revenue))
                                    let s5 = dbScript(db_sql['Q119'], { var1: findAdmin.rows[0].company_id, var2: month })
                                    let actualRevenue = await connection.query(s5)
                                    if (actualRevenue.rowCount > 0) {
                                        actualRevenue.rows.map(index => {
                                            sum = sum + Number(index.target_amount);
                                        })
                                    }
                                    actualData.push(sum)
                                } else {
                                    if (growthWindow != count) {

                                        month = month + 1;
                                        date = new Date(toDate.setMonth(toDate.getMonth() + 1));
                                        dateArr.push(date)
                                        revenueData.push(Number(Number(revenue).toFixed(2)))
                                        let s5 = dbScript(db_sql['Q119'], { var1: findAdmin.rows[0].company_id, var2: month })
                                        let actualRevenue = await connection.query(s5)
                                        if (actualRevenue.rowCount > 0) {
                                            actualRevenue.rows.map(index => {
                                                sum = sum + Number(index.target_amount);
                                            })
                                        }
                                        actualData.push(sum)
                                        count++;
                                    } else {
                                        count = 0;
                                        month = month + 1;
                                        date = new Date(toDate.setMonth(toDate.getMonth() + 1));
                                        dateArr.push(date)
                                        revenue = (Number(revenue) + Number(revenue) * (Number(growthPercentage) / 100))
                                        revenueData.push(Number(revenue.toFixed(2)))
                                        let s5 = dbScript(db_sql['Q119'], { var1: findAdmin.rows[0].company_id, var2: month })
                                        let actualRevenue = await connection.query(s5)
                                        if (actualRevenue.rowCount > 0) {
                                            actualRevenue.rows.map(index => {
                                                sum = sum + Number(index.target_amount);
                                            })
                                        }
                                        actualData.push(sum)
                                    }
                                }
                            }
                            break;
                        case 'Quarterly':
                            let month1 = (toDate.getMonth() + 1);
                            for (let i = 1; i <= difference / 3; i++) {
                                let sum = 0
                                if (i == 1) {
                                    for (let i = 1; i <= 3; i++) {
                                        let s5 = dbScript(db_sql['Q119'], { var1: findAdmin.rows[0].company_id, var2: month1 })
                                        let actualRevenue = await connection.query(s5)
                                        if (actualRevenue.rowCount > 0) {
                                            actualRevenue.rows.map(index => {
                                                sum = sum + Number(index.target_amount);
                                            })
                                        }
                                        month1++;
                                    }
                                    dateArr.push(new Date(toDate))
                                    revenueData.push(Number(revenue))
                                    actualData.push(sum)

                                } else {
                                    if (growthWindow != count) {
                                        date = new Date(toDate.setMonth(toDate.getMonth() + 4));
                                        for (let i = 1; i <= 3; i++) {
                                            let s5 = dbScript(db_sql['Q119'], { var1: findAdmin.rows[0].company_id, var2: month1 })
                                            let actualRevenue = await connection.query(s5)
                                            if (actualRevenue.rowCount > 0) {
                                                actualRevenue.rows.map(index => {
                                                    sum = sum + Number(index.target_amount);
                                                })
                                            }
                                            month1++;
                                        }
                                        dateArr.push(new Date(date))
                                        revenueData.push(Number(revenue))
                                        actualData.push(sum)
                                        count++;

                                    } else {
                                        count = 0;
                                        date = new Date(toDate.setMonth(toDate.getMonth() + 4));
                                        for (let i = 1; i <= 3; i++) {
                                            let s5 = dbScript(db_sql['Q119'], { var1: findAdmin.rows[0].company_id, var2: month1 })
                                            let actualRevenue = await connection.query(s5)
                                            if (actualRevenue.rowCount > 0) {
                                                actualRevenue.rows.map(index => {
                                                    sum = sum + Number(index.target_amount);
                                                })
                                            }
                                            month1++;
                                        }
                                        dateArr.push(new Date(date))
                                        revenue = (Number(revenue) + Number(revenue) * (Number(growthPercentage) / 100))
                                        revenueData.push(Number(revenue.toFixed(2)))
                                        actualData.push(sum)
                                    }
                                }
                            }
                            break;
                        case "Annual":
                            let month2 = (toDate.getMonth() + 1);
                            for (let i = 1; i <= yearDifference; i++) {
                                let sum = 0
                                if (i == 1) {
                                    for (let i = 1; i <= 12; i++) {
                                        let s5 = dbScript(db_sql['Q119'], { var1: findAdmin.rows[0].company_id, var2: month2 })
                                        let actualRevenue = await connection.query(s5)
                                        if (actualRevenue.rowCount > 0) {
                                            actualRevenue.rows.map(index => {
                                                sum = sum + Number(index.target_amount);
                                            })
                                        }
                                        month2++;
                                    }
                                    dateArr.push(new Date(toDate))
                                    revenueData.push(Number(revenue))
                                    actualData.push(sum)

                                } else {
                                    if (growthWindow != count) {
                                        date = new Date(toDate.setFullYear(toDate.getFullYear() + 1))
                                        for (let i = 1; i <= 12; i++) {
                                            let s5 = dbScript(db_sql['Q119'], { var1: findAdmin.rows[0].company_id, var2: month2 })
                                            let actualRevenue = await connection.query(s5)
                                            if (actualRevenue.rowCount > 0) {
                                                actualRevenue.rows.map(index => {
                                                    sum = sum + Number(index.target_amount);
                                                })
                                            }
                                            month2++;
                                        }
                                        dateArr.push(new Date(date))
                                        revenueData.push(Number(revenue))
                                        actualData.push(sum)
                                        count++;

                                    } else {
                                        count = 0;
                                        date = new Date(toDate.setFullYear(toDate.getFullYear() + 1))
                                        for (let i = 1; i <= 12; i++) {
                                            let s5 = dbScript(db_sql['Q119'], { var1: findAdmin.rows[0].company_id, var2: month2 })
                                            let actualRevenue = await connection.query(s5)
                                            if (actualRevenue.rowCount > 0) {
                                                actualRevenue.rows.map(index => {
                                                    sum = sum + Number(index.target_amount);
                                                })
                                            }
                                            month2++;
                                        }
                                        dateArr.push(new Date(date))
                                        revenue = (Number(revenue) + Number(revenue) * (Number(growthPercentage) / 100))
                                        revenueData.push(Number(revenue.toFixed(2)))
                                        actualData.push(sum)
                                    }
                                }
                            }
                            break;
                    }
                    actualVsForecastObj = {
                        actualRevenue: (actualData.length > 0) ? actualData : [],
                        forecastRevenue: (revenueData.length > 0) ? revenueData : [],
                        date: (dateArr.length > 0) ? dateArr : []
                    }
                    res.json({
                        status: 200,
                        success: true,
                        message: "Actual vs Forecast data",
                        data: actualVsForecastObj
                    })


                } else {
                    actualVsForecastObj = {
                        actualRevenue: [],
                        forecastRevenue: [],
                        date: []
                    }
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty Actual vs Forecast data",
                        data: actualVsForecastObj
                    })
                }

            } else {
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

//--------------------------------------Business and revenue Contact---------------------------

module.exports.addBusinessContact = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            companyId,
            businessEmail,
            businessContactName,
            businessPhoneNumber
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')

                let businessId = uuid.v4()
                let s6 = dbScript(db_sql['Q111'], { var1: businessId, var2: mysql_real_escape_string(businessContactName), var3: businessEmail, var4: businessPhoneNumber, var5: companyId })
                let addBusinessContact = await connection.query(s6)

                await connection.query('COMMIT')
                if (addBusinessContact.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "Business contact added successfully"
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.addRevenueContact = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            companyId,
            revenueEmail,
            revenueContactName,
            revenuePhoneNumber
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')

                let revenueId = uuid.v4()
                let s6 = dbScript(db_sql['Q112'], { var1: revenueId, var2: mysql_real_escape_string(revenueContactName), var3: revenueEmail, var4: revenuePhoneNumber, var5: companyId })
                let addRevenueContact = await connection.query(s6)

                await connection.query('COMMIT')
                if (addRevenueContact.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "Revenue contact added successfully"
                    })
                } else {
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }

            } else {
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

//------------------------------------------cron job ----------------------------------------

module.exports.recurringPaymentCron = async () => {

    let s1 = dbScript(db_sql['Q123'], {})
    let salesCommissionList = await connection.query(s1)
    if (salesCommissionList.rowCount > 0) {
        for (let data of salesCommissionList.rows) {
            if (data.sales_type == "Subscription") {

                const str = data.recurring_date;
                const [month, day, year] = str.split('/');

                const recurringDate = new Date(+year, month - 1, +day);
                let currentDate = new Date()
                let currentDate1 = currentDate.toISOString().split('T');

                if (data.subscription_plan == "Monthly") {
                    let date = currentDate.getDate()
                    let day = recurringDate.getDate()
                    if (date == day) {
                        let s2 = dbScript(db_sql['Q88'], { var1: data.customer_id })
                        let customers = await connection.query(s2)
                        for (let customerData of customers) {
                            let s3 = dbScript(db_sql['Q12'], { var1: customerData.user_id })
                            let userData = await connection.query(s3)
                            let s4 = dbScript(db_sql['Q19'], { var1: userData.rows[0].role_id })
                            let role = await connection.query(s4)
                            if (role.rows[0].role_name == 'Admin') {
                                await recurringPaymentMail(userData.email_address, customerData.customer_name)
                            } else {
                                let s5 = dbScript(db_sql['Q21'], { var1: userData.rows[0].company_id })
                                let roleData = await connection.query(s5)
                                for (role of roleData) {
                                    if (role.role_name == 'Admin') {
                                        let s6 = dbScript(db_sql['Q34'], { var1: role.id })
                                        let adminData = await connection.query(s6)
                                        await recurringPaymentMail(adminData.rows[0].email_address, customerData.customer_name)
                                        await recurringPaymentMail(userData.email_address, customerData.customer_name)
                                    }

                                }

                            }



                        }
                    }
                }
                if (data.subscription_plan == "Yearly") {
                    let difference = await getYearDifference(recurringDate, currentDate)
                    let futureDate = new Date(recurringDate.setFullYear(recurringDate.getFullYear() + difference))
                    let recurringDate1 = futureDate.toISOString().split('T');
                    if (currentDate1[0] == recurringDate1[0]) {
                        let s2 = dbScript(db_sql['Q88'], { var1: data.customer_id })
                        let customers = await connection.query(s2)
                        for (let customerData of customers) {
                            let s3 = dbScript(db_sql['Q12'], { var1: customerData.user_id })
                            let userData = await connection.query(s3)
                            let s4 = dbScript(db_sql['Q19'], { var1: userData.rows[0].role_id })
                            let role = await connection.query(s4)
                            if (role.rows[0].role_name == 'Admin') {
                                await recurringPaymentMail(userData.email_address, customerData.customer_name)
                            } else {
                                let s5 = dbScript(db_sql['Q21'], { var1: userData.rows[0].company_id })
                                let roleData = await connection.query(s5)
                                for (role of roleData) {
                                    if (role.role_name == 'Admin') {
                                        let s6 = dbScript(db_sql['Q34'], { var1: role.id })
                                        let adminData = await connection.query(s6)
                                        await recurringPaymentMail(adminData.rows[0].email_address, customerData.customer_name)
                                        await recurringPaymentMail(userData.email_address, customerData.customer_name)
                                    }

                                }

                            }
                        }
                    }
                }
            }
        }
    }
}

//------------------------------------------configuratins------------------------------------

module.exports.addConfigs = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { currency, phoneFormat, dateFormat, graphType } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            await connection.query('BEGIN')

            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q126'], { var1: _dt, var2: findAdmin.rows[0].company_id })
            let config = await connection.query(s2)

            let id = uuid.v4()
            let s3 = dbScript(db_sql['Q124'], { var1: id, var2: currency, var3: phoneFormat, var4: dateFormat, var5: findAdmin.rows[0].id, var6: graphType, var7: findAdmin.rows[0].company_id })

            let addConfig = await connection.query(s3)

            if (addConfig.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "Configuration added successfully"
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
                message: "Admin not found"
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

module.exports.configList = async (req, res) => {
    try {
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            let s2 = dbScript(db_sql['Q125'], { var1: findAdmin.rows[0].company_id })
            let configList = await connection.query(s2)
            let configuration = {}

            if (configList.rowCount > 0) {

                configuration.id = configList.rows[0].id
                configuration.currency = configList.rows[0].currency,
                    configuration.phoneFormat = configList.rows[0].phone_format,
                    configuration.dateFormat = configList.rows[0].date_format,
                    configuration.graphType = configList.rows[0].graph_type

                res.json({
                    status: 200,
                    success: true,
                    message: "Configuration List",
                    data: configuration
                })

            } else {
                configuration.id = "",
                    configuration.currency = "",
                    configuration.phoneFormat = "",
                    configuration.dateFormat = "",
                    configuration.graphType = ""

                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Configuration List",
                    data: configuration
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
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

//--------------------------------------Contact_us-------------------------------------------

module.exports.contactUs = async (req, res) => {
    try {
        let {
            fullName,
            email,
            subject,
            message,
            address
        } = req.body

        await connection.query('BEGIN')
        let id = uuid.v4()
        let s1 = dbScript(db_sql['Q134'], { var1: id, var2: fullName, var3: email, var4: subject, var5: mysql_real_escape_string(message), var6: address })

        let addContactUs = await connection.query(s1)
        if (addContactUs.rowCount > 0) {
            await contactUsMail(email, fullName, subject, message, address)
            await connection.query('COMMIT')
            res.json({
                status: 201,
                success: true,
                message: "Query added successfully"
            })

        } else {
            await connection.query('ROLLBACK')
            res.json({
                status: 400,
                success: false,
                message: "Something went wrong"
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

