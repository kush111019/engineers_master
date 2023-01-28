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

module.exports.rejectLead = async (req, res) => {
    try {
        let userId = req.user.id
        let { leadId, reason } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_update) {

            await connection.query('BEGIN')

            let s4 = dbScript(db_sql['Q252'], { var1 : leadId })
            let findLeadInSales = await connection.query(s4)

            if(findLeadInSales.rowCount == 0){

                let s5 = dbScript(db_sql['Q250'], { var1: leadId, var2 : true, var3 : mysql_real_escape_string(reason) })
                let rejectLead = await connection.query(s5)

                let s6 = dbScript(db_sql['Q251'], { var1: leadId, var2 : true })
                let rejectFromCustomer = await connection.query(s6)

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
            }else{
                res.json({
                    status: 200,
                    success: false,
                    message: "This record has been used by Sales"
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
            let s2 = dbScript(db_sql['Q252'], { var1: leadId })
            let checkCustomerInSales = await connection.query(s2)
            if (checkCustomerInSales.rowCount == 0) {
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
                res.json({
                    status: 200,
                    success: false,
                    message: "This record has been used by Sales"
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
            //Total Lead count
            let s2 = dbScript(db_sql['Q206'], { var1: checkPermission.rows[0].company_id })
            let leadCount = await connection.query(s2)
            
            //Total MQL Lead count
            let s4 = dbScript(db_sql['Q229'], { var1: checkPermission.rows[0].company_id })
            let MCount = await connection.query(s4)

            //Total Assigned Lead count
            let s6 = dbScript(db_sql['Q248'], { var1: checkPermission.rows[0].id })
            let ACount = await connection.query(s6)

            //Total Rejected Lead count
            let s8 = dbScript(db_sql['Q253'], { var1: checkPermission.rows[0].company_id, var2: true })
            let RCount = await connection.query(s8)


            let s3 = dbScript(db_sql['Q207'], { var1: checkPermission.rows[0].company_id, var2: limit, var3: offset, var4: orderBy.toLowerCase() })
            let leadData = await connection.query(s3)


            
            let s5 = dbScript(db_sql['Q223'], { var1: checkPermission.rows[0].company_id, var2: limit, var3: offset, var4: orderBy.toLowerCase() })
            let mqlLeads = await connection.query(s5)



            let s7 = dbScript(db_sql['Q247'], { var1: checkPermission.rows[0].id, var2: limit, var3: offset, var4: orderBy.toLowerCase() })
            let assignedLeads = await connection.query(s7)



            let s9 = dbScript(db_sql['Q255'], { var1: checkPermission.rows[0].company_id, var2: limit, var3: offset, var4: orderBy.toLowerCase(), var5 : true })
            let rejectedLeads = await connection.query(s9)

            const lists = [leadData.rows, mqlLeads.rows, assignedLeads.rows, rejectedLeads.rows];

            const counts = {};

            lists.forEach(list => {
                list.forEach(item => {
                    if (!counts[item.created_by]) {
                        counts[item.created_by] = {
                            created_by: item.created_by,
                            count: 0,
                            mqlCount: 0,
                            assignedCount: 0,
                            rejectedCount: 0
                        };
                    }
                });
            });

            lists.forEach(list => {
                list.forEach(item => {
                    if (list === leadData.rows) counts[item.created_by].count = item.count;
                    if (list === mqlLeads.rows) counts[item.created_by].mqlCount = item.count;
                    if (list === assignedLeads.rows) counts[item.created_by].assignedCount = item.count;
                    if (list === rejectedLeads.rows) counts[item.created_by].rejectedCount = item.count;
                });
            });

            const LeadCount = Object.values(counts);
            res.json({
                status: 200,
                success: true,
                message: 'Lead counts',
                data: {
                    totalCount: leadCount.rows[0].count,
                    totalMQLCount: MCount.rows[0].count,
                    totalAssignedCount: ACount.rows[0].count,
                    totalRejectedCount: RCount.rows[0].count,
                    leadData: LeadCount
                }
            })
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let totalCounts = 0
            let totalMQLCount = 0
            let totalAssignedCount = 0
            let totalRejectedCount = 0
            let leadData = []
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
            // for (id of roleUsers) {
                //Total Lead count
                let s4 = dbScript(db_sql['Q209'], { var1: checkPermission.rows[0].id })
                let leadCount = await connection.query(s4)
                console.log(leadCount.rows, "lead data");
                if(leadCount.rowCount > 0){
                    totalCounts += leadCount.rowCount
                    let count = 0
                    let mqlCount = 0
                    let assignedCount = 0
                    let rejectedCount = 0
                    for(leads of leadCount.rows){
                        let obj = {}
                        obj.created_by = leads.created_by
                        obj.count = (checkPermission.rows[0].id == leads.user_id) ? count + 1 : count;
                        obj.assignedCount = (leads.user_id != leads.assigned_sales_lead_to) ? assignedCount + 1 : assignedCount;
                        obj.mqlCount = (leads.is_converted) ? mqlCount + 1 : mqlCount;
                        obj.rejectedCount = (leads.is_rejected) ? rejectedCount + 1 : rejectedCount

                        leadData.push(obj)
                    }
                    totalMQLCount += mqlCount;
                    totalAssignedCount += assignedCount;
                    totalRejectedCount += rejectedCount;
                }
            // }
            res.json({
                status: 200,
                success: true,
                message: 'Lead counts',
                data: {
                    totalCount: totalCounts,
                    totalMQLCount: totalMQLCount,
                    totalAssignedCount : totalAssignedCount,
                    totalRejectedCount : totalRejectedCount,
                    leadData: leadData
                }
            })
           
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

module.exports.rejectedLeads = async (req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global) {

            let s2 = dbScript(db_sql['Q206'], { var1 : checkPermission.rows[0].company_id })
            let totalLeads = await connection.query(s2)

            let s3 = dbScript(db_sql['Q253'], { var1 : checkPermission.rows[0].company_id, var2 : true })
            let rejectedLeads = await connection.query(s3)

            res.json({
                status : 200,
                success : true,
                message : "Total vs Rejected leads",
                data : {
                    totalLeads : totalLeads.rows[0].count,
                    rejectedLeads : rejectedLeads.rows[0].count
                }
            })
        }else if(checkPermission.rows[0].permission_to_view_own){
            let roleUsers = []
            let roleIds = []
            let count = 0;
            let rCount = 0;
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
                let s5 = dbScript(db_sql['Q254'],{var1 : id, var2 : true})
                let rejectedLeads = await connection.query(s5)
                if(rejectedLeads.rowCount > 0){
                    rCount += Number(rejectedLeads.rows[0].count)
                }
            }
            res.json({
                status: 200,
                success: true,
                message : "Total vs Rejected leads",
                data : {
                    totalLeads : count,
                    rejectedLeads : rCount
                }
            })
        }else{
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

                let _dt = new Date().toISOString()
                let s4 = dbScript(db_sql['Q222'],{var1 : true, var2 : _dt, var3 : leadId})
                let updateLead = await connection.query(s4)
                if (createCustomer.rowCount > 0 && updateLead.rowCount > 0) {
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

//--------------------------------Budget------------------------------------------------

module.exports.addBudget = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            year, 
            q1Amount,
            q2Amount,
            q3Amount,
            q4Amount,
            description
        } = req.body

        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_create) {

            await connection.query('BEGIN')
            let id = uuid.v4()
            let s2 = dbScript(db_sql['Q233'], { var1 : id, var2 : year, var3: q1Amount, var4 : q2Amount, var5 : q3Amount, var6 : q4Amount, var7 : checkPermission.rows[0].id, var8 : checkPermission.rows[0].company_id })
            let createBudget = await connection.query(s2)

            if(createBudget.rowCount > 0){
                for(let descData of description){
                    let desId = uuid.v4() 
                    let s3 = dbScript(db_sql['Q234'],{var1 : desId, var2 : createBudget.rows[0].id, var3 : descData.title, var4 : descData.amount, var5 : checkPermission.rows[0].id, var6 : checkPermission.rows[0].company_id})
                    let addDescription = await connection.query(s3)

                    let logDesId = uuid.v4()
                    let s4 = dbScript(db_sql['Q235'],{var1 : logDesId,var2 : addDescription.rows[0].id, var3 : createBudget.rows[0].id, var4 : descData.title, var5 : descData.amount, var6 : checkPermission.rows[0].id, var7 : checkPermission.rows[0].company_id})
                    let addDescLog = await connection.query(s4)
                }

                let logBudgetId = uuid.v4()
                let s5 = dbScript(db_sql['Q236'],{var1 : logBudgetId, var2 :createBudget.rows[0].id ,var3 : year, var4: q1Amount, var5 : q2Amount, var6 : q3Amount, var7 : q4Amount, var8 : checkPermission.rows[0].id, var9 : checkPermission.rows[0].company_id})
                let addBudgetLog = await connection.query(s5)

                if(addBudgetLog.rowCount > 0){
                    await connection.query('COMMIT')
                    res.json({
                        status : 201,
                        success : true,
                        message : 'Budget added successfully'
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
        res.json({
            status: 400,
            success: false,
            message: error.message,
        }) 
    }
}

module.exports.budgetList = async(req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global) {
            let s2 = dbScript(db_sql['Q237'], {var1 : checkPermission.rows[0].company_id})
            let budgetList = await connection.query(s2)
            if(budgetList.rowCount > 0){
                const transformedArray = budgetList.rows.reduce((acc, curr) => {
                    const existingDesc = acc.find(s => s.id === curr.id);
                    if (existingDesc) {
                        existingDesc.description.push({
                            id: curr.description_id,
                            title: curr.title,
                            amount: curr.amount
                        });
                    } else {
                        acc.push({
                            id: curr.id,
                            budgetYear: curr.budget_year,
                            quarterOne: curr.quarter_one,
                            quarterTwo: curr.quarter_two,
                            quarterThree: curr.quarter_three,
                            quarterFour: curr.quarter_four,
                            isFinalize : curr.is_finalize,
                            createdAt : curr.created_at,
                            creatorName : curr.creator_name,
                            description: [
                                {
                                    id: curr.description_id,
                                    title: curr.title,
                                    amount: curr.amount
                                },
                            ],
                        });
                    }
                    return acc;
                }, []);
                if (transformedArray.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "budget list",
                        data: transformedArray
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty budget list",
                        data: []
                    })
                }
            }else{
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty budget list',
                    data: budgetList.rows
                })
            }
        }else if(checkPermission.rows[0].permission_to_view_own){
            let roleUsers = []
            let roleIds = []
            let budgetDataArr = []
            roleIds.push(checkPermission.rows[0].role_id)
            let getRoles = async (id) => {
                let s3 = dbScript(db_sql['Q16'], { var1: id })
                let getChild = await connection.query(s3);
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
                let s4 = dbScript(db_sql['Q185'], { var1: roleId })
                let findUsers = await connection.query(s4)
                if (findUsers.rowCount > 0) {
                    for (let user of findUsers.rows) {
                        roleUsers.push(user.id)
                    }
                }
            }
            for (id of roleUsers) {
                let s5 = dbScript(db_sql['Q240'],{var1 : id})
                let budgetList = await connection.query(s5)
                if(budgetList.rowCount > 0){
                    for(let budgetData of budgetList.rows){
                        budgetDataArr.push(budgetData)
                    }
                }
            }
            const transformedArray = budgetDataArr.reduce((acc, curr) => {
                const existingDesc = acc.find(s => s.id === curr.id);
                if (existingDesc) {
                    existingDesc.description.push({
                        id: curr.description_id,
                        title: curr.title,
                        amount: curr.amount
                    });
                } else {
                    acc.push({
                        id: curr.id,
                        budgetYear: curr.budget_year,
                        quarterOne: curr.quarter_one,
                        quarterTwo: curr.quarter_two,
                        quarterThree: curr.quarter_three,
                        quarterFour: curr.quarter_four,
                        isFinalize : curr.is_finalize,
                        createdAt : curr.created_at,
                        creatorName : curr.creator_name,
                        description: [
                            {
                                id: curr.description_id,
                                title: curr.title,
                                amount: curr.amount
                            },
                        ],
                    });
                }
                return acc;
            }, []);
            if (transformedArray.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "budget list",
                    data: transformedArray
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty budget list",
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

module.exports.deleteBudget = async(req, res) => {
    try {
        let userId = req.user.id
        let {budgetId} = req.body
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_delete) {
            await connection.query('BEGIN')
            let _dt = new Date().toISOString()

            let s2 = dbScript(db_sql['Q238'],{var1 : budgetId, var2 : _dt})
            let deleteBudget = await connection.query(s2)

            let s3 = dbScript(db_sql['Q239'],{var1 : budgetId, var2 : _dt})
            let deleteDescription = await connection.query(s3)

            if(deleteBudget.rowCount > 0 && deleteDescription.rowCount > 0){
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Budget deleted successfully"
                })
            }else{
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
        res.json({
            status: 400,
            success: false,
            message: error.message,
        }) 
    }
}

module.exports.updateBudget = async(req, res) => {
    try {
        let userId = req.user.id
        let {
            budgetId,
            year, 
            q1Amount,
            q2Amount,
            q3Amount,
            q4Amount,
            description
        } = req.body
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {

            let s2 = dbScript(db_sql['Q241'],{var1 : year, var2 :q1Amount, var3 : q2Amount, var4: q3Amount, var5 : q4Amount, var6 : budgetId})
            let updateBudget = await connection.query(s2)

            let logBudgetId = uuid.v4()
            let s5 = dbScript(db_sql['Q236'],{var1 : logBudgetId, var2 :budgetId, var3 : year, var4: q1Amount, var5 : q2Amount, var6 : q3Amount, var7 : q4Amount, var8 : checkPermission.rows[0].id, var9 : checkPermission.rows[0].company_id})
            let addBudgetLog = await connection.query(s5)

            for(let desc of description ){
                if(desc.id != ''){
                    let s3 = dbScript(db_sql['Q242'],{var1 : desc.title, var2 : desc.amount, var3 : desc.id})
                    let updateDescription = await connection.query(s3)

                    let logDesId = uuid.v4()
                    let s4 = dbScript(db_sql['Q235'],{var1 : logDesId,var2 : updateDescription.rows[0].id, var3 : budgetId, var4 : desc.title, var5 : desc.amount, var6 : checkPermission.rows[0].id, var7 : checkPermission.rows[0].company_id})
                    let addDescLog = await connection.query(s4)

                }else{
                    let desId = uuid.v4() 
                    let s5 = dbScript(db_sql['Q234'],{var1 : desId, var2 : budgetId, var3 : desc.title, var4 : desc.amount, var5 : checkPermission.rows[0].id, var6 : checkPermission.rows[0].company_id})
                    let addDescription = await connection.query(s5)

                    let logDesId = uuid.v4()
                    let s6 = dbScript(db_sql['Q235'],{var1 : logDesId,var2 : addDescription.rows[0].id, var3 : budgetId, var4 : desc.title, var5 : desc.amount, var6 : checkPermission.rows[0].id, var7 : checkPermission.rows[0].company_id})
                    let addDescLog = await connection.query(s6)
                }
            }
            if(updateBudget.rowCount > 0 && addBudgetLog.rowCount > 0){
                await connection.query('COMMIT')
                res.json({
                    status : 200,
                    success : true,
                    message : 'Budget updated successfully'
                })
            }else{
                await connection.query('ROLLBACK')
                res.json({
                    status : 400,
                    success : false,
                    message : 'Something went wrong'
                })
            }
        }else{
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

module.exports.budgetLogList = async(req, res) => {
    try {
        let userId = req.user.id
        let {budgetId} = req.query
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global) {
            let s2 = dbScript(db_sql['Q243'], {var1 : budgetId})
            let budgetLogList = await connection.query(s2)
            if(budgetLogList.rowCount > 0){
                const transformedArray = budgetLogList.rows.reduce((acc, curr) => {
                    const existingDesc = acc.find(s => s.id === curr.id);
                    if (existingDesc) {
                        existingDesc.description.push({
                            id: curr.description_id,
                            title: curr.title,
                            amount: curr.amount
                        });
                    } else {
                        acc.push({
                            id: curr.id,
                            budgetYear: curr.budget_year,
                            quarterOne: curr.quarter_one,
                            quarterTwo: curr.quarter_two,
                            quarterThree: curr.quarter_three,
                            quarterFour: curr.quarter_four,
                            isFinalize : curr.is_finalize,
                            createdAt : curr.created_at,
                            creatorName : curr.creator_name,
                            description: [
                                {
                                    id: curr.description_id,
                                    title: curr.title,
                                    amount: curr.amount
                                },
                            ],
                        });
                    }
                    return acc;
                }, []);
                if (transformedArray.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "budget logs list",
                        data: transformedArray
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty budget logs list",
                        data: []
                    })
                }
            }else{
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty budget logs list',
                    data: budgetLogList.rows
                })
            }
        }else if(checkPermission.rows[0].permission_to_view_own){
            let roleUsers = []
            let roleIds = []
            let budgetLogDataArr = []
            roleIds.push(checkPermission.rows[0].role_id)
            let getRoles = async (id) => {
                let s3 = dbScript(db_sql['Q16'], { var1: id })
                let getChild = await connection.query(s3);
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
                let s4 = dbScript(db_sql['Q185'], { var1: roleId })
                let findUsers = await connection.query(s4)
                if (findUsers.rowCount > 0) {
                    for (let user of findUsers.rows) {
                        roleUsers.push(user.id)
                    }
                }
            }
            for (id of roleUsers) {
                let s5 = dbScript(db_sql['Q244'],{var1 : id, var2 : budgetId})
                let budgetLogList = await connection.query(s5)
                if(budgetLogList.rowCount > 0){
                    for(let budgetData of budgetLogList.rows){
                        budgetLogDataArr.push(budgetData)
                    }
                }
            }
            const transformedArray = budgetLogDataArr.reduce((acc, curr) => {
                const existingDesc = acc.find(s => s.id === curr.id);
                if (existingDesc) {
                    existingDesc.description.push({
                        id: curr.description_id,
                        title: curr.title,
                        amount: curr.amount
                    });
                } else {
                    acc.push({
                        id: curr.id,
                        budgetYear: curr.budget_year,
                        quarterOne: curr.quarter_one,
                        quarterTwo: curr.quarter_two,
                        quarterThree: curr.quarter_three,
                        quarterFour: curr.quarter_four,
                        isFinalize : curr.is_finalize,
                        createdAt : curr.created_at,
                        creatorName : curr.creator_name,
                        description: [
                            {
                                id: curr.description_id,
                                title: curr.title,
                                amount: curr.amount
                            },
                        ],
                    });
                }
                return acc;
            }, []);
            if (transformedArray.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "budget logs list",
                    data: transformedArray
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty budget logs list",
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

module.exports.deleteDescription = async(req, res) => {
    try {
        let userId = req.user.id
        let {descriptionId} = req.query
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_delete) {

            await connection.query('BEGIN')
            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q245'], {var1 : _dt, var2 : descriptionId})
            let deleteDescription = await connection.query(s2)

            if(deleteDescription.rowCount > 0){
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Description deleted successfully"
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

module.exports.finalizeBudget = async (req, res) => {
    try {
        let userId = req.user.id
        let {budgetId} = req.query
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {
            await connection.query('BEGIN')
            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q246'],{var1 : budgetId, var2 : _dt})
            let finalize = await connection.query(s2)
            if(finalize.rowCount > 0){
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Budget finalized successfully"
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

