const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string } = require('../utils/helper')
const moduleName = process.env.CUSTOMERS_MODULE

module.exports.createCustomer = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            companyId,
            customerName,
            source,
            businessContact,
            revenueContact,
            address,
            currency
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_create) {
            await connection.query('BEGIN')
            let compId = ''
            let s4 = dbScript(db_sql['Q38'], { var1: companyId })
            let findCustomerCom = await connection.query(s4)
            if (findCustomerCom.rowCount == 0) {
                let comId = uuid.v4()
                let s5 = dbScript(db_sql['Q37'], { var1: comId, var2: mysql_real_escape_string(customerName), var3: checkPermission.rows[0].company_id })
                let addCustomerCom = await connection.query(s5)

                if (addCustomerCom.rowCount > 0) {
                    compId = addCustomerCom.rows[0].id
                }
            } else {
                compId = findCustomerCom.rows[0].id
            }
            let bId = [];
            let rId = [];
            for (let businessData of businessContact) {
                if (businessData.businessId == '') {
                    let businessId = uuid.v4()
                    let s6 = dbScript(db_sql['Q70'], { var1: businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: compId })
                    let addBusinessContact = await connection.query(s6)
                    bId.push(addBusinessContact.rows[0].id)
                } else {
                    let _dt = new Date().toISOString();
                    let s8 = dbScript(db_sql['Q72'], { var1: businessData.businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: _dt })
                    let updateBusinessContact = await connection.query(s8)
                    bId.push(updateBusinessContact.rows[0].id)
                }
            }
            for (let revenueData of revenueContact) {
                if (revenueData.revenueId == '') {
                    let revenueId = uuid.v4()
                    let s7 = dbScript(db_sql['Q71'], { var1: revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: compId })
                    let addRevenueContact = await connection.query(s7)
                    rId.push(addRevenueContact.rows[0].id)
                } else {
                    let _dt = new Date().toISOString();
                    let s9 = dbScript(db_sql['Q73'], { var1: revenueData.revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: _dt })
                    let updateRevenueContact = await connection.query(s9)
                    rId.push(updateRevenueContact.rows[0].id)
                }
            }
            let leadId = ''
            let id = uuid.v4()
            let s10 = dbScript(db_sql['Q36'], { var1: id, var2: checkPermission.rows[0].id, var3: compId, var4: mysql_real_escape_string(customerName), var5: mysql_real_escape_string(source), var6: checkPermission.rows[0].company_id, var7: JSON.stringify(bId), var8: JSON.stringify(rId), var9: mysql_real_escape_string(address), var10: currency, var11 : leadId })
            let createCustomer = await connection.query(s10)
            if (createCustomer.rowCount > 0) {
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
        let userIds = []
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            let customerArr = []
            let s4 = dbScript(db_sql['Q39'], { var1: checkPermission.rows[0].company_id, var2 : false})
            let customerList = await connection.query(s4)
            if (customerList.rowCount > 0) {
                for (let data of customerList.rows) {
                    if (data.business_contact_id != null && data.revenue_contact_id != null) {
                        let businessIds = JSON.parse(data.business_contact_id)
                        let revenueIds = JSON.parse(data.revenue_contact_id)
                        let businessContact = [];
                        let revenueContact = [];
                        for (let id of businessIds) {
                            let s5 = dbScript(db_sql['Q76'], { var1: id })
                            let businessData = await connection.query(s5)
                            businessContact.push(businessData.rows[0])
                        }
                        for (let id of revenueIds) {
                            let s5 = dbScript(db_sql['Q77'], { var1: id })
                            let revenueData = await connection.query(s5)
                            revenueContact.push(revenueData.rows[0])
                        }
                        data.businessContact = businessContact
                        data.revenueContact = revenueContact

                    } else {
                        data.businessContact = [];
                        data.revenueContact = [];
                    }
                    customerArr.push(data);
                }
            }
            if (customerArr.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Customers list',
                    data: customerArr
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty customers list',
                    data: customerArr
                })
            }
        }
        else if (checkPermission.rows[0].permission_to_view_own) {
            userIds.push(userId)
            let customerList = []
            let s3 = dbScript(db_sql['Q163'], { var1: checkPermission.rows[0].role_id })
            let findUsers = await connection.query(s3)
            if (findUsers.rowCount > 0) {
                for (user of findUsers.rows) {
                    userIds.push(user.id)
                }
            }
            for (id of userIds) {
                let s4 = dbScript(db_sql['Q166'], { var1: id })
                let findCustomerList = await connection.query(s4)
                if (findCustomerList.rowCount > 0) {
                    for (let data of findCustomerList.rows) {
                        if (data.business_contact_id != null && data.revenue_contact_id != null) {
                            let businessIds = JSON.parse(data.business_contact_id)
                            let revenueIds = JSON.parse(data.revenue_contact_id)
                            let businessContact = [];
                            let revenueContact = [];
                            for (let id of businessIds) {
                                let s5 = dbScript(db_sql['Q76'], { var1: id })
                                let businessData = await connection.query(s5)
                                businessContact.push(businessData.rows[0])
                            }
                            for (let id of revenueIds) {
                                let s5 = dbScript(db_sql['Q77'], { var1: id })
                                let revenueData = await connection.query(s5)
                                revenueContact.push(revenueData.rows[0])
                            }
                            data.businessContact = businessContact
                            data.revenueContact = revenueContact

                        } else {
                            data.businessContact = [];
                            data.revenueContact = [];
                        }
                        customerList.push(data);
                    }
                }
            }
            if (customerList.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Customers list',
                    data: customerList
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty customers list',
                    data: customerList
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
            currency
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_update) {

            await connection.query('BEGIN')
            let bId = [];
            let rId = [];
            let compId = ''
            let s4 = dbScript(db_sql['Q55'], { var1: customerId })
            let findCustomerCom = await connection.query(s4)
            if (findCustomerCom.rowCount > 0) {
                compId = findCustomerCom.rows[0].customer_company_id

                for (let businessData of businessContact) {
                    if (businessData.businessId == '') {
                        let businessId = uuid.v4()
                        let s6 = dbScript(db_sql['Q70'], { var1: businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: compId })
                        let addBusinessContact = await connection.query(s6)
                        bId.push(addBusinessContact.rows[0].id)
                    } else {
                        let _dt = new Date().toISOString();
                        let s8 = dbScript(db_sql['Q72'], { var1: businessData.businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: _dt })
                        let updateBusinessContact = await connection.query(s8)
                        bId.push(updateBusinessContact.rows[0].id)
                    }
                }
                for (let revenueData of revenueContact) {
                    if (revenueData.revenueId == '') {
                        let revenueId = uuid.v4()
                        let s7 = dbScript(db_sql['Q71'], { var1: revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: compId })
                        let addRevenueContact = await connection.query(s7)
                        rId.push(addRevenueContact.rows[0].id)
                    } else {
                        let _dt = new Date().toISOString();
                        let s9 = dbScript(db_sql['Q73'], { var1: revenueData.revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: _dt })
                        let updateRevenueContact = await connection.query(s9)
                        rId.push(updateRevenueContact.rows[0].id)
                    }
                }
            }

            let _dt = new Date().toISOString();
            let s5 = dbScript(db_sql['Q42'], { var1: mysql_real_escape_string(customerName), var2: mysql_real_escape_string(source), var3: _dt, var6: customerId, var4: JSON.stringify(bId), var5: JSON.stringify(rId), var7: mysql_real_escape_string(address), var8: checkPermission.rows[0].company_id, var9: currency })
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
            id,
            customerId
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_delete) {

            let s4 = dbScript(db_sql['Q55'], { var1: customerId })
            let customerData = await connection.query(s4)

            if (customerData.rowCount > 0) {
                let updateCustomer
                await connection.query('BEGIN')
                if (type == 'business') {
                    let businessIds = JSON.parse(customerData.rows[0].business_contact_id)
                    let index = businessIds.indexOf(id);
                    businessIds.splice(index, 1)

                    let s5 = dbScript(db_sql['Q79'], { var1: customerId, var2: JSON.stringify(businessIds) })
                    updateCustomer = await connection.query(s5)
                }
                else if (type == 'revenue') {
                    let revenueIds = JSON.parse(customerData.rows[0].revenue_contact_id)
                    let index = revenueIds.indexOf(id);
                    revenueIds.splice(index, 1)

                    let s6 = dbScript(db_sql['Q80'], { var1: customerId, var2: JSON.stringify(revenueIds) })
                    updateCustomer = await connection.query(s6)
                }
                await connection.query('COMMIT')
                if (updateCustomer.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: `${type} deleted successfully`
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

module.exports.customerCompanyList = async (req, res) => {
    try {
        let { companyName } = req.query
        let userId = req.user.id
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {

            let s4 = dbScript(db_sql['Q46'], { var1: checkPermission.rows[0].company_id, var2: companyName })
            let customerList = await connection.query(s4)

            if (customerList.rows.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Customer company list',
                    data: customerList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty customer company list',
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

module.exports.customerContactDetails = async (req, res) => {
    try {
        let { customerCompanyId } = req.query
        let userId = req.user.id
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let customerContactDetails = {};

            let s4 = dbScript(db_sql['Q74'], { var1: customerCompanyId })
            let businessDetails = await connection.query(s4)

            let s5 = dbScript(db_sql['Q75'], { var1: customerCompanyId })
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
            let s2 = dbScript(db_sql['Q259'],{var1 : customerId })
            let checkCustomerInSales = await connection.query(s2)
            if(checkCustomerInSales.rowCount == 0){
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

module.exports.addBusinessContact = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            companyId,
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
            let s6 = dbScript(db_sql['Q70'], { var1: businessId, var2: mysql_real_escape_string(businessContactName), var3: businessEmail, var4: businessPhoneNumber, var5: companyId })
            let addBusinessContact = await connection.query(s6)

            if (addBusinessContact.rowCount > 0) {

                let s4 = dbScript(db_sql['Q55'], { var1: customerId })
                let customerData = await connection.query(s4)
    
                let businessIds = JSON.parse(customerData.rows[0].business_contact_id)
                businessIds.push(addBusinessContact.rows[0].id)
    
                let s5 = dbScript(db_sql['Q79'], { var1: customerId, var2: JSON.stringify(businessIds) })
                let updateCustomer = await connection.query(s5)

                if(updateCustomer.rowCount > 0){
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: "Business contact added successfully"
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
            companyId,
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
            let s6 = dbScript(db_sql['Q71'], { var1: revenueId, var2: mysql_real_escape_string(revenueContactName), var3: revenueEmail, var4: revenuePhoneNumber, var5: companyId })
            let addRevenueContact = await connection.query(s6)

            if (addRevenueContact.rowCount > 0 ) {

                let s4 = dbScript(db_sql['Q55'], { var1: customerId })
                let customerData = await connection.query(s4)
                
                let revenueIds = JSON.parse(customerData.rows[0].revenue_contact_id)
                revenueIds.push(addRevenueContact.rows[0].id)
    
                let s5 = dbScript(db_sql['Q80'], { var1: customerId, var2: JSON.stringify(revenueIds) })
                let updateCustomer = await connection.query(s5)
                if(updateCustomer.rowCount > 0){
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: "Revenue contact added successfully"
                    })
                }else{
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    }) 
                }
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
