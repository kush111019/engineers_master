const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const { mysql_real_escape_string, getUserAndSubUser, notificationsOperations } = require('../utils/helper')
const fs = require("fs");
const fastcsv = require("fast-csv");
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

            if (titleId == '') {
                let s3 = dbScript(db_sql['Q178'], { var1: mysql_real_escape_string(title), var2: checkPermission.rows[0].company_id })
                let addTitle = await connection.query(s3)
                titleId = addTitle.rows[0].id;
            }

            if (sourceId == '') {
                let s3 = dbScript(db_sql['Q186'], { var1: mysql_real_escape_string(source), var2: checkPermission.rows[0].company_id })
                let addSource = await connection.query(s3)
                sourceId = addSource.rows[0].id
            }

            let s2 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(fullName), var2: titleId, var3: mysql_real_escape_string(emailAddress), var4: phoneNumber, var5: mysql_real_escape_string(address), var6: sourceId, var7: linkedinUrl, var8: website, var9: targetedValue, var10: marketingQualifiedLead, var11: assignedSalesLeadTo ? assignedSalesLeadTo : 'null', var12: mysql_real_escape_string(additionalMarketingNotes), var13: userId, var14: checkPermission.rows[0].company_id, var15: customerId, var16: empType })
            let createLead = await connection.query(s2)
            // add notification in notification list
            notification_typeId = createLead.rows[0].id;
            await notificationsOperations({ type: 4, msg: 4.1, notification_typeId, notification_userId }, userId);

            let _dt = new Date().toISOString()
            let s3 = dbScript(db_sql['Q278'], { var1: _dt, var2: checkPermission.rows[0].company_id })
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

            if (titleId == '') {
                let s3 = dbScript(db_sql['Q178'], { var1: mysql_real_escape_string(title), var2: checkPermission.rows[0].company_id })
                let addTitle = await connection.query(s3)
                titleId = addTitle.rows[0].id;
            }

            if (sourceId == '') {
                let s3 = dbScript(db_sql['Q186'], { var1: mysql_real_escape_string(source), var2: checkPermission.rows[0].company_id })
                let addSource = await connection.query(s3)
                sourceId = addSource.rows[0].id
            }

            let _dt = new Date().toISOString();
            let s5 = dbScript(db_sql['Q172'], { var1: leadId, var2: mysql_real_escape_string(fullName), var3: titleId, var4: mysql_real_escape_string(emailAddress), var5: phoneNumber, var6: mysql_real_escape_string(address), var7: sourceId, var8: linkedinUrl, var9: website, var10: targetedValue, var11: marketingQualifiedLead, var12: assignedSalesLeadTo ? assignedSalesLeadTo : 'null', var13: mysql_real_escape_string(additionalMarketingNotes), var14: _dt, var15: customerId })
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
                let notification_userId = rejectLead.rows[0].assigned_sales_lead_to ? [rejectLead.rows[0].assigned_sales_lead_to] : [];
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

