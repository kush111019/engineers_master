const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string } = require('../utils/helper')
const moduleName = process.env.SALES_MODULE

module.exports.customerListforSales = async (req, res) => {
    try {
        let userId = req.user.id
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let s4 = dbScript(db_sql['Q52'], { var1: checkPermission.rows[0].company_id })
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

module.exports.customerContactDetailsForSales = async (req, res) => {
    try {
        let { customerId } = req.query
        let userId = req.user.id
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: userId })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let s4 = dbScript(db_sql['Q55'], { var1: customerId })
                let contactDetails = await connection.query(s4)
                if (contactDetails.rowCount > 0) {
                    let customerContactDetails = {};

                    let s4 = dbScript(db_sql['Q74'], { var1: contactDetails.rows[0].customer_company_id })
                    let businessDetails = await connection.query(s4)

                    let s5 = dbScript(db_sql['Q75'], { var1: contactDetails.rows[0].customer_company_id })
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
        let userId = req.user.id
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
            currency,
            products,
            targetClosingDate,
            businessId,
            revenueId,
            salesType,
            subscriptionPlan,
            recurringDate,
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_create) {
            let supporterIds = []
            await connection.query('BEGIN')

            businessId = (businessId == '') ? '' : businessId
            revenueId = (revenueId == '') ? '' : revenueId
            targetAmount = (targetAmount == '') ? '0' : targetAmount

            let id = uuid.v4()
            let s5 = dbScript(db_sql['Q53'], { var1: id, var2: customerId, var3: customerCommissionSplitId, var4: is_overwrite, var5: checkPermission.rows[0].company_id, var6: businessId, var7: revenueId, var8: mysql_real_escape_string(qualification), var9: is_qualified, var10: targetAmount, var11: targetClosingDate, var13: salesType, var14: subscriptionPlan, var15: recurringDate, var16: currency })
            let createSalesConversion = await connection.query(s5)
            let s6 = dbScript(db_sql['Q56'], { var1: customerCommissionSplitId, var2: checkPermission.rows[0].company_id })
            let findSalescommission = await connection.query(s6)
            let closer_percentage = is_overwrite ? closerPercentage : findSalescommission.rows[0].closer_percentage

            let closerId = uuid.v4()
            let s7 = dbScript(db_sql['Q58'], { var1: closerId, var2: customerCloserId, var3: closer_percentage, var4: customerCommissionSplitId, var5: createSalesConversion.rows[0].id, var6: checkPermission.rows[0].company_id })
            let addSalesCloser = await connection.query(s7)

            if (supporters.length > 0) {
                for (let supporterData of supporters) {
                    let supporterId = uuid.v4()
                    let s8 = dbScript(db_sql['Q57'], { var1: supporterId, var2: customerCommissionSplitId, var3: supporterData.id, var4: supporterData.percentage, var5: createSalesConversion.rows[0].id, var6: checkPermission.rows[0].company_id })
                    addSalesSupporter = await connection.query(s8)
                    supporterIds.push(addSalesSupporter.rows[0].id)
                }
            }

            if (products.length > 0) {
                for (let productId of products) {
                    let prId = uuid.v4()
                    let s9 = dbScript(db_sql['Q155'], { var1: prId, var2 : productId, var3: createSalesConversion.rows[0].id, var4 : checkPermission.rows[0].company_id })
                    addProduct = await connection.query(s9)
                }
            }

            let logId = uuid.v4()
            let s9 = dbScript(db_sql['Q43'], { var1: logId, var2: createSalesConversion.rows[0].id, var3: customerCommissionSplitId, var4: mysql_real_escape_string(qualification), var5: is_qualified, var6: targetAmount, var7: JSON.stringify(products), 
                var8: targetClosingDate, var9: customerId, var10: is_overwrite, var11: checkPermission.rows[0].company_id, var12: revenueId, var13: businessId, var14: customerCloserId, var15: JSON.stringify(supporterIds), var16: salesType, var17: subscriptionPlan, var18: recurringDate, var19: currency })
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
        let userId = req.user.id
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_view) {

            let s3 = dbScript(db_sql['Q54'], { var1: checkPermission.rows[0].company_id })
            let salesCommissionList = await connection.query(s3)
            let commissionList = []
            for (data of salesCommissionList.rows) {
                let closer = {}
                let supporters = []

                let s4 = dbScript(db_sql['Q59'], { var1: data.id })
                let supporter = await connection.query(s4)
                if (supporter.rowCount > 0) {
                    if (supporter.rows[0].supporter_id != "") {
                        for (let supporterData of supporter.rows) {
                            let s5 = dbScript(db_sql['Q8'], { var1: supporterData.supporter_id })
                            let supporterName = await connection.query(s5)
                            supporters.push({
                                id: supporterData.supporter_id,
                                name: supporterName.rows[0].full_name,
                                email: supporterName.rows[0].email_address,
                                percentage: supporterData.supporter_percentage
                            })

                        }
                    }
                }

                let s9 = dbScript(db_sql['Q157'], { var1 : data.id})
                let productData = await connection.query(s9)

                if (data.business_contact_id != '' && data.revenue_contact_id != '') {

                    let s7 = dbScript(db_sql['Q76'], { var1: data.business_contact_id })
                    let businessData = await connection.query(s7);

                    closer.businessContactId = businessData.rows[0].id,
                    closer.businessContactName = businessData.rows[0].business_contact_name
                    closer.businessContactEmail = businessData.rows[0].business_email

                    let s8 = dbScript(db_sql['Q77'], { var1: data.revenue_contact_id })
                    let revenueData = await connection.query(s8);

                    closer.revenueContactId = revenueData.rows[0].id,
                    closer.revenueContactName = revenueData.rows[0].revenue_contact_name
                    closer.revenueContactEmail = revenueData.rows[0].revenue_email
                } else {
                    closer.businessContactId = ""
                    closer.businessContactName = ""
                    closer.businessContactEmail = ""
                    closer.revenueContactId = ""
                    closer.revenueContactName = ""
                    closer.revenueContactEmail = ""
                }
                closer.id = data.id
                closer.customerId = data.customer_id
                closer.customerName = data.customer_name
                closer.commissionSplitId = data.customer_commission_split_id
                closer.qualification = data.qualification
                closer.is_qualified = data.is_qualified
                closer.targetAmount = data.target_amount
                closer.currency = data.currency
                closer.targetClosingDate = data.target_closing_date
                closer.productMatch = data.product_match
                closer.is_overwrite = data.is_overwrite
                closer.closerId = data.closer_id
                closer.closerName = data.full_name
                closer.closerEmail = data.email_address
                closer.closerPercentage = data.closer_percentage
                closer.supporters = supporters
                closer.createdAt = data.created_at
                closer.closedAt = data.closed_at
                closer.salesType = data.sales_type
                closer.subscriptionPlan = data.subscription_plan
                closer.recurringDate = data.recurring_date
                closer.products = (productData.rowCount > 0) ? productData.rows : []

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
        let userId = req.user.id
        let {
            salesCommissionId,
            customerId,
            customerCommissionSplitId,
            customerCloserId,
            qualification,
            is_qualified,
            targetAmount,
            currency,
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
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: userId })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {
                let supporterIds = []
                await connection.query('BEGIN')

                let _dt = new Date().toISOString();

                let s5 = dbScript(db_sql['Q63'], { var1: customerId, var2: customerCommissionSplitId, var3: is_overwrite, var4: _dt, var5: salesCommissionId, var6: checkPermission.rows[0].company_id, var7: businessId, var8: revenueId, var9: qualification, var10: is_qualified, var11: targetAmount, var12: targetClosingDate, var14: salesType, var15: subscriptionPlan, var16: recurringDate, var17 : currency })
                let updateSalesCommission = await connection.query(s5)

                let s6 = dbScript(db_sql['Q56'], { var1: customerCommissionSplitId, var2: checkPermission.rows[0].company_id })
                let findSalesCommission = await connection.query(s6)

                let closer_percentage = is_overwrite ? closerPercentage : findSalesCommission.rows[0].closer_percentage

                let s7 = dbScript(db_sql['Q64'], { var1: customerCloserId, var2: closer_percentage, var3: customerCommissionSplitId, var4: _dt, var5: salesCommissionId, var6: checkPermission.rows[0].company_id })
                let updateSalesCloser = await connection.query(s7)

                let s8 = dbScript(db_sql['Q61'], { var1: _dt, var2: salesCommissionId, var3: checkPermission.rows[0].company_id })
                let updateSupporter = await connection.query(s8)
                if(supporters.length > 0){
                    for (let supporterData of supporters) {
                        let supporterId = uuid.v4()
                        let s9 = dbScript(db_sql['Q57'], { var1: supporterId, var2: customerCommissionSplitId, var3: supporterData.id, var4: supporterData.percentage, var5: salesCommissionId, var6: checkPermission.rows[0].company_id })
                        updateSalesSupporter = await connection.query(s9)
                        supporterIds.push(updateSalesSupporter.rows[0].id)
                    }
                }

                let s9 = dbScript(db_sql['Q156'], { var1: _dt, var2: salesCommissionId, var3: checkPermission.rows[0].company_id })
                let updateProduct = await connection.query(s9)
                if(products.length > 0){
                    for (let productId of products) {
                        let prId = uuid.v4()
                        let s9 = dbScript(db_sql['Q155'], { var1: prId, var2: productId, var3 :  salesCommissionId, var4 : checkPermission.rows[0].company_id })
                        addProduct = await connection.query(s9)
                    }
                }
                let logId = uuid.v4()
                let s10 = dbScript(db_sql['Q43'], { var1: logId, var2: updateSalesCommission.rows[0].id, var3: customerCommissionSplitId, var4: mysql_real_escape_string(qualification), var5: is_qualified, var6: targetAmount, var7: JSON.stringify(products), var8: targetClosingDate, var9: customerId, var10: is_overwrite, var11: checkPermission.rows[0].company_id, var12: revenueId, var13: businessId, var14: customerCloserId, var15: JSON.stringify(supporterIds), var16: salesType, var17: subscriptionPlan, var18: recurringDate, var19 : currency })
                let createLog = await connection.query(s10)

                if (updateSalesCommission.rowCount > 0 && findSalesCommission.rowCount > 0 && updateSalesCloser.rowCount > 0 && createLog.rowCount > 0 ) {
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
        let userId = req.user.id
        let {
            salesCommissionId
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_delete) {

            await connection.query('BEGIN')

            let _dt = new Date().toISOString();
            let s4 = dbScript(db_sql['Q60'], { var1: _dt, var2: salesCommissionId, var3: checkPermission.rows[0].company_id })
            let deleteSalesConversion = await connection.query(s4)
            
            let s5 = dbScript(db_sql['Q61'], { var1: _dt, var2: salesCommissionId, var3: checkPermission.rows[0].company_id })
            let deleteSalesSupporter = await connection.query(s5)

            let s6 = dbScript(db_sql['Q156'], { var1: _dt, var2: salesCommissionId, var3: checkPermission.rows[0].company_id })
            let deleteSalesProduct = await connection.query(s6)
           
            if (deleteSalesConversion.rowCount > 0 && deleteSalesSupporter.rowCount >= 0 && deleteSalesProduct.rowCount >= 0) {
                await connection.query('COMMIT')
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
        let userId = req.user.id
            let s2 = dbScript(db_sql['Q41'], { var1: moduleName , var2: userId })
            let checkPermission = await connection.query(s2)
            if (checkPermission.rows[0].permission_to_view) {
                let commissionList = []
                let s3 = dbScript(db_sql['Q44'], { var1: salesCommissionId })
                let salesCommissionlogList = await connection.query(s3)
                for (data of salesCommissionlogList.rows) {
                    let closer = {}
                    let supporters = []
                    for (let supporterId of JSON.parse(data.supporter_id)) {
                        let s4 = dbScript(db_sql['Q81'], { var1: supporterId })
                        let supporter = await connection.query(s4)
                        if (supporter.rowCount > 0) {
                            supporters.push({
                                id: supporter.rows[0].supporter_id,
                                name: supporter.rows[0].full_name,
                                percentage: supporter.rows[0].supporter_percentage
                            })
                        }
                    }
                    let productName = []
                    for (let productIds of JSON.parse(data.products)) {
                        let s6 = dbScript(db_sql['Q96'], { var1: productIds, var2: checkPermission.rows[0].company_id })
                        let product = await connection.query(s6)
                        if(product.rowCount>0){
                            productName.push({
                                id: product.rows[0].id,
                                name: product.rows[0].product_name
                            })
                        }
                    }

                    if (data.business_contact_id != '' && data.revenue_contact_id != '') {

                        let s7 = dbScript(db_sql['Q76'], { var1: data.business_contact_id })
                        let businessData = await connection.query(s7);

                        closer.businessContactId = businessData.rows[0].id,
                        closer.businessContactName = businessData.rows[0].business_contact_name

                        let s8 = dbScript(db_sql['Q77'], { var1: data.revenue_contact_id })
                        let revenueData = await connection.query(s8);

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
                    closer.customerName = data.customer_name
                    closer.commissionSplitId = data.customer_commission_split_id
                    closer.qualification = data.qualification
                    closer.is_qualified = data.is_qualified
                    closer.targetAmount = data.target_amount
                    closer.currency = data.currency
                    closer.targetClosingDate = data.target_closing_date
                    closer.productMatch = data.product_match
                    closer.is_overwrite = data.is_overwrite
                    closer.closerId = data.closer_id
                    closer.closerName = data.closer_name
                    closer.closerPercentage = data.closer_percentage
                    closer.supporters = supporters
                    closer.createdAt = data.created_at
                    closer.closedAt = data.closed_at
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
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: userId })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {

                let id = uuid.v4()
                let s4 = dbScript(db_sql['Q31'], { var1: id, var2: salesCommissionId, var3: checkPermission.rows[0].company_id, var4: userId, var5: mysql_real_escape_string(note) })
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
        if (checkPermission.rows[0].permission_to_view) {
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

module.exports.closeSales = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            salesCommissionId
        } = req.body
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {
            await connection.query('BEGIN')
            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q40'], { var1: _dt, var2: _dt, var3: salesCommissionId })
            let closeSales = await connection.query(s2)

            let s3 = dbScript(db_sql['Q158'], { var1: _dt, var2: _dt, var3: salesCommissionId })
            let updateSalesLog = await connection.query(s3)

            if (closeSales.rowCount > 0 && updateSalesLog.rowCount > 0) {
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
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view) {
            let s4 = dbScript(db_sql['Q24'], { var1: checkPermission.rows[0].company_id })
            let findUsers = await connection.query(s4);
            if (findUsers.rows.length > 0) {
                for (data of findUsers.rows) {
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
        } else {
            res.json({
                status: 403,
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
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: userId })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

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