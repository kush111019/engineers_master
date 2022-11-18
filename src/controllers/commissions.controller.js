const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");

module.exports.commissionSplit = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            closerPercentage,
            supporterPercentage
        } = req.body
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Commission'
        if (findAdmin.rows.length > 0) {
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')

                let id = uuid.v4()
                let s4 = dbScript(db_sql['Q48'], { var1: id, var2: closerPercentage, var3: supporterPercentage, var4: findAdmin.rows[0].company_id })
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
        let userId = req.user.id
        let {
            commissionId,
            closerPercentage,
            supporterPercentage
        } = req.body

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Commission'
        if (findAdmin.rows.length > 0) {
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q49'], { var1: closerPercentage, var2: supporterPercentage, var3: commissionId, var4: _dt, var5: findAdmin.rows[0].company_id })

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
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Commission'
        if (findAdmin.rows.length > 0) {
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q50'], { var1: findAdmin.rows[0].company_id })
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
        let userId = req.user.id
        let {
            commissionId
        } = req.body
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Commission'
        if (findAdmin.rows.length > 0) {
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q51'], { var1: _dt, var2: commissionId, var3: findAdmin.rows[0].company_id })
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