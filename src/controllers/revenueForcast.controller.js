const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const {getMonthDifference, getYearDifference, paginatedResults} = require('../utils/helper')
const moduleName = process.env.FORECAST_MODULE

module.exports.createRevenueForecast = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            timeline,
            revenue,
            currency,
            growthWindow,
            growthPercentage,
            startDate,
            endDate
        } = req.body

        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_create) {
            await connection.query('BEGIN')

            let id = uuid.v4()
            let s4 = dbScript(db_sql['Q67'], { var1: id, var2: timeline, var3: revenue, var4: growthWindow, var5: growthPercentage, var6: startDate, var7: endDate, var8: checkPermission.rows[0].id, var9: checkPermission.rows[0].company_id, var10: currency })
            let createForecast = await connection.query(s4)
            if (createForecast.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: 'Revenue forecast created successfully'
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
        let userIds = []
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_view_global) {

            let s3 = dbScript(db_sql['Q68'], { var1: checkPermission.rows[0].company_id })
            let revenueForecastList = await connection.query(s3)

            if (revenueForecastList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Revenue forecast list',
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
        }else if(checkPermission.rows[0].permission_to_view_own){
            userIds.push(userId)
            let revenueForecastListArr = []
            let s3 = dbScript(db_sql['Q163'], { var1: checkPermission.rows[0].role_id })
            let findUsers = await connection.query(s3)
            if (findUsers.rowCount > 0) {
                for (user of findUsers.rows) {
                    userIds.push(user.id)
                }
            }
            for(let id of userIds){
                let s3 = dbScript(db_sql['Q174'], { var1: id })
                let revenueForecastList = await connection.query(s3)
                if(revenueForecastList.rowCount > 0){
                    for(let forecast of revenueForecastList.rows ){
                        revenueForecastListArr.push(forecast)
                    }
                }
            }
            if (revenueForecastListArr.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Revenue forecast list',
                    data: revenueForecastListArr
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

module.exports.deleteRevenueForecast = async (req, res) => {
    try {
        let userId = req.user.id
        let { revenueId } = req.query
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_delete) {
            await connection.query('BEGIN')

            let _dt = new Date().toISOString();
            let s3 = dbScript(db_sql['Q148'], { var1: _dt, var2: revenueId, var3: checkPermission.rows[0].company_id })
            let deleteRevenue = await connection.query(s3)

            if (deleteRevenue.rowCount > 0) {
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

module.exports.actualVsForecast = async (req, res) => {
    try {
        let { id, page } = req.query
        let userId = req.user.id
        let limit = 10;
        let offset = (page - 1) * limit;
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own ) {
            let actualVsForecastObj = {}
            let revenueData = [];
            let actualData = []
            let dateArr = []

            let s4 = dbScript(db_sql['Q69'], { var1: id, var2: checkPermission.rows[0].company_id })
            let forecastRevenue = await connection.query(s4)
            if (forecastRevenue.rowCount > 0) {
                let revenue = forecastRevenue.rows[0].revenue
                let growthWindow = forecastRevenue.rows[0].growth_window
                let growthPercentage = forecastRevenue.rows[0].growth_percentage
                let timeline = forecastRevenue.rows[0].timeline
                let startDate = forecastRevenue.rows[0].start_date
                let endDate = forecastRevenue.rows[0].end_date
                let toDate = new Date(startDate)
                toDate.setDate(toDate.getDate() + 1);
                let fromDate = new Date(endDate)
                fromDate.setDate(fromDate.getDate() + 1);
                let difference = await getMonthDifference(toDate, fromDate)
                let yearDifference = await getYearDifference(toDate, fromDate)
                let count = 0;
                switch (timeline) {
                    case 'Monthly':
                        let month = toDate.getMonth();
                        let firstDay = new Date(toDate.getFullYear(), month, 1).toISOString()
                        let lastDay =  new Date(toDate.getFullYear(),month + 1, 0).toISOString()
                        for (let i = 1; i <= difference; i++) {
                            let sum = 0
                            if (i == 1) {
                                dateArr.push(new Date(toDate))
                                revenueData.push(Number(revenue))
                                let s5 = dbScript(db_sql['Q78'], { var1: checkPermission.rows[0].company_id, var2: firstDay, var3 : lastDay, var4 : limit, var5 : offset })
                                let actualRevenue = await connection.query(s5)
                                if (actualRevenue.rowCount > 0) {
                                    actualRevenue.rows.map(index => {
                                        sum = sum + Number(index.target_amount);
                                    })
                                }
                                actualData.push(sum)
                            } else {
                                if (growthWindow != count+1) {
                                    month = month + 1;
                                    let firstDay = new Date(toDate.getFullYear(), month, 1).toISOString()
                                    let lastDay =  new Date(toDate.getFullYear(),month + 1, 0).toISOString()
                                    date = new Date(toDate.setMonth(toDate.getMonth() + 1));
                                    dateArr.push(date)
                                    revenueData.push(Number(Number(revenue).toFixed(2)))
                                    let s5 = dbScript(db_sql['Q78'], { var1: checkPermission.rows[0].company_id, var2: firstDay, var3 : lastDay, var4 : limit, var5 : offset })
                                    let actualRevenue = await connection.query(s5)
                                    if (actualRevenue.rowCount > 0) {
                                        actualRevenue.rows.map(index => {
                                            sum = sum + Number(index.target_amount);
                                        })
                                    }
                                    actualData.push(sum)
                                    count++;
                                } else {
                                    count = 0;
                                    month = month + 1;
                                    let firstDay = new Date(toDate.getFullYear(), month, 1).toISOString()
                                    let lastDay =  new Date(toDate.getFullYear(),month + 1, 0).toISOString()
                                    date = new Date(toDate.setMonth(toDate.getMonth() + 1));
                                    dateArr.push(date)
                                    revenue = (Number(revenue) + Number(revenue) * (Number(growthPercentage) / 100))
                                    revenueData.push(Number(revenue.toFixed(2)))
                                    let s5 = dbScript(db_sql['Q78'], { var1: checkPermission.rows[0].company_id, var2: firstDay, var3 : lastDay, var4 : limit, var5 : offset })
                                    let actualRevenue = await connection.query(s5)
                                    if (actualRevenue.rowCount > 0) {
                                        actualRevenue.rows.map(index => {
                                            sum = sum + Number(index.target_amount);
                                        })
                                    }
                                    actualData.push(sum)
                                }
                            }
                        }
                        break;
                    case 'Quarterly':
                        let month1 = (toDate.getMonth() + 1);
                        for (let i = 1; i <= difference / 3; i++) {
                            let sum = 0
                            if (i == 1) {
                                for (let i = 1; i <= 3; i++) {
                                    let firstDay1 = new Date(toDate.getFullYear(), month1, 1).toISOString()
                                    let lastDay1 =  new Date(toDate.getFullYear(),month1 + 1, 0).toISOString()
                                    let s5 = dbScript(db_sql['Q78'], { var1: checkPermission.rows[0].company_id, var2: firstDay1, var3 : lastDay1, var4 : limit, var5 : offset })
                                    let actualRevenue = await connection.query(s5)
                                    if (actualRevenue.rowCount > 0) {
                                        actualRevenue.rows.map(index => {
                                            sum = sum + Number(index.target_amount);
                                        })
                                    }
                                    month1++;
                                }
                                dateArr.push(new Date(toDate))
                                revenueData.push(Number(revenue))
                                actualData.push(sum)

                            } else {
                                if (growthWindow != count+1) {
                                    date = new Date(toDate.setMonth(toDate.getMonth() + 3));
                                    for (let i = 1; i <= 3; i++) {
                                        let firstDay1 = new Date(toDate.getFullYear(), month1, 1).toISOString()
                                        let lastDay1 =  new Date(toDate.getFullYear(),month1 + 1, 0).toISOString()
                                        let s5 = dbScript(db_sql['Q78'], { var1: checkPermission.rows[0].company_id, var2: firstDay1, var3 : lastDay1, var4 : limit, var5 : offset })
                                        let actualRevenue = await connection.query(s5)
                                        if (actualRevenue.rowCount > 0) {
                                            actualRevenue.rows.map(index => {
                                                sum = sum + Number(index.target_amount);
                                            })
                                        }
                                        month1++;
                                    }
                                    dateArr.push(new Date(date))
                                    revenueData.push(Number(revenue))
                                    actualData.push(sum)
                                    count++;

                                } else {
                                    count = 0;
                                    date = new Date(toDate.setMonth(toDate.getMonth() + 3));

                                    for (let i = 1; i <= 3; i++) {
                                        let firstDay1 = new Date(toDate.getFullYear(), month1, 1).toISOString()
                                        let lastDay1 =  new Date(toDate.getFullYear(),month1 + 1, 0).toISOString()
                                        let s5 = dbScript(db_sql['Q78'], { var1: checkPermission.rows[0].company_id, var2: firstDay1, var3 : lastDay1, var4 : limit, var5 : offset })
                                        let actualRevenue = await connection.query(s5)
                                        if (actualRevenue.rowCount > 0) {
                                            actualRevenue.rows.map(index => {
                                                sum = sum + Number(index.target_amount);
                                            })
                                        }
                                        month1++;
                                    }
                                    dateArr.push(new Date(date))
                                    revenue = (Number(revenue) + Number(revenue) * (Number(growthPercentage) / 100))
                                    revenueData.push(Number(revenue.toFixed(2)))
                                    actualData.push(sum)
                                }
                            }
                        }
                        break;
                    case "Annual":
                        let month2 = (toDate.getMonth() + 1);
                        for (let i = 1; i <= yearDifference; i++) {
                            let sum = 0
                            if (i == 1) {
                                for (let i = 1; i <= 12; i++) {
                                    let firstDay1 = new Date(toDate.getFullYear(), month2, 1).toISOString()
                                    let lastDay1 =  new Date(toDate.getFullYear(),month2 + 1, 0).toISOString()
                                    let s5 = dbScript(db_sql['Q78'], { var1: checkPermission.rows[0].company_id, var2: firstDay1, var3 : lastDay1, var4 : limit, var5 : offset })
                                    let actualRevenue = await connection.query(s5)
                                    if (actualRevenue.rowCount > 0) {
                                        actualRevenue.rows.map(index => {
                                            sum = sum + Number(index.target_amount);
                                        })
                                    }
                                    month2++;
                                }
                                dateArr.push(new Date(toDate))
                                revenueData.push(Number(revenue))
                                actualData.push(sum)
                            } else {
                                if (growthWindow != count+1) {
                                    date = new Date(toDate.setFullYear(toDate.getFullYear() + 1))
                                    for (let i = 1; i <= 12; i++) {
                                        let firstDay1 = new Date(toDate.getFullYear(), month2, 1).toISOString()
                                        let lastDay1 =  new Date(toDate.getFullYear(),month2 + 1, 0).toISOString()
                                        let s5 = dbScript(db_sql['Q78'], { var1: checkPermission.rows[0].company_id, var2: firstDay1, var3 : lastDay1, var4 : limit, var5 : offset })
                                        let actualRevenue = await connection.query(s5)
                                        if (actualRevenue.rowCount > 0) {
                                            actualRevenue.rows.map(index => {
                                                sum = sum + Number(index.target_amount);
                                            })
                                        }
                                        month2++;
                                    }
                                    dateArr.push(new Date(date))
                                    revenueData.push(Number(revenue))
                                    actualData.push(sum)
                                    count++;

                                } else {
                                    count = 0;
                                    date = new Date(toDate.setFullYear(toDate.getFullYear() + 1))
                                    for (let i = 1; i <= 12; i++) {
                                        let firstDay1 = new Date(toDate.getFullYear(), month2, 1).toISOString()
                                        let lastDay1 =  new Date(toDate.getFullYear(),month2 + 1, 0).toISOString()
                                        let s5 = dbScript(db_sql['Q78'], { var1: checkPermission.rows[0].company_id, var2: firstDay1, var3 : lastDay1, var4 : limit, var5 : offset })
                                        let actualRevenue = await connection.query(s5)
                                        if (actualRevenue.rowCount > 0) {
                                            actualRevenue.rows.map(index => {
                                                sum = sum + Number(index.target_amount);
                                            })
                                        }
                                        month2++;
                                    }
                                    dateArr.push(new Date(date))
                                    revenue = (Number(revenue) + Number(revenue) * (Number(growthPercentage) / 100))
                                    revenueData.push(Number(revenue.toFixed(2)))
                                    actualData.push(sum)
                                }
                            }
                            //actualData.push(sum)
                        }
                        break;
                }
                let actualResult = await paginatedResults(actualData, page)
                let forecastResult = await paginatedResults(revenueData, page)
                let dateResult = await paginatedResults(dateArr,page)
                actualVsForecastObj = {
                    actualRevenue: (actualResult.length > 0) ? actualResult : [],
                    forecastRevenue: (forecastResult.length > 0) ? forecastResult : [],
                    date: (dateResult.length > 0) ? dateResult : []
                }
                res.json({
                    status: 200,
                    success: true,
                    message: "Actual vs Forecast data",
                    data: actualVsForecastObj
                })


            } else {
                actualVsForecastObj = {
                    actualRevenue: [],
                    forecastRevenue: [],
                    date: []
                }
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Actual vs Forecast data",
                    data: actualVsForecastObj
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