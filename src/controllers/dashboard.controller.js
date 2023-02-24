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
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let s4 = dbScript(db_sql['Q87'], { var1: checkPermission.rows[0].company_id, var2: orderBy, var3: sDate, var4: eDate, var5: roleUsers.join(',') })
            let salesData = await connection.query(s4)
            console.log(salesData.rows);
            if (salesData.rowCount > 0) {
                for (let saleData of salesData.rows) {
                    let revenueCommissionByDateObj = {}
                    revenueCommissionByDateObj.booking = Number(saleData.target_amount);

                    let s5 = dbScript(db_sql['Q300'], { var1: saleData.sales_commission_id })
                    let recognizedRevenueData = await connection.query(s5)
                    console.log(recognizedRevenueData.rows);
                    if (recognizedRevenueData.rows[0].amount) {
                        revenueCommissionByDateObj.revenue = Number(recognizedRevenueData.rows[0].amount)
                        revenueCommissionByDateObj.date = moment(saleData.closed_at).format('MM/DD/YYYY')
                        let commission = saleData.revenue_commission ? Number(saleData.revenue_commission) : 0;

                        if (filterBy.toLowerCase() == 'all') {
                            revenueCommissionByDateObj.booking_commission = Number(saleData.booking_commission);
                            revenueCommissionByDateObj.commission = Number(commission);
                            revenueCommissionBydate.push(revenueCommissionByDateObj)
                        } else if (filterBy.toLowerCase() == 'lead') {
                            for (let user of saleData.sales_users) {
                                if (user.user_type == process.env.CAPTAIN) {
                                    revenueCommissionByDateObj.booking_commission = ((Number(user.percentage) / 100) * Number(saleData.booking_commission));
                                    revenueCommissionByDateObj.commission = ((Number(user.percentage) / 100) * Number(commission))
                                    revenueCommissionBydate.push(revenueCommissionByDateObj)
                                }
                            }
                        } else {
                            let booking_commission1 = 0;
                            let commission1 = 0;
                            for (let user of saleData.sales_users) {
                                if (user.user_type == process.env.SUPPORT) {
                                    booking_commission1 = booking_commission1 + ((Number(user.percentage) / 100) * Number(saleData.booking_commission));
                                    commission1 = commission1 + ((Number(user.percentage) / 100) * Number(commission))

                                }
                            }
                            revenueCommissionByDateObj.booking_commission = booking_commission1
                            revenueCommissionByDateObj.commission = commission1
                            revenueCommissionBydate.push(revenueCommissionByDateObj)
                        }
                    }
                }
            }
            console.log(revenueCommissionBydate)
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
                    revenueCommissionByDateObj.booking = Number(saleData.target_amount);
                    let s5 = dbScript(db_sql['Q300'], { var1: saleData.sales_commission_id })
                    let recognizedRevenueData = await connection.query(s5)

                    if (recognizedRevenueData.rows[0].amount) {
                        revenueCommissionByDateObj.revenue = Number(recognizedRevenueData.rows[0].amount)
                        revenueCommissionByDateObj.date = moment(saleData.closed_at).format('MM/DD/YYYY')
                        let commission = saleData.revenue_commission ? Number(saleData.revenue_commission) : 0;

                        if (filterBy.toLowerCase() == 'all') {
                            revenueCommissionByDateObj.booking_commission = Number(saleData.booking_commission);
                            revenueCommissionByDateObj.commission = Number(commission);
                            revenueCommissionBydate.push(revenueCommissionByDateObj)
                        } else if (filterBy.toLowerCase() == 'lead') {
                            for (let user of saleData.sales_users) {
                                if (user.user_type == process.env.CAPTAIN) {
                                    revenueCommissionByDateObj.booking_commission = ((Number(user.percentage) / 100) * Number(saleData.booking_commission))
                                    revenueCommissionByDateObj.commission = ((Number(user.percentage) / 100) * Number(commission))
                                    revenueCommissionBydate.push(revenueCommissionByDateObj)
                                }
                            }
                        } else {
                            let booking_commission1 = 0;
                            let commission1 = 0;
                            for (let user of saleData.sales_users) {
                                if (user.user_type == process.env.SUPPORT) {
                                    console.log(user)
                                    booking_commission1 = booking_commission1 + ((Number(user.percentage) / 100) * Number(saleData.booking_commission));
                                    commission1 = commission1 + ((Number(user.percentage) / 100) * Number(commission))

                                }
                            }
                            revenueCommissionByDateObj.booking_commission = booking_commission1
                            revenueCommissionByDateObj.commission = commission1
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
            let s3 = dbScript(db_sql['Q297'], { var1: checkPermission.rows[0].company_id })
            let salesPerpetualData = await connection.query(s3)


            let s4 = dbScript(db_sql['Q298'], { var1: checkPermission.rows[0].company_id })
            let salesSubscriptionData = await connection.query(s4)

            let subscriptionBooking = 0;
            let subscriptionCommission = 0;
            for( let subscription of salesSubscriptionData.rows){
                subscriptionCommission = subscriptionCommission + Number(subscription.subscription_revenue_commission);
                if(Number(subscription.recognized_amount) <= Number(subscription.subscription_amount)){
                    subscriptionBooking = subscriptionBooking + Number(subscription.subscription_amount)
                }else{
                    subscriptionBooking = subscriptionBooking + Number(subscription.recognized_amount)
                }
            }

            let s5 = dbScript(db_sql['Q299'], { var1: checkPermission.rows[0].company_id })
            let recognizedRevenueData = await connection.query(s5)

            if (salesPerpetualData.rowCount > 0  || salesSubscriptionData.rowCount > 0 ) {
                let totalBooking = salesPerpetualData.rows[0].amount ? Number(salesPerpetualData.rows[0].amount) : 0;
                let bookingCommission = salesPerpetualData.rows[0].booking_commission ? Number(salesPerpetualData.rows[0].booking_commission) : 0;

                let revenueBooking = recognizedRevenueData.rows[0].amount ? Number(recognizedRevenueData.rows[0].amount) : 0;

                let revenueCommission = Number(subscriptionCommission) + Number(salesPerpetualData.rows[0].revenue_commission) ; 
                res.json({
                    status: 200,
                    success: true,
                    message: "Revenues and commissions details",
                    data: {
                        totalBooking,
                        subscriptionBooking,
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
            let salesId = [];
            for (let saleId of salesIdData.rows) {
                salesId.push("'" + saleId.id.toString() + "'")
            }
            if (salesId.length > 0) {
                //get sum of all totalBooking , bookingCommission, revenueBooking , revenueBooking 
                let s4 = dbScript(db_sql['Q302'], { var1: salesId.join(",") })
                let salesData = await connection.query(s4)
                let s5 = dbScript(db_sql['Q303'], { var1: salesId.join(",") })
                let recognizedRevenueData = await connection.query(s5)
                if (salesData.rowCount > 0) {
                    let totalBooking = salesData.rows[0].amount ? Number(salesData.rows[0].amount) : 0;
                    let bookingCommission = salesData.rows[0].booking_commission ? Number(salesData.rows[0].booking_commission) : 0;

                    let revenueBooking = recognizedRevenueData.rows[0].amount ? Number(recognizedRevenueData.rows[0].amount) : 0;
                    let revenueCommission = salesData.rows[0].revenue_commission ? Number(salesData.rows[0].revenue_commission) : 0;
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
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty sales list",
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

module.exports.dataCreationStatus = async (req, res) => {
    try {
        let userId = req.user.id
        console.log(userId, '')
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rowCount > 0) {

            console.log(checkPermission.rows)
            let s4 = dbScript(db_sql['Q9'], { var1: checkPermission.rows[0].company_id })
            let companyData = await connection.query(s4)
            console.log(companyData.rows)

            if (companyData.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Company details",
                    data: companyData.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Company details not found",
                    data: companyData.rows
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