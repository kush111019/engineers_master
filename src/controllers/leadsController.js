const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string, getUserAndSubUser, notificationsOperations } = require('../utils/helper')
const moduleName = process.env.LEADS_MODULE

module.exports.organizationList = async (req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global) {
            let s2 = dbScript(db_sql['Q262'], { var1: checkPermission.rows[0].company_id })
            let organizationList = await connection.query(s2)
            if (organizationList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Organization list',
                    data: organizationList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty organization list',
                    data: organizationList.rows
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            console.log(roleUsers, 'roleUsers')
            let s4 = dbScript(db_sql['Q261'], { var1: roleUsers.join("','") })
            console.log(s4, "s4");
            let organizationList = await connection.query(s4)
            if (organizationList.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Organization list',
                    data: organizationList
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty Organization list',
                    data: organizationList
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

module.exports.createLead = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            fullName,
            title,
            emailAddress,
            phoneNumber,
            address,
            organizationId,
            organizationName,
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
        let notification_userId = [assignedSalesLeadTo];
        let notification_typeId;

        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_create) {
            if (organizationId == '') {
                let orgId = uuid.v4()
                let s3 = dbScript(db_sql['Q263'], { var1: orgId, var2: mysql_real_escape_string(organizationName), var3: checkPermission.rows[0].id, var4: checkPermission.rows[0].company_id })
                let createOrganization = await connection.query(s3)
                organizationId = createOrganization.rows[0].id;
                organizationName = createOrganization.rows[0].organization_name
            }
            let id = uuid.v4()

            let s2 = dbScript(db_sql['Q201'], { var1: id, var2: fullName, var3: title, var4: emailAddress, var5: phoneNumber, var6: mysql_real_escape_string(address), var7: mysql_real_escape_string(organizationName), var8: source, var9: linkedinUrl, var10: website, var11: targetedValue, var12: industryType, var13: marketingQualifiedLead, var14: assignedSalesLeadTo, var15: mysql_real_escape_string(additionalMarketingNotes), var16: userId, var17: checkPermission.rows[0].company_id, var18: organizationId })
            let createLead = await connection.query(s2)

            if (marketingQualifiedLead) {
                let bId = []
                let rId = []
                organizationName = `${organizationName} - (Qualified)`
                let id = uuid.v4()
                let currency = 'United States Dollar (USD)'
                let s3 = dbScript(db_sql['Q36'], { var1: id, var2: checkPermission.rows[0].id, var3: organizationId, var4: mysql_real_escape_string(organizationName), var5: mysql_real_escape_string(source), var6: checkPermission.rows[0].company_id, var7: JSON.stringify(bId), var8: JSON.stringify(rId), var9: mysql_real_escape_string(address), var10: currency, var11 : createLead.rows[0].id, var12 : false })
                let createCustomer = await connection.query(s3)
            }
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
        if (checkPermission.rows[0].permission_to_view_global) {
            let leadList
            if (status.toLowerCase() == 'all') {
                let s2 = dbScript(db_sql['Q202'], { var1: checkPermission.rows[0].company_id })
                leadList = await connection.query(s2)
            }
            else if (status.toLowerCase() == 'rejected') {
                let s3 = dbScript(db_sql['Q275'], { var1: checkPermission.rows[0].company_id })
                leadList = await connection.query(s3)
            }
            else if (status.toLowerCase() == 'qualified') {
                let s4 = dbScript(db_sql['Q276'], { var1: checkPermission.rows[0].company_id })
                leadList = await connection.query(s4)
            }
            else if (status.toLowerCase() == 'converted') {
                let s5 = dbScript(db_sql['Q277'], { var1: checkPermission.rows[0].company_id })
                leadList = await connection.query(s5)
            }
            else if (status.toLowerCase() == 'assigned') {
                let s6 = dbScript(db_sql['Q282'], { var1: checkPermission.rows[0].id })
                leadList = await connection.query(s6)
            }
            if (leadList.rowCount > 0) {
                for (let lead of leadList.rows) {
                    if (lead.assigned_sales_lead_to !== "") {
                        let s3 = dbScript(db_sql['Q8'], { var1: lead.assigned_sales_lead_to })
                        assignedSalesLead = await connection.query(s3)
                        if (assignedSalesLead.rowCount > 0) {
                            lead.assignedSalesLeadName = assignedSalesLead.rows[0].full_name
                        } else {
                            lead.assignedSalesLeadName = ''
                        }
                    } else {
                        lead.assignedSalesLeadName = ''
                    }
                }
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
                let s4 = dbScript(db_sql['Q203'], { var1: roleUsers.join("','") })
                findLeadList = await connection.query(s4)
            }
            else if (status.toLowerCase() == 'rejected') {
                let s5 = dbScript(db_sql['Q278'], { var1: roleUsers.join("','") })
                findLeadList = await connection.query(s5)
            }
            else if (status.toLowerCase() == 'qualified') {
                let s5 = dbScript(db_sql['Q279'], { var1: roleUsers.join("','") })
                findLeadList = await connection.query(s5)
            }
            else if (status.toLowerCase() == 'converted') {
                let s5 = dbScript(db_sql['Q280'], { var1: roleUsers.join("','") })
                findLeadList = await connection.query(s5)
            }
            else if (status.toLowerCase() == 'assigned') {
                let s6 = dbScript(db_sql['Q283'], { var1: roleUsers.join("','") })
                findLeadList = await connection.query(s6)
            }
            if (findLeadList.rowCount > 0) {
                for (let lead of findLeadList.rows) {
                    if (lead.assigned_sales_lead_to !== '') {
                        let s3 = dbScript(db_sql['Q8'], { var1: lead.assigned_sales_lead_to })
                        assignedSalesLead = await connection.query(s3)
                        if (assignedSalesLead.rowCount > 0) {
                            lead.assignedSalesLeadName = assignedSalesLead.rows[0].full_name
                        } else {
                            lead.assignedSalesLeadName = ''
                        }

                    } else {
                        lead.assignedSalesLeadName = ''
                    }
                }
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
            organizationId,
            organizationName,
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
        let notification_userId = [assignedSalesLeadTo];
        let notification_typeId = leadId;

        await connection.query('BEGIN')
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_update) {
            let s4 = dbScript(db_sql['Q264'], { var1: organizationId })
            let findOrganization = await connection.query(s4)
            if(findOrganization.rowCount > 0){
                if(findOrganization.rows[0].organization_name != organizationName){
                    let _dt = new Date().toISOString()
                    let s6 = dbScript(db_sql['Q265'],{var1 : organizationId, var2 : organizationName, var3 : _dt})
                    let updateOrganizationName = await connection.query(s6)
                }
            }
            let _dt = new Date().toISOString();
            let s5 = dbScript(db_sql['Q204'], { var1: leadId, var2: fullName, var3: title, var4: emailAddress, var5: phoneNumber, var6: mysql_real_escape_string(address), var7: mysql_real_escape_string(organizationName), var8: source, var9: linkedinUrl, var10: website, var11: targetedValue, var12: industryType, var13: marketingQualifiedLead, var14: assignedSalesLeadTo, var15: mysql_real_escape_string(additionalMarketingNotes), var16: _dt, var17: organizationId })
            let updateLead = await connection.query(s5)
            if (marketingQualifiedLead) {
                let bId = []
                let rId = []
                organizationName = `${organizationName} - (Qualified)`
                let id = uuid.v4()
                let currency = 'United States Dollar (USD)'
                let s3 = dbScript(db_sql['Q36'], { var1: id, var2: checkPermission.rows[0].id, var3: organizationId, var4: mysql_real_escape_string(organizationName), var5: mysql_real_escape_string(source), var6: checkPermission.rows[0].company_id, var7: JSON.stringify(bId), var8: JSON.stringify(rId), var9: mysql_real_escape_string(address), var10: currency, var11 : leadId, var12 : false })
                let createCustomer = await connection.query(s3)
            }
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

                let s6 = dbScript(db_sql['Q251'], { var1: leadId, var2: true })
                let rejectFromCustomer = await connection.query(s6)
                // add notification in notification list
                let notification_userId = [rejectLead.rows[0].assigned_sales_lead_to ];
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
                console.log(deleteLead.rows[0].assigned_sales_lead_to, deleteLead.rows[0].user_id)
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

module.exports.rejectedLeads = async (req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global) {

            let s2 = dbScript(db_sql['Q206'], { var1: checkPermission.rows[0].company_id })
            let totalLeads = await connection.query(s2)

            let s3 = dbScript(db_sql['Q253'], { var1: checkPermission.rows[0].company_id, var2: true })
            let rejectedLeads = await connection.query(s3)

            res.json({
                status: 200,
                success: true,
                message: "Total vs Rejected leads",
                data: {
                    totalLeads: totalLeads.rows[0].count,
                    rejectedLeads: rejectedLeads.rows[0].count
                }
            })
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let count = 0;
            let rCount = 0;
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let s4 = dbScript(db_sql['Q209'], { var1: roleUsers.join("','") })
            let leadCount = await connection.query(s4)
            if (leadCount.rowCount > 0) {
                count += Number(leadCount.rows[0].count)
            }
            let s5 = dbScript(db_sql['Q254'], { var1: roleUsers.join("','"), var2: true })
            let rejectedLeads = await connection.query(s5)
            if (rejectedLeads.rowCount > 0) {
                rCount += Number(rejectedLeads.rows[0].count)
            }
            res.json({
                status: 200,
                success: true,
                message: "Total vs Rejected leads",
                data: {
                    totalLeads: count,
                    rejectedLeads: rCount
                }
            })
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

// module.exports.convertLeadToCustomer = async (req, res) => {
//     try {
//         let userId = req.user.id
//         let {
//             leadId,
//             address,
//             organizationName,
//             source,
//             marketingQualifiedLead,
//             currency
//         } = req.body

//         await connection.query('BEGIN')

//         let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
//         let checkPermission = await connection.query(s1)
//         if (checkPermission.rows[0].permission_to_update) {
//             if (marketingQualifiedLead) {
//                 let compId = uuid.v4()
//                 let s2 = dbScript(db_sql['Q37'], { var1: compId, var2: mysql_real_escape_string(organizationName), var3: checkPermission.rows[0].company_id })
//                 let addCustomerCom = await connection.query(s2)
//                 if (addCustomerCom.rowCount > 0) {
//                     compId = addCustomerCom.rows[0].id
//                 }
//                 let bId = []
//                 let rId = []
//                 organizationName = `${organizationName} - (Qualified)`
//                 let id = uuid.v4()
//                 let s3 = dbScript(db_sql['Q36'], { var1: id, var2: checkPermission.rows[0].id, var3: compId, var4: mysql_real_escape_string(organizationName), var5: mysql_real_escape_string(source), var6: checkPermission.rows[0].company_id, var7: JSON.stringify(bId), var8: JSON.stringify(rId), var9: mysql_real_escape_string(address), var10: currency, var11 : leadId })
//                 let createCustomer = await connection.query(s3)

//                 let _dt = new Date().toISOString()
//                 let s4 = dbScript(db_sql['Q222'],{var1 : true, var2 : _dt, var3 : leadId})
//                 let updateLead = await connection.query(s4)
//                 if (createCustomer.rowCount > 0 && updateLead.rowCount > 0) {
//                     await connection.query('COMMIT')
//                     res.json({
//                         status: 201,
//                         success: true,
//                         message: "Lead converted to customer successfully"
//                     })
//                 } else {
//                     await connection.query('ROLLBACK')
//                     res.json({
//                         status: 400,
//                         success: false,
//                         message: "something went wrong"
//                     })
//                 }
//             } else {
//                 res.json({
//                     status: 200,
//                     success: false,
//                     message: "Lead is not Qualified",
//                 })
//             }
//         } else {
//             await connection.query('ROLLBACK')
//             res.status(403).json({
//                 success: false,
//                 message: "Unathorised"
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

module.exports.createOrganization = async (req, res) => {
    try {
        let userId = req.user.id
        let { organizationName } = req.body
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_create) {
            let s2 = dbScript(db_sql['Q323'], { var1: organizationName })
            let findOrganization = await connection.query(s2)
            if (findOrganization.rowCount == 0) {
                let orgId = uuid.v4()
                let s3 = dbScript(db_sql['Q37'], { var1: orgId, var2: mysql_real_escape_string(organizationName), var3: checkPermission.rows[0].company_id })
                let addOrganization = await connection.query(s3)
                if (addOrganization.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Organization added successfully"
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
                res.json({
                    status: 200,
                    success: false,
                    message: "Organization name already exists"
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
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.updateOrganization = async(req, res) => {
    try {
        let userId = req.user.id 
        let { organizationId, organizationName } = req.body 
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {
            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q265'],{var1 : organizationId, var2 : organizationName, var3 : _dt})
            let updateOrganization = await connection.query(s2)
            if(updateOrganization.rowCount > 0){
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Organization updated successfully"
                })
            }else{
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong"
                })
            }
        }else{
            await connection.query('ROLLBACK')
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

module.exports.deleteOrganization = async (req, res) => {
    try {
        let userId = req.user.id
        let { organizationId } = req.query
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_delete) {
            let s2 = dbScript(db_sql['Q324'],{var1 : organizationId})
            let findUsedOrganization = await connection.query(s2)
            if(findUsedOrganization.rowCount == 0){
                let _dt = new Date().toISOString() 
                let s3 = dbScript(db_sql['Q325'],{var1 : _dt, var2 : organizationId})
                let deleteOrganization = await connection.query(s3)
                if(deleteOrganization.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Organization deleted successfully"
                    })
                }else{
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }
            }else{
                    res.json({
                        status: 200,
                        success: false,
                        message: "Organization details has been used in Leads."
                    })
            }
        } else {
            await connection.query('ROLLBACK')
            res.json({
                status: 400,
                success: false,
                message: "Something went wrong"
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