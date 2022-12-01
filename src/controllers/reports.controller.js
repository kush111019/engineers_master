const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const { paginatedResults, removeDuplicates } = require('../utils/helper')
const moduleName = process.env.REPORTS_MODULE

module.exports.revenuePerCustomer = async (req, res) => {
    try {
        let userId = req.user.id
        let { page } = req.query
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_view) {
            let revenuePerCustomer = []
            let s4 = dbScript(db_sql['Q89'], { var1: checkPermission.rows[0].company_id })
            let customerCompanies = await connection.query(s4)
            if (customerCompanies.rowCount > 0) {
                for (data of customerCompanies.rows) {
                    let obj = {}
                    obj.customerId = data.customer_company_id
                    obj.customerName = data.customer_company_name
                    obj.revenue = Number(data.target_amount)
                    revenuePerCustomer.push(obj)
                }
                let uniqueArray = await removeDuplicates(revenuePerCustomer, "customerId");
                if (uniqueArray.length > 0) {
                    let result = await paginatedResults(uniqueArray, page)
                    res.json({
                        status: 200,
                        success: true,
                        message: "Revenue per customer",
                        data: result
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty revenue per customer",
                        data: revenuePerCustomer
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "No customers available",
                    data: revenuePerCustomer
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
        let { page } = req.query
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view) {
            let s4 = dbScript(db_sql['Q87'], { var1: checkPermission.rows[0].company_id })
            let customers = await connection.query(s4)
            if (customers.rowCount > 0) {
                let revenuePerProduct = []
                for (data of customers.rows) {
                    if (data.closed_at != null) {
                        let products = JSON.parse(data.products)
                        for (let productIds of products) {
                            let s10 = dbScript(db_sql['Q96'], { var1: productIds, var2: checkPermission.rows[0].company_id })
                            let product = await connection.query(s10)
                            if (product.rowCount > 0) {
                                revenuePerProduct.push({
                                    productName: product.rows[0].product_name,
                                    revenue: data.target_amount
                                })
                            }
                        }
                    }
                }
                if (revenuePerProduct.length > 0) {
                    let result = await paginatedResults(revenuePerProduct, page)
                    res.json({
                        status: 200,
                        success: true,
                        message: "Revenue per product",
                        data: result
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty revenue per product",
                        data: revenuePerProduct
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty revenue per product",
                    data: []
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
        let { page } = req.query
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view) {
            let salesRepArr = []
            let s4 = dbScript(db_sql['Q90'], { var1: checkPermission.rows[0].company_id })
            let salesData = await connection.query(s4)
            if (salesData.rowCount > 0) {
                let holder = {};
                let newArr = []
                for (let sales of salesData.rows) {
                    let s5 = dbScript(db_sql['Q86'], { var1: sales.id })
                    let salesRep = await connection.query(s5)
                    if (salesRep.rows.length > 0) {
                        salesRepArr.push({
                            salesRep: salesRep.rows[0].full_name,
                            revenue: sales.target_amount
                        })
                    }
                }
                salesRepArr.forEach((d) => {
                    if (holder.hasOwnProperty(d.salesRep)) {
                        holder[d.salesRep] = holder[d.salesRep] + Number(d.revenue);
                    } else {
                        holder[d.salesRep] = Number(d.revenue);
                    }
                });
                for (let prop in holder) {
                    newArr.push({ salesRep: prop, revenue: holder[prop] });
                }
                if (newArr.length > 0) {
                    let result = await paginatedResults(newArr, page)
                    res.json({
                        status: 200,
                        success: true,
                        message: "Revenue per sales representative",
                        data: result
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty revenue per sales representative",
                        data: newArr
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "No Sales data available",
                    data: []
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
        let { status } = req.query
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view) {
            totalRevenue = [];
            let format = (status == 'Monthly') ? 'month' : (status == 'Quarterly') ? 'quarter' : 'year'
            let s4 = dbScript(db_sql['Q88'], { var1: checkPermission.rows[0].company_id, var2: format })
            let targetData = await connection.query(s4)
            if (targetData.rowCount > 0) {
                for (data of targetData.rows) {
                    totalRevenue.push({
                        revenue: data.target_amount,
                        date: data.date
                    })
                }
                if (totalRevenue.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Total revenue",
                        data: totalRevenue
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty Total revenue",
                        data: totalRevenue
                    })
                }
            } else {
                if (targetData.rows.length == 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty Total revenue",
                        data: totalRevenue
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