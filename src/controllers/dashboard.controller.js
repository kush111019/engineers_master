const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const {paginatedResults,reduceArrayWithCommission} = require('../utils/helper')
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
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            let revenueCommissionBydate = []
            let s4 = dbScript(db_sql['Q87'], { var1: checkPermission.rows[0].company_id, var2: orderBy, var3: sDate, var4: eDate })
            let salesData = await connection.query(s4)
            if (salesData.rowCount > 0) {
                for (let data of salesData.rows) {

                    let s5 = dbScript(db_sql['Q184'], { var1: data.slab_id })
                    let slab = await connection.query(s5)

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
                    if (filterBy.toLowerCase() == 'all') {
                        revenueCommissionByDateObj.commission = Number(commission.toFixed(2))
                        revenueCommissionBydate.push(revenueCommissionByDateObj)
                    } else if (filterBy.toLowerCase() == 'lead') {
                        let s6 = dbScript(db_sql['Q86'], { var1: data.sales_commission_id })
                        let leadPercentage = await connection.query(s6)
                        if (leadPercentage.rowCount > 0) {
                            revenueCommissionByDateObj.commission = ((Number(leadPercentage.rows[0].closer_percentage) / 100) * Number(commission.toFixed(2)))
                            revenueCommissionBydate.push(revenueCommissionByDateObj)
                        }
                    } else {
                        let s6 = dbScript(db_sql['Q59'], { var1: data.sales_commission_id })
                        let supporterPercentage = await connection.query(s6)
                        if (supporterPercentage.rowCount > 0) {
                            let sCommission = 0
                            for (supporter of supporterPercentage.rows) {
                                sCommission += ((Number(supporter.supporter_percentage)/100) * Number(commission.toFixed(2)))
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
            let roleUsers = []
            let roleIds = []
            roleIds.push(checkPermission.rows[0].role_id)
            let getRoles = async (id) => {
                let s7 = dbScript(db_sql['Q16'], { var1: id })
                let getChild = await connection.query(s7);
                if (getChild.rowCount > 0) {
                    for (let item of getChild.rows) {
                        if (roleIds.includes(item.id) == false) {
                            roleIds.push(item.id)
                            await getRoles(item.id)
                        }
                    }
                }
            }
            await getRoles(checkPermission.rows[0].role_id)
            for (let roleId of roleIds) {
                let s3 = dbScript(db_sql['Q185'], { var1: roleId })
                let findUsers = await connection.query(s3)
                if (findUsers.rowCount > 0) {
                    for (let user of findUsers.rows) {
                        roleUsers.push(user.id)
                    }
                }
            }
            let s4 = dbScript(db_sql['Q167'], {  var1: "'"+roleUsers.join("','")+"'", var2: orderBy, var3: sDate, var4: eDate })
            let salesData = await connection.query(s4)
            if (salesData.rowCount > 0) {
                for (let data of salesData.rows) {

                    let s5 = dbScript(db_sql['Q184'], { var1: data.slab_id })
                    let slab = await connection.query(s5)

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
                    if (filterBy.toLowerCase() == 'all') {
                        revenueCommissionByDateObj.commission = Number(commission.toFixed(2))
                        revenueCommissionBydate.push(revenueCommissionByDateObj)
                    } else if (filterBy.toLowerCase() == 'lead') {
                        let s6 = dbScript(db_sql['Q86'], { var1: data.sales_commission_id })
                        let leadPercentage = await connection.query(s6)
                        if (leadPercentage.rowCount > 0) {
                            revenueCommissionByDateObj.commission = ((Number(leadPercentage.rows[0].closer_percentage) / 100) * Number(commission.toFixed(2)))
                            revenueCommissionBydate.push(revenueCommissionByDateObj)
                        }
                    } else {
                        let s6 = dbScript(db_sql['Q59'], { var1: data.sales_commission_id })
                        let supporterPercentage = await connection.query(s6)
                        if (supporterPercentage.rowCount > 0) {
                            let sCommission = 0
                            for (supporter of supporterPercentage.rows) {
                                sCommission += ((Number(supporter.supporter_percentage)/100) * Number(commission.toFixed(2)))
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

            let counts = {}

            let s4 = dbScript(db_sql['Q159'], { var1: checkPermission.rows[0].company_id })
            let salesData = await connection.query(s4)
            if (salesData.rowCount > 0) {
                let totalExpectedRevenue = 0;
                let totalExpectedCommission = 0;
                let totalClosedRevenue = 0;
                let totalClosedCommission = 0;
                for (let data of salesData.rows) {

                    let s5 = dbScript(db_sql['Q184'], { var1: data.slab_id })
                    let slab = await connection.query(s5)

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
            let roleUsers = []
            let roleIds = []
            roleIds.push(checkPermission.rows[0].role_id)
            let getRoles = async (id) => {
                let s7 = dbScript(db_sql['Q16'], { var1: id })
                let getChild = await connection.query(s7);
                if (getChild.rowCount > 0) {
                    for (let item of getChild.rows) {
                        if (roleIds.includes(item.id) == false) {
                            roleIds.push(item.id)
                            await getRoles(item.id)
                        }
                    }
                }
            }
            await getRoles(checkPermission.rows[0].role_id)
            for (let roleId of roleIds) {
                let s3 = dbScript(db_sql['Q185'], { var1: roleId })
                let findUsers = await connection.query(s3)
                if (findUsers.rowCount > 0) {
                    for (let user of findUsers.rows) {
                        roleUsers.push(user.id)
                    }
                }
            }
        
            let totalExpectedRevenue = 0;
            let totalExpectedCommission = 0;
            let totalClosedRevenue = 0;
            let totalClosedCommission = 0;
            let s4 = dbScript(db_sql['Q168'], { var1: "'"+roleUsers.join("','")+"'" })
            let salesData = await connection.query(s4)
            console.log(salesData.rows,"sales data");
            if (salesData.rowCount > 0 ) {
                for (let data of salesData.rows) {
                    let s5 = dbScript(db_sql['Q184'], { var1: data.slab_id })
                    let slab = await connection.query(s5)
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
            }
            if (counts) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Revenues and Commissions",
                    data: counts
                })
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Revenues and Commissions",
                    data: {
                        totalExpectedRevenue: 0,
                        totalExpectedCommission: 0,
                        totalClosedRevenue: 0,
                        totalClosedCommission: 0
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

