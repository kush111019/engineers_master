const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string, getUserAndSubUser, notificationsOperations } = require('../utils/helper')
const moduleName = process.env.LEADS_MODULE

module.exports.createLead = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            fullName,
            title,
            emailAddress,
            phoneNumber,
            address,
            customerId,
            source,
            linkedinUrl,
            website,
            targetedValue,
            industryType,
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

            let id = uuid.v4()
            let s2 = dbScript(db_sql['Q201'], { var1: id, var2: fullName, var3: title, var4: emailAddress, var5: phoneNumber, var6: mysql_real_escape_string(address), var7: source, var8: linkedinUrl, var9: website, var10: targetedValue, var11: industryType, var12: marketingQualifiedLead, var13: assignedSalesLeadTo, var14: mysql_real_escape_string(additionalMarketingNotes), var15: userId, var16: checkPermission.rows[0].company_id, var17: customerId, var18: empType })
            let createLead = await connection.query(s2)
            // add notification in notification list
            notification_typeId = createLead.rows[0].id;
            await notificationsOperations({ type: 4, msg: 4.1, notification_typeId, notification_userId }, userId);

            if (createLead.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "Lead created successfully"
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
                let s2 = dbScript(db_sql['Q202'], { var1: checkPermission.rows[0].company_id, var2: type })
                leadList = await connection.query(s2)
            }
            else if (status.toLowerCase() == 'rejected') {
                let s3 = dbScript(db_sql['Q275'], { var1: checkPermission.rows[0].company_id, var2: type })
                leadList = await connection.query(s3)
            }
            else if (status.toLowerCase() == 'qualified') {
                let s4 = dbScript(db_sql['Q276'], { var1: checkPermission.rows[0].company_id, var2: type })
                leadList = await connection.query(s4)
            }
            else if (status.toLowerCase() == 'converted') {
                let s5 = dbScript(db_sql['Q277'], { var1: checkPermission.rows[0].company_id, var2: type })
                leadList = await connection.query(s5)
            }
            else if (status.toLowerCase() == 'assigned') {
                let s6 = dbScript(db_sql['Q282'], { var1: checkPermission.rows[0].id, var2: type })
                leadList = await connection.query(s6)
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
                let s4 = dbScript(db_sql['Q203'], { var1: roleUsers.join(","), var2: type })
                findLeadList = await connection.query(s4)
            }
            else if (status.toLowerCase() == 'rejected') {
                let s5 = dbScript(db_sql['Q278'], { var1: roleUsers.join(","), var2: type })
                findLeadList = await connection.query(s5)
            }
            else if (status.toLowerCase() == 'qualified') {
                let s5 = dbScript(db_sql['Q279'], { var1: roleUsers.join(","), var2: type })
                findLeadList = await connection.query(s5)
            }
            else if (status.toLowerCase() == 'converted') {
                let s5 = dbScript(db_sql['Q280'], { var1: roleUsers.join(","), var2: type })
                findLeadList = await connection.query(s5)
            }
            else if (status.toLowerCase() == 'assigned') {
                let s6 = dbScript(db_sql['Q283'], { var1: roleUsers.join(","), var2: type })
                findLeadList = await connection.query(s6)
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
            let s2 = dbScript(db_sql['Q208'], { var1: id, var2: type })
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
            emailAddress,
            phoneNumber,
            address,
            customerId,
            source,
            linkedinUrl,
            website,
            targetedValue,
            industryType,
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

            let _dt = new Date().toISOString();
            let s5 = dbScript(db_sql['Q204'], { var1: leadId, var2: fullName, var3: title, var4: emailAddress, var5: phoneNumber, var6: mysql_real_escape_string(address), var7: source, var8: linkedinUrl, var9: website, var10: targetedValue, var11: industryType, var12: marketingQualifiedLead, var13: assignedSalesLeadTo, var14: mysql_real_escape_string(additionalMarketingNotes), var15: _dt, var16: customerId })
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
            let s4 = dbScript(db_sql['Q252'], { var1: leadId })
            let findLeadInSales = await connection.query(s4)
            if (findLeadInSales.rowCount == 0) {
                let s5 = dbScript(db_sql['Q250'], { var1: leadId, var2: true, var3: mysql_real_escape_string(reason) })
                let rejectLead = await connection.query(s5)

                // add notification in notification list
                let notification_userId = [rejectLead.rows[0].assigned_sales_lead_to];
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
        //add notification deatils
        let notification_typeId = leadId;

        await connection.query('BEGIN')
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_delete) {
            let s2 = dbScript(db_sql['Q252'], { var1: leadId })
            let checkCustomerInSales = await connection.query(s2)
            if (checkCustomerInSales.rowCount == 0) {
                let _dt = new Date().toISOString();
                let s5 = dbScript(db_sql['Q205'], { var1: leadId, var2: _dt })
                let deleteLead = await connection.query(s5)
                // add notification in notification list
                let notification_userId = [];
                notification_userId.push(deleteLead.rows[0].assigned_sales_lead_to)
                notification_userId.push(deleteLead.rows[0].user_id)
                await notificationsOperations({ type: 4, msg: 4.4, notification_typeId, notification_userId }, userId);

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
