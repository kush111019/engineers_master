const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const moduleName = process.env.DASHBOARD_MODULE
const moment = require('moment')

module.exports.revenues = async (req, res) => {
    try {
        let userId = req.user.id
        let { page, startDate, endDate, orderBy } = req.query
        let limit = 10;
        let offset = (page - 1) * limit
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view) {
            let revenueCommissionBydate = []

            let s5 = dbScript(db_sql['Q17'], { var1: checkPermission.rows[0].company_id })
            let slab = await connection.query(s5)

            let s4 = dbScript(db_sql['Q87'], { var1: checkPermission.rows[0].company_id, var2 : orderBy, var3 : limit, var4 : offset, var5 : startDate, var6 : endDate  })
            let salesData = await connection.query(s4)
            if (salesData.rowCount > 0 && slab.rowCount > 0) {
                for (data of salesData.rows) {
                        let revenueCommissionByDateObj = {}
                        revenueCommissionByDateObj.revenue = Number(data.amount)
                        revenueCommissionByDateObj.date = moment(data.closed_at).format('MM/DD/YYYY')

                        let remainingAmount = Number(data.amount);
                        let commission = 0
                        //if remainning amount is 0 then no reason to check 
                        for (let i = 0; i < slab.rows.length && remainingAmount > 0; i++) {
                            let slab_percentage = Number(slab.rows[i].percentage)
                            let slab_maxAmount = Number(slab.rows[i].max_amount)
                            let slab_minAmount = Number(slab.rows[i].min_amount)
                            if (slab.rows[i].is_max) {
                                commission = commission + ((slab_percentage / 100) * remainingAmount)
                                remainingAmount = 0
                            }
                            else {
                                if (remainingAmount >= slab_maxAmount) {
                                    commission = commission + ((slab_percentage / 100) * (slab_maxAmount - slab_minAmount))
                                    remainingAmount = remainingAmount - (slab_maxAmount - slab_minAmount)
                                } else {
                                    commission = commission + ((slab_percentage / 100) * remainingAmount)
                                    remainingAmount = 0
                                }
                            }
                        }
                        revenueCommissionByDateObj.commission = Number(commission.toFixed(2))
                        revenueCommissionBydate.push(revenueCommissionByDateObj)
                }
            }
            res.json({
                status: 200,
                success: true,
                message: "Revenues and Commissions",
                data: revenueCommissionBydate
            })
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

module.exports.totalExpectedRevenueCounts = async(req, res) => {
    try {
        let userId = req.user.id
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view) {

            let counts = {}

            let s5 = dbScript(db_sql['Q17'], { var1: checkPermission.rows[0].company_id })
            let slab = await connection.query(s5)

            let s4 = dbScript(db_sql['Q159'], { var1: checkPermission.rows[0].company_id })
            let salesData = await connection.query(s4)
            if (salesData.rowCount > 0 && slab.rowCount > 0) {
                let totalExpectedRevenue = 0;
                let totalExpectedCommission = 0;
                let totalClosedRevenue = 0;
                let totalClosedCommission = 0;
                for (data of salesData.rows) {
                    if (data.closed_at == null) {
                        totalExpectedRevenue = Number(totalExpectedRevenue) + Number(data.amount);
                        let expectedRemainingAmount = Number(data.amount);
                        let expectedCommission = 0
                        //if remainning amount is 0 then no reason to check 
                        for (let i = 0; i < slab.rows.length && expectedRemainingAmount > 0; i++) {
                            let slab_percentage = Number(slab.rows[i].percentage)
                            let slab_maxAmount = Number(slab.rows[i].max_amount)
                            let slab_minAmount = Number(slab.rows[i].min_amount)
                            if (slab.rows[i].is_max) {
                                expectedCommission = expectedCommission + ((slab_percentage / 100) * expectedRemainingAmount)
                                expectedRemainingAmount = 0
                            }
                            else {
                                if (expectedRemainingAmount >= slab_maxAmount) {
                                    expectedCommission = expectedCommission + ((slab_percentage / 100) * (slab_maxAmount - slab_minAmount))
                                    expectedRemainingAmount = expectedRemainingAmount - (slab_maxAmount - slab_minAmount)
                                } else {
                                    expectedCommission = expectedCommission + ((slab_percentage / 100) * expectedRemainingAmount)
                                    expectedRemainingAmount = 0
                                }
                            }
                        }
                        totalExpectedCommission = totalExpectedCommission + expectedCommission
                    } else {
                        totalClosedRevenue = Number(totalClosedRevenue.toFixed(2)) + Number(data.amount);

                        let remainingAmount = Number(data.amount);
                        let commission = 0
                        //if remainning amount is 0 then no reason to check 
                        for (let i = 0; i < slab.rows.length && remainingAmount > 0; i++) {
                            let slab_percentage = Number(slab.rows[i].percentage)
                            let slab_maxAmount = Number(slab.rows[i].max_amount)
                            let slab_minAmount = Number(slab.rows[i].min_amount)
                            if (slab.rows[i].is_max) {
                                commission = commission + ((slab_percentage / 100) * remainingAmount)
                                remainingAmount = 0
                            }
                            else {
                                if (remainingAmount >= slab_maxAmount) {
                                    commission = commission + ((slab_percentage / 100) * (slab_maxAmount - slab_minAmount))
                                    remainingAmount = remainingAmount - (slab_maxAmount - slab_minAmount)
                                } else {
                                    commission = commission + ((slab_percentage / 100) * remainingAmount)
                                    remainingAmount = 0
                                }
                            }
                        }
                        totalClosedCommission = totalClosedCommission + commission
                    }
                }
                counts.totalExpectedRevenue = totalExpectedRevenue + totalClosedRevenue
                counts.totalExpectedCommission = totalExpectedCommission + totalClosedCommission
                counts.totalClosedRevenue = Number(totalClosedRevenue.toFixed(2))
                counts.totalClosedCommission = Number(totalClosedCommission.toFixed(2))
            } else {
                counts.totalExpectedRevenue = 0
                counts.totalExpectedCommission = 0
                counts.totalClosedRevenue = 0
                counts.totalClosedCommission = 0
            }
            res.json({
                status: 200,
                success: true,
                message: "Revenues and Commissions",
                data: counts
            })
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

