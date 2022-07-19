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
    let module_id = ""
    let {
        name,
        avatar,
        emailAddress,
        mobileNumber,
        phoneNumber,
        encryptedPassword
    } = bodyData
    s3 = dbScript(db_sql['Q4'], { var1: emailAddress })
    let findUser = await connection.query(s3)
    if (findUser.rows.length == 0) {
        await connection.query('BEGIN')
        let roleId = uuid.v4()
        s4 = dbScript(db_sql['Q18'], { var1: roleId, var2: cId })
        let createRole = await connection.query(s4)
        let role_id = createRole.rows[0].id
        s5 = dbScript(db_sql['Q3'], { var1: id, var2: name, var3: cId, var4: avatar, var5: emailAddress, var6: mobileNumber, var7: phoneNumber, var8: encryptedPassword, var9: role_id })
        let saveuser = await connection.query(s5)
        let perId = uuid.v4()
        s6 = dbScript(db_sql['Q33'], { var1: perId, var2: role_id, var3: module_id, var4: saveuser.rows[0].id })
        let addPermission = await connection.query(s6)
        await connection.query('COMMIT')
        if (createRole.rowCount > 0 && addPermission.rowCount > 0 && saveuser.rowCount > 0) {
            const payload = {
                id: saveuser.rows[0].id,
                email: saveuser.rows[0].email_address
            }
            let token = await issueJWT(payload)
            link = `http://143.198.102.134:8082/auth/reset-password/${token}`
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
        let path = `http:/localhost:3003/comapnyLogo/${file.originalname}`;
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
            await connection.query('COMMIT')
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
        console.log(req.body);
        let user = await verifyTokenFn(req)
        console.log(user);
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

            if (admin.rows[0].encrypted_password == password) {
                s2 = dbScript(db_sql['Q19'], { var1: admin.rows[0].role_id })

                let checkRole = await connection.query(s2)
                let payload = {
                    id: admin.rows[0].id,
                    email: admin.rows[0].email_address,
                }
                let jwtToken = await issueJWT(payload);
                res.send({
                    status: 200,
                    success: true,
                    message: "Login successfull",
                    data: {
                        token: jwtToken,
                        name: admin.rows[0].full_name,
                        role: checkRole.rows[0].role_name
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
        let path = `http:/localhost:3003/avatar/${file.originalname}`;
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
            avatar
        } = req.body

        s1 = dbScript(db_sql['Q4'], { var1: userMail })
        let findUser = await connection.query(s1)

        if (findUser.rows.length > 0) {
            await connection.query('BEGIN')
            _dt = new Date().toISOString();
            s2 = dbScript(db_sql['Q17'], { var1: name, var2: avatar, var3: _dt, var4: userMail })
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

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_view) {
                s3 = dbScript(db_sql['Q21'], { var1: findAdmin.rows[0].company_id })
                let RolesList = await connection.query(s3)

                if (RolesList.rows.length > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "role list",
                        data: RolesList.rows
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
            modulePermissions,
            isAdmin
        } = req.body

        let roleId = uuid.v4()

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        console.log(findAdmin.rows);
        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            console.log(checkPermission.rows);
            if (checkPermission.rows[0].permission_to_create) {


                await connection.query('BEGIN')
                s3 = dbScript(db_sql['Q20'], { var1: roleId, var2: roleName, var3: reporter, var4: findAdmin.rows[0].company_id  })
                let createRole = await connection.query(s3)
                
                for (data of modulePermissions) {
                    let permissionId = uuid.v4()
                    s4 = dbScript(db_sql['Q32'], { var1: permissionId, var2: createRole.rows[0].id, var3: data.moduleId, var4: data.permissionToCreate, var5: data.permissionToUpdate, var6: data.permissionToDelete, var7: data.permissionToView, var8: findAdmin.rows[0].id })
                    addPermission = await connection.query(s4)
                    await connection.query('COMMIT')
                }
                if (createRole.rowCount > 0 && addPermission.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "role created successfully"
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

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_update) {
                _dt = new Date().toISOString();
                await connection.query('BEGIN')
                s3 = dbScript(db_sql['Q42'], { var1: roleName, var2: reporter, var3: roleId, var4: _dt })
                let updateRole = await connection.query(s3)
                for (data of modulePermissions) {
                    s4 = dbScript(db_sql['Q43'], { var1: data.permissionToCreate, var2: data.permissionToView, var3: data.permissionToUpdate, var4: data.permissionToDelete, var5: roleId, var6: _dt, var7: data.moduleId })
                    updatePermission = await connection.query(s4)
                    await connection.query('COMMIT')
                }

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
            roleId
        } = req.body

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_update) {
                _dt = new Date().toISOString();
                await connection.query('BEGIN')
                s3 = dbScript(db_sql['Q44'], { var1: roleId, var2: _dt })
                let updateRole = await connection.query(s3)
                s4 = dbScript(db_sql['Q45'], { var1: roleId, var2: _dt })
                let updatePermission = await connection.query(s4)
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

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_update) {
                for (data of roleConfig) {
                    await connection.query('BEGIN')
                    _dt = new Date().toISOString();
                    s3 = dbScript(db_sql['Q22'], { var1: data.userId, var2: data.roleId, var3: data.percentageDistribution, var4: _dt })
                    var assignRole = await connection.query(s3)
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

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_view) {

                s3 = dbScript(db_sql['Q56'], { var1: findAdmin.rows[0].company_id })
                let RolesList = await connection.query(s3)

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

//-------------------------------------Quots-------------------------------------------------
module.exports.slabList = async (req, res) => {
    try {
        userEmail = req.user.email

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_view) {
                s3 = dbScript(db_sql['Q25'], { var1: findAdmin.rows[0].company_id })
                let slabList = await connection.query(s3)
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

module.exports.createSlab = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            slabs
        } = req.body
        console.log(req.body);
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
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

module.exports.updateSlab = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            slabs
        } = req.body

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
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

        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)

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

//-----------------------------------------Users-------------------------------------------------
// module.exports.salesEntry = async (req, res) => {
//     try {
//         let userEmail = req.user.email
//         let {
//             clientName,
//             clientEmail,
//             clientContact,
//             amount,
//             description
//         } = req.body

//         s1 = dbScript(db_sql['Q4'], { var1: userEmail })
//         let findAdmin = await connection.query(s1)

//         if (findAdmin.rows.length > 0) {
//             s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
//             let checkPermission = await connection.query(s2)

//             if (checkPermission.rows[0].permission_to_create) {
//                 await connection.query('BEGIN')
//                 s3 = dbScript(db_sql['Q36'], { var1: id, var2: findAdmin.rows[0].id, var3: clientName, var4: clientEmail, var5: clientContact, var6: amount, var7: description })
//                 let addSalesEntry = await connection.query(s3)
//                 await connection.query('COMMIT')
//                 if (addSalesEntry.rowCount > 0) {
//                     res.json({
//                         status: 201,
//                         success: true,
//                         message: "sales entry created successfully"
//                     })
//                 } else {
//                     await connection.query('ROLLBACK')
//                     res.json({
//                         status: 400,
//                         success: false,
//                         message: "something went wrong"
//                     })
//                 }

//             } else {
//                 res.json({
//                     status: 403,
//                     success: false,
//                     message: "UnAthorised"
//                 })
//             }
//         } else {
//             res.json({
//                 status: 400,
//                 success: false,
//                 message: "Admin not found"
//             })
//         }

//     } catch (error) {
//         await connection.query('ROLLBACK')
//         res.json({
//             status: 400,
//             success: false,
//             message: error.message,
//         })
//     }
// }

// module.exports.salesReportByUserId = async (req, res) => {
//     try {
//         let userEmail = req.user.email
//         s1 = dbScript(db_sql['Q4'], { var1: userEmail })
//         let findAdmin = await connection.query(s1)

//         if (findAdmin.rows.length > 0) {
//             s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
//             let checkPermission = await connection.query(s2)

//             if (checkPermission.rows[0].permission_to_view) {
//                 s3 = dbScript(db_sql['Q37'], { var1: findAdmin.rows[0].id })
//                 let salesReport = await connection.query(s3)
//                 if (salesReport.rowCount > 0) {
//                     res.json({
//                         status: 200,
//                         success: true,
//                         message: "sales report",
//                         data: salesReport.rows
//                     })
//                 } else {
//                     res.json({
//                         status: 200,
//                         success: true,
//                         message: "Empty sales report",
//                         data: []
//                     })
//                 }
//             } else {
//                 res.json({
//                     status: 403,
//                     success: false,
//                     message: "UnAthorised"
//                 })
//             }
//         } else {
//             res.json({
//                 status: 400,
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

// module.exports.salesReportList = async (req, res) => {
//     try {
//         let userEmail = req.user.email
//         s1 = dbScript(db_sql['Q4'], { var1: userEmail })
//         let findAdmin = await connection.query(s1)

//         if (findAdmin.rows.length > 0) {
//             s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
//             let checkPermission = await connection.query(s2)

//             if (checkPermission.rows[0].permission_to_view) {
//                 s3 = dbScript(db_sql['Q38'], { var1: findAdmin.rows[0].company_id })
//                 let salesReport = await connection.query(s3)
//                 if (salesReport.rowCount > 0) {
//                     res.json({
//                         status: 200,
//                         success: true,
//                         message: "sales report",
//                         data: salesReport.rows
//                     })
//                 } else {
//                     res.json({
//                         status: 200,
//                         success: true,
//                         message: "Empty sales report",
//                         data: []
//                     })
//                 }
//             } else {
//                 res.json({
//                     status: 403,
//                     success: false,
//                     message: "UnAthorised"
//                 })
//             }
//         } else {
//             res.json({
//                 status: 400,
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

//-------------------------------------Users-------------------------------------------------

module.exports.addUser = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            name,
            emailAddress,
            mobileNumber,
            phoneNumber,
            address,
            roleId,
            avatar,
            encryptedPassword
        } = req.body

        let id = uuid.v4()
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)

            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')
                s3 = dbScript(db_sql['Q3'], { var1: id, var2: name, var3: findAdmin.rows[0].company_id, var4: avatar, var5: emailAddress, var6: mobileNumber, var7: phoneNumber, var8: encryptedPassword, var9: roleId, var10: address })
                let addUser = await connection.query(s3)
                _dt = new Date().toISOString();
                s4 = dbScript(db_sql['Q64'], {var1 : roleId , var2:addUser.rows[0].id , var3 :_dt })
                let addPermission = await connection.query(s4)
                await connection.query('COMMIT')
                if (addUser.rowCount > 0 && addPermission.rowCount > 0 ) {
                    const payload = {
                        id: addUser.rows[0].id,
                        email: addUser.rows[0].email_address
                    }
                    let token = await issueJWT(payload)
                    link = `localhost:3003/api/v1/companyAdmin/setPassword/${token}`
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

module.exports.showUserById = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { userId } = req.body
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)

            if (checkPermission.rows[0].permission_to_view) {
                s3 = dbScript(db_sql['Q41'], { var1: userId })
                let findUser = await connection.query(s3)
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
        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)

            if (checkPermission.rows[0].permission_to_view) {

                s3 = dbScript(db_sql['Q34'], { var1: roleId })
                let userList = await connection.query(s3)

                if (userList.rowCount > 0) {
                    res.json({
                        status: 201,
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
        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)

            if (checkPermission.rows[0].permission_to_view) {

                s3 = dbScript(db_sql['Q23'], { var1: findAdmin.rows[0].company_id })
                let findUsers = await connection.query(s3);
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
            phoneNumber,
            address,
            roleId
        } = req.body
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)

            if (checkPermission.rows[0].permission_to_update) {
                _dt = new Date().toISOString();
                await connection.query('BEGIN')
                s3 = dbScript(db_sql['Q39'], { var1: emailAddress, var2: name, var3: mobileNumber, var4: phoneNumber, var5: address, var6: roleId, var7: userId, var8: _dt })
                let updateUser = await connection.query(s3)
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
        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_update) {
                _dt = new Date().toISOString();
                await connection.query('BEGIN')
                s3 = dbScript(db_sql['Q52'], { var1: isLocked, var2: userId, var3: _dt })
                let updateUser = await connection.query(s3)
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

        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)

            if (checkPermission.rows[0].permission_to_delete) {
                _dt = new Date().toISOString();
                await connection.query('BEGIN')
                s3 = dbScript(db_sql['Q40'], { var1: _dt, var2: userId })
                let updateUser = await connection.query(s3)
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

//----------------------------------leads------------------------------------------------

module.exports.createLead = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            fullName,
            designation,
            emailAddress,
            website,
            phoneNumber,
            leadValue,
            companyName,
            description,
            address,
            cityName,
            stateName,
            countryName,
            zipCode,
        } = req.body
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_create) {
                id = uuid.v4()
                await connection.query('BEGIN')
                s3 = dbScript(db_sql['Q48'], { var1: id, var2: findAdmin.rows[0].id, var3: findAdmin.rows[0].company_id, var4: fullName, var5: designation, var6: emailAddress, var7: website, var8: phoneNumber, var9: leadValue, var10: companyName, var11: description, var12: address, var13: cityName, var14: stateName, var15: countryName, var16: zipCode })
                console.log(s3);
                let createLead = await connection.query(s3)
                await connection.query('COMMIT')
                if (createLead.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "lead created successfully"
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

module.exports.leadsList = async (req, res) => {
    try {
        let userEmail = req.user.email
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)

            if (checkPermission.rows[0].permission_to_view) {
                s3 = dbScript(db_sql['Q49'], { var1: findAdmin.rows[0].company_id })
                let findLeads = await connection.query(s3)

                if (findLeads.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'leads List',
                        data: findLeads.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: 'empty leads List',
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

module.exports.updateLead = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            leadId,
            fullName,
            designation,
            emailAddress,
            website,
            phoneNumber,
            leadValue,
            companyName,
            description,
            address,
            cityName,
            stateName,
            countryName,
            zipCode,
        } = req.body
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_update) {
                await connection.query('BEGIN')
                _dt = new Date().toISOString();
                s3 = dbScript(db_sql['Q50'], { var1: leadId, var2: fullName, var3: designation, var4: emailAddress, var5: website, var6: phoneNumber, var7: leadValue, var8: companyName, var9: description, var10: address, var11: cityName, var12: stateName, var13: countryName, var14: zipCode, var15: _dt })
                let createLead = await connection.query(s3)
                await connection.query('COMMIT')
                if (createLead.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "lead updated successfully"
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

module.exports.deleteLead = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            leadId,
        } = req.body
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_delete) {
                await connection.query('BEGIN')
                _dt = new Date().toISOString();
                s3 = dbScript(db_sql['Q51'], { var1: leadId, var2: _dt })
                let deleteLead = await connection.query(s3)
                await connection.query('COMMIT')
                if (deleteLead.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "lead deleted successfully"
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

module.exports.showleadsById = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { userId } = req.body;
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)

            if (checkPermission.rows[0].permission_to_view) {
                s3 = dbScript(db_sql['Q53'], { var1: userId })
                console.log(s3);
                let findLeads = await connection.query(s3)
                if (findLeads.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'leads List',
                        data: findLeads.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: 'empty leads List',
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

module.exports.assignLeadToUser = async (req, res) => {
    try {
        let AdminEmail = req.user.email
        let {
            leadConfig
        } = req.body

        s1 = dbScript(db_sql['Q4'], { var1: AdminEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_update) {
                for (data of leadConfig) {
                    await connection.query('BEGIN')
                    _dt = new Date().toISOString();
                    s3 = dbScript(db_sql['Q54'], { var1: data.userId, var2: data.leadId, var3: _dt })
                    var assignLead = await connection.query(s3)
                    await connection.query('COMMIT')
                }
                if (assignLead.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Lead assigned  successfully"
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

module.exports.uploadLeadFile = async (req, res) => {
    try {
        let AdminEmail = req.user.email
        let file = req.file

        s1 = dbScript(db_sql['Q4'], { var1: AdminEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)

            if (checkPermission.rows[0].permission_to_update) {
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
                                //unique id for every row 
                                id = uuid.v4()
                                s3 = dbScript(db_sql['Q55'], { var1: id, var2: findAdmin.rows[0].id,var3: findAdmin.rows[0].company_id })
                                connection.query(s3, row, (err, res) => {
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
                    message: "Leads exported to DB"
                })

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
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.userWiseLeadList = async (req, res) => {
    try {
        userEmail = req.user.email

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_view) {

                s3 = dbScript(db_sql['Q57'], { var1: findAdmin.rows[0].company_id })
                let leadList = await connection.query(s3)

                if (leadList.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "lead list",
                        data: leadList.rows
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

//----------------------------------------Targets-----------------------------------------------

module.exports.convertLeadToTarget = async (req, res) => {
    try {
        userEmail = req.user.email
        let { supporters , finishingDate , leadId, targetAmount, description } = req.body
        let supportersList = JSON.stringify(supporters)
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_create) {

                s2 = dbScript(db_sql['Q58'], { var1: leadId })
                let findLead = await connection.query(s2)
                console.log(findLead);
                if(findLead.rowCount > 0){
                    id = uuid.v4()
                    await connection.query('BEGIN')
                    s3 = dbScript(db_sql['Q59'], { var0 : id, var1: leadId , var2 : supportersList , var3 : finishingDate, var4 : targetAmount, var5 : description, var6:findAdmin.rows[0].company_id })
                    let addTarget = await connection.query(s3)
                    console.log(s3);
                    console.log(addTarget);
                    await connection.query('COMMIT')
                    if(addTarget.rowCount > 0){
                        res.json({
                            status: 201,
                            success: true,
                            message: "target created successfully"
                        })
                    }else{
                        await connection.query('ROLLBACK')
                        res.json({
                            status: 400,
                            success: false,
                            message: "something went wrong"
                    })
                    }
                }else {
                    res.json({
                        status: 400,
                        success: false,
                        message: "lead not found"
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

module.exports.targetList = async (req, res) => {
    try {
        userEmail = req.user.email

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_view) {

                s3 = dbScript(db_sql['Q60'], { var1: findAdmin.rows[0].company_id })
                let targetList = await connection.query(s3)
                let targetArr = []
                for (data of targetList.rows) {

                    s4 = dbScript(db_sql['Q58'], { var1: data.lead_id })
                    let leadData = await connection.query(s4)
                    if (leadData.rowCount > 0) {
                        data.lead_id = leadData.rows[0]
                    }

                    let supporters = JSON.parse(data.supporters)
                    let supporterDataArr = []
                    for (let users of supporters) {
                        s5 = dbScript(db_sql['Q12'], { var1: users })
                        let supporterData = await connection.query(s5)
                        if (supporterData.rowCount > 0) {
                            supporterDataArr.push(supporterData.rows[0])
                        }
                    }
                    data.supporters = supporterDataArr
                    targetArr.push(data)
                }
                if (targetArr.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Target list",
                        data: targetArr
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty target list",
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

module.exports.addfollowUpNotes = async (req, res) => {
    try {
        userEmail = req.user.email
        let { notes, targetId } = req.body 

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_create) {
                let id = uuid.v4()
                s2 = dbScript(db_sql['Q61'], { var1:id , var2: targetId, var3 : findAdmin.rows[0].company_id, var4 : findAdmin.rows[0].id, var5 : notes })
                console.log(s2);
                let addNotes = await connection.query(s2)
                if(addNotes.rowCount > 0){
                    res.json({
                        status: 201,
                        success: true,
                        message: "notes created"
                    })

                }else{
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
        let { targetId } = req.body

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)

            if (checkPermission.rows[0].permission_to_view) {
                s3 = dbScript(db_sql['Q62'], { var1: targetId })
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

//-------------------------------------------Reports----------------------------------------------

module.exports.leadReport = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { fromDate, toDate, fromAmount, toAmount } = req.query

        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)

            if (checkPermission.rows[0].permission_to_view) {

                s3 = dbScript(db_sql['Q63'], { var1: findAdmin.rows[0].company_id , var2:fromDate , var3 : toDate, var4 : fromAmount, var5:toAmount })
                let findLeads = await connection.query(s3)
                console.log(s3);
                if(findLeads.rowCount > 0){
                    let leadData = []
                    for(data of findLeads.rows){
                        leadData.push({
                            id: data.id,
                            clientName : data.full_name,
                            leadValue : data.lead_value,
                            description : data.description,
                            date : data.created_at
                        })
                    }
                    res.json({
                        status: 200,
                        success: true,
                        message: "Leads report",
                        data : {
                            leadCount : findLeads.rowCount,
                            leadData : leadData
                        }
                    })
                }else{
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty Leads report",
                        data : []
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

        if (findAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q35'], { var1: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s2)

            if (checkPermission.rows[0].permission_to_view) {

                s3 = dbScript(db_sql['Q60'], { var1: findAdmin.rows[0].company_id , var2:fromDate , var3 : toDate, var4 : fromAmount, var5:toAmount })
                let findtargets = await connection.query(s3)

                if(findtargets.rowCount > 0){
                    let targetData = []
                    for(data of findtargets.rows){
                        targetData.push({
                            id: data.id,
                            targetDate : data.finishing_date,
                            amount : data.amount,
                            description : data.description,
                            date : data.created_at
                        })
                    }
                    res.json({
                        status: 200,
                        success: true,
                        message: "target conversion report",
                        data : {
                            targetCount : findtargets.rowCount,
                            targetData : targetData
                        }
                    })
                }else{
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty target conversion report",
                        data : []
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