module.exports.uploadLeadFile = async (req, res) => {
    try {
        let userId = req.user.id
        let file = req.file
        await connection.query('BEGIN')
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)

        if (checkPermission.rows[0].permission_to_create) {

            let promise = new Promise((resolve, reject) => {
                let stream = fs.createReadStream(file.path);
                let csvData = [];
                //.on('data') is triggered when a record is parsed,
                // so we will get the record (data) in the handler function.
                // Each record is pushed to csvData array.
                //on('end') is triggered after the parsing is done,
                // at the time that we have all records.
                let csvStream = fastcsv.parse().on("data", (data) => {
                    csvData.push(data)
                }).on("end", () => {
                    console.log(csvData, "csvData");
                    // remove the first line: header
                    csvData.shift();
                    // connect to the PostgreSQL database
                    // insert csvData into DB 
                    csvData.forEach(async (row) => {
                        console.log(row[8]);
                        //defualt product image 
                        if (row.length > 0) {

                            let titleId = '';
                            let s3 = dbScript(db_sql['Q192'], { var1: row[8], var2: checkPermission.rows[0].company_id })
                            let findTitle = await connection.query(s3)
                            if (findTitle.rowCount == 0) {
                                let s4 = dbScript(db_sql['Q178'], { var1: row[8], var2: checkPermission.rows[0].company_id })
                                let insertTitle = await connection.query(s4)
                                titleId = insertTitle.rows[0].id
                            } else {
                                titleId = findTitle.rows[0].id
                            }

                            let sourceId = '';
                            let s5 = dbScript(db_sql['Q191'], { var1: row[9], var2: checkPermission.rows[0].company_id })
                            let findSource = await connection.query(s5)
                            console.log(findSource.rows, "findSource");
                            if (findSource.rowCount == 0) {
                                let s6 = dbScript(db_sql['Q186'], { var1: row[9], var2: checkPermission.rows[0].company_id })
                                let insertSource = await connection.query(s6)
                                sourceId = insertSource.rows[0].id
                            } else {
                                sourceId = findSource.rows[0].id
                            }

                            let industryId = '';
                            let s7 = dbScript(db_sql['Q191'], { var1: row[11], var2: checkPermission.rows[0].company_id })
                            let findIndustry = await connection.query(s7)
                            console.log(findIndustry.rows, "findIndustry");
                            if (findIndustry.rowCount == 0) {
                                let s8 = dbScript(db_sql['Q186'], { var1: row[11], var2: checkPermission.rows[0].company_id })
                                let insertIndustry = await connection.query(s8)
                                industryId = insertIndustry.rows[0].id
                            } else {
                                industryId = findIndustry.rows[0].id
                            }

                            let customerId = ''
                            let s12 = dbScript(db_sql['Q312'],{var1 : mysql_real_escape_string(row[10])})
                            let findCustomer = await connection.query(s12)
                            console.log(findCustomer.rows);
                            if(findCustomer.rowCount == 0){
                                let s9 = dbScript(db_sql['Q36'], { var1: checkPermission.rows[0].id, var2: mysql_real_escape_string(row[10]), var3: checkPermission.rows[0].company_id, var4: mysql_real_escape_string(row[12]), var5: row[13], var6: industryId })
                                let createCustomer = await connection.query(s9)
                                customerId = createCustomer.rows[0].id
                            }else{
                                customerId = findCustomer.rows[0].id
                            }

                            let s10 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(row[0]), var2: titleId, var3: mysql_real_escape_string(row[1]), var4: row[2], var5: mysql_real_escape_string(row[3]), var6: sourceId, var7: row[4], var8: row[5], var9: row[6], var10: false, var11: 'null', var12: mysql_real_escape_string(row[7]), var13: userId, var14: checkPermission.rows[0].company_id, var15: customerId, var16: 'lead' })
                            let createLead = await connection.query(s10)

                            let _dt = new Date().toISOString();
                            let s11 = dbScript(db_sql['Q278'], { var1: _dt, var2: checkPermission.rows[0].company_id })
                            let updateStatusInCompany = await connection.query(s11)

                            if (createLead.rowCount > 0 && updateStatusInCompany.rowCount > 0) {
                                await connection.query('COMMIT')
                            }else{
                                await connection.query('ROLLBACK')
                            }

                        }
                    });
                })
                let exportedData = stream.pipe(csvStream);
                if (exportedData) {
                    resolve(file);
                } else {
                    reject(false)
                }
            })
            promise.then((file) => {
                fs.unlink(file.path, (err) => {
                    if (err) {
                        res.json({
                            status: 400,
                            success: false,
                            message: err
                        })
                    }else{
                        res.json({
                            status: 201,
                            success: true,
                            message: "Leads exported to DB"
                        })
                    }
                })
            }).catch(err => {
                res.json({
                    status: 400,
                    success: false,
                    message: err
                })
            })
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