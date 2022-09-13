const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");



module.exports.commissionSplit = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            closerPercentage,
            supporterPercentage
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Commission'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')

                let id = uuid.v4()
                let s4 = dbScript(db_sql['Q53'], { var1: id, var2: closerPercentage, var3: supporterPercentage, var4: findAdmin.rows[0].company_id })
                var createSlab = await connection.query(s4)

                await connection.query('COMMIT')

                if (createSlab.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "Commission created successfully"
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

module.exports.updatecommissionSplit = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            commissionId,
            closerPercentage,
            supporterPercentage
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Commission'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q54'], { var1: closerPercentage, var2: supporterPercentage, var3: commissionId, var4: _dt, var5: findAdmin.rows[0].company_id })

                var updatecommission = await connection.query(s4)

                await connection.query('COMMIT')

                if (updatecommission.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Commission updated Successfully"
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

module.exports.commissionSplitList = async (req, res) => {
    try {
        let userEmail = req.user.email
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Commission'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q55'], { var1: findAdmin.rows[0].company_id })
                let commissionList = await connection.query(s4)


                if (commissionList.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Commission split list",
                        data: commissionList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty commission split list",
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

module.exports.deletecommissionSplit = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            commissionId
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Commission'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q56'], { var1: _dt, var2: commissionId, var3: findAdmin.rows[0].company_id })
                var deleteSlab = await connection.query(s4)
                await connection.query('COMMIT')

                if (deleteSlab.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Commission deleted Successfully"
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