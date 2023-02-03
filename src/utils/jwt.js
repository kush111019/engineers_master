const jsonwebtoken = require("jsonwebtoken");
const { db_sql, dbScript } = require('../utils/db_scripts');
const connection = require('../database/connection')
const {getMinutesBetweenDates} = require('../utils/helper')

const jwt = {
    //create token
    issueJWT: async user => {
        let payload = {
            id: user.id,
            email: user.email
        };
        const jwtToken = await jsonwebtoken.sign(payload, 'KEy')
        let _dt = new Date().toISOString();
        let s1 = dbScript(db_sql['Q286'],{var1 : user.id, var2 : _dt})
        let addSessionTime = await connection.query(s1)
        return jwtToken;
    },
    //verify Token 
    verifyTokenFn: async (req, res, next) => {
        var token = req.headers.authorization
        await jsonwebtoken.verify(token, 'KEy', function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: "Session timed out. Please sign in again",
                });
            } else {
                req.user = {
                    id: decoded.id,
                    email: decoded.email,
                }
                const checkLocked = async (id) => {
                    try {
                        let s1 = dbScript(db_sql['Q8'], { var1: id });
                        let findUser = await connection.query(s1);
                        let s2 = dbScript(db_sql['Q9'], { var1: findUser.rows[0].company_id });
                        let checkCompany = await connection.query(s2);
                        return !checkCompany.rows[0].is_locked;
                    } catch (error) {
                        console.error(error);
                        return false;
                    }
                };
                (async () => {
                    let check = await checkLocked(req.user.id);
                    if (!check) {
                        return res.status(401).json({
                            success: false,
                            message: "Session timed out. Please sign in again",
                        });
                    } else {
                        let s1 = dbScript(db_sql['Q8'],{var1 : req.user.id})
                        let findSessionTime = await connection.query(s1)
                        if(findSessionTime.rowCount > 0){

                            let date1 = findSessionTime.rows[0].session_time ? new Date(findSessionTime.rows[0].session_time ) : new Date()
                            let date2 = new Date()
                            let difference = await getMinutesBetweenDates(date1, date2)
                            if(Number(difference) >= process.env.EXPIRES_IN){
                                return res.status(401).json({
                                    success: false,
                                    message: "Session timed out. Please sign in again",
                                });
                            }else{
                                let _dt = new Date().toISOString()
                                let s2 = dbScript(db_sql['Q286'],{var1 : req.user.id, var2 : _dt})
                                let updateSessionTime = await connection.query(s2)
                                return next();
                            }
                        }else{
                            return res.status(401).json({
                                success: false,
                                message: "Session timed out. Please sign in again",
                            });
                        }
                    }
                })();
            }
        });
    },

    verifyTokenFn1: async (req, res, next) => {
        var token = req.headers.authorization
        await jsonwebtoken.verify(token, 'KEy', function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: "Session timed out. Please sign in again",
                });
            } else {
                req.user = {
                    id: decoded.id,
                    email: decoded.email,
                }
                return next();
            }
        });
    }
};
module.exports = jwt;

