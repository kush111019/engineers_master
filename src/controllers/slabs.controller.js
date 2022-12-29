const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const moduleName = process.env.SLABS_MODULE

module.exports.createSlab = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            slabs
        } = req.body
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: userId })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q19'], { var1: checkPermission.rows[0].company_id, var2: _dt })
                let slabList = await connection.query(s4)

                for (let data of slabs) {
                    id = uuid.v4()
                    let s5 = dbScript(db_sql['Q18'], { var1: id, var2: data.minAmount, var3: data.maxAmount, var4: data.percentage, var5: data.isMax, var6: checkPermission.rows[0].company_id, var7: data.currency, var8: data.slab_ctr })
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
        let userIds = []
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            let s4 = dbScript(db_sql['Q17'], { var1: checkPermission.rows[0].company_id })
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
        }else if(checkPermission.rows[0].permission_to_view_own){
            userIds.push(userId)
            let slabList = []
            let s3 = dbScript(db_sql['Q163'],{var1 : checkPermission.rows[0].role_id})
            let findUsers = await connection.query(s3)
            if(findUsers.rowCount > 0){
                for(user of findUsers.rows){
                    userIds.push(user.id)
                }
            }
            for(id of userIds){
                let s4 = dbScript(db_sql['Q165'],{var1 : id})
                let findSlabs = await connection.query(s4)
                if(findSlabs.rowCount > 0){
                    findSlabs.rows.map(value => {
                        slabList.push(value)
                    })
                }
            }
            if (slabList.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Slab list",
                    data: slabList
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
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: userId })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {
                await connection.query('BEGIN')

                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q29'], { var1: _dt, var2: slabId, var3: checkPermission.rows[0].company_id })
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
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}