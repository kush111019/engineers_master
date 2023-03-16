const connection = require('../database/connection')
const { issueJWT } = require("../utils/jwt")
const {
    setPasswordMail,
    setPasswordMail2,
} = require("../utils/sendMail")
const { db_sql, dbScript } = require('../utils/db_scripts');
const { mysql_real_escape_string, getUserAndSubUser } = require('../utils/helper')
const moduleName = process.env.USERS_MODULE

//this fuction give us a user count
module.exports.userCount = async (req, res) => {
    try {
        let userId = req.user.id
        // here we are getting user deatils 
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            let s2 = dbScript(db_sql['Q15'], { var1: findAdmin.rows[0].company_id })
            let users = await connection.query(s2)

            //here we are getting a transection details and its limit 
            let s3 = dbScript(db_sql['Q97'], { var1: findAdmin.rows[0].company_id })
            let count = await connection.query(s3)

            //here we are getting a company details 
            let s4 = dbScript(db_sql['Q9'], { var1: findAdmin.rows[0].company_id })
            let userCount = await connection.query(s4)

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
                        message: 'Users limit reached, cannot add new users. Please contact your admin to increase the user license count'
                    })
                }
            } else if (userCount.rowCount > 0) {
                if (users.rowCount < userCount.rows[0].user_count) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Can add users'
                    })
                } else {
                    res.json({
                        status: 400,
                        success: false,
                        message: 'Users limit reached, cannot add new users. Please contact your admin to increase the user license count'
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

//this function is use for add new user in company 
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

        //let id = uuid.v4()
        // first check user email is exits in our data base or not
        let s2 = dbScript(db_sql['Q4'], { var1: emailAddress })
        let findUser = await connection.query(s2)
        if (findUser.rowCount == 0) {
            // here we are checking user permission 
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                //here we are checking roles
                let s4 = dbScript(db_sql['Q12'], { var1: roleId })
                let findRole = await connection.query(s4)
                let isAdmin = findRole.rows[0].role_name == 'Admin' ? true : false;

                // and user added in db and update there permission in db
                await connection.query('BEGIN')
                let s5 = dbScript(db_sql['Q45'], { var1: mysql_real_escape_string(name), var2: checkPermission.rows[0].company_id, var3: avatar, var4: emailAddress.toLowerCase(), var5: mobileNumber, var6: encryptedPassword, var7: roleId, var8: mysql_real_escape_string(address), var9: isAdmin, var10: userId })
                let addUser = await connection.query(s5)

                let _dt = new Date().toISOString();
                let s6 = dbScript(db_sql['Q33'], { var1: roleId, var2: addUser.rows[0].id, var3: _dt })
                let addPermission = await connection.query(s6)

                let s7 = dbScript(db_sql['Q277'], { var1: _dt, var2: checkPermission.rows[0].company_id })
                updateStatusInCompany = await connection.query(s7)


                if (addUser.rowCount > 0 && addPermission.rowCount > 0 && updateStatusInCompany.rowCount > 0) {
                    await connection.query('COMMIT')
                    const payload = {
                        id: addUser.rows[0].id,
                        email: addUser.rows[0].email_address
                    }
                    //here we are generate a token and send mail to user.
                    let token = await issueJWT(payload)
                    link = `${process.env.AUTH_LINK}/reset-password/${token}`
                    if (process.env.isLocalEmail == 'true') {
                        await setPasswordMail2(emailAddress, link, name);
                        await connection.query('COMMIT')
                        res.json({
                            status: 201,
                            success: true,
                            message: `User created successfully and link send for set password on ${emailAddress.toLowerCase()} `,
                            data : addUser.rows[0]
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
                                message: `User created successfully and link send for set password on ${emailAddress} `,
                                data : addUser.rows[0]
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
                message: "Email already exists"
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

// with the help of this function we can resend verification link on email address
module.exports.resendVerificationLink = async (req, res) => {
    try {
        let { userId } = req.query
        //here we are fetching user details
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findUser = await connection.query(s1)
        if (findUser.rowCount > 0) {
            const payload = {
                id: findUser.rows[0].id,
                email: findUser.rows[0].email_address
            }
            // generate token and resend mail on user email address
            let token = await issueJWT(payload)
            link = `${process.env.AUTH_LINK}/reset-password/${token}`
            if (process.env.isLocalEmail == 'true') {
                await setPasswordMail2(findUser.rows[0].email_address, link, findUser.rows[0].full_name);
                res.json({
                    status: 200,
                    success: true,
                    message: `Verification link send for set password on ${findUser.rows[0].email_address.toLowerCase()} `
                })
            } else {
                let emailSent = await setPasswordMail(findUser.rows[0].email_address, link, findUser.rows[0].full_name);
                if (emailSent.status == 400) {
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: `Verification link send for set password on ${emailAddress.toLowerCase()}  `
                    })
                }
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "User not found"
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

module.exports.showUserById = async (req, res) => {
    try {
        let id = req.user.id
        let { userId } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: id })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
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

//get all user list of any company in that function 
module.exports.usersList = async (req, res) => {
    try {
        let userId = req.user.id
        // here we are getting user permission's
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            //check user's on the basis of company id
            let s4 = dbScript(db_sql['Q15'], { var1: checkPermission.rows[0].company_id })
            let findUsers = await connection.query(s4);
            if (findUsers.rows.length > 0) {
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
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let s3 = dbScript(db_sql['Q272'], { var1: roleUsers.join(",") })
            let userList = await connection.query(s3);
            if (userList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Users list',
                    data: userList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty Users list',
                    data: []
                })
            }
        } else {
            res.status(403).json({
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

//get perticuler user all details by user id 
module.exports.usersDetails = async (req, res) => {
    try {
        let userId = req.user.id
        let user_id = req.query.id;
        //check user permission's
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        //get user details on behalf of user and company id 
        let s4 = dbScript(db_sql['Q250'], { var1: checkPermission.rows[0].company_id, var2: user_id })

        let findUsers = await connection.query(s4);
        if (findUsers.rows.length > 0) {
            res.json({
                status: 200,
                success: true,
                message: 'Users details',
                data: findUsers.rows
            })
        } else {
            res.json({
                status: 200,
                success: false,
                message: "Empty users details",
                data: []
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

//user can update user details on behalf of user id 
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
        //get user all permission's 
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: id })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_update) {

            let s5 = dbScript(db_sql['Q12'], { var1: roleId })
            let findRole = await connection.query(s5)
            let isAdmin = findRole.rows[0].role_name == 'Admin' ? true : false;

            let _dt = new Date().toISOString();
            await connection.query('BEGIN')

            //update user details
            let s4 = dbScript(db_sql['Q22'], { var1: emailAddress, var2: mysql_real_escape_string(name), var3: mobileNumber, var4: mysql_real_escape_string(address), var5: roleId, var6: userId, var7: _dt, var8: avatar, var9: checkPermission.rows[0].company_id, var10: isAdmin })
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

//with the help of user id we can lock user and block its permissions 
module.exports.lockUserAccount = async (req, res) => {
    try {
        let id = req.user.id
        let {
            userId,
            isLocked
        } = req.body
        //get user all permission's
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: id })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {
            let _dt = new Date().toISOString();
            //update user status is locked here
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

// with this function we can delete a user 
module.exports.deleteUser = async (req, res) => {
    try {
        let id = req.user.id
        let {
            userId
        } = req.body
        //check user all permission's
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: id })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_delete) {
            let _dt = new Date().toISOString();
            await connection.query('BEGIN')
            //update user status to deleted
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

module.exports.deactivateUserAccount = async (req, res) => {
    try {
        let id = req.user.id
        let {
            userId,
            isDeactivated
        } = req.body
        //get user all permission's
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: id })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {
            let s2 = dbScript(db_sql['Q307'],{var1 : userId})
            let findUserInSales = await connection.query(s2)
            console.log(findUserInSales.rowCount);
            let s3 = dbScript(db_sql['Q308'],{var1 : userId})
            let findUserInLeads = await connection.query(s3)
            console.log(findUserInLeads.rowCount);

            if(findUserInSales.rowCount == 0 && findUserInLeads.rowCount == 0){
                let _dt = new Date().toISOString();
                //update user status is locked here
                let s4 = dbScript(db_sql['Q311'], { var1: isDeactivated, var2: userId, var3: _dt })
                let updateUser = await connection.query(s4)
                
                if (updateUser.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "user deactivated successfully"
                    })
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "something went wrong"
                    })
                }
            }else{
                await connection.query('ROLLBACK')
                res.json({
                    status: 200,
                    success: false,
                    message: "Can not deactivate User because user has assinged Lead/Sales"
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

module.exports.AssigneSaleOrLeadToNewUser = async (req, res) => {
    try {
        let id = req.user.id
        let {
            userId,
            newUserId
        } = req.body
        //get user all permission's
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: id })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {
            let s2 = dbScript(db_sql['Q309'],{var1 : userId, var2 : newUserId})
            let updateUserInSales = await connection.query(s2)

            let s3 = dbScript(db_sql['Q310'],{var1 : userId,  var2 : newUserId})
            let updateUserInLeads = await connection.query(s3)

            if(updateUserInSales.rowCount > 0 || updateUserInLeads.rowCount > 0){
                await connection.query('COMMIt')
                res.json({
                    status: 200,
                    success: true,
                    message: "new user assigned successfully"
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



