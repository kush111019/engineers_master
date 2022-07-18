const connection = require('../database/connection')
const uuid = require("node-uuid")
const { issueJWT } = require("../utils/jwt")
const { resetPasswordMail } = require("../utils/sendMail")
const { db_sql, dbScript } = require('../utils/db_scripts');

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        s1 = dbScript(db_sql['Q11'], { var1: email })
        let admin = await connection.query(s1)
        if (admin.rows.length > 0) {
            if (admin.rows[0].encrypted_password == password) {
                let jwtToken = await issueJWT(admin.rows[0]);
                res.send({
                    status: 200,
                    success: true,
                    message: "Login successfull",
                    data: {
                        token :jwtToken
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

let create = async (bodyData, cId, res) => {
    let id = uuid.v4()
    let {
        name,
        avatar,
        emailAddress,
        contact,
        encryptedPassword,
        role_id
    } = bodyData
    s3 = dbScript(db_sql['Q4'], { var1: emailAddress })
    let findUser = await connection.query(s3)
    if (findUser.rows.length == 0) {
        await connection.query('BEGIN')
        s4 = dbScript(db_sql['Q3'], { var1: id, var2: name, var3: cId, var4: avatar, var5: emailAddress, var6: contact, var7: encryptedPassword, var9 : role_id })
        let saveuser = await connection.query(s4)
        await connection.query('COMMIT')
        if (saveuser.rowCount > 0) {
            const payload = {
                id: saveuser.rows[0].id,
                email: saveuser.rows[0].email_address
            }
            let token = await issueJWT(payload)
            link = `localhost:3000/auth/reset-password/${token}`
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
        return res.json({
            status: 200,
            success: false,
            message: "user Already Exists",
            data: ""
        })
    }

}

let createAdmin = async (bodyData, cId, res) => {
    let id = uuid.v4()
    let module_id = ""
    let {
        name,
        avatar,
        emailAddress,
        contact,
        encryptedPassword
    } = bodyData
    s3 = dbScript(db_sql['Q4'], { var1: emailAddress })
    let findUser = await connection.query(s3)
    if (findUser.rows.length == 0) {
        await connection.query('BEGIN')
        let rollId = uuid.v4()
        s4 = dbScript(db_sql['Q18'],{var1 : rollId, var2: cId} )
        let createRole = await connection.query(s4)
        let role_id = createRole.rows[0].id
        s5 = dbScript(db_sql['Q33'], {var1:id, var2:role_id, var3: module_id})
        let addPermission = await connection.query(s5)
        s6 = dbScript(db_sql['Q3'], { var1: id, var2: name, var3: cId, var4: avatar, var5: emailAddress, var6: contact, var7: encryptedPassword,var8: role_id})
        let saveuser = await connection.query(s6)
        await connection.query('COMMIT')
        if (createRole.rowCount>0 && addPermission.rowCount>0 && saveuser.rowCount > 0) {
            const payload = {
                id: saveuser.rows[0].id,
                email: saveuser.rows[0].email_address
            }
            let token = await issueJWT(payload)
            link = `localhost:3000/auth/reset-password/${token}`
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
        return res.json({
            status: 200,
            success: false,
            message: "user Already Exists",
            data: ""
        })
    }

}

module.exports.upload = async (req, res) => {
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

module.exports.addUser = async (req, res) => {
    try {
        let sAemail = req.user.email
        console.log(sAemail);
        let {
            companyName,
            companyLogo,
            companyAddress,
        } = req.body

        s1 = dbScript(db_sql['Q11'], { var1: sAemail })
        let checkSa = await connection.query(s1);
        if (checkSa.rows.length > 0) {
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
                await create(req.body, checkCompany.rows[0].id, res)
            }
        } else {
            res.json({
                status: 403,
                success: false,
                message: "Unathorized user",
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

module.exports.usersList = async (req, res) => {
    try {
        let email = req.user.email
        s1 = dbScript(db_sql['Q11'], { var1: email })
        let checkSuperAdmin = await connection.query(s1);
        if (checkSuperAdmin != 0) {
            s2 = dbScript(db_sql['Q15'], {})
            let findUsers = await connection.query(s2);
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
                    success: true,
                    message: "Empty Users list",
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

module.exports.showUserById = async (req, res) => {
    try {
        let sAEmail = req.user.email
        let {
            userId,
        } = req.body
        s1 = dbScript(db_sql['Q11'], { var1: sAEmail })
        let checkSuperAdmin = await connection.query(s1)
        if (checkSuperAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q12'], { var1: userId })
            let findUser = await connection.query(s2);
            if (findUser.rows.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'User data',
                    data: findUser.rows[0]
                })

            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "User not found",
                    data: []
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

module.exports.companiesList = async (req, res) => {
    try {
        let email = req.user.email

        s1 = dbScript(db_sql['Q11'], { var1: email })
        let checkSuperAdmin = await connection.query(s1);
        if (checkSuperAdmin != 0) {
            s2 = dbScript(db_sql['Q13'], {})
            let findCompanies = await connection.query(s2);
            if (findCompanies.rows.length > 0) {
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

module.exports.showCompanyById = async (req, res) => {
    try {
        let sAEmail = req.user.email
        let {
            companyId,
        } = req.body
        s1 = dbScript(db_sql['Q11'], { var1: sAEmail })
        let checkSuperAdmin = await connection.query(s1)
        if (checkSuperAdmin.rows.length > 0) {
            s2 = dbScript(db_sql['Q16'], { var1: companyId })
            let findUser = await connection.query(s2);
            if (findUser.rows.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Company data',
                    data: findUser.rows[0]
                })

            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Company not found",
                    data: []
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







