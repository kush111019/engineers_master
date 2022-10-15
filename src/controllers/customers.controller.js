const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string } = require('../utils/helper')

module.exports.createCustomer = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            companyId,
            customerName,
            source,
            businessContact,
            revenueContact,
            address
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {

                await connection.query('BEGIN')
                let compId = ''
                let s4 = dbScript(db_sql['Q42'], { var1: companyId })
                let findCustomerCom = await connection.query(s4)
                if (findCustomerCom.rowCount == 0) {
                    let comId = uuid.v4()
                    let s5 = dbScript(db_sql['Q41'], { var1: comId, var2: mysql_real_escape_string(customerName), var3: findAdmin.rows[0].company_id })
                    let addCustomerCom = await connection.query(s5)

                    if (addCustomerCom.rowCount > 0) {
                        compId = addCustomerCom.rows[0].id
                    }

                } else {

                    compId = findCustomerCom.rows[0].id
                }
                let bId = [];
                let rId = [];
                for (businessData of businessContact) {
                    if (businessData.businessId == '') {
                        let businessId = uuid.v4()
                        let s6 = dbScript(db_sql['Q76'], { var1: businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: compId })
                        let addBusinessContact = await connection.query(s6)
                        bId.push(addBusinessContact.rows[0].id)
                    } else {
                        let _dt = new Date().toISOString();
                        let s8 = dbScript(db_sql['Q78'], { var1: businessData.businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: _dt })
                        let updateBusinessContact = await connection.query(s8)
                        bId.push(updateBusinessContact.rows[0].id)
                    }
                }
                for (revenueData of revenueContact) {
                    if (revenueData.revenueId == '') {
                        let revenueId = uuid.v4()
                        let s7 = dbScript(db_sql['Q77'], { var1: revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: compId })
                        let addRevenueContact = await connection.query(s7)
                        rId.push(addRevenueContact.rows[0].id)
                    } else {
                        let _dt = new Date().toISOString();
                        let s9 = dbScript(db_sql['Q79'], { var1: revenueData.revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: _dt })
                        let updateRevenueContact = await connection.query(s9)
                        rId.push(updateRevenueContact.rows[0].id)
                    }
                }
                let id = uuid.v4()
                let s10 = dbScript(db_sql['Q40'], { var1: id, var2: findAdmin.rows[0].id, var3: compId, var4: mysql_real_escape_string(customerName), var5: mysql_real_escape_string(source), var6: findAdmin.rows[0].company_id, var7: JSON.stringify(bId), var8: JSON.stringify(rId), var9: mysql_real_escape_string(address) })
                let createCustomer = await connection.query(s10)

                await connection.query('COMMIT')
                if (createCustomer.rowCount > 0) {
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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

module.exports.closeCustomer = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            customerId
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q44'], { var1: _dt, var2: _dt, var3: customerId })
                let closeCustomer = await connection.query(s4)

                if (closeCustomer.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Customer closed successfully"
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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

        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            if (findModule.rowCount > 0) {

                let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
                let checkPermission = await connection.query(s3)
                if (checkPermission.rows[0].permission_to_view) {
                    let customerArr = []
                    let s4 = dbScript(db_sql['Q43'], { var1: findAdmin.rows[0].company_id })
                    let customerList = await connection.query(s4)

                    if (customerList.rowCount > 0) {
                        for (data of customerList.rows) {

                            let s5 = dbScript(db_sql['Q10'], { var1: data.user_id })
                            let createdBy = await connection.query(s5)

                            if (createdBy.rowCount > 0) {
                                data.createdBy = createdBy.rows[0].full_name
                            } else {
                                data.createdBy = ""
                            }

                            let s4 = dbScript(db_sql['Q60'], { var1: data.id })
                            let contactDetails = await connection.query(s4)
                            if (contactDetails.rowCount > 0) {
                                if (contactDetails.rows[0].business_id != null && contactDetails.rows[0].revenue_id != null) {

                                    let businessIds = JSON.parse(contactDetails.rows[0].business_id)
                                    let revenueIds = JSON.parse(contactDetails.rows[0].revenue_id)
                                    let businessContact = [];
                                    let revenueContact = [];
                                    for (id of businessIds) {
                                        let s5 = dbScript(db_sql['Q82'], { var1: id })
                                        let businessData = await connection.query(s5)
                                        businessContact.push(businessData.rows[0])
                                    }
                                    for (id of revenueIds) {
                                        let s5 = dbScript(db_sql['Q83'], { var1: id })
                                        let revenueData = await connection.query(s5)
                                        revenueContact.push(revenueData.rows[0])
                                    }
                                    data.businessContact = businessContact
                                    data.revenueContact = revenueContact

                                } else {
                                    data.businessContact = [];
                                    data.revenueContact = [];
                                }
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
                } else {
                    res.status(403).json({
                        success: false,
                        message: "UnAthorised"
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Module not found"
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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
        userEmail = req.user.email
        let {
            customerId,
            customerName,
            source,
            businessContact,
            revenueContact,
            address
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                await connection.query('BEGIN')
                let bId = [];
                let rId = [];
                let compId = ''
                let s4 = dbScript(db_sql['Q60'], { var1: customerId })
                let findCustomerCom = await connection.query(s4)
                if (findCustomerCom.rowCount > 0) {
                    compId = findCustomerCom.rows[0].customer_company_id

                    for (let businessData of businessContact) {
                        if (businessData.businessId == '') {
                            let businessId = uuid.v4()
                            let s6 = dbScript(db_sql['Q76'], { var1: businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: compId })
                            let addBusinessContact = await connection.query(s6)
                            bId.push(addBusinessContact.rows[0].id)
                        } else {
                            let _dt = new Date().toISOString();
                            let s8 = dbScript(db_sql['Q78'], { var1: businessData.businessId, var2: mysql_real_escape_string(businessData.businessContactName), var3: businessData.businessEmail, var4: businessData.businessPhoneNumber, var5: _dt })
                            let updateBusinessContact = await connection.query(s8)
                            bId.push(updateBusinessContact.rows[0].id)
                        }
                    }
                    for (let revenueData of revenueContact) {
                        if (revenueData.revenueId == '') {
                            let revenueId = uuid.v4()
                            let s7 = dbScript(db_sql['Q77'], { var1: revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: compId })
                            let addRevenueContact = await connection.query(s7)
                            rId.push(addRevenueContact.rows[0].id)
                        } else {
                            let _dt = new Date().toISOString();
                            let s9 = dbScript(db_sql['Q79'], { var1: revenueData.revenueId, var2: mysql_real_escape_string(revenueData.revenueContactName), var3: revenueData.revenueEmail, var4: revenueData.revenuePhoneNumber, var5: _dt })
                            let updateRevenueContact = await connection.query(s9)
                            rId.push(updateRevenueContact.rows[0].id)
                        }
                    }
                }

                let _dt = new Date().toISOString();
                let s5 = dbScript(db_sql['Q46'], { var1: mysql_real_escape_string(customerName), var2: mysql_real_escape_string(source), var3: _dt, var6: customerId, var4: JSON.stringify(bId), var5: JSON.stringify(rId), var7: mysql_real_escape_string(address), var8: findAdmin.rows[0].company_id })
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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

        userEmail = req.user.email
        let {
            type,
            id,
            customerId
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {

                let s4 = dbScript(db_sql['Q60'], { var1: customerId })
                let customerData = await connection.query(s4)

                if (customerData.rowCount > 0) {
                    let updateCustomer
                    await connection.query('BEGIN')
                    if (type == 'business') {
                        let businessIds = JSON.parse(customerData.rows[0].business_id)
                        let index = businessIds.indexOf(id);
                        businessIds.splice(index, 1)

                        let s5 = dbScript(db_sql['Q85'], { var1: customerId, var2: JSON.stringify(businessIds) })
                        updateCustomer = await connection.query(s5)
                    }
                    else if (type == 'revenue') {
                        let revenueIds = JSON.parse(customerData.rows[0].revenue_id)
                        let index = revenueIds.indexOf(id);
                        revenueIds.splice(index, 1)

                        let s6 = dbScript(db_sql['Q86'], { var1: customerId, var2: JSON.stringify(revenueIds) })
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q51'], { var1: findAdmin.rows[0].company_id, var2: companyName })
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let customerContactDetails = {};

                let s4 = dbScript(db_sql['Q80'], { var1: customerCompanyId })
                let businessDetails = await connection.query(s4)

                let s5 = dbScript(db_sql['Q81'], { var1: customerCompanyId })
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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
        userEmail = req.user.email
        let {
            customerId
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {

                await connection.query('BEGIN')

                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q52'], { var1: _dt, var2: customerId, var3: findAdmin.rows[0].company_id })
                let deleteCustomer = await connection.query(s4)

                await connection.query('COMMIT')

                if (deleteCustomer.rowCount > 0) {
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
                res.status(403).json({
                    success: false,
                    message: "Unathorised"
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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
        let userEmail = req.user.email
        let {
            companyId,
            businessEmail,
            businessContactName,
            businessPhoneNumber
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')

                let businessId = uuid.v4()
                let s6 = dbScript(db_sql['Q76'], { var1: businessId, var2: mysql_real_escape_string(businessContactName), var3: businessEmail, var4: businessPhoneNumber, var5: companyId })
                let addBusinessContact = await connection.query(s6)

                await connection.query('COMMIT')
                if (addBusinessContact.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "Business contact added successfully"
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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
        let userEmail = req.user.email
        let {
            companyId,
            revenueEmail,
            revenueContactName,
            revenuePhoneNumber
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Customer management'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')

                let revenueId = uuid.v4()
                let s6 = dbScript(db_sql['Q77'], { var1: revenueId, var2: mysql_real_escape_string(revenueContactName), var3: revenueEmail, var4: revenuePhoneNumber, var5: companyId })
                let addRevenueContact = await connection.query(s6)

                await connection.query('COMMIT')
                if (addRevenueContact.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "Revenue contact added successfully"
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
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Admin not found"
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
