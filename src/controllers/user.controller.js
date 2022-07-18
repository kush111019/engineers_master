const connection = require('../database/connection')
const { issueJWT } = require("../utils/jwt")
const { resetPasswordMail } = require("../utils/sendMail")
const { db_sql, dbScript } = require('../utils/db_scripts');
const jsonwebtoken = require("jsonwebtoken");

let verifyTokenFn = async (req) => {
      let {token} = req.body              
      let user = await jsonwebtoken.verify(token, 'KEy', function(err, decoded)
      {                     
          if (err) {   
            return 0
          }   else {                          
              var decoded = {
                  id: decoded.id,  
                  email: decoded.email,               
              };
              return decoded;
          }
      });
      return user
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
        let user = await connection.query(s1)
        console.log(user);
        if (user.rows.length > 0) {
                if (user.rows[0].encrypted_password == password) {
                    let payload = {
                        id : user.rows[0].id,
                        email : user.rows[0].email_address,
                    }
                    let jwtToken = await issueJWT(payload);
                    res.send({
                        status: 200,
                        success: true,
                        message: "Login successfull",
                        data: {
                            token: jwtToken
                        }
                    });
                } else {
                    res.json({
                        status: 200,
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

module.exports.upload = async(req,res)=>{
    try {
        let file = req.file
            let path = `http:/localhost:3003/avatar/${file.originalname}`;
            res.json({
                success: true,
                status: 201,
                message : "Avatar uploaded successfully!",
                data: path
            })   
    } catch (error) {
        res.json({
            success: false,
            status: 400,
            message: error.message,
            data: ""
        })
    }
}

module.exports.showProfile = async (req, res) => {
    try {
        let userEmail = req.user.email
        s1 = dbScript(db_sql['Q6'], { var1: userEmail })
        let checkUser = await connection.query(s1)
        if (checkUser.rows.length > 0) {
            res.json({
                status: 200,
                success: true,
                message: 'user data',
                data: checkUser.rows[0]
            })
        } else {
            res.json({
                status: 400,
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

module.exports.updateUserProfile = async (req, res) => {
    try {
        let userMail = req.user.email
        let {
            name,
            avatar
        } = req.body

        s1 = dbScript(db_sql['Q4'], { var1: userMail })
        let findUser = await connection.query(s1)

        if(findUser.rows.length>0){

                _dt = new Date().toISOString();
                s2 = dbScript(db_sql['Q17'], { var1:name, var2:avatar, var3 : _dt , var4: userMail})
                let updateUser = await connection.query(s2)

                if (updateUser.rowCount > 0 ) {
                    res.json({
                        success: true,
                        status: 200,
                        message: 'user Updated Successfully',
                    })
                } else {
                    res.json({
                        success: false,
                        status: 400,
                        message: "Something Went Wrong",
                        data: ""
                    })
                }
          
        }else {
            res.json({
                success: false,
                status: 200,
                message: "user not found",
                data: ""
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

module.exports.changePassword = async (req, res) => {
    try {
        let userEmail = req.user.email
        const { oldPassword, newPassword } = req.body;
        s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let user = await connection.query(s1)
        if (user.rows.length > 0) {
            if (user.rows[0].encrypted_password == oldPassword) {
                _dt = new Date().toISOString();
                s2 = dbScript(db_sql['Q7'], { var1: userEmail, var2: newPassword, var3: _dt })
                let updatePass = await connection.query(s2)
                if (updatePass.rowCount > 0) {
                    res.send({
                        status: 200,
                        success: true,
                        message: "Password Changed Successfully!",
                    });
                } else {
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
        res.json({
            status: 500,
            success: false,
            message: error.message
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
                status: 200,
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
                _dt = new Date().toISOString();
                s2 = dbScript(db_sql['Q7'], { var1: user.email, var2: password, var3: _dt })
                let updateuser = await connection.query(s2)
                if (updateuser.rowCount == 1)
                    res.json({
                        status: 201,
                        success: true,
                        message: "Password Changed Successfully",
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
            status: 400,
            success: false,
            message: error.message,
            data: ""
        })
    }
}









