const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const { mysql_real_escape_string, getUserAndSubUser, notificationsOperations } = require('../utils/helper')
const moduleName = process.env.LEADS_MODULE

module.exports.createLead = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            fullName,
            title,
            titleId,
            emailAddress,
            phoneNumber,
            address,
            customerId,
            source,
            sourceId,
            linkedinUrl,
            website,
            targetedValue,
            marketingQualifiedLead,
            assignedSalesLeadTo,
            additionalMarketingNotes,
            empType
        } = req.body
        //add notification deatils
        let notification_userId = assignedSalesLeadTo ? [assignedSalesLeadTo] : [];
        let notification_typeId;
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_create) {

            if(titleId == ''){
                let s3 = dbScript(db_sql['Q178'], { var1: mysql_real_escape_string(title), var2: checkPermission.rows[0].company_id })
                let addTitle = await connection.query(s3)
                titleId = addTitle.rows[0].id;
            }

            if(sourceId == ''){
                let s3 = dbScript(db_sql['Q186'], { var1: mysql_real_escape_string(source), var2: checkPermission.rows[0].company_id})
                let addSource = await connection.query(s3)
                sourceId = addSource.rows[0].id
            }

            let s2 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(fullName), var2: titleId, var3: emailAddress, var4: phoneNumber, var5: mysql_real_escape_string(address), var6: sourceId, var7: linkedinUrl, var8: website, var9: targetedValue, var10: marketingQualifiedLead, var11: assignedSalesLeadTo ?assignedSalesLeadTo : 'null', var12: mysql_real_escape_string(additionalMarketingNotes), var13: userId, var14: checkPermission.rows[0].company_id, var15: customerId, var16: empType })
            let createLead = await connection.query(s2)
            // add notification in notification list
            notification_typeId = createLead.rows[0].id;
            await notificationsOperations({ type: 4, msg: 4.1, notification_typeId, notification_userId }, userId);
            
            let _dt= new Date().toISOString()
            let s3 = dbScript(db_sql['Q278'], { var1:_dt, var2: checkPermission.rows[0].company_id })
            updateStatusInCompany = await connection.query(s3)
            if (createLead.rowCount > 0 && updateStatusInCompany.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "Lead created successfully",
                    data: createLead.rows[0].id
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
            await connection.query('ROLLBACK')
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

module.exports.leadsList = async (req, res) => {
    try {
        let userId = req.user.id
        let { status } = req.query
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        let type = 'lead';
        if (checkPermission.rows[0].permission_to_view_global) {
            let leadList
            if (status.toLowerCase() == 'all') {
                let s2 = dbScript(db_sql['Q170'], { var1: checkPermission.rows[0].company_id, var2: type })
                leadList = await connection.query(s2)
            }
            else if (status.toLowerCase() == 'rejected') {
                let s3 = dbScript(db_sql['Q232'], { var1: checkPermission.rows[0].company_id, var2: type })
                leadList = await connection.query(s3)
            }
            else if (status.toLowerCase() == 'qualified') {
                let s4 = dbScript(db_sql['Q233'], { var1: checkPermission.rows[0].company_id, var2: type })
                leadList = await connection.query(s4)
            }
            else if (status.toLowerCase() == 'converted') {
                let s5 = dbScript(db_sql['Q234'], { var1: checkPermission.rows[0].company_id, var2: type })
                leadList = await connection.query(s5)
            }
            else if (status.toLowerCase() == 'assigned') {
                let s6 = dbScript(db_sql['Q238'], { var1: checkPermission.rows[0].id, var2: type })
                leadList = await connection.query(s6)
            }
            else if (status.toLowerCase() == 'not-converted') {
                let s7 = dbScript(db_sql['Q298'], { var1: checkPermission.rows[0].company_id, var2: type })
                leadList = await connection.query(s7)
            }
            if (leadList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Leads list',
                    data: leadList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty leads list',
                    data: leadList.rows
                })
            }
        }
        else if (checkPermission.rows[0].permission_to_view_own) {
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let findLeadList
            if (status.toLowerCase() == 'all') {
                let s4 = dbScript(db_sql['Q171'], { var1: roleUsers.join(","), var2: type })
                findLeadList = await connection.query(s4)
            }
            else if (status.toLowerCase() == 'rejected') {
                let s5 = dbScript(db_sql['Q235'], { var1: roleUsers.join(","), var2: type })
                findLeadList = await connection.query(s5)
            }
            else if (status.toLowerCase() == 'qualified') {
                let s5 = dbScript(db_sql['Q236'], { var1: roleUsers.join(","), var2: type })
                findLeadList = await connection.query(s5)
            }
            else if (status.toLowerCase() == 'converted') {
                let s5 = dbScript(db_sql['Q237'], { var1: roleUsers.join(","), var2: type })
                findLeadList = await connection.query(s5)
            }
            else if (status.toLowerCase() == 'assigned') {
                let s6 = dbScript(db_sql['Q239'], { var1: roleUsers.join(","), var2: type })
                findLeadList = await connection.query(s6)
            }
            else if (status.toLowerCase() == 'not-converted') {
                let s7 = dbScript(db_sql['Q299'], { var1: roleUsers.join(","), var2: type })
                findLeadList = await connection.query(s7)
            }
            if (findLeadList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Leads list',
                    data: findLeadList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty leads list',
                    data: findLeadList.rows
                })
            }
        }
        else {
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

module.exports.leadsDetails = async (req, res) => {
    try {
        let userId = req.user.id
        let { id } = req.query
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        let type = 'lead';
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let s2 = dbScript(db_sql['Q176'], { var1: id, var2: type })
            leadList = await connection.query(s2)
            if (leadList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Lead details',
                    data: leadList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty lead details',
                    data: leadList.rows
                })
            }
        }else {
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

module.exports.updateLead = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            leadId,
            fullName,
            title,
            titleId,
            emailAddress,
            phoneNumber,
            address,
            customerId,
            source,
            sourceId,
            linkedinUrl,
            website,
            targetedValue,
            marketingQualifiedLead,
            assignedSalesLeadTo,
            additionalMarketingNotes,
        } = req.body

        //add notification deatils
        let notification_userId = assignedSalesLeadTo ? [assignedSalesLeadTo] : [];
        let notification_typeId = leadId;

        await connection.query('BEGIN')
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_update) {

            if(titleId == ''){
                let s3 = dbScript(db_sql['Q178'], { var1: mysql_real_escape_string(title), var2: checkPermission.rows[0].company_id })
                let addTitle = await connection.query(s3)
                titleId = addTitle.rows[0].id;
            }

            if(sourceId == ''){
                let s3 = dbScript(db_sql['Q186'], { var1: mysql_real_escape_string(source), var2: checkPermission.rows[0].company_id})
                let addSource = await connection.query(s3)
                sourceId = addSource.rows[0].id
            }

            let _dt = new Date().toISOString();
            let s5 = dbScript(db_sql['Q172'], { var1: leadId, var2: mysql_real_escape_string(fullName), var3: titleId, var4: emailAddress, var5: phoneNumber, var6: mysql_real_escape_string(address), var7: sourceId, var8: linkedinUrl, var9: website, var10: targetedValue, var11: marketingQualifiedLead, var12: assignedSalesLeadTo ? assignedSalesLeadTo : 'null', var13: mysql_real_escape_string(additionalMarketingNotes), var14: _dt, var15: customerId })
            let updateLead = await connection.query(s5)

            // add notification in notification list
            await notificationsOperations({ type: 4, msg: 4.2, notification_typeId, notification_userId }, userId);

            if (updateLead.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Lead updated successfully"
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
            await connection.query('ROLLBACK')
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

module.exports.rejectLead = async (req, res) => {
    try {
        let userId = req.user.id
        let { leadId, reason } = req.body
        //add notification deatils
        let notification_typeId = leadId;

        await connection.query('BEGIN')
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_update) {
            let s4 = dbScript(db_sql['Q216'], { var1: leadId })
            let findLeadInSales = await connection.query(s4)
            if (findLeadInSales.rowCount == 0) {
                let s5 = dbScript(db_sql['Q215'], { var1: leadId, var2: true, var3: mysql_real_escape_string(reason) })
                let rejectLead = await connection.query(s5)

                // add notification in notification list
                let notification_userId = rejectLead.rows[0].assigned_sales_lead_to ? [rejectLead.rows[0].assigned_sales_lead_to] :[];
                await notificationsOperations({ type: 4, msg: 4.3, notification_typeId, notification_userId }, userId);

                if (rejectLead.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Lead rejected successfully"
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
                res.json({
                    status: 200,
                    success: false,
                    message: "This record has been used by Sales"
                })
            }
        } else {
            await connection.query('ROLLBACK')
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

module.exports.deleteLead = async (req, res) => {
    try {
        let userId = req.user.id
        let { leadId } = req.query

        await connection.query('BEGIN')
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_delete) {
            let s2 = dbScript(db_sql['Q216'], { var1: leadId })
            let checkCustomerInSales = await connection.query(s2)
            if (checkCustomerInSales.rowCount == 0) {
                let _dt = new Date().toISOString();
                let s5 = dbScript(db_sql['Q173'], { var1: leadId, var2: _dt })
                let deleteLead = await connection.query(s5)
                if (deleteLead.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Lead deleted successfully"
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
                res.json({
                    status: 200,
                    success: false,
                    message: "This record has been used by Sales"
                })
            }

        } else {
            await connection.query('ROLLBACK')
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
