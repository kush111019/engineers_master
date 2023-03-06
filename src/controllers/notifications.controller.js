const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const { instantNotificationsList } = require('../utils/helper')

module.exports.notificationList = async (req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q290'], { var1: userId })
        let notificationList = await connection.query(s1);
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
        let s1 = dbScript(db_sql['Q291'], { var1: notificationId })
        let notificationList = await connection.query(s1);
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


module.exports.instantNotificationsList = async (req, res) => {
    try {
        let userId = req.user.id
        await connection.query('BEGIN')
        // let s1 = dbScript(db_sql['Q290'], { var1: userId })
        // let notificationList = await connection.query(s1);
        let checkNotification = await instantNotificationsList(req.body, 'socket')
        console.log(checkNotification, 'checkNotification')
        if (checkNotification) {
            checkNotification.forEach(element => {
                console.log(element.user_id)
            });
            await connection.query('COMMIT')
            res.json({
                status: 200,
                success: true,
                message: "Notification List",
                data: checkNotification
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