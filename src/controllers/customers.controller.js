const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string, getUserAndSubUser } = require('../utils/helper')
const moduleName = process.env.CUSTOMERS_MODULE

module.exports.createCustomer = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            customerName,
            source,
            address,
            businessContact,
            revenueContact,
            currency,
            industry
        } = req.body
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_create) {
            let id = uuid.v4()
            let s2 = dbScript(db_sql['Q36'], { var1: id, var2: checkPermission.rows[0].id, var3: mysql_real_escape_string(customerName), var4: mysql_real_escape_string(source), var5: checkPermission.rows[0].company_id, var6: mysql_real_escape_string(address), var7: currency, var8 : industry })
            let createCustomer = await connection.query(s2)
            if (createCustomer.rowCount > 0) {
                if (businessContact.length > 0 && revenueContact.length > 0) {
                    for (let businessData of businessContact) {
                        if (businessData.businessId == '') {
                            let businessId = uuid.v4()
                            let s6 = dbScript(db_sql['Q70'], { var1: businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: createCustomer.rows[0].id })
                            let addBusinessContact = await connection.query(s6)
                        } else {
                            let _dt = new Date().toISOString();
                            let s8 = dbScript(db_sql['Q72'], { var1: businessData.businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: _dt })
                            let updateBusinessContact = await connection.query(s8)
                        }
                    }
                    for (let revenueData of revenueContact) {
                        if (revenueData.revenueId == '') {
                            let revenueId = uuid.v4()
                            let s7 = dbScript(db_sql['Q71'], { var1: revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: createCustomer.rows[0].id })
                            let addRevenueContact = await connection.query(s7)
                        } else {
                            let _dt = new Date().toISOString();
                            let s9 = dbScript(db_sql['Q73'], { var1: revenueData.revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: _dt })
                            let updateRevenueContact = await connection.query(s9)
                            rId.push(updateRevenueContact.rows[0].id)
                        }
                    }
                }
                await connection.query('COMMIT')
                createCustomer.rows[0].business_contacts = []
                createCustomer.rows[0].revenue_contacts = []
                res.json({
                    status: 201,
                    success: true,
                    message: "Customer created successfully",
                    data : createCustomer.rows
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

module.exports.createCustomerWithLead = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            leadName,
            leadTitle,
            leadEmail,
            leadPhoneNumber,
            leadIndustryId,
            leadSource,
            customerName,
            source,
            industry,
            address,
            businessContact,
            revenueContact,
            currency
        } = req.body
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_create) {
            let id = uuid.v4()
            let s2 = dbScript(db_sql['Q36'], { var1: id, var2: checkPermission.rows[0].id, var3: mysql_real_escape_string(customerName), var4: mysql_real_escape_string(source), var5: checkPermission.rows[0].company_id, var6: mysql_real_escape_string(address), var7: currency, var8: industry })
            let createCustomer = await connection.query(s2)
            if (createCustomer.rowCount > 0) {
                if (businessContact.length > 0 && revenueContact.length > 0) {
                    for (let businessData of businessContact) {
                        if (businessData.businessId == '') {
                            let businessId = uuid.v4()
                            let s6 = dbScript(db_sql['Q70'], { var1: businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: createCustomer.rows[0].id })
                            let addBusinessContact = await connection.query(s6)
                        } else {
                            let _dt = new Date().toISOString();
                            let s8 = dbScript(db_sql['Q72'], { var1: businessData.businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: _dt })
                            let updateBusinessContact = await connection.query(s8)
                        }
                    }
                    for (let revenueData of revenueContact) {
                        if (revenueData.revenueId == '') {
                            let revenueId = uuid.v4()
                            let s7 = dbScript(db_sql['Q71'], { var1: revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: createCustomer.rows[0].id })
                            let addRevenueContact = await connection.query(s7)
                        } else {
                            let _dt = new Date().toISOString();
                            let s9 = dbScript(db_sql['Q73'], { var1: revenueData.revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: _dt })
                            let updateRevenueContact = await connection.query(s9)
                        }
                    }
                }
                let leadId = uuid.v4()
                let s10 = dbScript(db_sql['Q200'], { var1: leadId, var2: leadName, var3: leadTitle, var4: leadEmail, var5: leadPhoneNumber, var6: leadSource, var7: leadIndustryId, var8: createCustomer.rows[0].id, var9 : checkPermission.rows[0].id, var10 : checkPermission.rows[0].company_id })
                let createLead = await connection.query(s10)
                if (createLead.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: "Customer created successfully"
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

module.exports.customerList = async (req, res) => {
    try {
        let userId = req.user.id
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
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
            }else{
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty customers list',
                    data: customerList.rows
                })
            }       
        }else if (checkPermission.rows[0].permission_to_view_own) {
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let s2 = dbScript(db_sql['Q316'], { var1: roleUsers.join(","), var2: false })
            let customerList = await connection.query(s2)
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
                    data: customerList.rows
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

module.exports.editCustomer = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            customerId,
            customerName,
            source,
            businessContact,
            revenueContact,
            address,
            currency,
            industry
        } = req.body
        await connection.query('BEGIN')
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_update) {
            if(businessContact.length > 0 && revenueContact.length > 0){
                for (let businessData of businessContact) {
                    if (businessData.businessId == '') {
                        let businessId = uuid.v4()
                        let s6 = dbScript(db_sql['Q70'], { var1: businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: customerId })
                        let addBusinessContact = await connection.query(s6)
                    } else {
                        let _dt = new Date().toISOString();
                        let s8 = dbScript(db_sql['Q72'], { var1: businessData.businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: _dt })
                        let updateBusinessContact = await connection.query(s8)
                    }
                }
                for (let revenueData of revenueContact) {
                    if (revenueData.revenueId == '') {
                        let revenueId = uuid.v4()
                        let s7 = dbScript(db_sql['Q71'], { var1: revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: customerId })
                        let addRevenueContact = await connection.query(s7)
                    } else {
                        let _dt = new Date().toISOString();
                        let s9 = dbScript(db_sql['Q73'], { var1: revenueData.revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: _dt })
                        let updateRevenueContact = await connection.query(s9)
                    }
                }
            }
            let _dt = new Date().toISOString();
            let s5 = dbScript(db_sql['Q42'], { var1: mysql_real_escape_string(customerName), var2: mysql_real_escape_string(source), var3: _dt,  var4: mysql_real_escape_string(address), var5: currency, var6: customerId, var7: checkPermission.rows[0].company_id , var8 : industry})
            let updateCustomer = await connection.query(s5)
            if (updateCustomer.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Customer updated successfully"
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

module.exports.deleteContactForCustomer = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            type,
            id
        } = req.body
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_delete) {
            let _dt = new Date().toISOString()
            if (type == 'business') {
                let s2 = dbScript(db_sql['Q327'],{var1 : _dt, var2 : id})
                let deleteBusinessContact = await connection.query(s2)
                if (deleteBusinessContact.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: `Business contact deleted successfully`
                    })
                } else {
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }
            }else if (type == 'revenue') {
                let s3 = dbScript(db_sql['Q327'],{var1 : id})
                let deleteRevenueContact = await connection.query(s3)
                if (deleteRevenueContact.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: `Revenue contact deleted successfully`
                    })
                } else {
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }
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

