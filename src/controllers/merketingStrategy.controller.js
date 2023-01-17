const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string } = require('../utils/helper')
const moduleName = process.env.MARKETING_MODULE

module.exports.createLead = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            fullName,
            title,
            emailAddress,
            phoneNumber,
            address,
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

        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_create) {

            await connection.query('BEGIN')
            let id = uuid.v4()

            let s2 = dbScript(db_sql['Q201'], { var1: id, var2: fullName, var3: title, var4: emailAddress, var5: phoneNumber, var6: mysql_real_escape_string(address), var7: mysql_real_escape_string(organizationName), var8: source, var9: linkedinUrl, var10: website, var11: targetedValue, var12: industryType, var13: marketingQualifiedLead, var14: assignedSalesLeadTo, var15: mysql_real_escape_string(additionalMarketingNotes), var16: userId, var17: checkPermission.rows[0].company_id })
            let createLead = await connection.query(s2)

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
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global) {

            let s2 = dbScript(db_sql['Q202'], { var1: checkPermission.rows[0].company_id })
            let leadList = await connection.query(s2)
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
            let leadList = []
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
            for (id of roleUsers) {
                let s4 = dbScript(db_sql['Q203'], { var1: id })
                let findLeadList = await connection.query(s4)
                if (findLeadList.rowCount > 0) {
                    for (let lead of findLeadList.rows) {
                        leadList.push(lead)
                    }
                }
            }
            if (leadList.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Leads list',
                    data: leadList
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty leads list',
                    data: leadList
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
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_update) {

            await connection.query('BEGIN')

            let _dt = new Date().toISOString();
            let s5 = dbScript(db_sql['Q204'], { var1: leadId, var2: fullName, var3: title, var4: emailAddress, var5: phoneNumber, var6: mysql_real_escape_string(address), var7: mysql_real_escape_string(organizationName), var8: source, var9: linkedinUrl, var10: website, var11: targetedValue, var12: industryType, var13: marketingQualifiedLead, var14: assignedSalesLeadTo, var15: mysql_real_escape_string(additionalMarketingNotes), var16: _dt })
            let updateLead = await connection.query(s5)

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
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_delete) {

            await connection.query('BEGIN')

            let _dt = new Date().toISOString();
            let s5 = dbScript(db_sql['Q205'], { var1: leadId, var2: _dt })
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

module.exports.marketingDashboard = async (req, res) => {
    try {
        let userId = req.user.id
        let { page, orderBy } = req.query
        let limit = 10;
        let offset = (page - 1) * limit
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global) {

            let s2 = dbScript(db_sql['Q206'], { var1: checkPermission.rows[0].company_id })
            let leadCount = await connection.query(s2)

            let s3 = dbScript(db_sql['Q207'], { var1: checkPermission.rows[0].company_id, var2: limit, var3: offset, var4: orderBy.toLowerCase() })
            let leadData = await connection.query(s3)

            if (leadCount.rowCount > 0 && leadData.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Lead counts',
                    data: {
                        totalCount: leadCount.rows[0].count,
                        leadData: leadData.rows
                    }
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty Lead counts',
                    data: {
                        totalCount: leadCount.rows[0].count,
                        leadData: leadData.rows
                    }
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let leadList = []
            let count = 0;
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
            for (id of roleUsers) {
                let s4 = dbScript(db_sql['Q209'], { var1: id })
                let leadCount = await connection.query(s4)
                if (leadCount.rowCount > 0) {
                    count += Number(leadCount.rows[0].count)
                }
                let s5 = dbScript(db_sql['Q208'], { var1: id, var2: limit, var3: offset, var4: orderBy.toLowerCase() })
                let findLeadList = await connection.query(s5)
                if (findLeadList.rowCount > 0) {
                    for (let lead of findLeadList.rows) {
                        leadList.push(lead)
                    }
                }
            }
            if (count && leadList.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Lead counts',
                    data: {
                        totalCount: count,
                        leadData: leadList
                    }
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty Lead counts',
                    data: {
                        totalCount: count,
                        leadData: leadList
                    }
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

module.exports.convertLeadToCustomer = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            leadId,
            address,
            organizationName,
            source,
            marketingQualifiedLead,
            currency
        } = req.body
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_create) {
            if (marketingQualifiedLead) {
                
                await connection.query('BEGIN')
                let compId = uuid.v4()
                let s2 = dbScript(db_sql['Q37'], { var1: compId, var2: mysql_real_escape_string(organizationName), var3: checkPermission.rows[0].company_id })
                let addCustomerCom = await connection.query(s2)
                if (addCustomerCom.rowCount > 0) {
                    compId = addCustomerCom.rows[0].id
                }
                let bId = []
                let rId = []
                organizationName = `${organizationName} - (MQL)`
                let id = uuid.v4()
                let s3 = dbScript(db_sql['Q36'], { var1: id, var2: checkPermission.rows[0].id, var3: compId, var4: mysql_real_escape_string(organizationName), var5: mysql_real_escape_string(source), var6: checkPermission.rows[0].company_id, var7: JSON.stringify(bId), var8: JSON.stringify(rId), var9: mysql_real_escape_string(address), var10: currency, var11 : leadId })
                let createCustomer = await connection.query(s3)
                if (createCustomer.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: "Lead converted to customer successfully"
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
                res.json({
                    status: 200,
                    success: false,
                    message: "Lead is not Qualified",
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