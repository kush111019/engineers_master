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
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1);
        if (checkPermission.rows[0].permission_to_view_global) {
            let revenueCommissionBydate = []
            let totalRevenueAndCommission = {};
            let perpetualBooking = 0;
            let bookingCommission = 0;
            let revenueCommission = 0;
            let subscriptionBooking = 0;
            let subscriptionCommission = 0;
            let R1 = 0
            let s2 = dbScript(db_sql['Q254'], { var1: checkPermission.rows[0].company_id, var2: 'Perpetual', var3: sDate, var4: eDate })
            let salesPerpetualData = await connection.query(s2)
            if (salesPerpetualData.rowCount > 0) {
                for (let data of salesPerpetualData.rows) {
                    bookingCommission = bookingCommission + Number(data.booking_commission)
                    revenueCommission = revenueCommission + Number(data.revenue_commission)
                    let s5 = dbScript(db_sql['Q256'], { var1: data.sales_id })
                    let recognizedRevenueData = await connection.query(s5)
                    R1 = R1 + Number(recognizedRevenueData.rows[0].amount)
                    if (data.archived_at) {
                        if (recognizedRevenueData.rows[0].amount) {
                            perpetualBooking = perpetualBooking + Number(recognizedRevenueData.rows[0].amount)
                        }
                    } else {
                        perpetualBooking = perpetualBooking + Number(data.target_amount)
                    }
                }
            }

            let s3 = dbScript(db_sql['Q254'], { var1: checkPermission.rows[0].company_id, var2: 'Subscription', var3: sDate, var4: eDate })
            let salesSubscriptionData = await connection.query(s3)
            if (salesSubscriptionData.rowCount > 0) {
                for (let data of salesSubscriptionData.rows) {
                    subscriptionCommission = subscriptionCommission + Number(data.revenue_commission)
                    let s5 = dbScript(db_sql['Q256'], { var1: data.sales_id })
                    let recognizedRevenueData = await connection.query(s5)
                    if (recognizedRevenueData.rows[0].amount) {
                        R1 = R1 + Number(recognizedRevenueData.rows[0].amount)
                        if (data.archived_at) {
                            subscriptionBooking = subscriptionBooking + Number(recognizedRevenueData.rows[0].amount)
                        } else {
                            subscriptionBooking = subscriptionBooking + Number(data.target_amount)
                        }
                    }
                }
            }

            // let s4 = dbScript(db_sql['Q255'], { var1: checkPermission.rows[0].company_id, var3: sDate, var4: eDate })
            // let recognizedRevenueData = await connection.query(s4)

            //---------------------Dashboard boxes data----------------------
            //Bookings(Perpetual)
            totalRevenueAndCommission.totalPerpetualBooking = Number(perpetualBooking);
            //Subscription Revenue
            totalRevenueAndCommission.totalSubscriptionBooking = Number(subscriptionBooking);
            //Booking Commission
            totalRevenueAndCommission.totalBookingCommission = Number(bookingCommission)
            //Revenue
            totalRevenueAndCommission.totalRevenueBooking = R1
            //Earned Commission
            totalRevenueAndCommission.totalRevenueCommission = Number(subscriptionCommission) + Number(revenueCommission);
            //------------------------------------------------------------

            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let s5 = dbScript(db_sql['Q77'], { var1: checkPermission.rows[0].company_id, var2: orderBy, var3: sDate, var4: eDate, var5: roleUsers.join(',') })
            let salesData = await connection.query(s5)
            if (salesData.rowCount > 0) {
                for (let saleData of salesData.rows) {
                    let revenueCommissionByDateObj = {}

                    let s6 = dbScript(db_sql['Q256'], { var1: saleData.sales_commission_id })
                    let recognizedRevenueData = await connection.query(s6)

                    if (saleData.sales_type == 'Perpetual') {
                        let pBooking = 0;
                        if (saleData.archived_at) {
                            if (recognizedRevenueData.rows[0].amount) {
                                pBooking = recognizedRevenueData.rows[0].amount ? Number(recognizedRevenueData.rows[0].amount) : 0
                            }
                            revenueCommissionByDateObj.booking = Number(pBooking)
                        } else {
                            revenueCommissionByDateObj.booking = Number(saleData.target_amount)
                        }
                        revenueCommissionByDateObj.subscription_booking = 0;
                    }
                    if (saleData.sales_type == 'Subscription') {
                        let subscriptionBooking1 = 0;
                        if (recognizedRevenueData.rows[0].amount) {
                            if (saleData.archived_at) {
                                subscriptionBooking1 = recognizedRevenueData.rows[0].amount ? Number(recognizedRevenueData.rows[0].amount) : 0
                            } else {
                                subscriptionBooking1 = Number(saleData.target_amount)
                            }
                        }else{
                            subscriptionBooking1 = Number(saleData.target_amount)
                        }
                        revenueCommissionByDateObj.booking = 0;
                        revenueCommissionByDateObj.subscription_booking = Number(subscriptionBooking1);
                    }
                    if (recognizedRevenueData.rows[0].amount) {
                        revenueCommissionByDateObj.revenue = Number(recognizedRevenueData.rows[0].amount)
                        revenueCommissionByDateObj.date = moment(saleData.closed_at).format('MM/DD/YYYY')
                        let commission = saleData.revenue_commission ? Number(saleData.revenue_commission) : 0;

                        if (filterBy.toLowerCase() == 'all') {
                            revenueCommissionByDateObj.booking_commission = Number(saleData.booking_commission);
                            revenueCommissionByDateObj.commission = Number(commission);
                            revenueCommissionBydate.push(revenueCommissionByDateObj)
                        } else if (filterBy.toLowerCase() == 'lead') {
                            if (saleData.sales_users.length > 0) {
                                saleData.sales_users.map(value => {
                                    if (value.user_type == process.env.CAPTAIN) {
                                        revenueCommissionByDateObj.booking_commission = ((Number(value.percentage) / 100) * Number(saleData.booking_commission));
                                        revenueCommissionByDateObj.commission = ((Number(value.percentage) / 100) * Number(commission))
                                        revenueCommissionBydate.push(revenueCommissionByDateObj)
                                    }
                                })
                            }
                        } else {
                            let booking_commission1 = 0;
                            let commission1 = 0;
                            if (saleData.sales_users.length > 0) {
                                saleData.sales_users.map(value => {
                                    if (value.user_type == process.env.SUPPORT) {
                                        booking_commission1 = booking_commission1 + ((Number(value.percentage) / 100) * Number(saleData.booking_commission));
                                        commission1 = commission1 + ((Number(value.percentage) / 100) * Number(commission))
                                    }
                                })
                            }
                            revenueCommissionByDateObj.booking_commission = booking_commission1
                            revenueCommissionByDateObj.commission = commission1
                            revenueCommissionBydate.push(revenueCommissionByDateObj)
                        }
                    } else {
                        revenueCommissionByDateObj.booking_commission = 0;
                        revenueCommissionByDateObj.commission = 0;
                        revenueCommissionByDateObj.revenue = 0;
                        revenueCommissionByDateObj.date = moment(saleData.closed_at).format('MM/DD/YYYY')
                        revenueCommissionBydate.push(revenueCommissionByDateObj)
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
                            data: paginatedArr, totalRevenueAndCommission
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Revenues and Commissions",
                        data: [], totalRevenueAndCommission
                    })
                }
            }else{
                res.json({
                    status: 200,
                    success: false,
                    message: "Revenues and Commissions",
                    data: [], totalRevenueAndCommission
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let revenueCommissionBydate = [];
            let totalRevenueAndCommission = {};
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);

            //get sales id on behalf of user list
            let s1 = dbScript(db_sql['Q257'], { var1: roleUsers.join(","), var2: sDate, var3: eDate })
            let salesIdData = await connection.query(s1)
            let salesId = [];
            for (let saleId of salesIdData.rows) {
                salesId.push("'" + saleId.id.toString() + "'")
            }
            if (salesId.length > 0) {
                let perpetualBooking = 0;
                let bookingCommission = 0;
                let revenueCommission = 0;
                let subscriptionBooking = 0;
                let subscriptionCommission = 0;
                //get sum of all totalBooking , bookingCommission, revenueBooking , revenueBooking 
                let s3 = dbScript(db_sql['Q258'], { var1: salesId.join(","), var2: 'Perpetual' })
                let salesPerpetualData = await connection.query(s3)
                if (salesPerpetualData.rowCount > 0) {
                    for (let data of salesPerpetualData.rows) {
                        bookingCommission = bookingCommission + Number(data.booking_commission)
                        revenueCommission = revenueCommission + Number(data.revenue_commission)
                        let s5 = dbScript(db_sql['Q256'], { var1: data.sales_id })
                        let recognizedRevenueData = await connection.query(s5)
                        if (data.archived_at) {
                            if (recognizedRevenueData.rows[0].amount) {
                                perpetualBooking = perpetualBooking + Number(recognizedRevenueData.rows[0].amount)
                            }
                        } else {
                            perpetualBooking = perpetualBooking + Number(data.target_amount)
                        }
                    }
                }

                let s4 = dbScript(db_sql['Q258'], { var1: salesId.join(","), var2: 'Subscription' })
                let salesSubscriptionData = await connection.query(s4)
                if (salesSubscriptionData.rowCount > 0) {
                    for (let data of salesSubscriptionData.rows) {
                        subscriptionCommission = subscriptionCommission + Number(data.revenue_commission)
                        let s5 = dbScript(db_sql['Q256'], { var1: data.sales_id })
                        let recognizedRevenueData = await connection.query(s5)
                        if (data.archived_at) {
                            if (recognizedRevenueData.rows[0].amount) {
                                subscriptionBooking = subscriptionBooking + Number(recognizedRevenueData.rows[0].amount)
                            }
                        } else {
                            subscriptionBooking = subscriptionBooking + Number(data.target_amount)
                        }
                    }
                }

                let s5 = dbScript(db_sql['Q259'], { var1: salesId.join(",") })
                let recognizedRevenueData = await connection.query(s5)

                totalRevenueAndCommission.totalPerpetualBooking = Number(perpetualBooking);

                totalRevenueAndCommission.totalSubscriptionBooking = Number(subscriptionBooking);

                totalRevenueAndCommission.totalBookingCommission = Number(bookingCommission)

                totalRevenueAndCommission.totalRevenueBooking = recognizedRevenueData.rows[0].amount ? Number(recognizedRevenueData.rows[0].amount) : 0;

                totalRevenueAndCommission.totalRevenueCommission = Number(subscriptionCommission) + Number(revenueCommission);

            }
            let s6 = dbScript(db_sql['Q149'], { var1: roleUsers.join(','), var2: orderBy, var3: sDate, var4: eDate })
            let salesData = await connection.query(s6)
            if (salesData.rowCount > 0) {
                for (let saleData of salesData.rows) {
                    let revenueCommissionByDateObj = {}

                    let s6 = dbScript(db_sql['Q256'], { var1: saleData.sales_commission_id })
                    let recognizedRevenueData = await connection.query(s6)

                    if (saleData.sales_type == 'Perpetual') {
                        let pBooking = 0;
                        if (saleData.archived_at) {
                            if (recognizedRevenueData.rows[0].amount) {

                                pBooking = recognizedRevenueData.rows[0].amount ? Number(recognizedRevenueData.rows[0].amount) : 0
                            }
                            revenueCommissionByDateObj.booking = Number(pBooking)
                        } else {
                            revenueCommissionByDateObj.booking = Number(saleData.target_amount)
                        }
                        revenueCommissionByDateObj.subscription_booking = 0;
                    }
                    if (saleData.sales_type == 'Subscription') {
                        let subscriptionBooking1 = 0;
                        if (recognizedRevenueData.rows[0].amount) {
                            if (saleData.archived_at) {
                                subscriptionBooking1 = recognizedRevenueData.rows[0].amount ? Number(recognizedRevenueData.rows[0].amount) : 0
                            } else {
                                subscriptionBooking1 = Number(saleData.target_amount)
                            }
                        }
                        revenueCommissionByDateObj.booking = 0;
                        revenueCommissionByDateObj.subscription_booking = Number(subscriptionBooking1);
                    }

                    if (recognizedRevenueData.rows[0].amount) {
                        revenueCommissionByDateObj.revenue = Number(recognizedRevenueData.rows[0].amount)
                        revenueCommissionByDateObj.date = moment(saleData.closed_at).format('MM/DD/YYYY')
                        let commission = saleData.revenue_commission ? Number(saleData.revenue_commission) : 0;

                        if (filterBy.toLowerCase() == 'all') {
                            revenueCommissionByDateObj.booking_commission = Number(saleData.booking_commission);
                            revenueCommissionByDateObj.commission = Number(commission);
                            revenueCommissionBydate.push(revenueCommissionByDateObj)
                        } else if (filterBy.toLowerCase() == 'lead') {
                            if (saleData.sales_users.length > 0) {
                                saleData.sales_users.map(value => {
                                    if (value.user_type == process.env.CAPTAIN) {
                                        revenueCommissionByDateObj.booking_commission = ((Number(value.percentage) / 100) * Number(saleData.booking_commission));
                                        revenueCommissionByDateObj.commission = ((Number(value.percentage) / 100) * Number(commission))
                                        revenueCommissionBydate.push(revenueCommissionByDateObj)
                                    }
                                })
                            }
                        } else {
                            let booking_commission1 = 0;
                            let commission1 = 0;
                            if (saleData.sales_users.length > 0) {
                                saleData.sales_users.map(value => {
                                    if (value.user_type == process.env.SUPPORT) {
                                        booking_commission1 = booking_commission1 + ((Number(value.percentage) / 100) * Number(saleData.booking_commission));
                                        commission1 = commission1 + ((Number(value.percentage) / 100) * Number(commission))
                                    }
                                })
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
                        data: paginatedArr,
                        totalRevenueAndCommission
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Revenues and Commissions",
                    data: [], totalRevenueAndCommission
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
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rowCount > 0) {

            let s4 = dbScript(db_sql['Q284'], { var1: checkPermission.rows[0].company_id })
            let companyData = await connection.query(s4)

            if (companyData.rowCount > 0) {

                const onboardingData = companyData.rows;

                let s5 = dbScript(db_sql['Q2841'], { var1: checkPermission.rows[0].company_id })
                let marketingData = await connection.query(s5);
                if(marketingData.rows > 0 && marketingData.rows[0].count) {
                    onboardingData[0].is_budget_created = true;
                } else {
                    onboardingData[0].is_budget_created = true;
                }

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