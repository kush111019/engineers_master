const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const { getUserAndSubUser, notificationsOperations } = require('../utils/helper')
const moduleName = process.env.FORECAST_MODULE
const moment = require('moment');

module.exports.createRevenueForecast = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            timeline,
            amount,
            startDate,
            endDate,
            assignedTo,
            type,
            forecastData
        } = req.body
        await connection.query('BEGIN')
        //checking permission to create for user
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_create) {
            let pId = 0;
            //Inserting forecast into forecast table
            let s2 = dbScript(db_sql['Q67'], { var1: timeline, var2: amount, var3: startDate, var4: endDate, var5: pId, var6: userId, var7: userId })
            let createForecast = await connection.query(s2)
            //if forecast inserted into forecast table then
            if (createForecast.rowCount > 0) {
                //inserting the forecast data into forecast_data table
                for (let data of forecastData) {
                    let s3 = dbScript(db_sql['Q294'], { var1: createForecast.rows[0].id, var2: data.amount, var3: data.startDate, var4: data.endDate, var5: type, var6: userId })
                    let addForecastData = await connection.query(s3)
                }
                // Checking if assigned users length > 0 then
                if (assignedTo.length > 0) {
                    // adding assigned users forecast
                    for (let data of assignedTo) {
                        let notification_userId = [];
                        notification_userId.push(data.userId)
                        let pId = createForecast.rows[0].id
                        let s4 = dbScript(db_sql['Q67'], { var1: timeline, var2: data.amount, var3: startDate, var4: endDate, var5: pId, var6: data.userId, var7: req.user.id })
                        let createForecastForAssignedUsers = await connection.query(s4)

                        // add notification in notification list
                        let notification_typeId = createForecastForAssignedUsers.rows[0].id;
                        await notificationsOperations({ type: 3, msg: 3.1, notification_typeId, notification_userId }, userId);
                    }
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: 'Forecast created successfully'
                    })
                } else {
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: 'Forecast created successfully'
                    })
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
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }

}

module.exports.revenueForecastList = async (req, res) => {
    try {
        let userId = req.user.id
        // Checking permission for role user with module name and user id.
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_view_global) {
            // Getting forecast list by user Id
            let s3 = dbScript(db_sql['Q68'], { var1: userId });
            let revenueForecastList = await connection.query(s3);
            if (revenueForecastList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Forecast list',
                    data: revenueForecastList.rows
                });
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Empty forecast list',
                    data: []
                });
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            //Getting all the child and parent of Role
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0])
            // Getting forecast list for all child and parents.
            let s3 = dbScript(db_sql['Q174'], { var1: roleUsers.join(",") })
            let revenueForecastList = await connection.query(s3)
            if (revenueForecastList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Forecast list',
                    data: revenueForecastList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Empty revenue forecast list',
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

module.exports.forecastDetails = async (req, res) => {
    try {
        let userId = req.user.id
        let { forecastId } = req.query
        // Getting forecast list by user Id.
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let s3 = dbScript(db_sql['Q306'], { var1: forecastId });
            let revenueForecastList = await connection.query(s3);
            if (revenueForecastList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Forecast details',
                    data: revenueForecastList.rows
                });
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Empty forecast details',
                    data: []
                });
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