module.exports.customerContactDetails = async (req, res) => {
    try {
        let { customerId } = req.query
        let userId = req.user.id
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let customerContactDetails = {};

            let s4 = dbScript(db_sql['Q74'], { var1: customerId })
            let businessDetails = await connection.query(s4)

            let s5 = dbScript(db_sql['Q75'], { var1: customerId })
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

module.exports.deleteCustomer = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            customerId
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_delete) {
            let s2 = dbScript(db_sql['Q259'], { var1: customerId })
            let checkCustomerInSales = await connection.query(s2)
            if (checkCustomerInSales.rowCount == 0) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q47'], { var1: _dt, var2: customerId, var3: checkPermission.rows[0].company_id })
                let deleteCustomer = await connection.query(s4)
                if (deleteCustomer.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Customer deleted successfully"
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

module.exports.addBusinessContact = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            customerId,
            businessEmail,
            businessContactName,
            businessPhoneNumber
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_create) {
            await connection.query('BEGIN')

            let businessId = uuid.v4()
            let s6 = dbScript(db_sql['Q70'], { var1: businessId, var2: mysql_real_escape_string(businessContactName), var3: businessEmail, var4: businessPhoneNumber, var5: customerId })
            let addBusinessContact = await connection.query(s6)

            if (addBusinessContact.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "Business contact added successfully",
                    data : addBusinessContact.rows
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

module.exports.addRevenueContact = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            customerId,
            revenueEmail,
            revenueContactName,
            revenuePhoneNumber
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_create) {
            await connection.query('BEGIN')

            let revenueId = uuid.v4()
            let s6 = dbScript(db_sql['Q71'], { var1: revenueId, var2: mysql_real_escape_string(revenueContactName), var3: revenueEmail, var4: revenuePhoneNumber, var5: customerId })
            let addRevenueContact = await connection.query(s6)

            if (addRevenueContact.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "Revenue contact added successfully",
                    data : addRevenueContact.rows
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
