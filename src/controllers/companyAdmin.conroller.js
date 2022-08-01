const connection = require('../database/connection')
const { issueJWT } = require("../utils/jwt")
const { resetPasswordMail } = require("../utils/sendMail")
const { db_sql, dbScript } = require('../utils/db_scripts');
const jsonwebtoken = require("jsonwebtoken");
const uuid = require("node-uuid");
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
        avatar,
        emailAddress,
        mobileNumber,
        companyAddress,
        phoneNumber,
        encryptedPassword
    } = bodyData
    s3 = dbScript(db_sql['Q4'], { var1: emailAddress })
    let findUser = await connection.query(s3)
    if (findUser.rowCount == 0) {
        // await connection.query('BEGIN')
        let roleId = uuid.v4()
        s4 = dbScript(db_sql['Q18'], { var1: roleId, var2: cId })
        let createRole = await connection.query(s4)

        let role_id = createRole.rows[0].id
        s5 = dbScript(db_sql['Q3'], { var1: id, var2: name, var3: cId, var4: avatar, var5: emailAddress, var6: companyAddress, var6: mobileNumber, var7: phoneNumber, var8: encryptedPassword, var9: role_id })
        let saveuser = await connection.query(s5)

        s6 = dbScript(db_sql['Q8'], {})
        let findModules = await connection.query(s6)
        let moduleArr = []
        for (data of findModules.rows) {
            moduleArr.push(data.id)
            let perId = uuid.v4()
            s7 = dbScript(db_sql['Q33'], { var1: perId, var2: role_id, var3: data.id, var4: saveuser.rows[0].id })
            var addPermission = await connection.query(s7)

        }
        _dt = new Date().toISOString();
        s8 = dbScript(db_sql['Q65'], { var1: JSON.stringify(moduleArr), var2: _dt, var3: role_id })
        let updateModule = await connection.query(s8)

        await connection.query('COMMIT')
        if (createRole.rowCount > 0 && addPermission.rowCount > 0 && saveuser.rowCount > 0 && updateModule.rowCount > 0) {
            const payload = {
                id: saveuser.rows[0].id,
                email: saveuser.rows[0].email_address
            }
            let token = await issueJWT(payload)
            link = `http://143.198.102.134:8080/auth/reset-password/${token}`
            await resetPasswordMail(emailAddress, link);
            return res.json({
                status: 201,
                success: true,
                message: ` User Created Successfully and mail send to set password on mail :- '${emailAddress}'`,
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
        let path = `http://143.198.102.134:3003/comapnyLogo/${file.originalname}`;
        res.json({
            status: 201,
            success: true,
            message: "logo uploaded successfully!",
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

        s2 = dbScript(db_sql['Q1'], { var1: companyName })
        let checkCompany = await connection.query(s2);
        if (checkCompany.rows.length == 0) {
            let cId = uuid.v4()
            await connection.query('BEGIN')
            s3 = dbScript(db_sql['Q2'], { var1: cId, var2: companyName, var3: companyLogo, var4: companyAddress })
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
                message: "company already exists",
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
            s1 = dbScript(db_sql['Q4'], { var1: user.email })
            let checkuser = await connection.query(s1);
            if (checkuser.rows.length > 0) {
                _dt = new Date().toISOString();
                s2 = dbScript(db_sql['Q7'], { var1: user.email, var2: password, var3: _dt })
                let updateuser = await connection.query(s2)
                if (updateuser.rowCount == 1)
                    res.json({
                        status: 201,
                        success: true,
                        message: "Password created Successfully",
                        data: ""
                    })
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

module.exports.login = async (req, res) => {
    try {
        let { emailAddress, password } = req.body;
        s1 = dbScript(db_sql['Q4'], { var1: emailAddress })
        let admin = await connection.query(s1)
        if (admin.rows.length > 0) {

            s2 = dbScript(db_sql['Q14'], { var1: admin.rows[0].company_id })
            let company = await connection.query(s2)

            if (admin.rows[0].encrypted_password == password) {
                s3 = dbScript(db_sql['Q19'], { var1: admin.rows[0].role_id })
                let checkRole = await connection.query(s3)

                let moduleId = JSON.parse(checkRole.rows[0].module_ids)
                let modulePemissions = []
                for (data of moduleId) {

                    s4 = dbScript(db_sql['Q9'], { var1: data })
                    let modules = await connection.query(s4)

                    s5 = dbScript(db_sql['Q66'], { var1: checkRole.rows[0].id, var2: data })
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
                    message: "Login successfull",
                    data: {
                        token: jwtToken,
                        name: admin.rows[0].full_name,
                        role: checkRole.rows[0].role_name,
                        profileImage: profileImage,
                        modulePermissions: modulePemissions

                    }
                });

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

        s2 = dbScript(db_sql['Q6'], { var1: userEmail })
        let checkUser = await connection.query(s2)
        if (checkUser.rows.length > 0) {
            res.json({
                status: 200,
                success: true,
                message: 'user data',
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
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let user = await connection.query(s1)
        if (user.rows.length > 0) {
            if (user.rows[0].encrypted_password == oldPassword) {
                await connection.query('BEGIN')
                _dt = new Date().toISOString();
                s2 = dbScript(db_sql['Q7'], { var1: userEmail, var2: newPassword, var3: _dt })
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
                        message: "something went wrong"
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
            message: "Avatar uploaded successfully!",
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

        s1 = dbScript(db_sql['Q4'], { var1: userMail })
        let findUser = await connection.query(s1)

        if (findUser.rows.length > 0) {
            await connection.query('BEGIN')
            _dt = new Date().toISOString();
            s2 = dbScript(db_sql['Q17'], { var1: name, var2: avatar, var3: emailAddress, var4: phoneNumber, var5: mobileNumber, var6: address, var7: _dt, var8: userMail })
            let updateUser = await connection.query(s2)
            await connection.query('COMMIT')
            if (updateUser.rowCount > 0) {
                res.json({
                    success: true,
                    status: 200,
                    message: 'user Updated Successfully',
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
        s1 = dbScript(db_sql['Q4'], { var1: emailAddress })
        let checkuser = await connection.query(s1);
        if (checkuser.rows.length > 0) {
            const payload = {
                id: checkuser.rows[0].id,
                email: checkuser.rows[0].email_address
            }
            let token = await issueJWT(payload)
            let link = `localhost:3003/api/v1/user/resetPassword/${token}`
            let emailSend = await resetPasswordMail(emailAddress, link);
            res.json({
                status: 200,
                success: true,
                message: "New Link Sended To Your Email Address",
            })

        } else {
            res.json({
                status: 400,
                success: false,
                message: "This User Is Not Exits",
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
            s1 = dbScript(db_sql['Q4'], { var1: user.email })
            let checkuser = await connection.query(s1);
            if (checkuser.rows.length > 0) {
                await connection.query('BEGIN')
                _dt = new Date().toISOString();
                s2 = dbScript(db_sql['Q7'], { var1: user.email, var2: password, var3: _dt })
                let updateuser = await connection.query(s2)
                await connection.query('COMMIT')
                if (updateuser.rowCount == 1) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Password Changed Successfully",
                        data: ""
                    })
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "something went wrong",
                        data: ""
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

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_view) {

                s3 = dbScript(db_sql['Q8'], { var1: findAdmin.rows[0].company_id })
                let moduleList = await connection.query(s3)

                if (moduleList.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "module list",
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
                    status: 403,
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


//-------------------------------------Roles-------------------------------------------------
module.exports.rolesList = async (req, res) => {
    try {
        userEmail = req.user.email

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            let list = []
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                s4 = dbScript(db_sql['Q21'], { var1: findAdmin.rows[0].company_id })
                let RolesList = await connection.query(s4)

                for (let data of RolesList.rows) {
                    let modulePermissions = []
                    if (data.reporter != '') {
                        for (moduleId of JSON.parse(data.module_ids)) {
                            s5 = dbScript(db_sql['Q66'], { var1: data.id, var2: moduleId })
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
                        s7 = dbScript(db_sql['Q19'], { var1: data.reporter })
                        let reporterRole = await connection.query(s7)
                        list.push({
                            roleId: data.id,
                            roleName: data.role_name,
                            reporterId: reporterRole.rows[0].id,
                            reporterRole: reporterRole.rows[0].role_name,
                            modulePermissions: modulePermissions
                        })
                    } else {
                        list.push({
                            roleId: data.id,
                            roleName: data.role_name,
                            reporterId: "",
                            reporterRole: "",
                        })
                    }
                }
                if (list.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "role list",
                        data: list
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty Roles list",
                        data: []
                    })
                }

            } else {
                res.json({
                    status: 403,
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
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')
                let roleId = uuid.v4()

                s4 = dbScript(db_sql['Q20'], { var1: roleId, var2: roleName, var3: reporter, var4: findAdmin.rows[0].company_id })

                createRole = await connection.query(s4)

                let moduleIds = []
                for (let moduleData of modulePermissions) {

                    moduleIds.push(moduleData.moduleId)

                    let permissionId = uuid.v4()
                    s5 = dbScript(db_sql['Q32'], { var1: permissionId, var2: createRole.rows[0].id, var3: moduleData.moduleId, var4: moduleData.permissionToCreate, var5: moduleData.permissionToUpdate, var6: moduleData.permissionToDelete, var7: moduleData.permissionToView, var8: findAdmin.rows[0].id })

                    addPermission = await connection.query(s5)
                }

                let _dt = new Date().toISOString();
                s6 = dbScript(db_sql['Q65'], { var1: JSON.stringify(moduleIds), var2: _dt, var3: createRole.rows[0].id })
                updateRole = await connection.query(s6)

                await connection.query('COMMIT')

                if (createRole.rowCount > 0 && addPermission.rowCount > 0 && updateRole.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "role created successfully",
                        data: {
                            roleId: createRole.rows[0].id
                        }
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
                res.json({
                    status: 400,
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

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                await connection.query('BEGIN')
                _dt = new Date().toISOString();
                s4 = dbScript(db_sql['Q42'], { var1: roleName, var2: reporter, var3: roleId, var4: _dt })

                let updateRole = await connection.query(s4)

                for (let moduleData of modulePermissions) {

                    s5 = dbScript(db_sql['Q43'], { var1: moduleData.permissionToCreate, var2: moduleData.permissionToView, var3: moduleData.permissionToUpdate, var4: moduleData.permissionToDelete, var5: roleId, var6: _dt, var7: moduleData.moduleId })
                    updatePermission = await connection.query(s5)
                }

                await connection.query('COMMIT')

                if (updateRole.rowCount > 0 && updatePermission.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "role updated successfully"
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
                res.json({
                    status: 400,
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

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {

                _dt = new Date().toISOString();

                await connection.query('BEGIN')

                let updateRole;
                let updatePermission;

                if (status == "child") {

                    s3 = dbScript(db_sql['Q24'], { var1: roleId })
                    let roleData = await connection.query(s3)
                    for (data of roleData.rows) {

                        s4 = dbScript(db_sql['Q44'], { var1: data.id, var2: _dt })
                        updateRole = await connection.query(s4)

                        s5 = dbScript(db_sql['Q45'], { var1: data.id, var2: _dt })
                        updatePermission = await connection.query(s5)
                    }

                } else {
                    s4 = dbScript(db_sql['Q44'], { var1: roleId, var2: _dt })
                    updateRole = await connection.query(s4)

                    s4 = dbScript(db_sql['Q77'], { var1: roleId, var2: _dt })
                    updateChildRole = await connection.query(s4)

                    s5 = dbScript(db_sql['Q45'], { var1: roleId, var2: _dt })
                    updatePermission = await connection.query(s5)
                }
                await connection.query('COMMIT')

                if (updateRole.rowCount > 0 && updatePermission.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "role deleted successfully"
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
                res.json({
                    status: 400,
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

module.exports.assignRoleToUser = async (req, res) => {
    try {
        let AdminEmail = req.user.email
        let {
            roleConfig
        } = req.body

        s1 = dbScript(db_sql['Q4'], { var1: AdminEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {
                for (data of roleConfig) {
                    await connection.query('BEGIN')
                    _dt = new Date().toISOString();
                    s4 = dbScript(db_sql['Q22'], { var1: data.userId, var2: data.roleId, var3: data.percentageDistribution, var4: _dt })
                    var assignRole = await connection.query(s4)
                    await connection.query('COMMIT')
                }
                if (assignRole.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "role assigned  successfully"
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
                    status: 403,
                    success: false,
                    message: "UnAthorised"
                })
            }

        } else {
            res.json({
                status: 403,
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

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                s4 = dbScript(db_sql['Q56'], { var1: findAdmin.rows[0].company_id })
                let RolesList = await connection.query(s4)

                if (RolesList.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "role list",
                        data: RolesList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty Roles list",
                        data: []
                    })
                }

            } else {
                res.json({
                    status: 403,
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

        let id = uuid.v4()
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'users'
        if (findAdmin.rows.length > 0) {
            s3 = dbScript(db_sql['Q4'], { var1: emailAddress })
            let findUser = await connection.query(s3)
            if (findUser.rowCount == 0) {
                s2 = dbScript(db_sql['Q72'], { var1: moduleName })
                let findModule = await connection.query(s2)
                s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
                let checkPermission = await connection.query(s3)
                if (checkPermission.rows[0].permission_to_create) {
                    await connection.query('BEGIN')
                    s4 = dbScript(db_sql['Q76'], { var1: id, var2: name, var3: findAdmin.rows[0].company_id, var4: avatar, var5: emailAddress, var6: mobileNumber, var7: encryptedPassword, var8: roleId, var9: address })
                    let addUser = await connection.query(s4)
                    _dt = new Date().toISOString();
                    s5 = dbScript(db_sql['Q64'], { var1: roleId, var2: addUser.rows[0].id, var3: _dt })
                    let addPermission = await connection.query(s5)
                    await connection.query('COMMIT')
                    if (addUser.rowCount > 0 && addPermission.rowCount > 0) {
                        const payload = {
                            id: addUser.rows[0].id,
                            email: addUser.rows[0].email_address
                        }
                        let token = await issueJWT(payload)
                        link = `http://143.198.102.134:8080/auth/reset-password/${token}`
                        await resetPasswordMail(emailAddress, link);
                        res.json({
                            status: 201,
                            success: true,
                            message: "user created successfully"
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
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 403,
                        success: false,
                        message: "UnAthorised"
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
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'users'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                s4 = dbScript(db_sql['Q41'], { var1: userId })
                let findUser = await connection.query(s4)
                if (findUser.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "user data",
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
                res.json({
                    status: 403,
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

module.exports.usersListByRoleId = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            roleId
        } = req.body
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'users'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                s4 = dbScript(db_sql['Q34'], { var1: roleId })
                let userList = await connection.query(s4)

                if (userList.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "users list",
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
                res.json({
                    status: 403,
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

module.exports.usersList = async (req, res) => {
    try {
        let email = req.user.email
        s1 = dbScript(db_sql['Q6'], { var1: email })
        let findAdmin = await connection.query(s1);
        let moduleName = 'users'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                s4 = dbScript(db_sql['Q23'], { var1: findAdmin.rows[0].company_id })
                let findUsers = await connection.query(s4);
                if (findUsers.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Users List',
                        data: findUsers.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty Users list",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 403,
                    success: false,
                    message: "UnAthorized",
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
            roleId
        } = req.body
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'users'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                _dt = new Date().toISOString();
                await connection.query('BEGIN')
                s4 = dbScript(db_sql['Q39'], { var1: emailAddress, var2: name, var3: mobileNumber, var4: address, var5: roleId, var6: userId, var7: _dt })
                let updateUser = await connection.query(s4)
                await connection.query('COMMIT')
                if (updateUser.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "user Updated successfully"
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
                res.json({
                    status: 403,
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

module.exports.lockUserAccount = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            userId,
            isLocked
        } = req.body
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'users'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {
                _dt = new Date().toISOString();
                await connection.query('BEGIN')
                s4 = dbScript(db_sql['Q52'], { var1: isLocked, var2: userId, var3: _dt })
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
                res.json({
                    status: 403,
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
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'users'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {
                _dt = new Date().toISOString();
                await connection.query('BEGIN')
                s4 = dbScript(db_sql['Q40'], { var1: _dt, var2: userId })
                let updateUser = await connection.query(s4)
                await connection.query('COMMIT')
                if (updateUser.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "user deleted successfully"
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
                res.json({
                    status: 403,
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

// module.exports.uploadLeadFile = async (req, res) => {
//     try {
//         let AdminEmail = req.user.email
//         let file = req.file

//         s1 = dbScript(db_sql['Q4'], { var1: AdminEmail })
//         let findAdmin = await connection.query(s1)

//         if (findAdmin.rows.length > 0) {
//             s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
//             let checkPermission = await connection.query(s2)

//             if (checkPermission.rows[0].permission_to_update) {
//                 let promise = new Promise((resolve, reject) => {
//                     let stream = fs.createReadStream(file.path);
//                     let csvData = [];
//                     //.on('data') is triggered when a record is parsed,
//                     // so we will get the record (data) in the handler function.
//                     // Each record is pushed to csvData array.
//                     //on('end') is triggered after the parsing is done,
//                     // at the time that we have all records.
//                     let csvStream = fastcsv.parse().on("data", (data) => {
//                         csvData.push(data)
//                     }).on("end", () => {
//                         // remove the first line: header
//                         csvData.shift();
//                         // connect to the PostgreSQL database
//                         // insert csvData into DB 
//                         csvData.forEach(row => {
//                             //unique id for every row 
//                             id = uuid.v4()
//                             s3 = dbScript(db_sql['Q55'], { var1: id, var2: findAdmin.rows[0].id, var3: findAdmin.rows[0].company_id })
//                             connection.query(s3, row, (err, res) => {
//                                 if (err) {
//                                     throw err
//                                 }
//                             });
//                         });
//                     })
//                     let exportedData = stream.pipe(csvStream);
//                     if (exportedData) {
//                         resolve(file);
//                     } else {
//                         reject(false)
//                     }
//                 })
//                 promise.then((file) => {
//                     fs.unlink(file.path, (err) => {
//                         if (err) {
//                             throw err
//                         }
//                     })
//                 }).catch(err => {
//                     throw err
//                 })

//                 res.json({
//                     status: 201,
//                     success: true,
//                     message: "Leads exported to DB"
//                 })

//             } else {
//                 res.json({
//                     status: 403,
//                     success: false,
//                     message: "UnAthorised"
//                 })
//             }

//         } else {
//             res.json({
//                 status: 403,
//                 success: false,
//                 message: "Admin not found"
//             })
//         }
//     } catch (error) {
//         res.json({
//             status: 400,
//             success: false,
//             message: error.message,
//         })
//     }
// }

//-----------------------------------------Slab-----------------------------------------


module.exports.createSlab = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            slabs
        } = req.body
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Slab Configuration'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                for (data of slabs) {
                    id = uuid.v4()
                    s4 = dbScript(db_sql['Q28'], { var1: id, var2: data.minAmount, var3: data.maxAmount, var4: data.percentage, var5: data.isMax, var6: findAdmin.rows[0].company_id })
                    var createSlab = await connection.query(s4)
                    await connection.query('COMMIT')
                }
                if (createSlab.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "Slab created successfully"
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
                res.json({
                    status: 403,
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

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Slab Configuration'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                s4 = dbScript(db_sql['Q25'], { var1: findAdmin.rows[0].company_id })
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
                res.json({
                    status: 403,
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

module.exports.updateSlab = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            slabs
        } = req.body

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Slab Configuration'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {
                await connection.query('BEGIN')
                for (data of slabs) {
                    _dt = new Date().toISOString();
                    s4 = dbScript(db_sql['Q31'], { var1: data.minAmount, var2: data.maxAmount, var3: data.percentage, var4: data.isMax, var5: data.slabId, var6: _dt })
                    var updateSlab = await connection.query(s4)
                    await connection.query('COMMIT')
                }

                await connection.query('COMMIT')
                if (updateSlab.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Slab details updated Successfully"
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
                res.json({
                    status: 403,
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

module.exports.deleteSlab = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { slab } = req.body
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Slab Configuration'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {
                await connection.query('BEGIN')
                _dt = new Date().toISOString();
                for (data of slab) {

                    s4 = dbScript(db_sql['Q47'], { var1: _dt, var2: data.slabId })
                    var deleteSlab = await connection.query(s4)
                    await connection.query('COMMIT')
                }
                if (deleteSlab.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "slab deleted Successfully"
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
                res.json({
                    status: 403,
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


//-------------------------------------------Reports----------------------------------------------

module.exports.leadReport = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { fromDate, toDate, fromAmount, toAmount } = req.query

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Reports'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                s4 = dbScript(db_sql['Q63'], { var1: findAdmin.rows[0].company_id, var2: fromDate, var3: toDate, var4: fromAmount, var5: toAmount })
                let findLeads = await connection.query(s4)
                if (findLeads.rowCount > 0) {
                    let leadData = []
                    for (data of findLeads.rows) {
                        leadData.push({
                            id: data.id,
                            clientName: data.full_name,
                            leadValue: data.lead_value,
                            description: data.description,
                            date: data.created_at
                        })
                    }
                    res.json({
                        status: 200,
                        success: true,
                        message: "Leads report",
                        data: {
                            leadCount: findLeads.rowCount,
                            leadData: leadData
                        }
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty Leads report",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 403,
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

module.exports.leadConversionReport = async (req, res) => {
    try {
        let userEmail = req.user.email

        let { fromDate, toDate, fromAmount, toAmount } = req.query

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Reports'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                s4 = dbScript(db_sql['Q60'], { var1: findAdmin.rows[0].company_id, var2: fromDate, var3: toDate, var4: fromAmount, var5: toAmount })
                let findtargets = await connection.query(s4)

                if (findtargets.rowCount > 0) {
                    let targetData = []
                    for (data of findtargets.rows) {
                        targetData.push({
                            id: data.id,
                            targetDate: data.finishing_date,
                            amount: data.amount,
                            description: data.description,
                            date: data.created_at
                        })
                    }
                    res.json({
                        status: 200,
                        success: true,
                        message: "target conversion report",
                        data: {
                            targetCount: findtargets.rowCount,
                            targetData: targetData
                        }
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty target conversion report",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 403,
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

// ---------------------------------------Deal Management---------------------------------------

module.exports.createDeal = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            companyId,
            leadName,
            leadSource,
            qualification,
            is_qualified,
            targetAmount,
            productMatch,
            targetClosingDate
        } = req.body

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Deal management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')
                let compId = ''
                s4 = dbScript(db_sql['Q69'], { var1: companyId })
                let findDealCom = await connection.query(s4)

                if (findDealCom.rowCount == 0) {
                    let comId = uuid.v4()
                    s5 = dbScript(db_sql['Q68'], { var1: comId, var2: leadName, var3: findAdmin.rows[0].company_id })
                    let addDealCom = await connection.query(s5)
                    if (addDealCom.rowCount > 0) {
                        compId = addDealCom.rows[0].id
                    }

                } else {
                    compId = findDealCom.rows[0].id
                }

                let id = uuid.v4()
                s6 = dbScript(db_sql['Q67'], { var1: id, var2: findAdmin.rows[0].id, var3: compId, var4: leadName, var5: leadSource, var6: qualification, var7: is_qualified, var8: targetAmount, var9: productMatch, var10: targetClosingDate, var11: findAdmin.rows[0].company_id })
                let createDeal = await connection.query(s6)

                await connection.query('COMMIT')
                if (createDeal.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "Deal created successfully"
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
                res.json({
                    status: 403,
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

module.exports.closeDeal = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            dealId
        } = req.body
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Deal management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                _dt = new Date().toISOString();
                s4 = dbScript(db_sql['Q71'], { var1: _dt, var2: _dt, var3: dealId })
                let closeDeal = await connection.query(s4)

                if (closeDeal.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Deal Closed successfully"
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
                res.json({
                    status: 403,
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

module.exports.dealList = async (req, res) => {

    try {

        let userEmail = req.user.email
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Deal management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let dealArr = []
                s4 = dbScript(db_sql['Q70'], { var1: findAdmin.rows[0].company_id })
                let dealList = await connection.query(s4)

                if (dealList.rowCount > 0) {
                    for (data of dealList.rows) {
                        s5 = dbScript(db_sql['Q12'], { var1: data.user_id })
                        let createdBy = await connection.query(s5)
                        data.createdBy = createdBy.rows[0].full_name

                        dealArr.push(data)
                    }
                }

                if (dealArr.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'deals List',
                        data: dealArr
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: 'empty deals List',
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 403,
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

module.exports.editDeal = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            dealId,
            leadName,
            leadSource,
            qualification,
            is_qualified,
            targetAmount,
            productMatch,
            targetClosingDate
        } = req.body
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Deal management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                await connection.query('BEGIN')

                _dt = new Date().toISOString();
                s4 = dbScript(db_sql['Q73'], { var1: leadName, var2: leadSource, var3: qualification, var4: is_qualified, var5: targetAmount, var6: productMatch, var7: targetClosingDate, var8: _dt, var9: dealId })

                let updateDeal = await connection.query(s4)
                if (updateDeal.rowCount > 0) {

                    let id = uuid.v4()

                    s5 = dbScript(db_sql['Q74'], { var1: id, var2: updateDeal.rows[0].id, var3: updateDeal.rows[0].lead_name, var4: updateDeal.rows[0].lead_source, var5: updateDeal.rows[0].qualification, var6: updateDeal.rows[0].is_qualified, var7: updateDeal.rows[0].target_amount, var8: updateDeal.rows[0].product_match, var9: updateDeal.rows[0].target_closing_date })

                    var createLog = await connection.query(s5)
                    await connection.query('COMMIT')

                    if (createLog.rowCount > 0) {
                        res.json({
                            status: 200,
                            success: true,
                            message: "Deal updated successfully"
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
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "something went wrong"
                    })
                }

            } else {
                res.json({
                    status: 403,
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

module.exports.dealLogsList = async (req, res) => {

    try {
        let { dealId } = req.query
        let userEmail = req.user.email
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Deal management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                s4 = dbScript(db_sql['Q75'], { var1: dealId })
                let deallogList = await connection.query(s4)

                if (deallogList.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'deals log List',
                        data: deallogList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: 'empty deals log List',
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 403,
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

module.exports.dealCompanyList = async (req, res) => {

    try {
        let { companyName } = req.query
        let userEmail = req.user.email
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Deal management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                s4 = dbScript(db_sql['Q79'], { var1: findAdmin.rows[0].company_id, var2: companyName })
                let dealList = await connection.query(s4)

                if (dealList.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'deal Company List',
                        data: dealList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: 'empty deal Company List',
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 403,
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

module.exports.deleteDeal = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            dealId
        } = req.body
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Deal management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                await connection.query('BEGIN')

                _dt = new Date().toISOString();
                s4 = dbScript(db_sql['Q80'], { var1: _dt, var2: dealId })
                let deleteDeal = await connection.query(s4)

                await connection.query('COMMIT')

                if (deleteDeal.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Deal deleted successfully"
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
                res.json({
                    status: 403,
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

module.exports.addfollowUpNotes = async (req, res) => {
    try {
        userEmail = req.user.email
        let { notes, dealId } = req.body

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_create) {
                let id = uuid.v4()
                s2 = dbScript(db_sql['Q61'], { var1: id, var2: dealId, var3: findAdmin.rows[0].company_id, var4: findAdmin.rows[0].id, var5: notes })
                let addNotes = await connection.query(s2)
                if (addNotes.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "notes created"
                    })

                } else {
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }
            } else {
                res.json({
                    status: 403,
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
        let { dealId } = req.query

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)

            if (checkPermission.rows[0].permission_to_view) {
                s3 = dbScript(db_sql['Q62'], { var1: dealId })
                let findNOtes = await connection.query(s3)
                if (findNOtes.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Notes List',
                        data: findNOtes.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: 'empty Notes List',
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 403,
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

//-------------------------------------sales_config----------------------------------------

module.exports.commissionSplit = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            closerPercentage,
            supporterPercentage
        } = req.body
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Deal management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')

                id = uuid.v4()
                s4 = dbScript(db_sql['Q81'], { var1: id, var2: closerPercentage, var3: supporterPercentage, var4: findAdmin.rows[0].company_id })
                var createSlab = await connection.query(s4)

                await connection.query('COMMIT')

                if (createSlab.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "commission created successfully"
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
                res.json({
                    status: 403,
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

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Deal management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                await connection.query('BEGIN')
                _dt = new Date().toISOString();
                s4 = dbScript(db_sql['Q82'], { var1: closerPercentage, var2: supporterPercentage, var3: commissionId, var4: _dt })

                var updatecommission = await connection.query(s4)

                await connection.query('COMMIT')

                if (updatecommission.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "commission updated Successfully"
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
                res.json({
                    status: 403,
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

module.exports.commissionSplitList = async (req, res) => {
    try {
        let userEmail = req.user.email
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Deal management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                s4 = dbScript(db_sql['Q83'], { var1: findAdmin.rows[0].company_id })
                let slabList = await connection.query(s4)


                if (slabList.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "commission list",
                        data: slabList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty commission list",
                        data: []
                    })
                }

            } else {
                res.json({
                    status: 403,
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
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Deal management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {
                await connection.query('BEGIN')
                _dt = new Date().toISOString();
                s4 = dbScript(db_sql['Q84'], { var1: _dt, var2: commissionId })
                var deleteSlab = await connection.query(s4)
                await connection.query('COMMIT')

                if (deleteSlab.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "commission deleted Successfully"
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
                res.json({
                    status: 403,
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


//----------------------------------Sales conversion-------------------------------------

module.exports.dealListforSales = async (req, res) => {

    try {

        let userEmail = req.user.email
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Deal management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let dealArr = []
                s4 = dbScript(db_sql['Q85'], { var1: findAdmin.rows[0].company_id })
                let dealList = await connection.query(s4)

                if (dealList.rowCount > 0) {
                    for (data of dealList.rows) {
                        s5 = dbScript(db_sql['Q12'], { var1: data.user_id })
                        let createdBy = await connection.query(s5)
                        data.createdBy = createdBy.rows[0].full_name

                        dealArr.push(data)
                    }
                }

                if (dealArr.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'deals List',
                        data: dealArr
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: 'empty deals List',
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 403,
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

module.exports.createSalesConversion = async (req, res) => {

    try {
        let userEmail = req.user.email
        let {
            dealId,
            dealCloserId,
            dealCommissionId,
            supporters,
            is_overwrite,
            closerPercentage
        } = req.body

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {

                await connection.query('BEGIN')

                let id = uuid.v4()
                let s5 = dbScript(db_sql['Q86'], { var1: id, var2: dealId, var3: dealCommissionId, var4: is_overwrite, var5: findAdmin.rows[0].company_id })
                let createSalesConversion = await connection.query(s5)

                let s6 = dbScript(db_sql['Q89'], { var1: dealCommissionId, var2: findAdmin.rows[0].company_id })
                let findSalescommission = await connection.query(s6)

                let closer_percentage = is_overwrite ? closerPercentage : findSalescommission.rows[0].closer_percentage

                let closerId = uuid.v4()
                s7 = dbScript(db_sql['Q93'], { var1: closerId, var2: dealCloserId, var3: closer_percentage, var4: dealCommissionId, var5: createSalesConversion.rows[0].id, var6: findAdmin.rows[0].company_id })
                let addSalesCloser = await connection.query(s7)

                for (supporterData of supporters) {

                    let supporterId = uuid.v4()
                    s8 = dbScript(db_sql['Q91'], { var1: supporterId, var2: dealCommissionId, var3: supporterData.id, var4: supporterData.percentage, var5: createSalesConversion.rows[0].id, var6: findAdmin.rows[0].company_id })
                    addSalesSupporter = await connection.query(s8)

                }

                await connection.query('COMMIT')

                if (createSalesConversion.rowCount > 0 && findSalescommission.rowCount > 0 && addSalesCloser.rowCount > 0 && addSalesSupporter.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "Sales conversion created Successfully"
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
                res.json({
                    status: 403,
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

module.exports.salesConversionList = async (req, res) => {

    try {

        let userEmail = req.user.email
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                s4 = dbScript(db_sql['Q87'], { var1: findAdmin.rows[0].company_id })
                let salesConversionList = await connection.query(s4)

                let conversionList = []

                for (data of salesConversionList.rows) {
                    let closer = {}
                    let supporters = []

                    s5 = dbScript(db_sql['Q88'], { var1: data.deal_id })
                    let dealname = await connection.query(s5)

                    s6 = dbScript(db_sql['Q12'], { var1: data.closer_id })
                    let closerName = await connection.query(s6)

                    s7 = dbScript(db_sql['Q94'], { var1: data.id })
                    let supporter = await connection.query(s7)

                    for (supporterData of supporter.rows) {
                        s8 = dbScript(db_sql['Q12'], { var1: supporterData.supporter_id })
                        let supporterName = await connection.query(s8)
                        supporters.push({
                            id: supporterData.supporter_id,
                            name: supporterName.rows[0].full_name,
                            percentage: supporterData.supporter_percentage
                        })
                    }

                    closer.id = data.id
                    closer.dealId = data.deal_id
                    closer.dealName = dealname.rows[0].lead_name
                    closer.commissionId = data.deal_commision_id
                    closer.is_overwrite = data.is_overwrite
                    closer.closerId = data.closer_id
                    closer.closerName = closerName.rows[0].full_name
                    closer.closerPercentage = data.closer_percentage
                    closer.supporters = supporters

                    conversionList.push(closer)
                }
                if (conversionList.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'sales conversion List',
                        data: conversionList
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: 'empty sales conversion List',
                        data: []
                    })
                }

            } else {
                res.json({
                    status: 403,
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

module.exports.updateSalesConversion = async (req, res) => {

    try {
        let userEmail = req.user.email
        let {
            salesConversionId,
            dealId,
            dealCommissionId,
            dealCloserId,
            supporters,
            is_overwrite,
            closerPercentage
        } = req.body

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {

                await connection.query('BEGIN')

                _dt = new Date().toISOString();

                let s5 = dbScript(db_sql['Q98'], { var1: dealId, var2: dealCommissionId, var3: is_overwrite, var4: _dt, var5: salesConversionId, var6: findAdmin.rows[0].company_id })
                let updateSalesConversion = await connection.query(s5)

                let s6 = dbScript(db_sql['Q89'], { var1: dealCommissionId, var2: findAdmin.rows[0].company_id })
                let findSalescommission = await connection.query(s6)

                let closer_percentage = is_overwrite ? closerPercentage : findSalescommission.rows[0].closer_percentage

                s7 = dbScript(db_sql['Q99'], { var1: dealCloserId, var2: closer_percentage, var3: dealCommissionId, var4: _dt, var5: salesConversionId, var6: findAdmin.rows[0].company_id })
                let updateSalesCloser = await connection.query(s7)

                s8 = dbScript(db_sql['Q100'], { var1: salesConversionId, var2: findAdmin.rows[0].company_id })
                let updateSupporter = await connection.query(s8)


                for (supporterData of supporters) {
                    console.log(supporterData);

                    let supporterId = uuid.v4()
                    s9 = dbScript(db_sql['Q91'], { var1: supporterId, var2: dealCommissionId, var3: supporterData.id, var4: supporterData.percentage, var5: salesConversionId, var6: findAdmin.rows[0].company_id })
                    updateSalesSupporter = await connection.query(s9)

                }

                await connection.query('COMMIT')

                if (updateSalesConversion.rowCount > 0 && findSalescommission.rowCount > 0 && updateSalesCloser.rowCount > 0 && updateSalesSupporter.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Sales conversion updated Successfully"
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
                res.json({
                    status: 403,
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

module.exports.deleteSalesConversion = async (req, res) => {

    try {
        let userEmail = req.user.email
        let {
            salesConversionId
        } = req.body

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q72'], { var1: moduleName })
            let findModule = await connection.query(s2)
            s3 = dbScript(db_sql['Q66'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                await connection.query('BEGIN')

                _dt = new Date().toISOString();
                s4 = dbScript(db_sql['Q95'], { var1: _dt, var2: salesConversionId, var3: findAdmin.rows[0].company_id })
                let deleteSalesConversion = await connection.query(s4)

                s5 = dbScript(db_sql['Q96'], { var1: _dt, var2: salesConversionId, var3: findAdmin.rows[0].company_id })
                let deleteSalesSupporter = await connection.query(s5)

                s5 = dbScript(db_sql['Q97'], { var1: _dt, var2: salesConversionId, var3: findAdmin.rows[0].company_id })
                let deleteSalesCloser = await connection.query(s5)

                await connection.query('COMMIT')

                if (deleteSalesConversion.rowCount > 0 && deleteSalesSupporter.rowCount > 0, deleteSalesCloser.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "sales conversion deleted Successfully"
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
                res.json({
                    status: 403,
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