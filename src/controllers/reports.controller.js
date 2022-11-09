const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');


let paginatedResults = (model, page) => {
    const limit = 10;

    // calculating the starting and ending index
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    if (endIndex < model.length) {
        results.next = {
            page: page + 1,
            limit: limit
        };
    }

    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit
        };
    }

    data = model.slice(startIndex, endIndex);
    return data
}

module.exports.revenuePerCustomer = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {page} = req.query
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Reports'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let revenuePerCustomer = []
                let s4 = dbScript(db_sql['Q95'], { var1: findAdmin.rows[0].company_id })
                let customerCompanies = await connection.query(s4)
                if (customerCompanies.rowCount > 0) {
                    for (company of customerCompanies.rows) {
                        let s5 = dbScript(db_sql['Q96'], { var1: company.id })
                        let customers = await connection.query(s5)
                        if (customers.rows.length > 0) {
                            let revenue = 0
                            let obj = {}
                            for (data of customers.rows) {
                                let s6 = dbScript(db_sql['Q97'], { var1: data.id })
                                let amount = await connection.query(s6)
                                if (amount.rowCount > 0) {
                                    revenue = revenue + Number(amount.rows[0].target_amount)
                                }
                            }
                            obj.customerId = company.id
                            obj.customerName = company.customer_company_name
                            obj.revenue = revenue
                            revenuePerCustomer.push(obj)
                        }
                    }
                    if (revenuePerCustomer.length > 0) {
                        let result = await paginatedResults(revenuePerCustomer,page)
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
                        message: "No customers available, hence no revenues"
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
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.revenuePerProduct = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {page} = req.query
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Reports'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let s4 = dbScript(db_sql['Q93'], { var1: findAdmin.rows[0].company_id })
                let customers = await connection.query(s4)
                if (customers.rowCount > 0) {
                    let revenuePerProduct = []
                    for (data of customers.rows) {
                        if (data.closed_at != null) {
                            let products = JSON.parse(data.products)
                            for (let productIds of products) {
                                let s10 = dbScript(db_sql['Q104'], { var1: productIds, var2: findAdmin.rows[0].company_id })
                                let product = await connection.query(s10)
                                if(product.rowCount > 0){
                                    revenuePerProduct.push({
                                        productName: product.rows[0].product_name,
                                        revenue: data.target_amount
                                    })
                                }
                            }
                        }
                    }
                    if (revenuePerProduct.length > 0) {
                        let result = await paginatedResults(revenuePerProduct,page)
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
                        message: "No customers available"
                    })
                }
            } else {
                res.status(403).json({
                    success: false,
                    message: "Unauthorised"
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

module.exports.revenuePerSalesRep = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {page} = req.query
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Reports'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let salesRepArr = []
                let s4 = dbScript(db_sql['Q98'], { var1: findAdmin.rows[0].company_id })
                let salesData = await connection.query(s4)
                if (salesData.rowCount > 0) {
                    let holder = {};
                    let newArr = []
                    for (let sales of salesData.rows) {
                        let s5 = dbScript(db_sql['Q92'], { var1: sales.id })
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
                        let result = await paginatedResults(newArr,page)
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
                        message: "No Sales data available"
                    })
                }

            } else {
                res.status(403).json({
                    success: false,
                    message: "Unauthorised"
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

module.exports.totalRevenue = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { status } = req.query
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Reports'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                totalRevenue = [];
                let format = (status == 'Monthly') ? 'month' : (status == 'Quarterly') ? 'quarter' : 'year'
                let s4 = dbScript(db_sql['Q94'], { var1: findAdmin.rows[0].company_id, var2: format })
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
                    if(targetData.rows.length == 0){
                        res.json({
                            status: 200,
                            success: true,
                            message: "Empty Total revenue",
                            data: totalRevenue
                        })
                    }else{
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