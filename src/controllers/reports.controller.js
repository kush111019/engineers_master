const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const {reduceArray, paginatedResults,reduceArrayWithName, reduceArrayWithCommission} = require('../utils/helper')
const moduleName = process.env.REPORTS_MODULE
const moment = require('moment')

module.exports.revenuePerCustomer = async (req, res) => {
    try {
        let userId = req.user.id
        let { page, orderBy, startDate, endDate } = req.query
        let limit = 10;
        let offset = (page - 1) * limit
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global) {
            if ((startDate != undefined || startDate != '') && (endDate != undefined || endDate != '')) {
                let s2 = dbScript(db_sql['Q89'], { var1: checkPermission.rows[0].company_id, var2: orderBy, var3: limit, var4: offset, var5: startDate, var6: endDate })
                let customerCompanies = await connection.query(s2)
                if (customerCompanies.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Revenue per customer",
                        data: customerCompanies.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty revenue per customer",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date required",
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let revenuePerCustomerArr = []
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
            if ((startDate != undefined || startDate != '') && (endDate != undefined || endDate != '')) {
                for (id of roleUsers) {
                    let s2 = dbScript(db_sql['Q170'], { var1: id, var2: orderBy, var3: limit, var4: offset, var5: startDate, var6: endDate })
                    let customerCompanies = await connection.query(s2)
                    if(customerCompanies.rowCount > 0){
                        for(let customer of customerCompanies.rows){
                            revenuePerCustomerArr.push(customer)
                        }
                    }
                }
                if (revenuePerCustomerArr.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Revenue per customer",
                        data: revenuePerCustomerArr
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty revenue per customer",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date required",
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

module.exports.revenuePerProduct = async (req, res) => {
    try {
        let userId = req.user.id
        let { page, orderBy, startDate, endDate} = req.query
        let limit = 10;
        let offset = (page - 1) * limit
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            if((startDate != undefined || startDate != '') && (endDate != undefined || endDate != '')){
                let s4 = dbScript(db_sql['Q153'], { var1: checkPermission.rows[0].company_id, var2 : orderBy, var3 : limit, var4 : offset, var5: startDate, var6: endDate })
                let revenuePerProduct = await connection.query(s4)
                if (revenuePerProduct.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Revenue per product",
                        data: revenuePerProduct.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty revenue per product",
                        data: revenuePerProduct.rows
                    })
                }
            }else{
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date required",
                })
            }
        }else if(checkPermission.rows[0].permission_to_view_own){
            let revenuePerProductArr = []
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
            if((startDate != undefined || startDate != '') && (endDate != undefined || endDate != '')){
                for(let id of roleUsers){
                    let s4 = dbScript(db_sql['Q171'], { var1: id, var2 : orderBy, var3 : limit, var4 : offset, var5: startDate, var6: endDate })
                    let revenuePerProduct = await connection.query(s4)
                    if(revenuePerProduct.rowCount > 0){
                        for(let product of revenuePerProduct.rows){
                            revenuePerProductArr.push(product)
                        }
                    }
                }
                if (revenuePerProductArr.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Revenue per product",
                        data: revenuePerProductArr
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty revenue per product",
                        data: revenuePerProductArr
                    })
                }
            }else{
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date required",
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "Unauthorised"
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

module.exports.revenuePerSalesRep = async (req, res) => {
    try {
        let userId = req.user.id
        let { page, orderBy, startDate, endDate } = req.query
        let limit = 10;
        let offset = (page - 1) * limit
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            if ((startDate != undefined && startDate != '') && (endDate != undefined && endDate != '')) {
                let revenueCommissionBydate = []
                let s4 = dbScript(db_sql['Q257'], { var1: checkPermission.rows[0].company_id, var2: orderBy, var3: limit, var4: offset, var5: startDate, var6: endDate })
                let salesData = await connection.query(s4)
                if (salesData.rowCount > 0) {
                    for (let data of salesData.rows) {
    
                        let s5 = dbScript(db_sql['Q184'], { var1: data.slab_id })
                        let slab = await connection.query(s5)
    
                        let revenueCommissionByDateObj = {}
                        revenueCommissionByDateObj.revenue = Number(data.amount)
                        revenueCommissionByDateObj.sales_rep = data.sales_rep
    
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
    
                if (revenueCommissionBydate.length > 0) {
                    let returnData = await reduceArrayWithName(revenueCommissionBydate)
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
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date is required",
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
            
            if ((startDate != undefined && startDate != '') && (endDate != undefined && endDate != '')) {
                for (let id of roleUsers) {
                    let s4 = dbScript(db_sql['Q258'], { var1: id, var2: orderBy, var3: limit, var4: offset, var5: startDate, var6: endDate })
                    let salesData = await connection.query(s4)
                    if (salesData.rowCount > 0) {
                        for (let data of salesData.rows) {
    
                            let s5 = dbScript(db_sql['Q184'], { var1: data.slab_id })
                            let slab = await connection.query(s5)
    
                            let revenueCommissionByDateObj = {}
                            revenueCommissionByDateObj.revenue = Number(data.amount)
                            revenueCommissionByDateObj.sales_rep = data.sales_rep
    
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
                if (revenueCommissionBydate.length > 0) {
                    let returnData = await reduceArrayWithName(revenueCommissionBydate)
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
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date is required",
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "Unauthorised"
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

module.exports.totalRevenue = async (req, res) => {
    try {
        let userId = req.user.id
        let { status, page } = req.query
        let limit = (status == 'Monthly') ? 12 : (status == 'Quarterly') ? 4 : 10;
        let offset = (page - 1) * limit
        let format = (status == 'Monthly') ? 'month' : (status == 'Quarterly') ? 'quarter' : 'year'
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            let s4 = dbScript(db_sql['Q88'], { var1: checkPermission.rows[0].company_id, var2: format, var3: limit, var4: offset })
            let targetData = await connection.query(s4)
            if (targetData.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Total revenue",
                    data: targetData.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty Total revenue",
                    data: targetData.rows
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let totalRevenue = [];
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
            for (let id of roleUsers) {
                let s4 = dbScript(db_sql['Q173'], { var1: id, var2: format, var3: limit, var4: offset })
                let targetData = await connection.query(s4)
                if (targetData.rowCount > 0) {
                    for (let total of targetData.rows) {
                        totalRevenue.push(total)
                    }
                }
            }
            if (totalRevenue.length > 0) {
                let finalArray = await reduceArray(totalRevenue)
                res.json({
                    status: 200,
                    success: true,
                    message: "Total revenue",
                    data: finalArray
                })
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty Total revenue",
                    data: totalRevenue
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

module.exports.roleWiseRevenue = async (req, res) => {
    try {
        let userId = req.user.id
        let { page, orderBy, startDate, endDate, role_id, isAll } = req.query
        let limit = 10;
        let offset = (page - 1) * limit
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            if ((startDate != undefined && startDate != '') && (endDate != undefined && endDate != '')) {
                let roleIds = []
                let roleUsers = []
                let revenueList = []
                roleIds.push(role_id)
                if(isAll == 'true'){
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
                    await getRoles(role_id)
                }
                for(let roleId of roleIds){
                    let s3 = dbScript(db_sql['Q185'], { var1: roleId })
                    let findUsers = await connection.query(s3)
                    if (findUsers.rowCount > 0) {
                        for (let user of findUsers.rows) {
                            roleUsers.push(user.id)
                        }
                    }
                }
                for(let id of roleUsers){
                    let s4 = dbScript(db_sql['Q186'], { var1: id, var2: limit, var3: offset, var4: startDate, var5: endDate })
                    let salesData = await connection.query(s4)
                    if(salesData.rowCount > 0){
                        revenueList.push(salesData.rows[0])
                    }
                }
                if (revenueList.length > 0) {
                    if(orderBy.toLowerCase() == 'asc'){
                        revenueList = revenueList.sort((a,b) => {
                            return a.revenue - b.revenue
                        })
                    }else{
                        revenueList = revenueList.sort((a,b) => {
                            return b.revenue - a.revenue
                        })
                    }
                    res.json({
                        status: 200,
                        success: true,
                        message: "Revenue per role wise user",
                        data: revenueList
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty revenue per role wise user",
                        data: revenueList
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date is required",
                })
            }
        } 
        // else if (checkPermission.rows[0].permission_to_view_own) {
        //     userIds.push(userId)
        //     let revenuePerSalesRepArr = []
        //     let s3 = dbScript(db_sql['Q163'], { var1: checkPermission.rows[0].role_id })
        //     let findUsers = await connection.query(s3)
        //     if (findUsers.rowCount > 0) {
        //         for (user of findUsers.rows) {
        //             userIds.push(user.id)
        //         }
        //     }
        //     if ((startDate != undefined && startDate != '') && (endDate != undefined && endDate != '')) {
        //         for (let id of userIds) {
        //             let s4 = dbScript(db_sql['Q172'], { var1: id, var2: orderBy, var3: limit, var4: offset, var5: startDate, var6: endDate })
        //             let salesData = await connection.query(s4)
        //             if (salesData.rowCount > 0) {
        //                 for (let sales of salesData.rows) {
        //                     revenuePerSalesRepArr.push(sales)
        //                 }
        //             }
        //         }
        //         if (revenuePerSalesRepArr.length > 0) {
        //             res.json({
        //                 status: 200,
        //                 success: true,
        //                 message: "Revenue per sales representative",
        //                 data: revenuePerSalesRepArr
        //             })
        //         } else {
        //             res.json({
        //                 status: 200,
        //                 success: true,
        //                 message: "Empty revenue per sales representative",
        //                 data: revenuePerSalesRepArr
        //             })
        //         }
        //     } else {
        //         res.json({
        //             status: 400,
        //             success: false,
        //             message: "Start date and End date is required",
        //         })
        //     }
        // } 
        else {
            res.status(403).json({
                success: false,
                message: "Unauthorised"
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