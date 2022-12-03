const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const moduleName = process.env.REPORTS_MODULE

module.exports.revenuePerCustomer = async (req, res) => {
    try {
        let userId = req.user.id
        let { page, orderBy } = req.query
        let limit = 10;
        let offset = (page - 1) * limit
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_view) {
            let s4 = dbScript(db_sql['Q89'], { var1: checkPermission.rows[0].company_id, var2: orderBy, var3: limit, var4: offset })
            let customerCompanies = await connection.query(s4)
            if (customerCompanies.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Revenue per customer",
                    data: customerCompanies.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty revenue per customer",
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

module.exports.revenuePerProduct = async (req, res) => {
    try {
        let userId = req.user.id
        let { page, orderBy } = req.query
        let limit = 10;
        let offset = (page - 1) * limit
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view) {
            let s4 = dbScript(db_sql['Q153'], { var1: checkPermission.rows[0].company_id, var2 : orderBy, var3 : limit, var4 : offset })
            let revenuePerProduct = await connection.query(s4)
            if (revenuePerProduct.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Revenue per product",
                    data: revenuePerProduct.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty revenue per product",
                    data: revenuePerProduct.rows
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
        let { page, orderBy } = req.query
        let limit = 10;
        let offset = (page - 1) * limit
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view) {
            let s4 = dbScript(db_sql['Q90'], { var1: checkPermission.rows[0].company_id, var2 : orderBy, var3 : limit, var4 : offset })
            let salesData = await connection.query(s4)
            if (salesData.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Revenue per sales representative",
                        data: salesData.rows
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
        let limit = 10;
        let offset = (page - 1) * limit
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view) {
            totalRevenue = [];
            let format = (status == 'Monthly') ? 'month' : (status == 'Quarterly') ? 'quarter' : 'year'
            let s4 = dbScript(db_sql['Q88'], { var1: checkPermission.rows[0].company_id, var2: format, var3: limit, var4: offset })
            let targetData = await connection.query(s4)
            if (targetData.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Total revenue",
                    data: targetData.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty Total revenue",
                    data: targetData.rows
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