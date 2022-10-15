const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string } = require('../utils/helper')


module.exports.customerListforSales = async (req, res) => {

    try {

        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q57'], { var1: findAdmin.rows[0].company_id })
                let customerList = await connection.query(s4)
                let customerArr = []

                if (customerList.rowCount > 0) {
                    for (data of customerList.rows) {
                        let s5 = dbScript(db_sql['Q10'], { var1: data.user_id })
                        let createdBy = await connection.query(s5)
                        if (createdBy.rows[0].full_name) {
                            data.createdBy = createdBy.rows[0].full_name
                        }
                        customerArr.push(data)
                    }
                    if (customerArr.length > 0) {
                        res.json({
                            status: 200,
                            success: true,
                            message: 'Customers list',
                            data: customerArr
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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

module.exports.customerContactDetailsForSales = async (req, res) => {
    try {
        let { customerId } = req.query
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let s4 = dbScript(db_sql['Q60'], { var1: customerId })
                let contactDetails = await connection.query(s4)
                if (contactDetails.rowCount > 0) {
                    let customerContactDetails = {};

                    let s4 = dbScript(db_sql['Q80'], { var1: contactDetails.rows[0].customer_company_id })
                    let businessDetails = await connection.query(s4)

                    let s5 = dbScript(db_sql['Q81'], { var1: contactDetails.rows[0].customer_company_id })
                    let revenueDetails = await connection.query(s5)

                    customerContactDetails.businessDetails = (businessDetails.rowCount > 0) ? businessDetails.rows : []
                    customerContactDetails.revenueDetails = (revenueDetails.rowCount > 0) ? revenueDetails.rows : []

                    res.json({
                        status: 200,
                        success: true,
                        message: 'Customer contact details',
                        data: customerContactDetails
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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

module.exports.createSalesCommission = async (req, res) => {

    try {
        let userEmail = req.user.email
        let {
            customerId,
            customerCloserId,
            customerCommissionSplitId,
            supporters,
            is_overwrite,
            closerPercentage,
            qualification,
            is_qualified,
            targetAmount,
            products,
            targetClosingDate,
            businessId,
            revenueId,
            salesType,
            subscriptionPlan,
            recurringDate,
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                let supporterIds = []
                await connection.query('BEGIN')

                businessId = (businessId == '') ? '' : businessId
                revenueId = (revenueId == '') ? '' : revenueId

                let id = uuid.v4()
                let s5 = dbScript(db_sql['Q58'], { var1: id, var2: customerId, var3: customerCommissionSplitId, var4: is_overwrite, var5: findAdmin.rows[0].company_id, var6: businessId, var7: revenueId, var8: mysql_real_escape_string(qualification), var9: is_qualified, var10: targetAmount, var11: targetClosingDate, var12: JSON.stringify(products), var13: salesType, var14: subscriptionPlan, var15: recurringDate })
                let createSalesConversion = await connection.query(s5)

                let s6 = dbScript(db_sql['Q61'], { var1: customerCommissionSplitId, var2: findAdmin.rows[0].company_id })
                let findSalescommission = await connection.query(s6)
                let closer_percentage = is_overwrite ? closerPercentage : findSalescommission.rows[0].closer_percentage

                let closerId = uuid.v4()
                let s7 = dbScript(db_sql['Q63'], { var1: closerId, var2: customerCloserId, var3: closer_percentage, var4: customerCommissionSplitId, var5: createSalesConversion.rows[0].id, var6: findAdmin.rows[0].company_id })
                let addSalesCloser = await connection.query(s7)

                if (supporters.length > 0) {

                    for (let supporterData of supporters) {
                        let supporterId = uuid.v4()
                        let s8 = dbScript(db_sql['Q62'], { var1: supporterId, var2: customerCommissionSplitId, var3: supporterData.id, var4: supporterData.percentage, var5: createSalesConversion.rows[0].id, var6: findAdmin.rows[0].company_id })
                        addSalesSupporter = await connection.query(s8)
                        supporterIds.push(addSalesSupporter.rows[0].id)
                    }
                }

                let logId = uuid.v4()
                let s9 = dbScript(db_sql['Q47'], { var1: logId, var2: createSalesConversion.rows[0].id, var3: customerCommissionSplitId, var4: mysql_real_escape_string(qualification), var5: is_qualified, var6: targetAmount, var7: JSON.stringify(products), var8: targetClosingDate, var9: customerId, var10: is_overwrite, var11: findAdmin.rows[0].company_id, var12: revenueId, var13: businessId, var14: customerCloserId, var15: JSON.stringify(supporterIds), var16: salesType, var17: subscriptionPlan, var18: recurringDate })
                let createLog = await connection.query(s9)



                if (createSalesConversion.rowCount > 0 && findSalescommission.rowCount > 0 && addSalesCloser.rowCount > 0 && createLog.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: "Sales commission created successfully"
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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

module.exports.salesCommissionList = async (req, res) => {

    try {
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q59'], { var1: findAdmin.rows[0].company_id })
                let salesCommissionList = await connection.query(s4)
                let commissionList = []
                for (data of salesCommissionList.rows) {
                    let closer = {}
                    let supporters = []

                    let s5 = dbScript(db_sql['Q60'], { var1: data.customer_id })
                    let customerName = await connection.query(s5)

                    let s6 = dbScript(db_sql['Q10'], { var1: data.closer_id })
                    let closerName = await connection.query(s6)

                    let s7 = dbScript(db_sql['Q64'], { var1: data.id })
                    let supporter = await connection.query(s7)
                    if (supporter.rowCount > 0) {
                        if (supporter.rows[0].supporter_id != "") {
                            for (let supporterData of supporter.rows) {

                                let s8 = dbScript(db_sql['Q10'], { var1: supporterData.supporter_id })
                                let supporterName = await connection.query(s8)
                                supporters.push({
                                    id: supporterData.supporter_id,
                                    name: supporterName.rows[0].full_name,
                                    percentage: supporterData.supporter_percentage
                                })

                            }
                        }
                    }

                    let products = JSON.parse(data.products)
                    let productName = []
                    for (let productIds of products) {
                        let s10 = dbScript(db_sql['Q104'], { var1: productIds, var2: findAdmin.rows[0].company_id })
                        let product = await connection.query(s10)
                        if(product.rowCount>0){
                            productName.push({
                                id: product.rows[0].id,
                                name: product.rows[0].product_name
                            })
                        }
                    }
                    if (data.business_id != '' && data.revenue_id != '') {

                        let s8 = dbScript(db_sql['Q82'], { var1: data.business_id })
                        let businessData = await connection.query(s8);

                        closer.businessContactId = businessData.rows[0].id,
                            closer.businessContactName = businessData.rows[0].business_contact_name

                        let s9 = dbScript(db_sql['Q83'], { var1: data.revenue_id })
                        let revenueData = await connection.query(s9);

                        closer.revenueContactId = revenueData.rows[0].id,
                            closer.revenueContactName = revenueData.rows[0].revenue_contact_name
                    } else {
                        closer.businessContactId = ""
                        closer.businessContactName = ""
                        closer.revenueContactId = ""
                        closer.revenueContactName = ""
                    }
                    closer.id = data.id
                    closer.customerId = data.customer_id
                    closer.customerName = (customerName.rowCount > 0) ? customerName.rows[0].customer_name : ''
                    closer.commissionSplitId = data.customer_commission_split_id
                    closer.qualification = data.qualification
                    closer.is_qualified = data.is_qualified
                    closer.targetAmount = data.target_amount
                    closer.targetClosingDate = data.target_closing_date
                    closer.productMatch = data.product_match
                    closer.is_overwrite = data.is_overwrite
                    closer.closerId = data.closer_id
                    closer.closerName = (closerName.rowCount > 0) ? closerName.rows[0].full_name : ''
                    closer.closerPercentage = data.closer_percentage
                    closer.supporters = supporters
                    closer.createdAt = data.created_at
                    closer.closedAt = (customerName.rowCount > 0) ? customerName.rows[0].closed_at : ''
                    closer.salesType = data.sales_type
                    closer.subscriptionPlan = data.subscription_plan
                    closer.recurringDate = data.recurring_date
                    closer.products = productName

                    commissionList.push(closer)
                }
                if (commissionList.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Sales commission list',
                        data: commissionList
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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

module.exports.updateSalesCommission = async (req, res) => {

    try {
        let userEmail = req.user.email
        let {
            salesCommissionId,
            customerId,
            customerCommissionSplitId,
            customerCloserId,
            qualification,
            is_qualified,
            targetAmount,
            products,
            targetClosingDate,
            supporters,
            is_overwrite,
            closerPercentage,
            businessId,
            revenueId,
            salesType,
            subscriptionPlan,
            recurringDate

        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {
                let supporterIds = []
                await connection.query('BEGIN')

                let _dt = new Date().toISOString();

                let s5 = dbScript(db_sql['Q68'], { var1: customerId, var2: customerCommissionSplitId, var3: is_overwrite, var4: _dt, var5: salesCommissionId, var6: findAdmin.rows[0].company_id, var7: businessId, var8: revenueId, var9: qualification, var10: is_qualified, var11: targetAmount, var12: targetClosingDate, var13: JSON.stringify(products), var14: salesType, var15: subscriptionPlan, var16: recurringDate })
                let updateSalesCommission = await connection.query(s5)

                let s6 = dbScript(db_sql['Q61'], { var1: customerCommissionSplitId, var2: findAdmin.rows[0].company_id })
                let findSalesCommission = await connection.query(s6)

                let closer_percentage = is_overwrite ? closerPercentage : findSalesCommission.rows[0].closer_percentage

                let s7 = dbScript(db_sql['Q69'], { var1: customerCloserId, var2: closer_percentage, var3: customerCommissionSplitId, var4: _dt, var5: salesCommissionId, var6: findAdmin.rows[0].company_id })
                let updateSalesCloser = await connection.query(s7)

                let s8 = dbScript(db_sql['Q70'], { var1: salesCommissionId, var2: findAdmin.rows[0].company_id, var3: _dt })
                let updateSupporter = await connection.query(s8)

                for (let supporterData of supporters) {

                    let supporterId = uuid.v4()
                    let s9 = dbScript(db_sql['Q62'], { var1: supporterId, var2: customerCommissionSplitId, var3: supporterData.id, var4: supporterData.percentage, var5: salesCommissionId, var6: findAdmin.rows[0].company_id })
                    updateSalesSupporter = await connection.query(s9)
                    supporterIds.push(updateSalesSupporter.rows[0].id)

                }

                let logId = uuid.v4()
                let s10 = dbScript(db_sql['Q47'], { var1: logId, var2: updateSalesCommission.rows[0].id, var3: customerCommissionSplitId, var4: mysql_real_escape_string(qualification), var5: is_qualified, var6: targetAmount, var7: JSON.stringify(products), var8: targetClosingDate, var9: customerId, var10: is_overwrite, var11: findAdmin.rows[0].company_id, var12: revenueId, var13: businessId, var14: customerCloserId, var15: JSON.stringify(supporterIds), var16: salesType, var17: subscriptionPlan, var18: recurringDate })
                let createLog = await connection.query(s10)

                if (updateSalesCommission.rowCount > 0 && findSalesCommission.rowCount > 0 && updateSalesCloser.rowCount > 0 && updateSalesSupporter.rowCount > 0 && createLog.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Sales commission updated successfully"
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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

module.exports.deleteSalesCommission = async (req, res) => {

    try {
        let userEmail = req.user.email
        let {
            salesCommissionId
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {

                await connection.query('BEGIN')

                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q65'], { var1: _dt, var2: salesCommissionId, var3: findAdmin.rows[0].company_id })
                let deleteSalesConversion = await connection.query(s4)

                let s5 = dbScript(db_sql['Q66'], { var1: _dt, var2: salesCommissionId, var3: findAdmin.rows[0].company_id })
                let deleteSalesSupporter = await connection.query(s5)

                let s6 = dbScript(db_sql['Q67'], { var1: _dt, var2: salesCommissionId, var3: findAdmin.rows[0].company_id })
                let deleteSalesCloser = await connection.query(s6)

                await connection.query('COMMIT')

                if (deleteSalesConversion.rowCount > 0 && deleteSalesSupporter.rowCount >= 0, deleteSalesCloser.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Sales commission deleted successfully"
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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

module.exports.salesCommissionLogsList = async (req, res) => {

    try {
        let { salesCommissionId } = req.query
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let commissionList = []
                let s4 = dbScript(db_sql['Q48'], { var1: salesCommissionId })
                let salesCommissionlogList = await connection.query(s4)
                for (data of salesCommissionlogList.rows) {
                    let closer = {}
                    let supporters = []

                    let s5 = dbScript(db_sql['Q60'], { var1: data.customer_id })
                    let customerName = await connection.query(s5)

                    let s6 = dbScript(db_sql['Q10'], { var1: data.closer_id })
                    let closerName = await connection.query(s6)

                    let s10 = dbScript(db_sql['Q92'], { var1: salesCommissionId })
                    let closerPercentage = await connection.query(s10)

                    for (let supporterId of JSON.parse(data.supporter_id)) {

                        let s7 = dbScript(db_sql['Q87'], { var1: supporterId })
                        let supporter = await connection.query(s7)

                        if (supporter.rowCount > 0) {

                            let s8 = dbScript(db_sql['Q10'], { var1: supporter.rows[0].supporter_id })
                            let supporterName = await connection.query(s8)
                            supporters.push({
                                id: supporter.rows[0].supporter_id,
                                name: supporterName.rows[0].full_name,
                                percentage: supporter.rows[0].supporter_percentage
                            })
                        }

                    }

                    let products = JSON.parse(data.products)
                    let productName = []
                    for (let productIds of products) {
                        let s10 = dbScript(db_sql['Q104'], { var1: productIds, var2: findAdmin.rows[0].company_id })
                        let product = await connection.query(s10)
                        if(product.rowCount>0){
                            productName.push({
                                id: product.rows[0].id,
                                name: product.rows[0].product_name
                            })
                        }
                    }

                    if (data.business_id != '' && data.revenue_id != '') {


                        let s8 = dbScript(db_sql['Q82'], { var1: data.business_id })
                        let businessData = await connection.query(s8);

                        closer.businessContactId = businessData.rows[0].id,
                            closer.businessContactName = businessData.rows[0].business_contact_name

                        let s9 = dbScript(db_sql['Q83'], { var1: data.revenue_id })
                        let revenueData = await connection.query(s9);

                        closer.revenueContactId = revenueData.rows[0].id,
                            closer.revenueContactName = revenueData.rows[0].revenue_contact_name
                    } else {
                        closer.businessContactId = ""
                        closer.businessContactName = ""
                        closer.revenueContactId = ""
                        closer.revenueContactName = ""
                    }
                    closer.id = data.id
                    closer.customerId = data.customer_id
                    closer.customerName = (customerName.rowCount > 0) ? customerName.rows[0].customer_name : ''
                    closer.commissionSplitId = data.customer_commission_split_id
                    closer.qualification = data.qualification
                    closer.is_qualified = data.is_qualified
                    closer.targetAmount = data.target_amount
                    closer.targetClosingDate = data.target_closing_date
                    closer.productMatch = data.product_match
                    closer.is_overwrite = data.is_overwrite
                    closer.closerId = data.closer_id
                    closer.closerName = closerName.rows[0].full_name
                    closer.closerPercentage = (closerPercentage.rowCount > 0) ? closerPercentage.rows[0].closer_percentage : '';
                    closer.supporters = supporters
                    closer.createdAt = data.created_at
                    closer.closedAt = (customerName.rowCount > 0) ? customerName.rows[0].closed_at : ''
                    closer.salesType = data.sales_type
                    closer.subscriptionPlan = data.subscription_plan
                    closer.recurringDate = data.recurring_date
                    closer.products = productName

                    commissionList.push(closer)
                }


                if (commissionList.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: 'Sales Commission log list',
                        data: commissionList
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: 'Empty Sales Commission log list',
                        data: []
                    })
                }
            } else {
                res.status(403).json({
                    success: false,
                    message: "UnAthorised"
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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
        userEmail = req.user.email
        let { note, salesCommissionId } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {

                let id = uuid.v4()
                let s4 = dbScript(db_sql['Q35'], { var1: id, var2: salesCommissionId, var3: findAdmin.rows[0].company_id, var4: findAdmin.rows[0].id, var5: mysql_real_escape_string(note) })
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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
        let userEmail = req.user.email
        let { salesCommissionId } = req.query

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let s4 = dbScript(db_sql['Q36'], { var1: salesCommissionId })
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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
        userEmail = req.user.email
        let {
            noteId
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Sales management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {

                await connection.query('BEGIN')

                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q71'], { var1: _dt, var2: noteId })
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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