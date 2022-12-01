const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const { reduceArray, paginatedResults } = require('../utils/helper')
const moduleName = process.env.DASHBOARD_MODULE
const moment = require('moment')

module.exports.revenues = async (req, res) => {
    try {
        let userId = req.user.id
        let { page } = req.query
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view) {

            let counts = {}
            let revenueCommissionBydate = []
            let result;

            let s5 = dbScript(db_sql['Q17'], { var1: checkPermission.rows[0].company_id })
            let slab = await connection.query(s5)
            if (slab.rowCount > 0) {
                let s4 = dbScript(db_sql['Q87'], { var1: checkPermission.rows[0].company_id })
                let salesData = await connection.query(s4)
                if (salesData.rowCount > 0) {
                    let expectedRevenue = 0;
                    let totalRevenue = 0;
                    let totalCommission = 0;
                    for (data of salesData.rows) {
                        if (data.closed_at == null) {
                            expectedRevenue = Number(expectedRevenue) + Number(data.target_amount);
                        } else {
                            let revenueCommissionByDateObj = {}

                            revenueCommissionByDateObj.revenue = Number(data.target_amount)
                            revenueCommissionByDateObj.date = moment(data.closed_at).format('MM/DD/YYYY')
                            totalRevenue = Number(totalRevenue) + Number(data.target_amount);

                            let remainingAmount = Number(data.target_amount);
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
                            revenueCommissionByDateObj.commission =  Number(commission.toFixed(2))
                            
                            totalCommission = totalCommission + commission
                            revenueCommissionBydate.push(revenueCommissionByDateObj)
                        }
                    }
                    let reducedArray = await reduceArray(revenueCommissionBydate)
                    result = await paginatedResults(reducedArray, page)
                    counts.expectedRevenue = expectedRevenue
                    counts.totalRevenue =  Number(totalRevenue.toFixed(2))
                    counts.totalCommission =  Number(totalCommission.toFixed(2))
                } else {
                    counts.totalRevenue = 0
                    counts.expectedRevenue = 0
                    counts.totalCommission = 0
                }
                res.json({
                    status: 200,
                    success: true,
                    message: "Revenues and Commissions",
                    data: counts,
                    revenues : result
                })
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Slabs not found"
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

