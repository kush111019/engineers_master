const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const { mysql_real_escape_string, getUserAndSubUser, notificationsOperations } = require('../utils/helper')
const moduleName = process.env.SALES_MODULE
const customerModule = process.env.CUSTOMERS_MODULE
const userModule = process.env.USERS_MODULE


module.exports.customerListforSales = async (req, res) => {
    try {
        let userId = req.user.id
        let s3 = dbScript(db_sql['Q41'], { var1: customerModule, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            let s4 = dbScript(db_sql['Q39'], { var1: checkPermission.rows[0].company_id })
            let customerList = await connection.query(s4)
            if (customerList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Customers list',
                    data: customerList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty customers list',
                    data: []
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0])
            let s4 = dbScript(db_sql['Q316'], { var1: roleUsers.join(",") })
            let customerList = await connection.query(s4)
            if (customerList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Customers list',
                    data: customerList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty customers list',
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


module.exports.createSales = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            customerId,
            leadId,
            businessId,
            revenueId,
            captainId,
            captainPercentage,
            supporters,
            slabId,
            commissionSplitId,
            qualification,
            is_qualified,
            targetAmount,
            targetClosingDate,
            products,
            is_overwrite,
            currency,
            salesType,
            subscriptionPlan,
            recurringDate,
           
        } = req.body
        //add notification deatils
        let notification_userId = [];
        let notification_typeId;
        if (supporters.length > 0) {
            for (let sid of supporters) {
                notification_userId.push(sid.id)
            }
            notification_userId.push(captainId)
        } else {
            notification_userId.push(captainId)
        }
        //here check user all permission's
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_create) {
            let supporterIds = []
            await connection.query('BEGIN')

            businessId = (businessId == '') ? '' : businessId
            revenueId = (revenueId == '') ? '' : revenueId
            targetAmount = (targetAmount == '') ? '0' : targetAmount

            let totalCommission = 0;
            let s4 = dbScript(db_sql['Q184'], { var1: slabId })
            let slab = await connection.query(s4)
            let remainingAmount = Number(targetAmount);
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
            totalCommission = totalCommission + commission

            let s5 = dbScript(db_sql['Q53'], { var1: customerId, var2: commissionSplitId, var3: is_overwrite, var4: checkPermission.rows[0].company_id, var5: businessId, var6: revenueId, var7: mysql_real_escape_string(qualification), var8: is_qualified, var9: targetAmount, var10: targetClosingDate, var11: salesType, var12: subscriptionPlan, var13: recurringDate, var14: currency, var15: userId, var16: slabId, var17: leadId, var18: totalCommission })
            let createSales = await connection.query(s5)
            let salesUsersForLog = [];
            let s7 = dbScript(db_sql['Q58'], { var1: captainId, var2: Number(captainPercentage), var3: process.env.CAPTAIN, var4: commissionSplitId, var5: createSales.rows[0].id, var6: checkPermission.rows[0].company_id })
            let addSalesCaptain = await connection.query(s7)
            if (addSalesCaptain.rowCount > 0) {
                let s8 = dbScript(db_sql['Q8'], { var1: addSalesCaptain.rows[0].user_id })
                let userName = await connection.query(s8)
                addSalesCaptain.rows[0].user_name =(userName.rows[0].full_name)?userName.rows[0].full_name:"";
                salesUsersForLog.push(addSalesCaptain.rows[0])
            }

            if (supporters.length > 0) {
                for (let supporterData of supporters) {
                    let s8 = dbScript(db_sql['Q58'], { var1: supporterData.id, var2: Number(supporterData.percentage), var3: process.env.SUPPORT, var4: commissionSplitId, var5: createSales.rows[0].id, var6: checkPermission.rows[0].company_id })
                    addSalesSupporter = await connection.query(s8)
                    supporterIds.push(addSalesSupporter.rows[0].id)
                    if (addSalesCaptain.rowCount > 0) {
                        let s8 = dbScript(db_sql['Q8'], { var1: addSalesSupporter.rows[0].user_id })
                        let userName = await connection.query(s8)
                        addSalesSupporter.rows[0].user_name = (userName.rows[0].full_name)?userName.rows[0].full_name:"";
                        salesUsersForLog.push(addSalesSupporter.rows[0])
                    }
                }
            }
            if (products.length > 0) {
                for (let productId of products) {
                    let s9 = dbScript(db_sql['Q155'], { var1: productId, var2: createSales.rows[0].id, var3: checkPermission.rows[0].company_id })
                    let addProduct = await connection.query(s9)
                }
            }

            let s9 = dbScript(db_sql['Q43'], {
                var1: createSales.rows[0].id, var2: commissionSplitId, var3: mysql_real_escape_string(qualification), var4: is_qualified, var5: targetAmount, var6: JSON.stringify(products),
                var7: targetClosingDate, var8: customerId, var9: is_overwrite, var10: checkPermission.rows[0].company_id, var11: revenueId, var12: businessId, var13: salesType, var14: subscriptionPlan, var15: recurringDate, var16: currency, var17: slabId, var18: totalCommission, var19: JSON.stringify(salesUsersForLog)
            })
            let createLog = await connection.query(s9)

            if (createSales.rowCount > 0 && addSalesCaptain.rowCount > 0 && createLog.rowCount > 0) {
                // add notification in notification list
                notification_typeId = createSales.rows[0].id;
                await notificationsOperations({ type: 1, msg: 1.1, notification_typeId, notification_userId }, userId);
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "Sales created successfully"
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
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.allSalesList = async (req, res) => {
    try {
        let userId = req.user.id
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_view_global) {
            let s3 = dbScript(db_sql['Q54'], { var1: checkPermission.rows[0].company_id })
            let salesList = await connection.query(s3)
            for (let salesData of salesList.rows) {
                if (salesData.sales_users) {
                    salesData.sales_users.map(value => {
                        if (value.user_type == process.env.CAPTAIN) {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        } else {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        }
                    })
                }
            }
            if (salesList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Sales commission list',
                    data: salesList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty sales commission list',
                    data: []
                })
            }

        } else if (checkPermission.rows[0].permission_to_view_own) {
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let s3 = dbScript(db_sql['Q178'], { var1: roleUsers.join(",") })
            let salesList = await connection.query(s3)
            for (let salesData of salesList.rows) {
                if (salesData.sales_users) {
                    salesData.sales_users.map(value => {
                        if (value.user_type == process.env.CAPTAIN) {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        } else {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        }
                    })
                }
            }
            if (salesList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Sales list',
                    data: salesList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty sales list',
                    data: []
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "UnAthorised"
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

module.exports.activeSalesList = async (req, res) => {
    try {
        let userId = req.user.id
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_view_global) {
            let s3 = dbScript(db_sql['Q179'], { var1: checkPermission.rows[0].company_id })
            let salesList = await connection.query(s3)
            for (let salesData of salesList.rows) {
                if (salesData.sales_users) {
                    salesData.sales_users.map(value => {
                        if (value.user_type == process.env.CAPTAIN) {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        } else {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        }
                    })
                }
            }
            if (salesList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Active sales list',
                    data: salesList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty active sales list',
                    data: []
                })
            }

        } else if (checkPermission.rows[0].permission_to_view_own) {
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let s3 = dbScript(db_sql['Q181'], { var1: roleUsers.join(",") })
            let salesList = await connection.query(s3)
            for (let salesData of salesList.rows) {
                if (salesData.sales_users) {
                    salesData.sales_users.map(value => {
                        if (value.user_type == process.env.CAPTAIN) {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        } else {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        }
                    })
                }
            }
            if (salesList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Sales commission list',
                    data: salesList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty sales commission list',
                    data: []
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "UnAthorised"
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

module.exports.closedSalesList = async (req, res) => {
    try {
        let userId = req.user.id
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_view_global) {

            let s3 = dbScript(db_sql['Q180'], { var1: checkPermission.rows[0].company_id })
            let salesList = await connection.query(s3)
            for (let salesData of salesList.rows) {
                if (salesData.sales_users) {
                    salesData.sales_users.map(value => {
                        if (value.user_type == process.env.CAPTAIN) {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        } else {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        }
                    })
                }
            }
            if (salesList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Closed sales list',
                    data: salesList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty closed sales list',
                    data: []
                })
            }

        } else if (checkPermission.rows[0].permission_to_view_own) {
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let s3 = dbScript(db_sql['Q182'], { var1: roleUsers.join(",") })
            let salesList = await connection.query(s3)
            for (let salesData of salesList.rows) {
                if (salesData.sales_users) {
                    salesData.sales_users.map(value => {
                        if (value.user_type == process.env.CAPTAIN) {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        } else {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        }
                    })
                }
            }
            if (salesList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Closed sales list',
                    data: salesList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty closed sales  list',
                    data: []
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "UnAthorised"
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

module.exports.salesDetails = async (req, res) => {
    try {
        let userId = req.user.id;
        let salesId = req.query.id;
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let s3 = dbScript(db_sql['Q292'], { var1: checkPermission.rows[0].company_id, var2: salesId })
            let salesList = await connection.query(s3)
            for (let salesData of salesList.rows) {
                if (salesData.sales_users) {
                    salesData.sales_users.map(value => {
                        if (value.user_type == process.env.CAPTAIN) {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        } else {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        }
                    })
                }
            }
            if (salesList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Sales details',
                    data: salesList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty sales commission list',
                    data: []
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "UnAthorised"
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

module.exports.updateSales = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            salesId,
            customerId,
            commissionSplitId,
            captainId,
            qualification,
            is_qualified,
            targetAmount,
            currency,
            products,
            targetClosingDate,
            supporters,
            is_overwrite,
            captainPercentage,
            businessId,
            revenueId,
            leadId,
            salesType,
            subscriptionPlan,
            recurringDate,
            slabId
        } = req.body
        let notification_userId = [];
        let notification_typeId = salesId;
        if (supporters.length > 0) {
            for (let sid of supporters) {
                notification_userId.push(sid.id)
            }
            notification_userId.push(captainId)
        } else {
            notification_userId.push(captainId)
        }
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_update) {
            let supporterIds = []
            await connection.query('BEGIN')

            let _dt = new Date().toISOString();

            let totalCommission = 0;
            let s4 = dbScript(db_sql['Q184'], { var1: slabId })
            let slab = await connection.query(s4)
            let remainingAmount = Number(targetAmount);
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
            totalCommission = totalCommission + commission
            let s5 = dbScript(db_sql['Q63'], { var1: customerId, var2: commissionSplitId, var3: is_overwrite, var4: _dt, var5: salesId, var6: checkPermission.rows[0].company_id, var7: businessId, var8: revenueId, var9: mysql_real_escape_string(qualification), var10: is_qualified, var11: targetAmount, var12: targetClosingDate, var14: salesType, var15: subscriptionPlan, var16: recurringDate, var17: currency, var18: slabId, var19: leadId, var20: totalCommission })
            let updateSales = await connection.query(s5)


            // let s6 = dbScript(db_sql['Q56'], { var1: commissionSplitId, var2: checkPermission.rows[0].company_id })
            // let findSalesCommission = await connection.query(s6)

            // let closer_percentage = closerPercentage
            let salesUsersForLog = []
            let s7 = dbScript(db_sql['Q64'], { var1: captainId, var2: captainPercentage, var3: commissionSplitId, var4: _dt, var5: salesId, var6: checkPermission.rows[0].company_id, var7: process.env.CAPTAIN })
            let updateSalesCaptain = await connection.query(s7)
            if (updateSalesCaptain.rowCount > 0) {
                let s8 = dbScript(db_sql['Q8'], { var1: updateSalesCaptain.rows[0].user_id })
                let userName = await connection.query(s8)
                updateSalesCaptain.rows[0].user_name = (userName.rows[0].full_name)?userName.rows[0].full_name:"";
                salesUsersForLog.push(updateSalesCaptain.rows[0])
            }

            let s8 = dbScript(db_sql['Q61'], { var1: _dt, var2: salesId, var3: checkPermission.rows[0].company_id, var4: process.env.SUPPORT })
            let updateSupporter = await connection.query(s8)
            if (supporters.length > 0) {
                for (let supporterData of supporters) {
                    let s8 = dbScript(db_sql['Q58'], { var1: supporterData.id, var2: Number(supporterData.percentage), var3: process.env.SUPPORT, var4: commissionSplitId, var5: salesId, var6: checkPermission.rows[0].company_id })
                    let addSalesSupporter = await connection.query(s8)
                    supporterIds.push(addSalesSupporter.rows[0].id)
                    if (addSalesSupporter.rowCount > 0) {
                        let s8 = dbScript(db_sql['Q8'], { var1: addSalesSupporter.rows[0].user_id })
                        let userName = await connection.query(s8)
                        addSalesSupporter.rows[0].user_name = (userName.rows[0].full_name)?userName.rows[0].full_name:"";
                        salesUsersForLog.push(addSalesSupporter.rows[0])
                    }
                }
            }
            let s9 = dbScript(db_sql['Q156'], { var1: _dt, var2: salesId, var3: checkPermission.rows[0].company_id })
            let updateProduct = await connection.query(s9)
            if (products.length > 0) {
                for (let productId of products) {
                    let s9 = dbScript(db_sql['Q155'], { var1: productId, var2: salesId, var3: checkPermission.rows[0].company_id })
                    let addProduct = await connection.query(s9)
                }
            }
            let s10 = dbScript(db_sql['Q43'], {
                var1: updateSales.rows[0].id, var2: commissionSplitId, var3: mysql_real_escape_string(qualification), var4: is_qualified, var5: targetAmount, var6: JSON.stringify(products), var7: targetClosingDate, var8: customerId, var9: is_overwrite, var10: checkPermission.rows[0].company_id, var11: revenueId, var12: businessId, var13: salesType, var14: subscriptionPlan, var15: recurringDate, var16: currency, var17: slabId, var18: totalCommission, var19: JSON.stringify(salesUsersForLog)
            })
            let createLog = await connection.query(s10)

            if (updateSales.rowCount > 0 && updateSalesCaptain.rowCount > 0 && createLog.rowCount > 0) {
                // update notification in notification list
                await notificationsOperations({ type: 1, msg: 1.2, notification_typeId, notification_userId }, userId);

                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Sales updated successfully"
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
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }

}

module.exports.deleteSales = async (req, res) => {

    try {
        let userId = req.user.id
        let {
            salesId
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_delete) {

            await connection.query('BEGIN')

            let _dt = new Date().toISOString();
            let s4 = dbScript(db_sql['Q60'], { var1: _dt, var2: salesId, var3: checkPermission.rows[0].company_id })
            let deleteSales = await connection.query(s4)

            let s5 = dbScript(db_sql['Q62'], { var1: _dt, var2: salesId, var3: checkPermission.rows[0].company_id })
            let deleteSalesUsers = await connection.query(s5)

            let s6 = dbScript(db_sql['Q156'], { var1: _dt, var2: salesId, var3: checkPermission.rows[0].company_id })
            let deleteSalesProduct = await connection.query(s6)

            if (deleteSales.rowCount > 0 && deleteSalesUsers.rowCount >= 0 && deleteSalesProduct.rowCount >= 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Sales deleted successfully"
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
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }

}

module.exports.salesLogsList = async (req, res) => {
    try {
        let { salesId } = req.query
        let userId = req.user.id
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let s3 = dbScript(db_sql['Q44'], { var1: salesId })
            let saleslogList = await connection.query(s3)

            for (let salesData of saleslogList.rows) {
                let sales_users = [];
                let products = [];
                if (salesData.sales_users) {
                    JSON.parse(salesData.sales_users).map(value => {
                        if (value.user_type == process.env.CAPTAIN) {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.user_percentage) / 100) * (salesData.booking_commission)) : 0;
                        } else {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.user_percentage) / 100) * (salesData.booking_commission)) : 0;
                        }
                        sales_users.push(value)
                    })
                }
                if (salesData.products) {
                    for (let productId of JSON.parse(salesData.products)) {
                        let s4 = dbScript(db_sql['Q96'], { var1: productId, var2: checkPermission.rows[0].company_id })
                        let productsList = await connection.query(s4)
                        products.push(productsList.rows[0])
                    }
                }
                salesData.sales_users = sales_users
                salesData.products = products
            }
            if (saleslogList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Sales log list',
                    data: saleslogList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty sales log list',
                    data: []
                })
            }

        } else {
            res.status(403).json({
                success: false,
                message: "UnAthorised"
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

module.exports.addfollowUpNotes = async (req, res) => {
    try {
        let userId = req.user.id
        let { note, salesCommissionId } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_create) {
            let s4 = dbScript(db_sql['Q31'], { var1: salesCommissionId, var2: checkPermission.rows[0].company_id, var3: userId, var4: mysql_real_escape_string(note) })
            let addNote = await connection.query(s4)
            if (addNote.rowCount > 0) {
                res.json({
                    status: 201,
                    success: true,
                    message: "Note created successfully"
                })

            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong"
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "UnAthorised"
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

module.exports.notesList = async (req, res) => {
    try {
        let userId = req.user.id
        let { salesCommissionId } = req.query
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let s4 = dbScript(db_sql['Q32'], { var1: salesCommissionId })
            let findNOtes = await connection.query(s4)
            if (findNOtes.rows.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Notes list',
                    data: findNOtes.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty notes list',
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

module.exports.deleteNote = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            noteId
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_delete) {

            await connection.query('BEGIN')

            let _dt = new Date().toISOString();
            let s4 = dbScript(db_sql['Q66'], { var1: _dt, var2: noteId })
            let deleteDeal = await connection.query(s4)

            await connection.query('COMMIT')

            if (deleteDeal.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Note deleted successfully"
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
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.uploadSalesContract = async (req, res) => {
    try {
        let file = req.file
        let path = `${process.env.SALES_CONTRACT_LINK}/${file.originalname}`;
        res.json({
            success: true,
            status: 200,
            message: "Sales Contract uploaded successfully!",
            data: path
        })
    } catch (error) {
        res.json({
            success: false,
            status: 400,
            message: error.message
        })
    }
}

module.exports.closeSales = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            salesCommissionId,
            contract
        } = req.body
        let notification_userId = [];
        let notification_typeId = salesCommissionId;
        notification_userId.push(userId)

        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {
            await connection.query('BEGIN')
            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q40'], { var1: _dt, var2: _dt, var3: salesCommissionId, var4: contract })
            let closeSales = await connection.query(s2)

            let s3 = dbScript(db_sql['Q158'], { var1: _dt, var2: _dt, var3: salesCommissionId })
            let updateSalesLog = await connection.query(s3)

            let s4 = dbScript(db_sql['Q271'], { var1: salesCommissionId })
            let findSales = await connection.query(s4)

            let s5 = dbScript(db_sql['Q322'], { var1: _dt, var2: findSales.rows[0].lead_id })
            let updateLead = await connection.query(s5)

            // add notification in notification list
            await notificationsOperations({ type: 1, msg: 1.4, notification_typeId, notification_userId }, userId);

            if (closeSales.rowCount > 0 && updateSalesLog.rowCount > 0 && updateLead.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Sales closed successfully"
                })
            } else {
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: "something went wrong"
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

module.exports.usersListForSales = async (req, res) => {
    try {
        let userId = req.user.id
        let s3 = dbScript(db_sql['Q41'], { var1: userModule, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            let s4 = dbScript(db_sql['Q24'], { var1: checkPermission.rows[0].company_id })
            let findUsers = await connection.query(s4);
            if (findUsers.rows.length > 0) {
                for (let data of findUsers.rows) {
                    let s5 = dbScript(db_sql['Q12'], { var1: data.role_id })
                    let findRole = await connection.query(s5);
                    if (findRole.rowCount > 0) {
                        data.roleName = findRole.rows[0].role_name
                    } else {
                        data.roleName = null
                    }
                }
                res.json({
                    status: 200,
                    success: true,
                    message: 'Users list',
                    data: findUsers.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty users list",
                    data: []
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let userListArr = []
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
            let s4 = dbScript(db_sql['Q268'], { var1: checkPermission.rows[0].id })
            let addUser = await connection.query(s4)
            let s5 = dbScript(db_sql['Q12'], { var1: addUser.rows[0].role_id })
            let findRole = await connection.query(s5);
            if (findRole.rowCount > 0) {
                addUser.rows[0].roleName = findRole.rows[0].role_name
            } else {
                addUser.rows[0].roleName = null
            }
            userListArr.push(addUser.rows[0])
            for (let id of roleUsers) {
                let s5 = dbScript(db_sql['Q176'], { var1: id })
                let findUsers = await connection.query(s5);
                if (findUsers.rowCount > 0) {
                    for (let user of findUsers.rows) {
                        let s5 = dbScript(db_sql['Q12'], { var1: user.role_id })
                        let findRole = await connection.query(s5);
                        if (findRole.rowCount > 0) {
                            user.roleName = findRole.rows[0].role_name
                        } else {
                            user.roleName = null
                        }
                        userListArr.push(user)
                    }
                }
            }
            if (userListArr.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Users list',
                    data: userListArr
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty Users list',
                    data: userListArr
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "Unathorized",
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

module.exports.commissionSplitListForSales = async (req, res) => {
    try {
        let userId = req.user.id
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {

            let s4 = dbScript(db_sql['Q162'], { var1: checkPermission.rows[0].company_id })
            let commissionList = await connection.query(s4)
            if (commissionList.rows.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Commission split list",
                    data: commissionList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty commission split list",
                    data: []
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "UnAthorised"
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

module.exports.transferBackSales = async (req, res) => {
    try {
        let userId = req.user.id
        let { salesId, creatorId, transferReason } = req.body
        let notification_userId = [];
        let notification_typeId = salesId;
        notification_userId.push(creatorId)

        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {
            await connection.query('BEGIN')
            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q269'], { var1: creatorId, var2: _dt, var3: salesId, var4: process.env.CAPTAIN })
            let transferSales = await connection.query(s2)

            let s3 = dbScript(db_sql['Q270'], { var1: mysql_real_escape_string(transferReason), var2: _dt, var3: salesId, var4: userId })
            let updateReason = await connection.query(s3)

            let s4 = dbScript(db_sql['Q284'], { var1: userId, var2: creatorId, var3: _dt, var4: salesId, var5:  mysql_real_escape_string(transferReason), var6: checkPermission.rows[0].id, var7: checkPermission.rows[0].company_id })
            let addTransferSales = await connection.query(s4)
            // add notification in notification list
            await notificationsOperations({ type: 1, msg: 1.3, notification_typeId, notification_userId }, userId);

            if (transferSales.rowCount > 0 && updateReason.rowCount > 0 && addTransferSales.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: 'Sales Transfered back successfully',
                })
            } else {
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: 'Something went wrong',
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

module.exports.transferBackList = async (req, res) => {
    try {
        let userId = req.user.id
        let { salesId } = req.query
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let s1 = dbScript(db_sql['Q285'], { var1: salesId })
            let transferedBackList = await connection.query(s1)
            if (transferedBackList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Transfered sales list',
                    data: transferedBackList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Empty Transfered sales list',
                    data: transferedBackList.rows
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

module.exports.uploadSalesInvoice = async (req, res) => {
    try {
        let file = req.file
        let path = `${process.env.SALES_INVOICE_LINK}/${file.originalname}`;
        res.json({
            success: true,
            status: 200,
            message: "Sales invoice uploaded successfully!",
            data: path
        })
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.addRecognizedRevenue = async (req, res) => {
    try {
        let userId = req.user.id
        let { salesId, date, amount, notes, invoice } = req.body

        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)

        let s2 = dbScript(db_sql['Q271'], { var1: salesId })
        let findSales = await connection.query(s2)

        if (findSales.rowCount > 0) {
            let targetAmount = Number(findSales.rows[0].target_amount)
            await connection.query('BEGIN')
            //add RecognizeRevenue in db
            let s3 = dbScript(db_sql['Q272'], { var1: date, var2: amount, var3: targetAmount, var4: mysql_real_escape_string(notes), var5: invoice, var6: salesId, var7: checkPermission.rows[0].id, var8: checkPermission.rows[0].company_id })
            let addRecognizeRevenue = await connection.query(s3)
            await connection.query('COMMIT')

            //get Recognized Revenue total that submitted
            let s5 = dbScript(db_sql['Q300'], { var1: salesId })
            let recognizeRevenue = await connection.query(s5)

            //get slab's list here
            let totalCommission = 0;
            let s4 = dbScript(db_sql['Q184'], { var1: findSales.rows[0].slab_id })
            let slab = await connection.query(s4)

            let remainingAmount = Number(recognizeRevenue.rows[0].amount);
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
            totalCommission = totalCommission + commission;
            let s6 = dbScript(db_sql['Q296'], { var1: totalCommission, var2: salesId })
            let updateSalesData = await connection.query(s6)


            if (addRecognizeRevenue.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Recognized revenue added successfully",
                })
            } else {
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong",
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Sales not found",
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

module.exports.recognizedRevenueList = async (req, res) => {
    try {
        let userId = req.user.id
        let { salesId } = req.query
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let s2 = dbScript(db_sql['Q273'], { var1: salesId })
            let recognizedList = await connection.query(s2)
            if (recognizedList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Recognized revenue list",
                    data: recognizedList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty recognized revenue list",
                    data: recognizedList.rows
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

module.exports.getRemainingTargetAmount = async (req, res) => {
    try {
        let salesId = req.query.id;
        let s1 = dbScript(db_sql['Q271'], { var1: salesId })
        let getSalesData = await connection.query(s1)

        let s2 = dbScript(db_sql['Q300'], { var1: salesId })
        let recognizedRevenueData = await connection.query(s2)
        let remainingAmount = Number(getSalesData.rows[0].target_amount) - Number(recognizedRevenueData.rows[0].amount);
        if (getSalesData.rowCount > 0) {
            res.json({
                status: 200,
                success: true,
                message: "Remaining amount showed successfully",
                data: remainingAmount
            })
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Something went wrong",
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

module.exports.getAllApiDeatilsRelatedSales = async (req, res) => {
    try {
        let userId = req.user.id
        let moduleName = process.env.SALES_MODULE;
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global) {
            // here we are getting product, customer, user, slab,commissionSlab deatils by global permission
            let allDetails = {};
            let s2 = dbScript(db_sql['Q94'], { var1: checkPermission.rows[0].company_id })
            let productList = await connection.query(s2)
            if (productList.rowCount > 0) {
                allDetails.productList = productList.rows
            }else{
                allDetails.productList = []
            }

            let s3 = dbScript(db_sql['Q39'], { var1: checkPermission.rows[0].company_id })
            let customerList = await connection.query(s3)
            if (customerList.rowCount > 0) {
                allDetails.customerList = customerList.rows
            }else{
                allDetails.customerList = []
            }

            let s4 = dbScript(db_sql['Q15'], { var1: checkPermission.rows[0].company_id })
            let userList = await connection.query(s4);
            if (userList.rowCount > 0) {
                allDetails.userList = userList.rows
            }else{
                allDetails.userList = []
            }

            //get slab list here 
            let s5 = dbScript(db_sql['Q17'], { var1: checkPermission.rows[0].company_id })
            let slabList = await connection.query(s5)
            if (slabList.rowCount > 0) {
                const unique = [...new Map(slabList.rows.map(item => [item['slab_id'], item])).values()]
                allDetails.slabList = unique;
            }else{
                allDetails.slabList = []
            }

            let s6 = dbScript(db_sql['Q50'], { var1: checkPermission.rows[0].company_id })
            let commissionList = await connection.query(s6)
            if (commissionList.rowCount > 0) {
                allDetails.commissionList = commissionList.rows
            }else{
                allDetails.commissionList = []
            }

            if (allDetails) {
                res.json({
                    status: 200,
                    success: true,
                    message: "All details list",
                    data: allDetails
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty details list",
                    data: []
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            // here we are getting product, customer, user, slab,commissionSlab deatils by own permission of user and its child user
            let allDetails = {};
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);

            let s1 = dbScript(db_sql['Q315'], { var1: roleUsers.join(",") })
            let productList = await connection.query(s1)
            if (productList.rowCount > 0) {
                allDetails.productList = productList.rows
            }else{
                allDetails.productList = []
            }

            let s2 = dbScript(db_sql['Q316'], { var1: roleUsers.join(","), var2: false })
            let customerList = await connection.query(s2)
            if (customerList.rowCount > 0) {
                allDetails.customerList = customerList.rows
            }else{
                allDetails.customerList = []
            }

            let s3 = dbScript(db_sql['Q317'], { var1: roleUsers.join(",") })
            let userList = await connection.query(s3);
            if (userList.rowCount > 0) {
                allDetails.userList = userList.rows
            }else{
                allDetails.userList = []
            }

            //get slab list here 
            let s4 = dbScript(db_sql['Q17'], { var1: checkPermission.rows[0].company_id })
            let slabList = await connection.query(s4)
            if (slabList.rowCount > 0) {
                const unique = [...new Map(slabList.rows.map(item => [item['slab_id'], item])).values()]
                allDetails.slabList = unique;
            }else{
                allDetails.slabList = []
            }

            let s5 = dbScript(db_sql['Q50'], { var1: checkPermission.rows[0].company_id })
            let commissionList = await connection.query(s5)
            if (commissionList.rowCount > 0) {
                allDetails.commissionList = commissionList.rows
            }else{
                allDetails.commissionList = []
            }

            if (allDetails) {
                res.json({
                    status: 200,
                    success: true,
                    message: "All details list",
                    data: allDetails
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty details list",
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