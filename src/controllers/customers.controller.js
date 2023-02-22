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
            customerContact,
            currency,
            industry
        } = req.body
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_create) {
            let s2 = dbScript(db_sql['Q36'], { var1: checkPermission.rows[0].id, var2: mysql_real_escape_string(customerName), var3: mysql_real_escape_string(source), var4: checkPermission.rows[0].company_id, var5: mysql_real_escape_string(address), var6: currency, var7: industry })
            let createCustomer = await connection.query(s2)
            if (createCustomer.rowCount > 0) {
                if (customerContact.length > 0) {
                    for (let contactData of customerContact) {
                        if (contactData.empId == '') {
                            let s6 = dbScript(db_sql['Q70'], { var1: mysql_real_escape_string(contactData.empContactName), var2: contactData.empEmail, var3: contactData.empPhoneNumber, var4: createCustomer.rows[0].id, var5: contactData.empType, var6: userId, var7: checkPermission.rows[0].company_id })
                            let addCustomerContact = await connection.query(s6)
                        } else {
                            let _dt = new Date().toISOString();
                            let s8 = dbScript(db_sql['Q72'], { var1: contactData.empId, var2: mysql_real_escape_string(contactData.empContactName), var3: contactData.empEmail, var4: contactData.empPhoneNumber, var5: _dt })
                            let updateCustomerContact = await connection.query(s8)
                        }
                    }
                }
                await connection.query('COMMIT')
                createCustomer.rows[0].customer_contacts = []
                res.json({
                    status: 201,
                    success: true,
                    message: "Customer created successfully",
                    data: createCustomer.rows
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
            customerContact,
            currency,
            empType
        } = req.body
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_create) {
            let s2 = dbScript(db_sql['Q36'], { var1:checkPermission.rows[0].id, var2: mysql_real_escape_string(customerName), var3: mysql_real_escape_string(source), var4: checkPermission.rows[0].company_id, var5: mysql_real_escape_string(address), var6: currency, var7: industry })
            let createCustomer = await connection.query(s2)
            if (createCustomer.rowCount > 0) {
                if (customerContact.length > 0) {
                    for (let contactData of customerContact) {
                        if (contactData.empId == '') {
                            let s6 = dbScript(db_sql['Q70'], { var1: mysql_real_escape_string(contactData.empContactName), var2: contactData.empEmail, var3: contactData.empPhoneNumber, var4: createCustomer.rows[0].id, var5: contactData.empType, var6: userId, var7: checkPermission.rows[0].company_id })
                            let addCustomerContact = await connection.query(s6)
                        } else {
                            let _dt = new Date().toISOString();
                            let s8 = dbScript(db_sql['Q72'], { var1: contactData.empId, var2: mysql_real_escape_string(contactData.empContactName), var3: contactData.empEmail, var4: contactData.empPhoneNumber, var5: _dt })
                            let updateCustomerContact = await connection.query(s8)
                        }
                    }
                }
                let s10 = dbScript(db_sql['Q200'], { var1: leadName, var2: leadTitle, var3: leadEmail, var4: leadPhoneNumber, var5: leadSource, var6: leadIndustryId, var7: createCustomer.rows[0].id, var8: checkPermission.rows[0].id, var9: checkPermission.rows[0].company_id, var10: empType })
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
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty customers list',
                    data: customerList.rows
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
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
            customerContact,
            address,
            currency,
            industry
        } = req.body
        await connection.query('BEGIN')
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_update) {
            if (customerContact.length > 0) {
                for (let contactData of customerContact) {
                    if (contactData.empId == '') {

                        let s6 = dbScript(db_sql['Q70'], { var1: mysql_real_escape_string(contactData.empContactName), var2: contactData.empEmail, var3: contactData.empPhoneNumber, var4: customerId, var5: contactData.empType, var6: userId, var7: checkPermission.rows[0].company_id })
                        let addCustomerContact = await connection.query(s6)
                    } else {
                        let _dt = new Date().toISOString();
                        let s8 = dbScript(db_sql['Q72'], { var1: contactData.empId, var2: mysql_real_escape_string(contactData.empContactName), var3: contactData.empEmail, var4: contactData.empPhoneNumber, var5: _dt })
                        let updateCustomerContact = await connection.query(s8)
                    }
                }
            }
            let _dt = new Date().toISOString();
            let s5 = dbScript(db_sql['Q42'], { var1: mysql_real_escape_string(customerName), var2: mysql_real_escape_string(source), var3: _dt, var4: mysql_real_escape_string(address), var5: currency, var6: customerId, var7: checkPermission.rows[0].company_id, var8: industry })
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
            id
        } = req.body
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_delete) {
            let _dt = new Date().toISOString()
            // if (type == 'business') {
            let s2 = dbScript(db_sql['Q205'], { var1: id, var2: _dt })
            let deleteBusinessContact = await connection.query(s2)
            if (deleteBusinessContact.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: `Customer contact deleted successfully`
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

// module.exports.customerContactDetails = async (req, res) => {
//     try {
//         let { customerId } = req.query
//         let userId = req.user.id
//         let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
//         let checkPermission = await connection.query(s3)
//         if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
//             let customerContactDetails = {};

//             let s4 = dbScript(db_sql['Q74'], { var1: customerId })
//             let businessDetails = await connection.query(s4)

//             let s5 = dbScript(db_sql['Q75'], { var1: customerId })
//             let revenueDetails = await connection.query(s5)

//             customerContactDetails.businessDetails = (businessDetails.rowCount > 0) ? businessDetails.rows : []
//             customerContactDetails.revenueDetails = (revenueDetails.rowCount > 0) ? revenueDetails.rows : []

//             res.json({
//                 status: 200,
//                 success: true,
//                 message: 'Customer contact details',
//                 data: customerContactDetails
//             })

//         } else {
//             res.status(403).json({
//                 success: false,
//                 message: "UnAthorised"
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

module.exports.addBusinessAndRevenueContact = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            customerId,
            empEmail,
            empContactName,
            empPhoneNumber,
            empType
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_create) {
            await connection.query('BEGIN')

            let s6 = dbScript(db_sql['Q70'], { var1:mysql_real_escape_string(empContactName), var2: empEmail, var3: empPhoneNumber, var4: customerId, var5: empType, var6: userId, var7: checkPermission.rows[0].company_id })
            let addContact = await connection.query(s6)

            if (addContact.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: empType + " contact added successfully",
                    data: addContact.rows
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

// module.exports.addRevenueContact = async (req, res) => {
//     try {
//         let userId = req.user.id
//         let {
//             customerId,
//             revenueEmail,
//             revenueContactName,
//             revenuePhoneNumber
//         } = req.body
//         let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
//         let checkPermission = await connection.query(s3)
//         if (checkPermission.rows[0].permission_to_create) {
//             await connection.query('BEGIN')

//             let revenueId = uuid.v4()
//             let s6 = dbScript(db_sql['Q71'], { var1: revenueId, var2: mysql_real_escape_string(revenueContactName), var3: revenueEmail, var4: revenuePhoneNumber, var5: customerId })
//             let addRevenueContact = await connection.query(s6)

//             if (addRevenueContact.rowCount > 0) {
//                 await connection.query('COMMIT')
//                 res.json({
//                     status: 201,
//                     success: true,
//                     message: "Revenue contact added successfully",
//                     data: addRevenueContact.rows
//                 })
//             } else {
//                 res.json({
//                     status: 400,
//                     success: false,
//                     message: "Something went wrong"
//                 })
//             }
//         } else {
//             res.status(403).json({
//                 success: false,
//                 message: "Unathorised"
//             })
//         }
//     } catch (error) {
//         await connection.query('ROLLBACK')
//         res.json({
//             status: 400,
//             success: false,
//             message: error.message,
//         })
//     }
// }
