const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const { mysql_real_escape_string, getUserAndSubUser, notificationsOperations, calculateCommission, getParentUserList } = require('../utils/helper')
const moduleName = process.env.SALES_MODULE
const customerModule = process.env.CUSTOMERS_MODULE
const userModule = process.env.USERS_MODULE
const { LeadActivityCreate } = require("./leadsController");


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
            let s4 = dbScript(db_sql['Q271'], { var1: roleUsers.join(",") })
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
            is_service_performed,
            service_perform_note

        } = req.body
        await connection.query('BEGIN')
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

            businessId = (businessId == '') ? '' : businessId
            revenueId = (revenueId == '') ? '' : revenueId
            targetAmount = (targetAmount == '') ? '0' : targetAmount

            let totalCommission = await calculateCommission(slabId, targetAmount)

            let _dt = new Date().toISOString();

            let s5 = dbScript(db_sql['Q53'], { var1: customerId, var2: commissionSplitId, var3: is_overwrite, var4: checkPermission.rows[0].company_id, var5: businessId, var6: revenueId, var7: mysql_real_escape_string(qualification), var8: is_qualified, var9: targetAmount, var10: targetClosingDate, var11: salesType, var12: subscriptionPlan, var13: recurringDate, var14: currency, var15: userId, var16: slabId, var17: leadId, var18: totalCommission, var19: is_qualified ? _dt : 'null', var20: is_service_performed, var21: mysql_real_escape_string(service_perform_note), var22: is_service_performed ? _dt : 'null' })
            let createSales = await connection.query(s5);

            //Update Logs
            let sul = dbScript(db_sql['Q482'], { var1: createSales.rows[0].id, var2: leadId });
            let insertSalesId = await connection.query(sul);
            console.log(insertSalesId)

            let salesUsersForLog = [];
            let s7 = dbScript(db_sql['Q57'], { var1: captainId, var2: Number(captainPercentage), var3: process.env.CAPTAIN, var4: commissionSplitId, var5: createSales.rows[0].id, var6: checkPermission.rows[0].company_id })
            let addSalesCaptain = await connection.query(s7)
            if (addSalesCaptain.rowCount > 0) {
                let s8 = dbScript(db_sql['Q8'], { var1: addSalesCaptain.rows[0].user_id })
                let userName = await connection.query(s8)
                addSalesCaptain.rows[0].user_name = (userName.rows[0].full_name) ? mysql_real_escape_string(userName.rows[0].full_name) : "";
                salesUsersForLog.push(addSalesCaptain.rows[0])
            }

            if (supporters.length > 0) {
                for (let supporterData of supporters) {
                    let s8 = dbScript(db_sql['Q57'], { var1: supporterData.id, var2: Number(supporterData.percentage), var3: process.env.SUPPORT, var4: commissionSplitId, var5: createSales.rows[0].id, var6: checkPermission.rows[0].company_id })
                    addSalesSupporter = await connection.query(s8)
                    supporterIds.push(addSalesSupporter.rows[0].id)
                    if (addSalesSupporter.rowCount > 0) {
                        let s8 = dbScript(db_sql['Q8'], { var1: addSalesSupporter.rows[0].user_id })
                        let userName = await connection.query(s8)
                        addSalesSupporter.rows[0].user_name = (userName.rows[0].full_name) ? mysql_real_escape_string(userName.rows[0].full_name) : "";
                        salesUsersForLog.push(addSalesSupporter.rows[0])
                    }
                }
            }
            if (products.length > 0) {
                for (let productId of products) {
                    let s9 = dbScript(db_sql['Q141'], { var1: productId, var2: createSales.rows[0].id, var3: checkPermission.rows[0].company_id })
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

                for(let pid of products) {
                    await LeadActivityCreate(leadId, notification_typeId, userId, "Sales Created", checkPermission.rows[0].company_id, pid);
                }

                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "Sales created successfully",
                    data: createSales.rows[0].id
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
        let { status } = req.query;
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global) {
            let salesList;
            if (status.toLowerCase() == 'all') {
                let s2 = dbScript(db_sql['Q54'], { var1: checkPermission.rows[0].company_id })
                salesList = await connection.query(s2)
            }
            if (status.toLowerCase() == 'active') {
                let s3 = dbScript(db_sql['Q156'], { var1: checkPermission.rows[0].company_id })
                salesList = await connection.query(s3)
            }
            if (status.toLowerCase() == 'closed') {
                let s4 = dbScript(db_sql['Q157'], { var1: checkPermission.rows[0].company_id })
                salesList = await connection.query(s4)
            }
            if (status.toLowerCase() == 'perpetual') {
                let s4 = dbScript(db_sql['Q300'], { var1: checkPermission.rows[0].company_id, var2: 'Perpetual' })
                salesList = await connection.query(s4)
            }
            if (status.toLowerCase() == 'subscription') {
                let s5 = dbScript(db_sql['Q300'], { var1: checkPermission.rows[0].company_id, var2: 'Subscription' })
                salesList = await connection.query(s5)
            }
            if (status.toLowerCase() == 'recognized') {
                let s6 = dbScript(db_sql['Q302'], { var1: checkPermission.rows[0].company_id })
                salesList = await connection.query(s6)
            }
            if (status.toLowerCase() == 'archived') {
                let s7 = dbScript(db_sql['Q72'], { var1: checkPermission.rows[0].company_id })
                salesList = await connection.query(s7)
            }
            if (status == 'partialRecognized') {
                let s8 = dbScript(db_sql['Q473'], { var1: checkPermission.rows[0].company_id })
                salesList = await connection.query(s8)
            }
            if (status == 'transferredBack') {
                let s9 = dbScript(db_sql['Q474'], { var1: checkPermission.rows[0].company_id })
                salesList = await connection.query(s9)
            }
            if (salesList.rowCount > 0) {
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
            let salesList;
            if (status.toLowerCase() == 'all') {
                let s1 = dbScript(db_sql['Q155'], { var1: roleUsers.join(",") })
                salesList = await connection.query(s1)
            }
            if (status.toLowerCase() == 'active') {
                let s2 = dbScript(db_sql['Q158'], { var1: roleUsers.join(",") })
                salesList = await connection.query(s2)
            }
            if (status.toLowerCase() == 'closed') {
                let s3 = dbScript(db_sql['Q159'], { var1: roleUsers.join(",") })
                salesList = await connection.query(s3)
            }
            if (status.toLowerCase() == 'perpetual') {
                let s4 = dbScript(db_sql['Q301'], { var1: roleUsers.join(","), var2: 'Perpetual' })
                salesList = await connection.query(s4)
            }
            if (status.toLowerCase() == 'subscription') {
                let s5 = dbScript(db_sql['Q301'], { var1: roleUsers.join(","), var2: 'Subscription' })
                salesList = await connection.query(s5)
            }
            if (status.toLowerCase() == 'recognized') {
                let s5 = dbScript(db_sql['Q303'], { var1: roleUsers.join(",") })
                salesList = await connection.query(s5)
            }
            if (status.toLowerCase() == 'archived') {
                let s3 = dbScript(db_sql['Q73'], { var1: roleUsers.join(",") })
                salesList = await connection.query(s3)
            }

            if (salesList.rowCount > 0) {
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

module.exports.salesDetails = async (req, res) => {
    try {
        let userId = req.user.id;
        let salesId = req.query.id;
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let s3 = dbScript(db_sql['Q421'], { var1: checkPermission.rows[0].company_id, var2: salesId })
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
            slabId,
            is_service_performed,
            service_perform_note
        } = req.body

        await connection.query('BEGIN')
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

            let _dt = new Date().toISOString();

            let totalCommission = await calculateCommission(slabId, targetAmount)

            let s11 = dbScript(db_sql['Q229'], { var1: salesId })
            let findSales = await connection.query(s11)
            let committedDate = (!is_qualified) ? 'null' :
                (findSales.rows[0].committed_at !== null && is_qualified) ? new Date(findSales.rows[0].committed_at).toISOString() : (_dt);

            let performedDate = (!is_service_performed) ? 'null' :
                (findSales.rows[0].service_performed_at !== null && is_service_performed) ? new Date(findSales.rows[0].service_performed_at).toISOString() : _dt;


            let s5 = dbScript(db_sql['Q62'], { var1: customerId, var2: commissionSplitId, var3: is_overwrite, var4: _dt, var5: salesId, var6: checkPermission.rows[0].company_id, var7: businessId, var8: revenueId, var9: mysql_real_escape_string(qualification), var10: is_qualified, var11: targetAmount, var12: targetClosingDate, var14: salesType, var15: subscriptionPlan, var16: recurringDate, var17: currency, var18: slabId, var19: leadId, var20: totalCommission, var21: committedDate, var22: is_service_performed, var23: mysql_real_escape_string(service_perform_note), var24: performedDate })
            let updateSales = await connection.query(s5)

            let salesUsersForLog = []
            let s7 = dbScript(db_sql['Q63'], { var1: captainId, var2: captainPercentage, var3: commissionSplitId, var4: _dt, var5: salesId, var6: checkPermission.rows[0].company_id, var7: process.env.CAPTAIN })
            let updateSalesCaptain = await connection.query(s7)
            if (updateSalesCaptain.rowCount > 0) {
                let s8 = dbScript(db_sql['Q8'], { var1: updateSalesCaptain.rows[0].user_id })
                let userName = await connection.query(s8)
                updateSalesCaptain.rows[0].user_name = (userName.rows[0].full_name) ? mysql_real_escape_string(userName.rows[0].full_name) : "";
                salesUsersForLog.push(updateSalesCaptain.rows[0])
            }

            let s8 = dbScript(db_sql['Q60'], { var1: _dt, var2: salesId, var3: checkPermission.rows[0].company_id, var4: process.env.SUPPORT })
            let updateSupporter = await connection.query(s8)
            if (supporters.length > 0) {
                for (let supporterData of supporters) {
                    let s8 = dbScript(db_sql['Q57'], { var1: supporterData.id, var2: Number(supporterData.percentage), var3: process.env.SUPPORT, var4: commissionSplitId, var5: salesId, var6: checkPermission.rows[0].company_id })
                    let addSalesSupporter = await connection.query(s8)
                    supporterIds.push(addSalesSupporter.rows[0].id)
                    if (addSalesSupporter.rowCount > 0) {
                        let s8 = dbScript(db_sql['Q8'], { var1: addSalesSupporter.rows[0].user_id })
                        let userName = await connection.query(s8)
                        addSalesSupporter.rows[0].user_name = (userName.rows[0].full_name) ? mysql_real_escape_string(userName.rows[0].full_name) : "";
                        salesUsersForLog.push(addSalesSupporter.rows[0])
                    }
                }
            }
            let s9 = dbScript(db_sql['Q142'], { var1: _dt, var2: salesId, var3: checkPermission.rows[0].company_id })
            let updateProduct = await connection.query(s9)
            if (products.length > 0) {
                for (let productId of products) {
                    let s9 = dbScript(db_sql['Q141'], { var1: productId, var2: salesId, var3: checkPermission.rows[0].company_id })
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
        await connection.query('BEGIN')
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_delete) {

            let _dt = new Date().toISOString();
            let s4 = dbScript(db_sql['Q59'], { var1: _dt, var2: salesId, var3: checkPermission.rows[0].company_id })
            let deleteSales = await connection.query(s4)

            let s5 = dbScript(db_sql['Q61'], { var1: _dt, var2: salesId, var3: checkPermission.rows[0].company_id })
            let deleteSalesUsers = await connection.query(s5)

            let s6 = dbScript(db_sql['Q142'], { var1: _dt, var2: salesId, var3: checkPermission.rows[0].company_id })
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
                        let s4 = dbScript(db_sql['Q86'], { var1: productId, var2: checkPermission.rows[0].company_id })
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
        let { note, salesCommissionId, leadId, notes_type, product_id } = req.body
        await connection.query('BEGIN')
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_create) {
            const tmpLeadId = leadId ? leadId : null;
            const tmpSalesCommissionId = salesCommissionId ? salesCommissionId : null;
            let insertDone = 0;
            if(product_id.length > 0) {
                for(let pid of product_id) {
                    let s4 = dbScript(db_sql['Q31'], { var1: tmpSalesCommissionId, var2: checkPermission.rows[0].company_id, var3: userId, var4: mysql_real_escape_string(note), var5: mysql_real_escape_string(notes_type), var6: tmpLeadId, var7: pid });
                    let addNote = await connection.query(s4)
                    if (addNote.rowCount > 0) {
                        insertDone = 1;
                    }
                }
            } else {
                let s4 = dbScript(db_sql['Q31'], { var1: tmpSalesCommissionId, var2: checkPermission.rows[0].company_id, var3: userId, var4: mysql_real_escape_string(note), var5: mysql_real_escape_string(notes_type), var6: tmpLeadId, var7: null })
                let addNote = await connection.query(s4)
                if (addNote.rowCount > 0) {
                    insertDone = 1;
                }
            }
            if(insertDone != 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "Note created successfully"
                })
            }else {
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
                message: "UnAthorised"
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
        await connection.query('BEGIN')
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_delete) {

            let _dt = new Date().toISOString();
            let s4 = dbScript(db_sql['Q64'], { var1: _dt, var2: noteId })
            let deleteDeal = await connection.query(s4)

            if (deleteDeal.rowCount > 0) {
                await connection.query('COMMIT')
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
        let path = `${process.env.SALES_CONTRACT_LINK}/${file.filename}`;
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
        await connection.query('BEGIN')
        let notification_userId = [];
        let notification_typeId = salesCommissionId;
        notification_userId.push(userId)

        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {

            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q40'], { var1: _dt, var2: _dt, var3: salesCommissionId, var4: contract })
            let closeSales = await connection.query(s2)

            let s3 = dbScript(db_sql['Q143'], { var1: _dt, var2: _dt, var3: salesCommissionId })
            let updateSalesLog = await connection.query(s3)

            let s4 = dbScript(db_sql['Q229'], { var1: salesCommissionId })
            let findSales = await connection.query(s4)

            let s5 = dbScript(db_sql['Q275'], { var1: _dt, var2: findSales.rows[0].lead_id })
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
                let s3 = dbScript(db_sql['Q162'], { var1: roleId })
                let findUsers = await connection.query(s3)
                if (findUsers.rowCount > 0) {
                    for (let user of findUsers.rows) {
                        roleUsers.push(user.id)
                    }
                }
            }
            let s4 = dbScript(db_sql['Q226'], { var1: checkPermission.rows[0].id })
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
                let s5 = dbScript(db_sql['Q154'], { var1: id })
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

            let s4 = dbScript(db_sql['Q147'], { var1: checkPermission.rows[0].company_id })
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
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {

            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q227'], { var1: creatorId, var2: _dt, var3: salesId, var4: process.env.CAPTAIN })
            let transferSales = await connection.query(s2)

            let s3 = dbScript(db_sql['Q228'], { var1: mysql_real_escape_string(transferReason), var2: _dt, var3: salesId, var4: userId })
            let updateReason = await connection.query(s3)

            let s4 = dbScript(db_sql['Q240'], { var1: userId, var2: creatorId, var3: _dt, var4: salesId, var5: mysql_real_escape_string(transferReason), var6: checkPermission.rows[0].id, var7: checkPermission.rows[0].company_id })
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
        await connection.query('ROLLBACK')
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
            let s1 = dbScript(db_sql['Q241'], { var1: salesId })
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
        let path = `${process.env.SALES_INVOICE_LINK}/${file.filename}`;
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
        await connection.query('BEGIN')

        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        let s2 = dbScript(db_sql['Q423'], { var1: salesId })
        let findSales = await connection.query(s2);

        if (findSales.rowCount > 0) {
            let targetAmount = Number(findSales.rows[0].target_amount)
            //add RecognizeRevenue in db
            let s3 = dbScript(db_sql['Q230'], { var1: date, var2: amount, var3: targetAmount, var4: mysql_real_escape_string(notes), var5: invoice, var6: salesId, var7: checkPermission.rows[0].id, var8: checkPermission.rows[0].company_id })
            let addRecognizeRevenue = await connection.query(s3)

            //get Recognized Revenue total that submitted
            let s5 = dbScript(db_sql['Q256'], { var1: salesId })
            let recognizeRevenue = await connection.query(s5)

            let totalCommission = await calculateCommission(findSales.rows[0].slab_id, recognizeRevenue.rows[0].amount)

            let commissionOncurrentAmount = 0
            let s11 = dbScript(db_sql['Q376'], { var1: salesId });
            let previousCommission = await connection.query(s11);

            if (previousCommission.rowCount > 0) {
                commissionOncurrentAmount = Number(totalCommission) - Number(previousCommission.rows[0].commission)
            } else {
                commissionOncurrentAmount = Number(totalCommission)
            }
            for (let comData of findSales.rows) {
                let userCommission = Number(commissionOncurrentAmount * Number(comData.user_percentage / 100))

                userCommission = userCommission.toFixed(2);
                let notification_userId = [];
                let s4 = dbScript(db_sql['Q472'], { var1: checkPermission.rows[0].company_id, var2: comData.created_by })
                let findUsers = await connection.query(s4);
                if (findUsers.rows.length > 0) {
                    if (!findUsers.rows[0].deleted_at) {
                        notification_userId.push(comData.created_by)
                    }
                }
                let s8 = dbScript(db_sql['Q339'], { var1: comData.user_id, var2: comData.id, var3: comData.user_type })
                let findCommission = await connection.query(s8)

                // if (findCommission.rowCount == 0) {
                let s7 = dbScript(db_sql['Q334'], { var1: comData.user_id, var2: comData.id, var3: checkPermission.rows[0].company_id, var4: Number(userCommission), var5: comData.user_type })
                let addUserCommission = await connection.query(s7);
                // } else {
                // let s9 = dbScript(db_sql['Q337'], { var1: Number(userCommission), var2: findCommission.rows[0].id })
                // let updateUserCommission = await connection.query(s9);
                // }

                let notification_typeId = findSales.rows[0].id;
                await notificationsOperations({ type: 6, msg: 6.1, notification_typeId, notification_userId }, userId);

                let recognizedUserCommission = Number(commissionOncurrentAmount * Number(comData.user_percentage / 100))

                recognizedUserCommission = recognizedUserCommission.toFixed(2)

                let s10 = dbScript(db_sql['Q374'], { var1: comData.user_id, var2: comData.id, var3: checkPermission.rows[0].company_id, var4: Number(recognizedUserCommission), var5: comData.user_type, var6: date, var7: amount })
                let addRecognizedCommission = await connection.query(s10)
            }

            let s6 = dbScript(db_sql['Q253'], { var1: totalCommission, var2: salesId })
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
            let s2 = dbScript(db_sql['Q231'], { var1: salesId })
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
        let s1 = dbScript(db_sql['Q229'], { var1: salesId })
        let getSalesData = await connection.query(s1)

        let s2 = dbScript(db_sql['Q256'], { var1: salesId })
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
        let allDetails = {};

        let productModule = process.env.PRODUCTS_MODULE;
        let s1 = dbScript(db_sql['Q41'], { var1: productModule, var2: userId })
        let checkPermissionForProduct = await connection.query(s1)
        if (checkPermissionForProduct.rows[0].permission_to_view_global) {
            // here we are getting product deatils by global permission

            let s2 = dbScript(db_sql['Q84'], { var1: checkPermissionForProduct.rows[0].company_id })
            let productList = await connection.query(s2)
            if (productList.rowCount > 0) {
                allDetails.productList = productList.rows
            } else {
                allDetails.productList = []
            }

        } else if (checkPermissionForProduct.rows[0].permission_to_view_own) {
            // here we are getting product deatils by own permission of user and its child user
            let roleUsers = await getUserAndSubUser(checkPermissionForProduct.rows[0]);

            let s1 = dbScript(db_sql['Q270'], { var1: roleUsers.join(",") })
            let productList = await connection.query(s1)
            if (productList.rowCount > 0) {
                allDetails.productList = productList.rows
            } else {
                allDetails.productList = []
            }

        }

        let customerModule = process.env.CUSTOMERS_MODULE;
        let s2 = dbScript(db_sql['Q41'], { var1: customerModule, var2: userId })
        let checkPermissionForCustomer = await connection.query(s2)
        if (checkPermissionForCustomer.rows[0].permission_to_view_global) {
            // here we are getting customer deatils by global permission

            let s3 = dbScript(db_sql['Q39'], { var1: checkPermissionForCustomer.rows[0].company_id })
            let customerList = await connection.query(s3)
            if (customerList.rowCount > 0) {
                allDetails.customerList = customerList.rows
            } else {
                allDetails.customerList = []
            }

        } else if (checkPermissionForCustomer.rows[0].permission_to_view_own) {
            // here we are getting customer deatils by own permission of user and its child user
            let roleUsers = await getUserAndSubUser(checkPermissionForCustomer.rows[0]);

            let s2 = dbScript(db_sql['Q271'], { var1: roleUsers.join(","), var2: false })
            let customerList = await connection.query(s2)
            if (customerList.rowCount > 0) {
                allDetails.customerList = customerList.rows
            } else {
                allDetails.customerList = []
            }
        }

        let slabModule = process.env.SLABS_MODULE;
        let s3 = dbScript(db_sql['Q41'], { var1: slabModule, var2: userId })
        let checkPermissionForslab = await connection.query(s3)
        if (checkPermissionForslab.rows[0].permission_to_view_global) {
            // here we are getting slab deatils by global permission

            let s5 = dbScript(db_sql['Q17'], { var1: checkPermissionForslab.rows[0].company_id })
            let slabList = await connection.query(s5)
            if (slabList.rowCount > 0) {
                const unique = [...new Map(slabList.rows.map(item => [item['slab_id'], item])).values()]
                allDetails.slabList = unique;
            } else {
                allDetails.slabList = []
            }

        } else if (checkPermissionForslab.rows[0].permission_to_view_own) {
            // here we are getting slab deatils by own permission of user and its child user
            let roleUsers = await getUserAndSubUser(checkPermissionForslab.rows[0]);

            let s4 = dbScript(db_sql['Q17'], { var1: checkPermissionForslab.rows[0].company_id })
            let slabList = await connection.query(s4)
            if (slabList.rowCount > 0) {
                const unique = [...new Map(slabList.rows.map(item => [item['slab_id'], item])).values()]
                allDetails.slabList = unique;
            } else {
                allDetails.slabList = []
            }
        }

        let commissionModule = process.env.COMMISSIONS_MODULE;
        let s4 = dbScript(db_sql['Q41'], { var1: commissionModule, var2: userId })
        let checkPermissionForCommission = await connection.query(s4)
        if (checkPermissionForCommission.rows[0].permission_to_view_global) {
            // here we are getting commissionSlab deatils by global permission

            let s6 = dbScript(db_sql['Q50'], { var1: checkPermissionForCommission.rows[0].company_id })
            let commissionList = await connection.query(s6)
            if (commissionList.rowCount > 0) {
                allDetails.commissionList = commissionList.rows
            } else {
                allDetails.commissionList = []
            }

        } else if (checkPermissionForCommission.rows[0].permission_to_view_own) {
            // here we are getting commissionSlab deatils by own permission of user and its child user
            let roleUsers = await getUserAndSubUser(checkPermissionForCommission.rows[0]);

            let s5 = dbScript(db_sql['Q50'], { var1: checkPermissionForCommission.rows[0].company_id })
            let commissionList = await connection.query(s5)
            if (commissionList.rowCount > 0) {
                allDetails.commissionList = commissionList.rows
            } else {
                allDetails.commissionList = []
            }
        }

        let usersModule = process.env.USERS_MODULE;
        let s5 = dbScript(db_sql['Q41'], { var1: usersModule, var2: userId })
        let checkPermissionForusers = await connection.query(s5)
        if (checkPermissionForusers.rows[0].permission_to_view_global) {
            // here we are getting Users deatils by global permission

            let s4 = dbScript(db_sql['Q15'], { var1: checkPermissionForusers.rows[0].company_id })
            let userList = await connection.query(s4);
            if (userList.rowCount > 0) {
                allDetails.userList = userList.rows
            } else {
                allDetails.userList = []
            }

        } else if (checkPermissionForusers.rows[0].permission_to_view_own) {
            // here we are getting Users deatils by own permission of user and its child user
            let roleUsers = await getUserAndSubUser(checkPermissionForusers.rows[0]);

            let s3 = dbScript(db_sql['Q272'], { var1: roleUsers.join(",") })
            let userList = await connection.query(s3);
            if (userList.rowCount > 0) {
                allDetails.userList = userList.rows
            } else {
                allDetails.userList = []
            }

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

    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.archivedSales = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            salesId,
            userIds,
            reason
        } = req.body
        //add notification deatils
        let notification_userId = userIds;
        let notification_typeId = salesId;

        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {

            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q71'], { var1: _dt, var2: userId, var3: mysql_real_escape_string(reason), var4: salesId, var5: checkPermission.rows[0].company_id })
            let archivedSales = await connection.query(s2)

            if (archivedSales.rowCount > 0) {
                // add notification in notification list
                await notificationsOperations({ type: 1, msg: 1.5, notification_typeId, notification_userId }, userId);

                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Sales archived successfully"
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

// module.exports.userCommissionList = async (req, res) => {
//     try {
//         let userId = req.user.id
//         let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
//         let checkPermission = await connection.query(s1)
//         if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
//             let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
//             let s1 = dbScript(db_sql['Q335'], { var1: roleUsers.join(","), var2: checkPermission.rows[0].company_id })
//             let commissionList = await connection.query(s1)

//             if (commissionList.rowCount > 0) {
//                 res.json({
//                     status: 200,
//                     success: true,
//                     message: 'User commission List',
//                     data: commissionList.rows
//                 })
//             } else {
//                 res.json({
//                     status: 200,
//                     success: false,
//                     message: 'Empty User commission List',
//                     data: []
//                 })
//             }
//         } else {
//             res.status(403).json({
//                 success: false,
//                 message: "UnAthorised"
//             })
//         }
//     } catch (error) {
//         res.json({
//             status: 400,
//             success: false,
//             message: error.message,
//         })
//     }
// }

module.exports.userCommissionList = async (req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global) {
            let s1 = dbScript(db_sql['Q414'], { var1: checkPermission.rows[0].company_id })
            let commissionList = await connection.query(s1)

            if (commissionList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'User commission List',
                    data: commissionList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty User commission List',
                    data: []
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let s1 = dbScript(db_sql['Q335'], { var1: roleUsers.join(","), var2: checkPermission.rows[0].company_id })
            let commissionList = await connection.query(s1)

            if (commissionList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'User commission List',
                    data: commissionList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty User commission List',
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

module.exports.salesWiseCommissionList = async (req, res) => {
    try {
        let userId = req.user.id
        let { salesId } = req.query;
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let s1 = dbScript(db_sql['Q336'], { var1: salesId, var2: checkPermission.rows[0].company_id })
            let commissionList = await connection.query(s1)

            if (commissionList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'User commission List',
                    data: commissionList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty User commission List',
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

module.exports.updateUserCommission = async (req, res) => {
    try {
        let userId = req.user.id;
        let { id, bonusAmount, notes } = req.body

        await connection.query('BEGIN')

        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {

            let _dt = new Date().toISOString()

            let s2 = dbScript(db_sql['Q338'], { var1: id, var2: Number(bonusAmount), var3: mysql_real_escape_string(notes), var4: _dt })
            let updateUserCommission = await connection.query(s2)

            if (updateUserCommission.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: 'User commission updated successfully'
                })
            } else {
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: 'Something went wrong'
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "UnAthorised"
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

module.exports.commissionDetails = async (req, res) => {
    try {
        let { commissionId } = req.query;

        let s1 = dbScript(db_sql['Q340'], { var1: commissionId })
        let commission = await connection.query(s1)

        if (commission.rowCount > 0) {
            res.json({
                status: 200,
                success: true,
                message: "User commission details",
                data: commission.rows
            })
        } else {
            res.json({
                status: 200,
                success: false,
                message: "Empty User commission details",
                data: []
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

module.exports.commissionReport = async (req, res) => {
    try {
        let userId = req.user.id
        let { salesRepId, startDate, endDate } = req.query
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rowCount > 0) {

            let s2 = dbScript(db_sql['Q8'], { var1: salesRepId })
            let finduser = await connection.query(s2)

            let s3 = dbScript(db_sql['Q12'], { var1: finduser.rows[0].role_id })
            let roleData = await connection.query(s3)
            let managerName = ''
            if (roleData.rows[0].reporter) {
                let parentList = await getParentUserList(roleData.rows[0], findAdmin.rows[0].company_id);
                for (let parent of parentList) {
                    if (parent.role_id == roleData.rows[0].reporter) {
                        managerName = parent.full_name
                    }
                }

            }

            let s4 = dbScript(db_sql['Q373'], { var1: salesRepId, var2: startDate, var3: endDate })
            let _dt = new Date().toISOString()
            let commissionData = await connection.query(s4)
            if (commissionData.rowCount > 0) {
                let data = {
                    salesRepName: commissionData.rows[0].sales_rep_name,
                    companyName: commissionData.rows[0].company_name,
                    companyLogo: commissionData.rows[0].company_logo,
                    currentDate: _dt,
                    fromDate: startDate,
                    toDate: endDate,
                    managerName: managerName,
                    report: [],
                    totalPerpetualCommissionEarned: 0,
                    totalSubscriptionCommissionEarned: 0
                };

                for (let row of commissionData.rows) {
                    data.report.push({
                        id: row.id,
                        customerName: row.customer_name,
                        date: row.recognized_date,
                        dealType: row.sales_type,
                        salesRole: row.user_type,
                        earnedCommission: Number(row.commission_amount)
                    });

                    if (row.sales_type === 'Perpetual') {
                        data.totalPerpetualCommissionEarned += Number(row.commission_amount);
                    } else if (row.sales_type === 'Subscription') {
                        data.totalSubscriptionCommissionEarned += Number(row.commission_amount);
                    }

                    data.totalCommission = data.totalPerpetualCommissionEarned + data.totalSubscriptionCommissionEarned
                }
                if (data) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Commission Report",
                        data: data
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty Commission Report",
                        data: {
                            salesRepName: "",
                            companyName: "",
                            companyLogo: "",
                            currentDate: "",
                            fromDate: "",
                            toDate: "",
                            managerName: "",
                            report: [],
                            totalPerpetualCommissionEarned: 0,
                            totalSubscriptionCommissionEarned: 0,
                            totalCommission: 0
                        }
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Commission Report",
                    data: {
                        salesRepName: "",
                        companyName: "",
                        companyLogo: "",
                        currentDate: "",
                        fromDate: "",
                        toDate: "",
                        managerName: "",
                        report: [],
                        totalPerpetualCommissionEarned: 0,
                        totalSubscriptionCommissionEarned: 0,
                        totalCommission: 0
                    }
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "User not found"
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

