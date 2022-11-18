const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const {getMonthDifference, getYearDifference} = require('../utils/helper')

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

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Revenue Management'
        if (findAdmin.rows.length > 0) {

            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')

                let id = uuid.v4()
                let s4 = dbScript(db_sql['Q67'], { var1: id, var2: timeline, var3: revenue, var4: growthWindow, var5: growthPercentage, var6: startDate, var7: endDate, var8: findAdmin.rows[0].id, var9: findAdmin.rows[0].company_id, var10 : currency })

                let createForecast = await connection.query(s4)

                await connection.query('COMMIT')
                if (createForecast.rowCount > 0) {
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

module.exports.revenueForecastList = async (req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Revenue Management'
        if (findAdmin.rows.length > 0) {

            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q68'], { var1: findAdmin.rows[0].company_id })
                let revenueForecastList = await connection.query(s4)

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

            } else {
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
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

module.exports.actualVsForecast = async (req, res) => {
    try {
        let { id } = req.query

        let userId = req.user.id
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Revenue Management'
        if (findAdmin.rows.length > 0) {

            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let actualVsForecastObj = {}
                let revenueData = [];
                let actualData = []
                let dateArr = []

                let s4 = dbScript(db_sql['Q69'], { var1: id, var2: findAdmin.rows[0].company_id })
                let forecastRevenue = await connection.query(s4)
                if (forecastRevenue.rowCount > 0) {
                    let revenue = forecastRevenue.rows[0].revenue
                    let growthWindow = forecastRevenue.rows[0].growth_window
                    let growthPercentage = forecastRevenue.rows[0].growth_percentage
                    let timeline = forecastRevenue.rows[0].timeline
                    let startDate = forecastRevenue.rows[0].start_date
                    let endDate = forecastRevenue.rows[0].end_date

                    let toDate = new Date(startDate)
                    let fromDate = new Date(endDate)
                    let difference = await getMonthDifference(toDate, fromDate)
                    let yearDifference = await getYearDifference(toDate, fromDate)
                    let count = 0;
                    switch (timeline) {
                        case 'Monthly':
                            let month = (toDate.getMonth() + 1);
                            for (let i = 1; i <= difference; i++) {
                                let sum = 0
                                if (i == 1) {
                                    dateArr.push(new Date(toDate))
                                    revenueData.push(Number(revenue))
                                    let s5 = dbScript(db_sql['Q78'], { var1: findAdmin.rows[0].company_id, var2: month })
                                    let actualRevenue = await connection.query(s5)
                                    if (actualRevenue.rowCount > 0) {
                                        actualRevenue.rows.map(index => {
                                            sum = sum + Number(index.target_amount);
                                        })
                                    }
                                    actualData.push(sum)
                                } else {
                                    if (growthWindow != count) {

                                        month = month + 1;
                                        date = new Date(toDate.setMonth(toDate.getMonth() + 1));
                                        dateArr.push(date)
                                        revenueData.push(Number(Number(revenue).toFixed(2)))
                                        let s5 = dbScript(db_sql['Q78'], { var1: findAdmin.rows[0].company_id, var2: month })
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
                                        date = new Date(toDate.setMonth(toDate.getMonth() + 1));
                                        dateArr.push(date)
                                        revenue = (Number(revenue) + Number(revenue) * (Number(growthPercentage) / 100))
                                        revenueData.push(Number(revenue.toFixed(2)))
                                        let s5 = dbScript(db_sql['Q78'], { var1: findAdmin.rows[0].company_id, var2: month })
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
                                        let s5 = dbScript(db_sql['Q78'], { var1: findAdmin.rows[0].company_id, var2: month1 })
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
                                    if (growthWindow != count) {
                                        date = new Date(toDate.setMonth(toDate.getMonth() + 4));
                                        for (let i = 1; i <= 3; i++) {
                                            let s5 = dbScript(db_sql['Q78'], { var1: findAdmin.rows[0].company_id, var2: month1 })
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
                                        date = new Date(toDate.setMonth(toDate.getMonth() + 4));
                                        for (let i = 1; i <= 3; i++) {
                                            let s5 = dbScript(db_sql['Q78'], { var1: findAdmin.rows[0].company_id, var2: month1 })
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
                                        let s5 = dbScript(db_sql['Q78'], { var1: findAdmin.rows[0].company_id, var2: month2 })
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
                                    if (growthWindow != count) {
                                        date = new Date(toDate.setFullYear(toDate.getFullYear() + 1))
                                        for (let i = 1; i <= 12; i++) {
                                            let s5 = dbScript(db_sql['Q78'], { var1: findAdmin.rows[0].company_id, var2: month2 })
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
                                            let s5 = dbScript(db_sql['Q78'], { var1: findAdmin.rows[0].company_id, var2: month2 })
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
                            }
                            break;
                    }
                    actualVsForecastObj = {
                        actualRevenue: (actualData.length > 0) ? actualData : [],
                        forecastRevenue: (revenueData.length > 0) ? revenueData : [],
                        date: (dateArr.length > 0) ? dateArr : []
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