const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');

module.exports.notificationList = async (req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q290'], { var1: userId })
        console.log(s1,'s1')
        let notificationList = await connection.query(s1);
        console.log(notificationList.rows)
        await connection.query('BEGIN')
        if (notificationList.rows.length > 0) {
            await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Notification List",
                    data: notificationList.rows
                })
    
        } else {
            res.json({
                status: 200,
                success: false,
                message: "Notification not found",
                data: []
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

module.exports.notificationRead = async (req, res) => {
    try {
        let userId = req.user.id;
        let notificationId = req.query.id;
        console.log(notificationId,'notificationId')
        let s1 = dbScript(db_sql['Q291'], { var1: notificationId })
        console.log(s1,'s1')
        let notificationList = await connection.query(s1);
        console.log(notificationList.rows)
        await connection.query('BEGIN')
        if (notificationList.rows.length > 0) {
            await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Notification Readed Sucessfully",
                    data: notificationList.rows
                })
        } else {
            res.json({
                status: 200,
                success: false,
                message: "Notification not found",
                data: []
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