module.exports.editRevenueForecast = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            forecastId,
            timeline,
            amount,
            startDate,
            endDate,
            forecastData,
            assignedForecast
        } = req.body
        //add notification deatils
        let notification_userId = [];
        let notification_typeId = forecastId;
        if (assignedForecast.length > 0) {
            for (let sid of assignedForecast) {
                notification_userId.push(sid.userId)
            }
            notification_userId.push(userId)
        } else {
            notification_userId.push(userId)
        }

        await connection.query('BEGIN')
        // Checking permission for role user with module name and user id.
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {
            let _dt = new Date().toISOString()
            // Updating forecast with forecast id.
            let s2 = dbScript(db_sql['Q199'], { var1: forecastId, var2: timeline, var3: amount, var4: startDate, var5: endDate, var6: _dt })
            let updateForecast = await connection.query(s2)
            if (updateForecast.rowCount > 0) {
                if (forecastData.length > 0) {
                    let s3 = dbScript(db_sql['Q305'], { var1: forecastId, var2:_dt })
                    let updateForecastData = await connection.query(s3)
                    for (let data of forecastData) {
                            let s4 = dbScript(db_sql['Q294'], { var1: forecastId, var2: data.amount, var3: data.startDate, var4: data.endDate, var5: data.type, var6: userId })
                            let addForecastData = await connection.query(s4)
                    }
                }
                if (assignedForecast.length > 0) {
                    for (let af of assignedForecast) {
                        if (af.id) {
                            let s3 = dbScript(db_sql['Q307'], { var1: af.id, var2: af.amount, var3: af.userId })
                            let updateAssignedForecast = await connection.query(s3)
                        } else {
                            let s4 = dbScript(db_sql['Q67'], { var1: timeline, var2: af.amount, var3: startDate, var4: endDate, var5: forecastId, var6: af.userId, var7: userId })
                            let addAssignedForecast = await connection.query(s4)
                        }
                    }
                }
                // add notification in notification list
                await notificationsOperations({ type: 3, msg: 3.2, notification_typeId, notification_userId }, userId);

                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: 'Forecast updated successfully'
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

module.exports.auditForecast = async (req, res) => {
    try {
        let userId = req.user.id
        let { forecastId, pid, reason, amount, forecastAmount } = req.body

        //add notification deatils
        let notification_userId;
        let notification_typeId = forecastId;

        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {
            let s2 = dbScript(db_sql['Q308'], { var1: forecastId, var2: amount, var3: reason, var4: userId , var5 :pid, var6 : forecastAmount})
            let createAudit = await connection.query(s2)

            let s3 = dbScript(db_sql['Q306'], { var1: forecastId });
            let revenueForecastList = await connection.query(s3);
            if (createAudit.rowCount > 0) {
                // add notification in notification list
                notification_userId = [revenueForecastList.rows[0].created_by];
                await notificationsOperations({ type: 3, msg: 3.3, notification_typeId, notification_userId }, userId);
                res.json({
                    status: 200,
                    success: true,
                    message: "Forecast audited successfully"
                })
            } else {
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
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.deleteRevenueForecast = async (req, res) => {
    try {
        let userId = req.user.id
        let { forecastId } = req.query
        //add notification deatils
        let notification_userId = [];
        let notification_typeId = forecastId;

        await connection.query('BEGIN')
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_delete) {
            let _dt = new Date().toISOString();
            let s3 = dbScript(db_sql['Q198'], { var1: _dt, var2: forecastId })
            let deleteForecast = await connection.query(s3)

            let s4 = dbScript(db_sql['Q310'], { var1: _dt, var2: forecastId })
            let deleteForecastData = await connection.query(s4)
            if (deleteForecast.rowCount > 0) {
                // add notification in notification list
                if (deleteForecast.rows.length > 0) {
                    for (let sid of deleteForecast.rows) {
                        notification_userId.push(sid.assigned_to)
                    }
                } else {
                    notification_userId.push(userId)
                }
                await notificationsOperations({ type: 3, msg: 3.4, notification_typeId, notification_userId }, userId);

                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Forecast deleted successfully"
                })
            } else {
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong!"
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

module.exports.deleteAssignedUserForecast = async (req, res) => {
    try {
        let userId = req.user.id
        let { assignedUserId, forecastId } = req.query
        //add notification deatils
        let notification_userId = [assignedUserId];
        let notification_typeId = forecastId;

        await connection.query('BEGIN')
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_delete) {
            let _dt = new Date().toISOString();
            let s3 = dbScript(db_sql['Q309'], { var1: _dt, var2: assignedUserId, var3: forecastId })
            let deleteAssignedUser = await connection.query(s3)
            let s4 = dbScript(db_sql['Q310'], { var1: _dt, var2: forecastId })
            let deleteForecastData = await connection.query(s4)

            if (deleteAssignedUser.rowCount > 0) {
                // add notification in notification list
                await notificationsOperations({ type: 3, msg: 3.4, notification_typeId, notification_userId }, userId);

                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Assigned user deleted successfully"
                })
            } else {
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong!"
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

module.exports.actualVsForecast = async (req, res) => {
    try {
        let userId = req.user.id
        let { forecastId } = req.query
        await connection.query('BEGIN')
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let s3 = dbScript(db_sql['Q311'], { var1: forecastId })
            console.log(s3)
            let forecastData = await connection.query(s3)
            if (forecastData.rowCount > 0) {
                for (let data of forecastData.rows) {
                    let amount = 0
                    if (data.sales_data) {
                        for (let id of data.sales_data) {
                            let s2 = dbScript(db_sql['Q300'], { var1: id })
                            let recognizedRevenueData = await connection.query(s2)
                            amount = (recognizedRevenueData.rowCount > 0) ? amount + Number(recognizedRevenueData.rows[0].amount) : amount
                        }
                        data.recognized_amount = amount
                    } else {
                        data.recognized_amount = 0
                    }
                }
                res.json({
                    status: 200,
                    success: true,
                    message: "Forecast Data",
                    data: forecastData.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty forecast Data",
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
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}