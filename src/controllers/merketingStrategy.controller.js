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
                let s4 = dbScript(db_sql['Q229'], { var1: checkPermission.rows[0].company_id })
                let MCount = await connection.query(s4)

                let s5 = dbScript(db_sql['Q223'], {var1: checkPermission.rows[0].company_id, var2: limit, var3: offset, var4: orderBy.toLowerCase()})
                let mqlLeads = await connection.query(s5)

                let s6 = dbScript(db_sql['Q247'],{var1: checkPermission.rows[0].id, var2: limit, var3: offset, var4: orderBy.toLowerCase()})
                let assignedLeads = await connection.query(s6)
                
                for(let data of leadData.rows){
                    let mqlCount = 0
                    let assignedCount = 0
                    mqlLeads.rows.map((value) => {
                        if(value.created_by == data.created_by){
                            mqlCount += Number(value.count)
                        }
                    })
                    data.mqlCount = mqlCount
                    assignedLeads.rows.map((value) => {
                        if(value.created_by == data.assigned_to){
                            assignedCount += Number(value.count)
                        }
                    })
                    data.assignedCount = assignedCount
                }
                res.json({
                    status: 200,
                    success: true,
                    message: 'Lead counts',
                    data: {
                        totalCount: leadCount.rows[0].count,
                        totalMQLCount : MCount.rows[0].count,
                        totalAssignedLeads : assignedLeads.row[0].count,
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
                        totalMQLCount : 0,
                        totalAssignedLeads : 0,
                        leadData: leadData.rows
                    }
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let leadList = []
            let MQLleadList = []
            let assingedleadList = []
            let count = 0;
            let mCount = 0;
            let aCount = 0;
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
                let s6 = dbScript(db_sql['Q224'], { var1: id, var2: limit, var3: offset, var4: orderBy.toLowerCase() })
                let findMQLLeadList = await connection.query(s6)
                if (findMQLLeadList.rowCount > 0) {
                    for (let MQLlead of findMQLLeadList.rows) {
                        MQLleadList.push(MQLlead)
                    }
                }
                let s7 = dbScript(db_sql['Q228'], { var1: id })
                let mqlCount = await connection.query(s7)
                if (leadCount.rowCount > 0) {
                    mCount += Number(mqlCount.rows[0].count)
                }
                let s8 = dbScript(db_sql['Q248'], { var1: id })
                let assignedCount = await connection.query(s8)
                if (leadCount.rowCount > 0) {
                    aCount += Number(assignedCount.rows[0].count)
                }
                let s9 = dbScript(db_sql['Q247'], { var1: id, var2: limit, var3: offset, var4: orderBy.toLowerCase() })
                let findAssignedLeadList = await connection.query(s9)
                if (findAssignedLeadList.rowCount > 0) {
                    for (let assignedlead of findAssignedLeadList.rows) {
                        assingedleadList.push(assignedlead)
                    }
                }

            }
            for(let data of leadList){
                MQLleadList.filter((value) => {
                    if(value.created_by == data.created_by){
                        data.mqlCount = value.count
                    }else{
                        data.mqlCount = '0'
                    }
                })
                assingedleadList.filter((value) => {
                    if(value.created_by == data.assigned_to){
                        data.assignedCount = value.count
                    }else{
                        data.assignedCount = '0'
                    }
                })
            }
            // if (count && leadList.length > 0) {
            res.json({
                status: 200,
                success: true,
                message: 'Lead counts',
                data: {
                    totalCount: count,
                    totalMQLCount : mCount,
                    totalAssignedLeads : aCount,
                    leadData: leadList
                }
            })
            // } else {
            //     res.json({
            //         status: 200,
            //         success: false,
            //         message: 'Empty Lead counts',
            //         data: {
            //             totalCount: count,
            //             totalMQLCount : mCount,
            //             totalAssignedLeads : aCount,
            //             leadData: leadList
            //         }
            //     })
            // }
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

