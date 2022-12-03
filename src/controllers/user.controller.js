const connection = require('../database/connection')
const { issueJWT } = require("../utils/jwt")
const {
    setPasswordMail,
    setPasswordMail2,
} = require("../utils/sendMail")
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string } = require('../utils/helper')
const moduleName = process.env.USERS_MODULE

module.exports.userCount = async (req, res) => {
    try {
        let userId = req.user.id

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            let s2 = dbScript(db_sql['Q15'], { var1: findAdmin.rows[0].company_id })
            let users = await connection.query(s2)

            let s3 = dbScript(db_sql['Q108'], { var1: findAdmin.rows[0].company_id })
            let count = await connection.query(s3)

            if (count.rows.length > 0) {
                if (users.rowCount - 1 < count.rows[0].user_count) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Can add users'
                    })
                } else {
                    res.json({
                        status: 400,
                        success: false,
                        message: 'Plan limit exists! Can not add more users'
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Empty User List'
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

module.exports.addUser = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            name,
            emailAddress,
            mobileNumber,
            address,
            roleId,
            avatar,
            encryptedPassword
        } = req.body

        avatar = (avatar == "") ? process.env.DEFAULT_LOGO : avatar;

        let id = uuid.v4()
        let s2 = dbScript(db_sql['Q4'], { var1: emailAddress })
        let findUser = await connection.query(s2)
        if (findUser.rowCount == 0) {
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')
                let s5 = dbScript(db_sql['Q45'], { var1: id, var2: mysql_real_escape_string(name), var3: checkPermission.rows[0].company_id, var4: avatar, var5: emailAddress, var6: mobileNumber, var7: encryptedPassword, var8: roleId, var9: mysql_real_escape_string(address) })
                let addUser = await connection.query(s5)
                let _dt = new Date().toISOString();
                let s6 = dbScript(db_sql['Q33'], { var1: roleId, var2: addUser.rows[0].id, var3: _dt })
                let addPermission = await connection.query(s6)
                await connection.query('COMMIT')
                if (addUser.rowCount > 0 && addPermission.rowCount > 0) {
                    const payload = {
                        id: addUser.rows[0].id,
                        email: addUser.rows[0].email_address
                    }
                    let token = await issueJWT(payload)
                    link = `${process.env.AUTH_LINK}/reset-password/${token}`
                    if (process.env.isLocalEmail == 'true') {
                        await setPasswordMail2(emailAddress, link, name);
                        await connection.query('COMMIT')
                        res.json({
                            status: 201,
                            success: true,
                            message: `User created successfully and link send for set password on ${emailAddress} `
                        })
                    } else {
                        let emailSent = await setPasswordMail(emailAddress, link, name);
                        if (emailSent.status == 400) {
                            await connection.query('ROLLBACK')
                            res.json({
                                status: 400,
                                success: false,
                                message: "Something went wrong"
                            })
                        } else {
                            await connection.query('COMMIT')
                            res.json({
                                status: 201,
                                success: true,
                                message: `User created successfully and link send for set password on ${emailAddress} `
                            })
                        }
                    }
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
                message: "User already exists"
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
        let id = req.user.id
        let { userId } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: id })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view) {
            let s4 = dbScript(db_sql['Q8'], { var1: userId })
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
        let userId = req.user.id
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view) {

            let s4 = dbScript(db_sql['Q15'], { var1: checkPermission.rows[0].company_id })
            let findUsers = await connection.query(s4);
            if (findUsers.rows.length > 0) {
                for (data of findUsers.rows) {
                    let s5 = dbScript(db_sql['Q12'], { var1: data.role_id })
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
        let id = req.user.id
        let {
            userId,
            emailAddress,
            name,
            mobileNumber,
            address,
            roleId,
            avatar
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: id })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_update) {

            let _dt = new Date().toISOString();
            await connection.query('BEGIN')
            let s4 = dbScript(db_sql['Q22'], { var1: emailAddress, var2: mysql_real_escape_string(name), var3: mobileNumber, var4: mysql_real_escape_string(address), var5: roleId, var6: userId, var7: _dt, var8: avatar, var9: checkPermission.rows[0].company_id })
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
        let id = req.user.id
        let {
            userId,
            isLocked
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: id })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_update) {
            let _dt = new Date().toISOString();
            await connection.query('BEGIN')
            let s4 = dbScript(db_sql['Q30'], { var1: isLocked, var2: userId, var3: _dt })
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
        let id = req.user.id
        let {
            userId
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: id })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_delete) {
            let _dt = new Date().toISOString();
            await connection.query('BEGIN')
            let s4 = dbScript(db_sql['Q23'], { var1: _dt, var2: userId, var3: checkPermission.rows[0].company_id })
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
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}
