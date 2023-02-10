const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const { paginatedResults, reduceArrayWithCommission, getUserAndSubUser } = require('../utils/helper')
const moduleName = process.env.DASHBOARD_MODULE
const moment = require('moment')

module.exports.revenues = async (req, res) => {
    try {
        let userId = req.user.id
        let { page, startDate, endDate, orderBy, filterBy } = req.query
        startDate = new Date(startDate)
        startDate.setHours(0, 0, 0, 0)
        let sDate = new Date(startDate).toISOString()
        endDate = new Date(endDate)
        endDate.setHours(23, 59, 59, 999)
        let eDate = new Date(endDate).toISOString()
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3);
        if (checkPermission.rows[0].permission_to_view_global) {
            let revenueCommissionBydate = []
            let userList = await getUserAndSubUser(checkPermission.rows[0]);
            let s4 = dbScript(db_sql['Q87'], { var1: checkPermission.rows[0].company_id, var2: orderBy, var3: sDate, var4: eDate, var5: userList.join(',') })
            let salesData = await connection.query(s4)
     
            for (let saleData of salesData.rows) {
                let revenueCommissionByDateObj = {}
                let s5 = dbScript(db_sql['Q300'], { var1: saleData.sales_commission_id })
                let recognizedRevenueData = await connection.query(s5)

                if (recognizedRevenueData.rows[0].amount) {
                    revenueCommissionByDateObj.revenue = Number(recognizedRevenueData.rows[0].amount)
                    revenueCommissionByDateObj.date = moment(saleData.closed_at).format('MM/DD/YYYY')
                    let commission = saleData.revenue_commission ? Number(saleData.revenue_commission) : 0;

                    if (filterBy.toLowerCase() == 'all') {
                        revenueCommissionByDateObj.commission = Number(commission);
                        revenueCommissionBydate.push(revenueCommissionByDateObj)
                    } else if (filterBy.toLowerCase() == 'lead') {
                        let s6 = dbScript(db_sql['Q86'], { var1: saleData.sales_commission_id })
                        let leadPercentage = await connection.query(s6)
                        if (leadPercentage.rowCount > 0) {
                            revenueCommissionByDateObj.commission = ((Number(leadPercentage.rows[0].closer_percentage) / 100) * Number(commission))
                            revenueCommissionBydate.push(revenueCommissionByDateObj)
                        }
                    } else {
                        let s6 = dbScript(db_sql['Q59'], { var1: saleData.sales_commission_id })
                        let supporterPercentage = await connection.query(s6)
                        if (supporterPercentage.rowCount > 0) {
                            let sCommission = 0
                            for (supporter of supporterPercentage.rows) {
                                sCommission += ((Number(supporter.supporter_percentage) / 100) * Number(commission))
                            }
                            revenueCommissionByDateObj.commission = sCommission
                            revenueCommissionBydate.push(revenueCommissionByDateObj)
                        }
                    }
                }
            }
            if (revenueCommissionBydate.length > 0) {
                let returnData = await reduceArrayWithCommission(revenueCommissionBydate)
                if (returnData.length > 0) {
                    let paginatedArr = await paginatedResults(returnData, page)
                    if (orderBy.toLowerCase() == 'asc') {
                        paginatedArr = paginatedArr.sort((a, b) => {
                            return a.revenue - b.revenue
                        })
                    } else {
                        paginatedArr = paginatedArr.sort((a, b) => {
                            return b.revenue - a.revenue
                        })
                    }
                    res.json({
                        status: 200,
                        success: true,
                        message: "Revenues and Commissions",
                        data: paginatedArr
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Revenues and Commissions",
                    data: []
                })
            }

        } else if (checkPermission.rows[0].permission_to_view_own) {
            let revenueCommissionBydate = []
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let s4 = dbScript(db_sql['Q167'], { var1: roleUsers.join(','), var2: orderBy, var3: sDate, var4: eDate })
            let salesData = await connection.query(s4)
            if (salesData.rowCount > 0) {
                for (let saleData of salesData.rows) {
                    let revenueCommissionByDateObj = {}
                    let s5 = dbScript(db_sql['Q300'], { var1: saleData.sales_commission_id })
                    let recognizedRevenueData = await connection.query(s5)
    
                    if (recognizedRevenueData.rows[0].amount) {
                        revenueCommissionByDateObj.revenue = Number(recognizedRevenueData.rows[0].amount)
                        revenueCommissionByDateObj.date = moment(saleData.closed_at).format('MM/DD/YYYY')
                        let commission = saleData.revenue_commission ? Number(saleData.revenue_commission) : 0;
    
                        if (filterBy.toLowerCase() == 'all') {
                            revenueCommissionByDateObj.commission = Number(commission);
                            revenueCommissionBydate.push(revenueCommissionByDateObj)
                        } else if (filterBy.toLowerCase() == 'lead') {
                            let s6 = dbScript(db_sql['Q86'], { var1: saleData.sales_commission_id })
                            let leadPercentage = await connection.query(s6)
                            if (leadPercentage.rowCount > 0) {
                                revenueCommissionByDateObj.commission = ((Number(leadPercentage.rows[0].closer_percentage) / 100) * Number(commission))
                                revenueCommissionBydate.push(revenueCommissionByDateObj)
                            }
                        } else {
                            let s6 = dbScript(db_sql['Q59'], { var1: saleData.sales_commission_id })
                            let supporterPercentage = await connection.query(s6)
                            if (supporterPercentage.rowCount > 0) {
                                let sCommission = 0
                                for (supporter of supporterPercentage.rows) {
                                    sCommission += ((Number(supporter.supporter_percentage) / 100) * Number(commission))
                                }
                                revenueCommissionByDateObj.commission = sCommission
                                revenueCommissionBydate.push(revenueCommissionByDateObj)
                            }
                        }
                    }
                }
            }
            if (revenueCommissionBydate.length > 0) {
                let returnData = await reduceArrayWithCommission(revenueCommissionBydate)
                if (returnData.length > 0) {
                    let paginatedArr = await paginatedResults(returnData, page)
                    if (orderBy.toLowerCase() == 'asc') {
                        paginatedArr = paginatedArr.sort((a, b) => {
                            return a.revenue - b.revenue
                        })
                    } else {
                        paginatedArr = paginatedArr.sort((a, b) => {
                            return b.revenue - a.revenue
                        })
                    }
                    res.json({
                        status: 200,
                        success: true,
                        message: "Revenues and Commissions",
                        data: paginatedArr
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Revenues and Commissions",
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

module.exports.totalExpectedRevenueCounts = async (req, res) => {
    try {
        let userId = req.user.id
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            let s4 = dbScript(db_sql['Q298'], { var1: checkPermission.rows[0].company_id })
            let salesData = await connection.query(s4)

            let s5 = dbScript(db_sql['Q299'], { var1: checkPermission.rows[0].company_id })
            let recognizedRevenueData = await connection.query(s5)
            if (salesData.rowCount > 0) {
                let totalBooking = salesData.rows[0].amount ? salesData.rows[0].amount : 0;
                let bookingCommission = salesData.rows[0].booking_commission ? salesData.rows[0].booking_commission : 0;

                let revenueBooking = recognizedRevenueData.rows[0].amount ? recognizedRevenueData.rows[0].amount : 0;
                let revenueCommission = salesData.rows[0].revenue_commission ? salesData.rows[0].revenue_commission : 0;
                res.json({
                    status: 200,
                    success: true,
                    message: "Revenues and commissions details",
                    data: {
                        totalBooking,
                        bookingCommission,
                        revenueBooking,
                        revenueCommission
                    }
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Revenues and commissions are empty",
                    data: {
                        totalBooking: 0,
                        bookingCommission: 0,
                        revenueBooking: 0,
                        revenueCommission: 0
                    }
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            //get roles user list 
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);

            //get sales id on behalf of user list
            let s1 = dbScript(db_sql['Q301'], { var1: roleUsers.join(",") })
            let salesIdData = await connection.query(s1)
            console.log(s1,'s1')
            let salesId = [];
            for (let saleId of salesIdData.rows) {
                salesId.push("'" + saleId.id.toString() + "'")
            }

            //get sum of all totalBooking , bookingCommission, revenueBooking , revenueBooking 
            let s4 = dbScript(db_sql['Q302'], { var1: salesId.join(",") })
            console.log(s4,'s4')
            let salesData = await connection.query(s4)
            let s5 = dbScript(db_sql['Q303'], { var1: roleUsers.join(",") })
            console.log(s5,'s5')
            let recognizedRevenueData = await connection.query(s5)
            if (salesData.rowCount > 0) {
                let totalBooking = salesData.rows[0].amount ? salesData.rows[0].amount : 0;
                let bookingCommission = salesData.rows[0].booking_commission ? salesData.rows[0].booking_commission : 0;

                let revenueBooking = recognizedRevenueData.rows[0].amount ? recognizedRevenueData.rows[0].amount : 0;
                let revenueCommission = salesData.rows[0].revenue_commission ? salesData.rows[0].revenue_commission : 0;
                res.json({
                    status: 200,
                    success: true,
                    message: "Revenues and commissions details",
                    data: {
                        totalBooking,
                        bookingCommission,
                        revenueBooking,
                        revenueCommission
                    }
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Revenues and commissions are empty",
                    data: {
                        totalBooking: 0,
                        bookingCommission: 0,
                        revenueBooking: 0,
                        revenueCommission: 0
                    }
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

