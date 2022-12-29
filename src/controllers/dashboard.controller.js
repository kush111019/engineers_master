const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const moduleName = process.env.DASHBOARD_MODULE
const moment = require('moment')

module.exports.revenues = async (req, res) => {
    try {
        let userId = req.user.id
        let userIds = []
        let { page, startDate, endDate, orderBy } = req.query
        let limit = 10;
        let offset = (page - 1) * limit
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            let revenueCommissionBydate = []

            let s5 = dbScript(db_sql['Q17'], { var1: checkPermission.rows[0].company_id })
            let slab = await connection.query(s5)

            let s4 = dbScript(db_sql['Q87'], { var1: checkPermission.rows[0].company_id, var2: orderBy, var3: limit, var4: offset, var5: startDate, var6: endDate })
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
                            // Reached the last slab
                            commission += ((slab_percentage / 100) * remainingAmount)
                            break;
                        }
                        else {
                            // This is not the last slab
                            let diff = slab_minAmount == 0 ? 0 : 1
                            let slab_diff = (slab_maxAmount - slab_minAmount + diff)
                            slab_diff = (slab_diff > remainingAmount) ? remainingAmount : slab_diff
                            commission += ((slab_percentage / 100) * slab_diff)
                            remainingAmount -= slab_diff
                            if (remainingAmount <= 0) {
                                break;
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
        } else if (checkPermission.rows[0].permission_to_view_own) {
            userIds.push(userId)
            let revenueCommissionBydate = []
            let s3 = dbScript(db_sql['Q163'], { var1: checkPermission.rows[0].role_id })
            let findUsers = await connection.query(s3)
            if (findUsers.rowCount > 0) {
                for (user of findUsers.rows) {
                    userIds.push(user.id)
                }
            }
            let s5 = dbScript(db_sql['Q17'], { var1: checkPermission.rows[0].company_id })
            let slab = await connection.query(s5)
            for (id of userIds) {
                let s4 = dbScript(db_sql['Q167'], { var1: id, var2: orderBy, var3: limit, var4: offset, var5: startDate, var6: endDate })
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
                                // Reached the last slab
                                commission += ((slab_percentage / 100) * remainingAmount)
                                break;
                            }
                            else {
                                // This is not the last slab
                                let diff = slab_minAmount == 0 ? 0 : 1
                                let slab_diff = (slab_maxAmount - slab_minAmount + diff)
                                slab_diff = (slab_diff > remainingAmount) ? remainingAmount : slab_diff
                                commission += ((slab_percentage / 100) * slab_diff)
                                remainingAmount -= slab_diff
                                if (remainingAmount <= 0) {
                                    break;
                                }
                            }
                        }
                        revenueCommissionByDateObj.commission = Number(commission.toFixed(2))
                        revenueCommissionBydate.push(revenueCommissionByDateObj)
                    }
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

module.exports.totalExpectedRevenueCounts = async (req, res) => {
    try {
        let userId = req.user.id
        let userIds = []
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {

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
                                // Reached the last slab
                                expectedCommission += ((slab_percentage / 100) * expectedRemainingAmount)
                                break;
                            }
                            else {
                                // This is not the last slab
                                let diff = slab_minAmount == 0 ? 0 : 1
                                let slab_diff = (slab_maxAmount - slab_minAmount + diff)
                                slab_diff = (slab_diff > expectedRemainingAmount) ? expectedRemainingAmount : slab_diff
                                expectedCommission += ((slab_percentage / 100) * slab_diff)
                                expectedRemainingAmount -= slab_diff
                                if (expectedRemainingAmount <= 0) {
                                    break;
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
                                // Reached the last slab
                                commission += ((slab_percentage / 100) * remainingAmount)
                                break;
                            }
                            else {
                                // This is not the last slab
                                let diff = slab_minAmount == 0 ? 0 : 1
                                let slab_diff = (slab_maxAmount - slab_minAmount + diff)
                                slab_diff = (slab_diff > remainingAmount) ? remainingAmount : slab_diff
                                commission += ((slab_percentage / 100) * slab_diff)
                                remainingAmount -= slab_diff
                                if (remainingAmount <= 0) {
                                    break;
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
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let counts = {}
            userIds.push(userId)
            let s3 = dbScript(db_sql['Q163'], { var1: checkPermission.rows[0].role_id })
            let findUsers = await connection.query(s3)
            if (findUsers.rowCount > 0) {
                for (user of findUsers.rows) {
                    userIds.push(user.id)
                }
            }
            let s5 = dbScript(db_sql['Q17'], { var1: checkPermission.rows[0].company_id })
            let slab = await connection.query(s5)
            console.log(slab.rows,"slab data");
            let totalExpectedRevenue = 0;
            let totalExpectedCommission = 0;
            let totalClosedRevenue = 0;
            let totalClosedCommission = 0;
            for (let id of userIds) {
                let s4 = dbScript(db_sql['Q168'], { var1: id })
                let salesData = await connection.query(s4)
                if (salesData.rowCount > 0 && slab.rowCount > 0) {
                    
                    for (let data of salesData.rows) {
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
                                    // Reached the last slab
                                    expectedCommission += ((slab_percentage / 100) * expectedRemainingAmount)
                                    break;
                                }
                                else {
                                    // This is not the last slab
                                    let diff = slab_minAmount == 0 ? 0 : 1
                                    let slab_diff = (slab_maxAmount - slab_minAmount + diff)
                                    slab_diff = (slab_diff > expectedRemainingAmount) ? expectedRemainingAmount : slab_diff
                                    expectedCommission += ((slab_percentage / 100) * slab_diff)
                                    expectedRemainingAmount -= slab_diff
                                    if (expectedRemainingAmount <= 0) {
                                        break;
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
                                    // Reached the last slab
                                    commission += ((slab_percentage / 100) * remainingAmount)
                                    break;
                                }
                                else {
                                    // This is not the last slab
                                    let diff = slab_minAmount == 0 ? 0 : 1
                                    let slab_diff = (slab_maxAmount - slab_minAmount + diff)
                                    slab_diff = (slab_diff > remainingAmount) ? remainingAmount : slab_diff
                                    commission += ((slab_percentage / 100) * slab_diff)
                                    remainingAmount -= slab_diff
                                    if (remainingAmount <= 0) {
                                        break;
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

                    console.log(totalExpectedRevenue,"totalExpectedRevenue000000");
                    console.log(totalExpectedCommission,"totalExpectedCommission00000");
                    console.log(totalClosedRevenue,"totalClosedRevenue0000000");
                    console.log(totalClosedCommission,"totalClosedCommission000000");
                } else {
                    counts.totalExpectedRevenue = 0
                    counts.totalExpectedCommission = 0
                    counts.totalClosedRevenue = 0
                    counts.totalClosedCommission = 0
                }
            }
            console.log(totalExpectedRevenue,"totalExpectedRevenue");
            console.log(totalExpectedCommission,"totalExpectedCommission");
            console.log(totalClosedRevenue,"totalClosedRevenue");
            console.log(totalClosedCommission,"totalClosedCommission");

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

