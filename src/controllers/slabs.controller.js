const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");


module.exports.createSlab = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            slabs
        } = req.body
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Slab Configuration'
        if (findAdmin.rows.length > 0) {
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q19'], { var1: findAdmin.rows[0].company_id, var2: _dt })
                let slabList = await connection.query(s4)

                for (data of slabs) {
                    id = uuid.v4()
                    let s5 = dbScript(db_sql['Q18'], { var1: id, var2: data.minAmount, var3: data.maxAmount, var4: data.percentage, var5: data.isMax, var6: findAdmin.rows[0].company_id, var7 : data.currency })
                    var createSlab = await connection.query(s5)

                    await connection.query('COMMIT')
                }

                if (createSlab.rowCount > 0) {
                    res.json({
                        status: 201,
                        success: true,
                        message: "Slab added successfully"
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

module.exports.slabList = async (req, res) => {
    try {
        let userId = req.user.id
        let id = uuid.v4()
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Slab Configuration'
        if (findAdmin.rows.length > 0) {
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q17'], { var1: findAdmin.rows[0].company_id })
                let slabList = await connection.query(s4)
                if (slabList.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Slab list",
                        data: slabList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty Slab list",
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

module.exports.deleteSlab = async (req, res) => {
    try {
        let userId = req.user.id
        let { slabId } = req.body
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Slab Configuration'
        if (findAdmin.rows.length > 0) {
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {
                await connection.query('BEGIN')

                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q29'], { var1: _dt, var2: slabId, var3: findAdmin.rows[0].company_id })
                var deleteSlab = await connection.query(s4)

                await connection.query('COMMIT')

                if (deleteSlab.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Slab deleted Successfully"
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
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}