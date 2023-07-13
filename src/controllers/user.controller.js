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
            let uc = 0;
            users.rows.map(value => {
                if (value.is_deactivated == false) {
                    uc = uc + 1
                }
            })
            //here we are getting a transection details and its limit 
            let s3 = dbScript(db_sql['Q97'], { var1: findAdmin.rows[0].company_id })
            let count = await connection.query(s3)

            //here we are getting a company details 
            let s4 = dbScript(db_sql['Q9'], { var1: findAdmin.rows[0].company_id })
            let userCount = await connection.query(s4)

            if (count.rows.length > 0) {
                if (uc - 1 < count.rows[0].user_count) {
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
                if (uc < userCount.rows[0].user_count) {
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

module.exports.proUserCount = async (req, res) => {
    try {
        let userId = req.user.id
        // here we are getting user deatils 
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            let s2 = dbScript(db_sql['Q15'], { var1: findAdmin.rows[0].company_id })
            let users = await connection.query(s2)
            let puc = 0;
            users.rows.map(value => {
                if (value.is_deactivated == false && value.is_pro_user) {
                    puc = puc + 1
                }
            })
            //here we are getting a transection details and its limit 
            let s3 = dbScript(db_sql['Q97'], { var1: findAdmin.rows[0].company_id })
            let count = await connection.query(s3)

            //here we are getting a company details 
            let s4 = dbScript(db_sql['Q9'], { var1: findAdmin.rows[0].company_id })
            let userCount = await connection.query(s4)

            if (count.rows.length > 0) {
                if (puc < count.rows[0].pro_user_count) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Can add pro users'
                    })
                } else {
                    res.json({
                        status: 400,
                        success: false,
                        message: 'Users limit reached, cannot add new pro users. Please contact your admin to increase the user license count'
                    })
                }
            } else if (userCount.rowCount > 0) {
                if (puc < userCount.rows[0].pro_user_count) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Can add users'
                    })
                } else {
                    res.json({
                        status: 400,
                        success: false,
                        message: 'Users limit reached, cannot add pro users. Please contact your admin to increase the user license count'
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
            encryptedPassword,
            isProUser
        } = req.body

        await connection.query('BEGIN')
        avatar = (avatar == "") ? process.env.DEFAULT_LOGO : avatar;

        //let id = uuid.v4()
        // first check user email is exits in our data base or not
        let s2 = dbScript(db_sql['Q4'], { var1: mysql_real_escape_string(emailAddress) })
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
                let s5 = dbScript(db_sql['Q45'], { var1: mysql_real_escape_string(name), var2: checkPermission.rows[0].company_id, var3: avatar, var4: mysql_real_escape_string(emailAddress.toLowerCase()), var5: mobileNumber, var6: encryptedPassword, var7: roleId, var8: mysql_real_escape_string(address), var9: isAdmin, var10: userId, var11: isProUser })
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
                            data: addUser.rows[0]
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
                                data: addUser.rows[0]
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
        let status = "all"

        if (req?.query?.status) {
            status = (req?.query?.status == 'undefined' || req?.query?.status == undefined) ? 'all' : req?.query?.status;
        }
        // here we are getting user permission's
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            //check user's on the basis of company id
            let findUsers;
            if (status.toLowerCase() == 'all') {
                let s4 = dbScript(db_sql['Q15'], { var1: checkPermission.rows[0].company_id })
                findUsers = await connection.query(s4);
            }
            if (status.toLowerCase() == 'active') {
                let s4 = dbScript(db_sql['Q314'], { var1: checkPermission.rows[0].company_id, var2: false })
                findUsers = await connection.query(s4);
            }
            if (status.toLowerCase() == 'deactive') {
                let s4 = dbScript(db_sql['Q314'], { var1: checkPermission.rows[0].company_id, var2: true })
                findUsers = await connection.query(s4);
            }

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
            let userList;
            if (status.toLowerCase() == 'all') {
                let s3 = dbScript(db_sql['Q272'], { var1: roleUsers.join(",") })
                userList = await connection.query(s3);
            }
            if (status.toLowerCase() == 'active') {
                let s4 = dbScript(db_sql['Q315'], { var1: roleUsers.join(","), var2: false })
                console.log(s4, "s4");
                userList = await connection.query(s4);
            }
            if (status.toLowerCase() == 'deactive') {
                let s4 = dbScript(db_sql['Q315'], { var1: roleUsers.join(","), var2: true })
                userList = await connection.query(s4);
            }
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
            avatar,
            isProUser
        } = req.body

        await connection.query('BEGIN')
        //get user all permission's 
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: id })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_update) {

            let s5 = dbScript(db_sql['Q12'], { var1: roleId })
            let findRole = await connection.query(s5)
            console.log(findRole.rows, "find role");
            let isAdmin = findRole.rows[0].role_name == 'Admin' ? true : false;

            let _dt = new Date().toISOString();

            //update user details
            let s4 = dbScript(db_sql['Q22'], { var1: mysql_real_escape_string(emailAddress), var2: mysql_real_escape_string(name), var3: mobileNumber, var4: mysql_real_escape_string(address), var5: roleId, var6: userId, var7: _dt, var8: avatar, var9: checkPermission.rows[0].company_id, var10: isAdmin, var11: isProUser })
            let updateUser = await connection.query(s4)
            if (updateUser.rowCount > 0) {
            await connection.query('COMMIT')
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
                    message: "Something went wrongOr User is deactivated"
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
            message: error.stack,
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
            if (updateUser.rowCount > 0) {
            await connection.query('COMMIT')
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

        await connection.query('BEGIN')
        //check user all permission's
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: id })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_delete) {
            let _dt = new Date().toISOString();
            //update user status to deleted
            let s4 = dbScript(db_sql['Q23'], { var1: _dt, var2: userId, var3: checkPermission.rows[0].company_id })
            let updateUser = await connection.query(s4)

            if (updateUser.rowCount > 0) {
                await connection.query('COMMIT')
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
            if (isDeactivated == true) {
                let s2 = dbScript(db_sql['Q307'], { var1: userId })
                let findUser = await connection.query(s2)
                if (findUser.rows.length > 0 &&
                    (
                        findUser.rows[0].role_data ||
                        findUser.rows[0].users_data ||
                        // findUser.rows[0].sales_data ||
                        findUser.rows[0].sales_users ||
                        findUser.rows[0].customer_companies ||
                        findUser.rows[0].customer_company_employees ||
                        findUser.rows[0].products_data ||
                        findUser.rows[0].slabs_data ||
                        findUser.rows[0].commission_split_data ||
                        findUser.rows[0].marketing_budget_data ||
                        findUser.rows[0].marketing_budget_data_data ||
                        findUser.rows[0].marketing_budget_description_data ||
                        findUser.rows[0].chat_data ||
                        findUser.rows[0].chat_room_members_data ||
                        findUser.rows[0].forecast_data ||
                        findUser.rows[0].forecast_audit_data ||
                        findUser.rows[0].forecast_data_data ||
                        findUser.rows[0].recognized_revenue_data ||
                        findUser.rows[0].user_availability_data ||
                        findUser.rows[0].pro_scheduled_events_data ||
                        findUser.rows[0].pro_user_events_data ||
                        findUser.rows[0].pro_user_time_slot_data
                    )
                ) {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 200,
                        success: false,
                        message: "Assigned to another user because current user has existing tasks.",
                        data: findUser.rows[0]
                    })
                } else {
                    let _dt = new Date().toISOString();
                    //update user status is locked here
                    let s4 = dbScript(db_sql['Q311'], { var1: isDeactivated, var2: userId, var3: _dt, var4: 'null' })
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
                }
            } else {
                let s2 = dbScript(db_sql['Q15'], { var1: checkPermission.rows[0].company_id })
                let users = await connection.query(s2)
                let uc = 0;
                users.rows.map(value => {
                    if (value.is_deactivated == false) {
                        uc = uc + 1
                    }
                })
                //here we are getting a transection details and its limit 
                let s3 = dbScript(db_sql['Q97'], { var1: checkPermission.rows[0].company_id })
                let count = await connection.query(s3)

                //here we are getting a company details 
                let s4 = dbScript(db_sql['Q9'], { var1: checkPermission.rows[0].company_id })
                let userCount = await connection.query(s4)

                if (count.rows.length > 0) {
                    if (uc - 1 < count.rows[0].user_count) {
                        let _dt = new Date().toISOString();
                        let s4 = dbScript(db_sql['Q311'], { var1: isDeactivated, var2: userId, var3: _dt })
                        let updateUser = await connection.query(s4)
                        await connection.query('COMMIT')
                        res.json({
                            status: 200,
                            success: true,
                            message: 'User activated successfully'
                        })
                    } else {
                        await connection.query('ROLLBACK')
                        res.json({
                            status: 400,
                            success: false,
                            message: 'Users limit reached, cannot activate user. Please contact your admin to increase the user license count'
                        })
                    }
                } else if (userCount.rowCount > 0) {
                    if (uc < userCount.rows[0].user_count) {

                        let _dt = new Date().toISOString();
                        let s4 = dbScript(db_sql['Q311'], { var1: isDeactivated, var2: userId, var3: _dt })
                        let updateUser = await connection.query(s4)
                        await connection.query('COMMIT')
                        res.json({
                            status: 200,
                            success: true,
                            message: 'User activated successfully'
                        })
                    } else {
                        await connection.query('ROLLBACK')
                        res.json({
                            status: 400,
                            success: false,
                            message: 'Users limit reached, cannot activate user. Please contact your admin to increase the user license count'
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Empty User List'
                    })
                }
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
            newUserId,
            isAssignProUser,
            userData
        } = req.body
        console.log(req.body);
        //get user all permission's
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: id })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {
            if (userData.roles_data) {
                let rolesIds = []
                userData.roles_data.map(item => {
                    rolesIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'roles', var2: 'user_id', var3: newUserId, var4: rolesIds.join(",") })
                let updateNewUserInRole = await connection.query(s2)
            }

            if (userData.users_data) {
                let userIds = []
                userData.users_data.map(item => {
                    userIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'users', var2: 'created_by', var3: newUserId, var4: userIds.join(",") })
                let updateNewUserInUsers = await connection.query(s2)

            }
            // if (userData.sales_data) {
            //     let salesIds = []
            //     userData.sales_data.map(item => {
            //         salesIds.push("'" + item.toString() + "'")
            //     })
            //     let s2 = dbScript(db_sql['Q309'], { var1: 'sales', var2: 'user_id', var3: newUserId, var4: salesIds.join(",") })
            //     let updateNewUserInSales = await connection.query(s2)
            // }
            if (userData.sales_users) {
                let salesUsersIds = []
                userData.sales_users.map(item => {
                    salesUsersIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'sales_users', var2: 'user_id', var3: newUserId, var4: salesUsersIds.join(",") })
                let updateNewUserInSalesUsers = await connection.query(s2)
            }
            if (userData.customer_companies) {
                let customerCompaniesIds = []
                userData.customer_companies.map(item => {
                    customerCompaniesIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'customer_companies', var2: 'user_id', var3: newUserId, var4: customerCompaniesIds.join(",") })
                let updateNewUserInCustomerCompanies = await connection.query(s2)
            }
            if (userData.customer_company_employees) {
                let customerCompaniesEmpIds = []
                userData.customer_company_employees.map(item => {
                    customerCompaniesEmpIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q310'], { var1: 'customer_company_employees', var2: 'assigned_sales_lead_to', var3: newUserId, var4: customerCompaniesEmpIds.join(","), var5: 'assigned_sales_lead_to', var6: userId })
                let updateNewUserInAssignedCustomerCompaniesEmployees = await connection.query(s2)
            }
            if (userData.customer_company_employees) {
                let customerCompaniesEmpIds = []
                userData.customer_company_employees.map(item => {
                    customerCompaniesEmpIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q310'], { var1: 'customer_company_employees', var2: 'creator_id', var3: newUserId, var4: customerCompaniesEmpIds.join(","), var5: 'creator_id', var6: userId })
                let updateNewUserInCustomerCompaniesEmployees = await connection.query(s2)
            }
            if (userData.products_data) {
                let productIds = []
                userData.products_data.map(item => {
                    productIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'products', var2: 'user_id', var3: newUserId, var4: productIds.join(",") })
                let updateNewUserInProducts = await connection.query(s2)
            }
            if (userData.slabs_data) {
                let slabIds = []
                userData.slabs_data.map(item => {
                    slabIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'slabs', var2: 'user_id', var3: newUserId, var4: slabIds.join(",") })
                let updateNewUserInSlabs = await connection.query(s2)
            }
            if (userData.commission_split_data) {
                let commissionIds = []
                userData.commission_split_data.map(item => {
                    commissionIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'commission_split', var2: 'user_id', var3: newUserId, var4: commissionIds.join(",") })
                let updateNewUserInCommission = await connection.query(s2)
            }
            if (userData.marketing_budget_data) {
                let budgetIds = []
                userData.marketing_budget_data.map(item => {
                    budgetIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'marketing_budget', var2: 'created_by', var3: newUserId, var4: budgetIds.join(",") })
                let updateNewUserInMarketingBudget = await connection.query(s2)
            }
            if (userData.marketing_budget_data_data) {
                let budgetDataIds = []
                userData.marketing_budget_data_data.map(item => {
                    budgetDataIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'marketing_budget_data', var2: 'created_by', var3: newUserId, var4: budgetDataIds.join(",") })
                let updateNewUserInMarketingBudgetData = await connection.query(s2)
            }
            if (userData.marketing_budget_description_data) {
                let budgetDescriptionIds = []
                userData.marketing_budget_description_data.map(item => {
                    budgetDescriptionIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'marketing_budget_description', var2: 'user_id', var3: newUserId, var4: budgetDescriptionIds.join(",") })
                let updateNewUserInMarketingDescription = await connection.query(s2)
            }
            if (userData.chat_data) {
                let chatIds = []
                userData.chat_data.map(item => {
                    chatIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q310'], { var1: 'chat', var2: 'group_admin', var3: newUserId, var4: chatIds.join(","), var5: 'group_admin', var6: userId })
                let updateNewUserInGroupAdminChat = await connection.query(s2)
            }
            if (userData.chat_data) {
                let chatIds = []
                userData.chat_data.map(item => {
                    chatIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q310'], { var1: 'chat', var2: 'user_a', var3: newUserId, var4: chatIds.join(","), var5: 'user_a', var6: userId })
                let updateNewUserInUserAChat = await connection.query(s2)
            }
            if (userData.chat_data) {
                let chatIds = []
                userData.chat_data.map(item => {
                    chatIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q310'], { var1: 'chat', var2: 'user_b', var3: newUserId, var4: chatIds.join(","), var5: 'user_b', var6: userId })
                let updateNewUserInUserBChat = await connection.query(s2)
            }
            if (userData.chat_room_members_data) {
                let chatMembersIds = []
                userData.chat_room_members_data.map(item => {
                    chatMembersIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'chat_room_members', var2: 'user_id', var3: newUserId, var4: chatMembersIds.join(",") })
                let updateNewUserInChatRoomMembers = await connection.query(s2)
            }
            if (userData.forecast_data) {
                let forecastIds = []
                userData.forecast_data.map(item => {
                    forecastIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q310'], { var1: 'forecast', var2: 'created_by', var3: newUserId, var4: forecastIds.join(","), var5: 'created_by', var6: userId })
                let updateNewUserInForecastCreator = await connection.query(s2)
            }
            if (userData.forecast_data) {
                let forecastIds = []
                userData.forecast_data.map(item => {
                    forecastIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q310'], { var1: 'forecast', var2: 'assigned_to', var3: newUserId, var4: forecastIds.join(","), var5: 'assigned_to', var6: userId })
                let updateNewUserInForecast = await connection.query(s2)
            }
            if (userData.forecast_audit_data) {
                let forecastAuditIds = []
                userData.forecast_audit_data.map(item => {
                    forecastAuditIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'forecast_audit', var2: 'created_by', var3: newUserId, var4: forecastAuditIds.join(",") })
                let updateNewUserInAuditForecast = await connection.query(s2)
            }
            if (userData.forecast_data_data) {
                let forecastDataIds = []
                userData.forecast_data_data.map(item => {
                    forecastDataIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'forecast_data', var2: 'created_by', var3: newUserId, var4: forecastDataIds.join(",") })
                let updateNewUserInForecastData = await connection.query(s2)
            }
            if (userData.recognized_revenue_data) {
                let recognizedRevenueIds = []
                userData.recognized_revenue_data.map(item => {
                    recognizedRevenueIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'recognized_revenue', var2: 'user_id', var3: newUserId, var4: recognizedRevenueIds.join(",") })
                let updateNewUserInRecognizedRevenue = await connection.query(s2)
            }
            if (userData.user_availability_data) {
                let userAvailabilityIds = []
                userData.user_availability_data.map(item => {
                    userAvailabilityIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'pro_user_availability', var2: 'user_id', var3: newUserId, var4: userAvailabilityIds.join(",") })
                let updateNewUserInProUserAvailability = await connection.query(s2)
            }
            if (userData.pro_scheduled_events_data) {
                let scheduedEventIds = []
                userData.pro_scheduled_events_data.map(item => {
                    scheduedEventIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'pro_scheduled_events', var2: 'user_id', var3: newUserId, var4: scheduedEventIds.join(",") })
                let updateNewUserInProscheduedEvent = await connection.query(s2)
            }
            if (userData.pro_user_events_data) {
                let proUserEventsIds = []
                userData.pro_user_events_data.map(item => {
                    proUserEventsIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'pro_user_events', var2: 'user_id', var3: newUserId, var4: proUserEventsIds.join(",") })
                let updateNewUserInProUserEvents = await connection.query(s2)
            }
            if (userData.pro_user_time_slot_data) {
                let proUserTimeSlotIds = []
                userData.pro_user_time_slot_data.map(item => {
                    proUserTimeSlotIds.push("'" + item.toString() + "'")
                })
                let s2 = dbScript(db_sql['Q309'], { var1: 'pro_user_time_slot', var2: 'user_id', var3: newUserId, var4: proUserTimeSlotIds.join(",") })
                let updateNewUserInProUserTimeSlots = await connection.query(s2)
            }

            let _dt = new Date().toISOString();
            if(isAssignProUser){
            let s4 = dbScript(db_sql['Q422'], { var1: true, var2: newUserId, var3: _dt })
            let updateNewUser = await connection.query(s4)
            }

            let s4 = dbScript(db_sql['Q311'], { var1: true, var2: userId, var3: _dt, var4: newUserId })
            let updateUser = await connection.query(s4)
            if (updateUser.rowCount > 0) {
                await connection.query('COMMIT')
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



