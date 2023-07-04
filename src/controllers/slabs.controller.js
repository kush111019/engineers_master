const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid")
const moduleName = process.env.SLABS_MODULE
const { getUserAndSubUser, mysql_real_escape_string } = require('../utils/helper')

module.exports.createSlab = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            slabsData
        } = req.body
        await connection.query('BEGIN')
        //here check user all permission's
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_create) {
            
            let slabId = uuid.v4()
            //insert slab entries into db here
            for (let data of slabsData.slabs) {
                //id = uuid.v4()
                let s5 = dbScript(db_sql['Q18'], { var1: data.minAmount, var2: data.maxAmount, var3: data.percentage, var4: data.isMax, var5: checkPermission.rows[0].company_id, var6: data.currency, var7: Number(data.slab_ctr), var8: userId, var9: slabId, var10: mysql_real_escape_string(slabsData.slabName), var11: slabsData.commissionSplitId ? slabsData.commissionSplitId : 'null' })
                let createSlab = await connection.query(s5)  
            }

            let _dt = new Date().toISOString();
            let s7 = dbScript(db_sql['Q282'], { var1:_dt, var2: checkPermission.rows[0].company_id })
            updateStatusInCompany = await connection.query(s7)
            if ( updateStatusInCompany.rowCount > 0) {
                await connection.query('COMMIT')
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

module.exports.updateSlab = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            slabsData
        } = req.body
        await connection.query('BEGIN')
        //here check user all permission's
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {
            //here we update slab deatails 
            for (let data of slabsData.slabs) {
                let _dt = new Date().toISOString()
                if (data.id != '') {
                    let s2 = dbScript(db_sql['Q19'], { var1: mysql_real_escape_string(slabsData.slabName), var2: data.minAmount, var3: data.maxAmount, var4: data.percentage, var5: data.isMax, var6: checkPermission.rows[0].company_id, var7: data.currency, var8: Number(data.slab_ctr), var9: userId, var10: data.id, var11: slabsData.slabId, var12: _dt, var13: slabsData.commissionSplitId ?slabsData.commissionSplitId:'null' })
                    var updateSlab = await connection.query(s2)
                } else {
                    let s5 = dbScript(db_sql['Q18'], { var1: data.minAmount, var2: data.maxAmount, var3: data.percentage, var4: data.isMax, var5: checkPermission.rows[0].company_id, var6: data.currency, var7: Number(data.slab_ctr), var8: userId, var9: slabsData.slabId, var10: slabsData.slabName, var11: slabsData.commissionSplitId ? slabsData.commissionSplitId:'null' })
                    var createSlab = await connection.query(s5)
                }
            }
            if (updateSlab.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Slab updated successfully"
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
        let userId = req.user.id;
        //here check user all permission's
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            //get slab list here 
            let s4 = dbScript(db_sql['Q17'], { var1: checkPermission.rows[0].company_id })
            let slabList = await connection.query(s4)
            if (slabList.rowCount > 0) {
                const unique = [...new Map(slabList.rows.map(item => [item['slab_id'], item])).values()]
                if (unique.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Slab list",
                        data: unique
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
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Slab list",
                    data: []
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            //get roles user list 
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let s4 = dbScript(db_sql['Q148'], { var1: roleUsers.join(",") })
            let findSlabs = await connection.query(s4)
            if (findSlabs.rowCount > 0) {
                const unique = [...new Map(findSlabs.rows.map(item => [item['slab_id'], item])).values()]
                if(unique.length > 0){
                    res.json({
                        status: 200,
                        success: true,
                        message: "Slab list",
                        data: unique
                    })
                }else{
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty Slab list",
                        data: []
                    })
                }
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

        await connection.query('BEGIN')

        //here check user all permission's
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_delete) {

            let s2 = dbScript(db_sql['Q288'],{ var1 : slabId })
            let checkslabInSales = await connection.query(s2)

            if(checkslabInSales.rowCount > 0){
                await connection.query('ROLLBACK')
                return res.json({
                    status: 200,
                    success: false,
                    message: "Can not delete this slab, because it is used in sales"
                })
            }

            let _dt = new Date().toISOString();
            //update slab status to deleted
            let s4 = dbScript(db_sql['Q160'], { var1: _dt, var2: slabId, var3: checkPermission.rows[0].company_id })
            var deleteSlab = await connection.query(s4)

            if (deleteSlab.rowCount > 0) {
                await connection.query('COMMIT')
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

module.exports.deleteSlabLayer = async (req, res) => {
    try {
        let userId = req.user.id
        let { slabLayerId } = req.body

        await connection.query('BEGIN')

        //here check user all permission's
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_delete) {
           
            let s2 = dbScript(db_sql['Q289'],{ var1 : slabLayerId })
            let checkSlabsInSales = await connection.query(s2)

            if(checkSlabsInSales.rowCount > 0){
                return res.json({
                    status: 200,
                    success: false,
                    message: "Can not delete this slab layer, because it is used in sales"
                })
            }

            let _dt = new Date().toISOString();
            // here update slab layer to deleted
            let s3 = dbScript(db_sql['Q29'], { var1: _dt, var2: slabLayerId, var3: checkPermission.rows[0].company_id })
            let deleteSlab = await connection.query(s3)

            if (deleteSlab.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Slab layer deleted Successfully"
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