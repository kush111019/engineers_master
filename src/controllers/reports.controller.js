const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const { reduceArray, paginatedResults, paginatedResults1, reduceArrayWithName, reduceArrayWithCustomer, reduceArrayWithProduct, getUserAndSubUser } = require('../utils/helper')
const moduleName = process.env.REPORTS_MODULE

module.exports.revenuePerCustomer = async (req, res) => {
    try {
        let userId = req.user.id
        let { page, orderBy, startDate, endDate } = req.query
        startDate = new Date(startDate)
        startDate.setHours(0, 0, 0, 0)
        let sDate = new Date(startDate).toISOString()
        endDate = new Date(endDate)
        endDate.setHours(23, 59, 59, 999)
        let eDate = new Date(endDate).toISOString()
        let limit = 10;
        let offset = (page - 1) * limit
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global) {
            if ((startDate != undefined || startDate != '') && (endDate != undefined || endDate != '')) {
                let s2 = dbScript(db_sql['Q79'], { var1: checkPermission.rows[0].company_id, var2: orderBy, var3: sDate, var4: eDate })
                let customerCompanies = await connection.query(s2)
                if (customerCompanies.rowCount > 0) {
                    let revenuePerCustomerArr = []
                    for (let data of customerCompanies.rows) {
                        let s5 = dbScript(db_sql['Q256'], { var1: data.sales_commission_id })
                        let recognizedRevenueData = await connection.query(s5)
                        if (recognizedRevenueData.rowCount > 0) {
                            revenuePerCustomerArr.push({
                                customer_name: data.customer_name,
                                revenue: recognizedRevenueData.rows[0].amount ? recognizedRevenueData.rows[0].amount : 0
                            })
                        }
                    }
                    if (revenuePerCustomerArr.length > 0) {
                        let returnData = await reduceArrayWithCustomer(revenuePerCustomerArr)
                        if (returnData.length > 0) {
                            let paginatedArr = await paginatedResults(returnData, page)
                            if (orderBy.toLowerCase() == 'asc') {
                                paginatedArr = paginatedArr.sort((a, b) => {
                                    return a.revenue - b.revenue
                                })
                            } else {
                                paginatedArr = paginatedArr.sort((a, b) => {
                                    return b.revenue - a.revenue
                                })
                            }
                            res.json({
                                status: 200,
                                success: true,
                                message: "Revenue per customer",
                                data: paginatedArr
                            })
                        }
                    } else {
                        res.json({
                            status: 200,
                            success: false,
                            message: "Empty revenue per customer",
                            data: []
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty revenue per customer",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date required",
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let revenuePerCustomerArr = []
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            if ((startDate != undefined || startDate != '') && (endDate != undefined || endDate != '')) {
                let s2 = dbScript(db_sql['Q150'], { var1: roleUsers.join(","), var2: orderBy, var3: sDate, var4: eDate })
                let customerCompanies = await connection.query(s2)
                if (customerCompanies.rowCount > 0) {
                    for (let data of customerCompanies.rows) {
                        let s5 = dbScript(db_sql['Q256'], { var1: data.sales_commission_id })
                        let recognizedRevenueData = await connection.query(s5)
                        if (recognizedRevenueData.rowCount > 0) {
                            revenuePerCustomerArr.push({
                                customer_name: data.customer_name,
                                revenue: recognizedRevenueData.rows[0].amount ? recognizedRevenueData.rows[0].amount : 0
                            })
                        }
                    }
                    if (revenuePerCustomerArr.length > 0) {
                        let returnData = await reduceArrayWithCustomer(revenuePerCustomerArr)
                        if (returnData.length > 0) {
                            let paginatedArr = await paginatedResults(returnData, page)
                            if (orderBy.toLowerCase() == 'asc') {
                                paginatedArr = paginatedArr.sort((a, b) => {
                                    return a.revenue - b.revenue
                                })
                            } else {
                                paginatedArr = paginatedArr.sort((a, b) => {
                                    return b.revenue - a.revenue
                                })
                            }
                            res.json({
                                status: 200,
                                success: true,
                                message: "Revenue per customer",
                                data: paginatedArr
                            })
                        }
                    } else {
                        res.json({
                            status: 200,
                            success: false,
                            message: "Empty revenue per customer",
                            data: []
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty revenue per customer",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date required",
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

module.exports.revenuePerProduct = async (req, res) => {
    try {
        let userId = req.user.id
        let { page, orderBy, startDate, endDate } = req.query
        startDate = new Date(startDate)
        startDate.setHours(0, 0, 0, 0)
        let sDate = new Date(startDate).toISOString()
        endDate = new Date(endDate)
        endDate.setHours(23, 59, 59, 999)
        let eDate = new Date(endDate).toISOString()
        let limit = 10;
        let offset = (page - 1) * limit
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            if ((startDate != undefined || startDate != '') && (endDate != undefined || endDate != '')) {
                let s4 = dbScript(db_sql['Q139'], { var1: checkPermission.rows[0].company_id, var2: orderBy, var3: sDate, var4: eDate })
                let revenuePerProduct = await connection.query(s4)
                if (revenuePerProduct.rowCount > 0) {
                    let revenuePerProductArr = []
                    for (let data of revenuePerProduct.rows) {
                        let s5 = dbScript(db_sql['Q256'], { var1: data.sales_commission_id })
                        let recognizedRevenueData = await connection.query(s5)
                        if (recognizedRevenueData.rowCount > 0) {
                            revenuePerProductArr.push({
                                product_name: data.product_name,
                                revenue: recognizedRevenueData.rows[0].amount ? recognizedRevenueData.rows[0].amount : 0
                            })
                        }
                    }
                    let returnData = await reduceArrayWithProduct(revenuePerProductArr)
                    if (returnData.length > 0) {
                        let paginatedArr = await paginatedResults(returnData, page)
                        if (orderBy.toLowerCase() == 'asc') {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return a.revenue - b.revenue
                            })
                        } else {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return b.revenue - a.revenue
                            })
                        }
                        res.json({
                            status: 200,
                            success: true,
                            message: "Revenue per product",
                            data: paginatedArr
                        })
                    }
                    else {
                        res.json({
                            status: 200,
                            success: false,
                            message: "Empty revenue per product",
                            data: []
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty revenue per product",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date required",
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let revenuePerProductArr = []
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            if ((startDate != undefined || startDate != '') && (endDate != undefined || endDate != '')) {
                let s4 = dbScript(db_sql['Q151'], { var1: roleUsers.join(","), var2: orderBy, var3: sDate, var4: eDate })
                let revenuePerProduct = await connection.query(s4)
                if (revenuePerProduct.rowCount > 0) {
                    for (let product of revenuePerProduct.rows) {
                        let s5 = dbScript(db_sql['Q256'], { var1: product.sales_commission_id })
                        let recognizedRevenueData = await connection.query(s5)
                        if (recognizedRevenueData.rowCount > 0) {
                            revenuePerProductArr.push({
                                product_name: product.product_name,
                                revenue: recognizedRevenueData.rows[0].amount ? recognizedRevenueData.rows[0].amount : 0
                            })
                        }
                    }
                    if (revenuePerProductArr.length > 0) {
                        let returnData = await reduceArrayWithProduct(revenuePerProductArr)
                        if (returnData.length > 0) {
                            let paginatedArr = await paginatedResults(returnData, page)
                            if (orderBy.toLowerCase() == 'asc') {
                                paginatedArr = paginatedArr.sort((a, b) => {
                                    return a.revenue - b.revenue
                                })
                            } else {
                                paginatedArr = paginatedArr.sort((a, b) => {
                                    return b.revenue - a.revenue
                                })
                            }
                            res.json({
                                status: 200,
                                success: true,
                                message: "Revenue per product",
                                data: paginatedArr
                            })
                        }
                    } else {
                        res.json({
                            status: 200,
                            success: true,
                            message: "Empty revenue per product",
                            data: revenuePerProductArr
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty revenue per product",
                        data: revenuePerProductArr
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date required",
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "Unauthorised"
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

module.exports.revenuePerSalesRep = async (req, res) => {
    try {
        let userId = req.user.id
        let { page, orderBy, startDate, endDate, role_id, isAll, filterBy } = req.query
        startDate = new Date(startDate)
        startDate.setHours(0, 0, 0, 0)
        let sDate = new Date(startDate).toISOString()
        endDate = new Date(endDate)
        endDate.setHours(23, 59, 59, 999)
        let eDate = new Date(endDate).toISOString()
        let limit = 10;
        let offset = (page - 1) * limit
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            if ((startDate != undefined && startDate != '') && (endDate != undefined && endDate != '')) {
                let roleUsers;
                let revenueCommissionBydate = []
                if (isAll == 'true') {
                    roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
                } else {
                    let userData = [];
                    let s2 = dbScript(db_sql['Q21'], { var1: role_id, var2: checkPermission.rows[0].company_id })
                    let getUserData = await connection.query(s2);
                    if (getUserData.rowCount > 0) {
                        getUserData.rows.map(e => {
                            userData.push("'" + e.id.toString() + "'");
                        })
                    }
                    roleUsers = userData;
                }
                if(roleUsers.length == 0){
                    return res.json({
                        status: 200,
                        success: false,
                        message: "Empty Revenues and Commissions per sales captain",
                        data: []
                    })
                }
                let s4 = dbScript(db_sql['Q221'], { var1: roleUsers.join(","), var2: orderBy, var3: sDate, var4: eDate })
                let salesData = await connection.query(s4)
                if (salesData.rowCount > 0) {
                    for (let saleData of salesData.rows) {
                        let revenueCommissionByDateObj = {}
                        let s5 = dbScript(db_sql['Q256'], { var1: saleData.sales_commission_id })
                        let recognizedRevenueData = await connection.query(s5)

                        if (recognizedRevenueData.rows[0].amount) {
                            revenueCommissionByDateObj.revenue = Number(recognizedRevenueData.rows[0].amount)
                            revenueCommissionByDateObj.sales_rep = saleData.sales_rep;
                            if (saleData.sales_users) {
                                for (let user of saleData.sales_users) {
                                    if (user.user_type == process.env.CAPTAIN) {
                                        revenueCommissionByDateObj.sales_rep = user.name;
                                    }
                                }
                            }
                            let commission = saleData.revenue_commission ? Number(saleData.revenue_commission) : 0;

                            if (filterBy.toLowerCase() == 'all') {
                                revenueCommissionByDateObj.commission = Number(commission);
                                revenueCommissionBydate.push(revenueCommissionByDateObj)
                            } else if (filterBy.toLowerCase() == 'lead') {
                                if (saleData.sales_users) {
                                    for (let user of saleData.sales_users) {
                                        if (user.user_type == process.env.CAPTAIN) {
                                            revenueCommissionByDateObj.commission = ((Number(user.percentage) / 100) * Number(commission))
                                            revenueCommissionBydate.push(revenueCommissionByDateObj)
                                        }
                                    }
                                }
                            } else {
                                if (saleData.sales_users) {
                                    let commission1 = 0;
                                    for (let user of saleData.sales_users) {
                                        if (user.user_type == process.env.SUPPORT) {
                                            commission1 = commission1 + ((Number(user.percentage) / 100) * Number(commission))
                                        }
                                    }
                                    revenueCommissionByDateObj.commission = commission1
                                    revenueCommissionBydate.push(revenueCommissionByDateObj)
                                }
                            }
                        }
                    }
                }
                if (revenueCommissionBydate.length > 0) {
                    let returnData = await reduceArrayWithName(revenueCommissionBydate)
                    if (returnData.length > 0) {
                        let paginatedArr = await paginatedResults(returnData, page)
                        if (orderBy.toLowerCase() == 'asc') {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return a.revenue - b.revenue
                            })
                        } else {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return b.revenue - a.revenue
                            })
                        }
                        res.json({
                            status: 200,
                            success: true,
                            message: "Revenues and Commissions per sales captain",
                            data: paginatedArr
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty Revenues and Commissions per sales captain",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date is required",
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            if ((startDate != undefined && startDate != '') && (endDate != undefined && endDate != '')) {
                let roleUsers;
                let revenueCommissionBydate = []
                if (isAll == 'true') {
                    roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
                } else {
                    let userData = [];
                    let s2 = dbScript(db_sql['Q21'], { var1: role_id, var2: checkPermission.rows[0].company_id })
                    let getUserData = await connection.query(s2);
                    if (getUserData.rowCount > 0) {
                        getUserData.rows.map(e => {
                            userData.push("'" + e.id.toString() + "'");
                        })
                    }
                    roleUsers = userData;
                }

                if(roleUsers.length == 0){
                    return res.json({
                        status: 200,
                        success: false,
                        message: "Empty Revenues and Commissions per sales captain",
                        data: []
                    })
                }
                let s4 = dbScript(db_sql['Q221'], { var1: roleUsers.join(","), var2: orderBy, var3: sDate, var4: eDate })
                let salesData = await connection.query(s4)

                if (salesData.rowCount > 0) {
                    for (let saleData of salesData.rows) {
                        let revenueCommissionByDateObj = {}
                        let s5 = dbScript(db_sql['Q256'], { var1: saleData.sales_commission_id })
                        let recognizedRevenueData = await connection.query(s5)

                        if (recognizedRevenueData.rows[0].amount) {
                            revenueCommissionByDateObj.revenue = Number(recognizedRevenueData.rows[0].amount)
                            revenueCommissionByDateObj.sales_rep = saleData.sales_rep;
                            for (let user of saleData.sales_users) {
                                if (user.user_type == process.env.CAPTAIN) {
                                    revenueCommissionByDateObj.sales_rep = user.name;
                                }
                            }
                            let commission = saleData.revenue_commission ? Number(saleData.revenue_commission) : 0;

                            if (filterBy.toLowerCase() == 'all') {
                                revenueCommissionByDateObj.commission = Number(commission);
                                revenueCommissionBydate.push(revenueCommissionByDateObj)
                            } else if (filterBy.toLowerCase() == 'lead') {
                                for (let user of saleData.sales_users) {
                                    if (user.user_type == process.env.CAPTAIN) {
                                        revenueCommissionByDateObj.commission = ((Number(user.percentage) / 100) * Number(commission))
                                        revenueCommissionBydate.push(revenueCommissionByDateObj)
                                    }
                                }
                            } else {
                                let commission1 = 0;
                                for (let user of saleData.sales_users) {
                                    if (user.user_type == process.env.SUPPORT) {
                                        commission1 = commission1 + ((Number(user.percentage) / 100) * Number(commission))
                                    }
                                }
                                revenueCommissionByDateObj.commission = commission1
                                revenueCommissionBydate.push(revenueCommissionByDateObj)
                            }
                        }
                    }
                }
                if (revenueCommissionBydate.length > 0) {
                    let returnData = await reduceArrayWithName(revenueCommissionBydate)
                    if (returnData.length > 0) {
                        let paginatedArr = await paginatedResults(returnData, page)
                        if (orderBy.toLowerCase() == 'asc') {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return a.revenue - b.revenue
                            })
                        } else {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return b.revenue - a.revenue
                            })
                        }
                        res.json({
                            status: 200,
                            success: true,
                            message: "Revenues and Commissions per sales captain",
                            data: paginatedArr
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty Revenues and Commissions per sales captain",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date is required",
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "Unauthorised"
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

module.exports.totalRevenue = async (req, res) => {
    try {
        let userId = req.user.id
        let { status, page } = req.query
        let limit = (status == 'Monthly') ? 12 : (status == 'Quarterly') ? 4 : 10;
        let offset = (page - 1) * limit
        let format = (status == 'Monthly') ? 'month' : (status == 'Quarterly') ? 'quarter' : 'year'
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            let s4 = dbScript(db_sql['Q78'], { var1: checkPermission.rows[0].company_id, var2: format })
            let salesData = await connection.query(s4)
            if (salesData.rowCount > 0) {
                let totalRevenueArr = []
                for (let data of salesData.rows) {
                    let s5 = dbScript(db_sql['Q256'], { var1: data.sales_commission_id })
                    let recognizedRevenueData = await connection.query(s5)
                    if (recognizedRevenueData.rowCount > 0) {
                        totalRevenueArr.push({
                            date: data.date,
                            revenue: recognizedRevenueData.rows[0].amount ? recognizedRevenueData.rows[0].amount : 0
                        })
                    }
                }
                if (totalRevenueArr.length > 0) {
                    let returnData = await reduceArray(totalRevenueArr)
                    if (returnData.length > 0) {
                        let paginatedArr = await paginatedResults1(returnData, page, limit)
                        res.json({
                            status: 200,
                            success: true,
                            message: "Total revenue",
                            data: paginatedArr
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty Total revenue",
                        data: totalRevenueArr
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty Total revenue",
                    data: salesData.rows
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let s4 = dbScript(db_sql['Q152'], { var1: roleUsers.join(","), var2: format })
            let salesData = await connection.query(s4)
            if (salesData.rowCount > 0) {
                let totalRevenueArr = []
                for (let data of salesData.rows) {
                    let s5 = dbScript(db_sql['Q256'], { var1: data.sales_commission_id })
                    let recognizedRevenueData = await connection.query(s5)
                    if (recognizedRevenueData.rowCount > 0) {
                        totalRevenueArr.push({
                            date: data.date,
                            revenue: recognizedRevenueData.rows[0].amount ? recognizedRevenueData.rows[0].amount : 0
                        })
                    }
                }
                if (totalRevenueArr.length > 0) {
                    let finalArray = await reduceArray(totalRevenueArr)
                    if (finalArray.length > 0) {
                        let paginatedArr = await paginatedResults1(finalArray, page, limit)
                        res.json({
                            status: 200,
                            success: true,
                            message: "Total revenue",
                            data: paginatedArr
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty Total revenue",
                        data: totalRevenueArr
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty Total revenue",
                    data: salesData.rows
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
