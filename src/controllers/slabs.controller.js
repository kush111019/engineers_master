const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const moduleName = process.env.SLABS_MODULE

module.exports.createSlab = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            slabsData
        } = req.body
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: userId })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')
                let slabId = uuid.v4()
                for (let data of slabsData.slabs) {
                    id = uuid.v4()
                    let s5 = dbScript(db_sql['Q18'], { var1: id, var2: data.minAmount, var3: data.maxAmount, var4: data.percentage, var5: data.isMax, var6: checkPermission.rows[0].company_id, var7: data.currency, var8: Number(data.slab_ctr), var9 : userId, var10 : slabId, var11 : slabsData.slabName, var12 : slabsData.commissionSplitId })
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

module.exports.updateSlab = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            slabsData
        } = req.body
        console.log(slabsData,"slabsData");
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_update) {
            await connection.query('BEGIN')
            for (let data of slabsData.slabs) {
                let _dt = new Date().toISOString()
                if (data.id != '') {
                    let s2 = dbScript(db_sql['Q19'], { var1: slabsData.slabName, var2: data.minAmount, var3: data.maxAmount, var4: data.percentage, var5: data.isMax, var6: checkPermission.rows[0].company_id, var7: data.currency, var8: Number(data.slab_ctr), var9: userId, var10: data.id, var11: slabsData.slabId, var12: _dt, var13 : slabsData.commissionSplitId })
                    var updateSlab = await connection.query(s2)
                }else{
                    let id = uuid.v4()
                    let s5 = dbScript(db_sql['Q18'], { var1: id, var2: data.minAmount, var3: data.maxAmount, var4: data.percentage, var5: data.isMax, var6: checkPermission.rows[0].company_id, var7: data.currency, var8: Number(data.slab_ctr), var9 : userId, var10 : slabsData.slabId, var11 : slabsData.slabName, var12 : slabsData.commissionSplitId })
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
        let userId = req.user.id
        let userIds = []
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            let s4 = dbScript(db_sql['Q17'], { var1: checkPermission.rows[0].company_id })
            let slabList = await connection.query(s4)
            if (slabList.rowCount > 0) {
                
                const transformedArray = slabList.rows.reduce((acc, curr) => {
                    let cs = []
                    if(curr.commission_split_id && curr.commission_split_id != ''){
                        let s5 = dbScript(db_sql['Q56'],{var1 : curr.commission_split_id, var2 : curr.company_id})
                        let commissionSplit = connection.query(s5)
                        cs.push(commissionSplit.rows[0])
                    }
                    const existingSlab = acc.find(s => s.slab_id === curr.slab_id);
                    if (existingSlab) {
                        existingSlab.slabs.push({
                            id: curr.id,
                            min_amount: curr.min_amount,
                            max_amount: curr.max_amount,
                            percentage: curr.percentage,
                            is_max: curr.is_max,
                            currency: curr.currency,
                            slab_ctr: curr.slab_ctr,
                            company_id: curr.company_id,
                            user_id: curr.user_id,
                            created_at: curr.created_at,
                            updated_at: curr.updated_at,
                            deleted_at: curr.deleted_at
                        });
                    } else {
                        acc.push({
                            slab_id: curr.slab_id,
                            slab_name: curr.slab_name,
                            commissionSplitId : (curr.commission_split_id && curr.commission_split_id != '') ? curr.commission_split_id : '',
                            closerPercentage : (cs.length > 0) ? cs[0].closer_percentage : '',
                            supporterPercentage : (cs.length > 0) ? cs[0].supporter_percentage : '',
                            slabs: [
                                {
                                    id: curr.id,
                                    min_amount: curr.min_amount,
                                    max_amount: curr.max_amount,
                                    percentage: curr.percentage,
                                    is_max: curr.is_max,
                                    currency: curr.currency,
                                    slab_ctr: curr.slab_ctr,
                                    company_id: curr.company_id,
                                    user_id: curr.user_id,
                                    created_at: curr.created_at,
                                    updated_at: curr.updated_at,
                                    deleted_at: curr.deleted_at
                                },
                            ],
                        });
                    }
                    return acc;
                }, []);

                if (transformedArray.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Slab list",
                        data: transformedArray
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
            userIds.push(userId)
            let slabList = []
            let s3 = dbScript(db_sql['Q163'], { var1: checkPermission.rows[0].role_id })
            let findUsers = await connection.query(s3)
            if (findUsers.rowCount > 0) {
                for (user of findUsers.rows) {
                    userIds.push(user.id)
                }
            }
            for (id of userIds) {
                let s4 = dbScript(db_sql['Q165'], { var1: id })
                let findSlabs = await connection.query(s4)
                if (findSlabs.rowCount > 0) {
                    findSlabs.rows.map(value => {
                        slabList.push(value)
                    })
                }
            }
            if (slabList.length > 0) {
                for (let item of slabList) {
                    if (item.commission_split_id) {
                        let s5 = dbScript(db_sql['Q56'],{var1 : item.commission_split_id, var2 : item.company_id})
                        let commissionSplit = await connection.query(s5);
                        closerPercent= item
                        if (commissionSplit.rows.length > 0) {
                            for (let commission of commissionSplit.rows) {
                                if (item.commission_split_id === commission.id) {
                                    item.closerPercentage = commission.closer_percentage;
                                    item.supporterPercentage = commission.supporter_percentage;
                                }
                            }
                        }
                    } else {
                        item.closerPercentage = '';
                        item.supporterPercentage = '';
                    }
                    
                }
                const transformedArray = slabList.reduce((acc, curr) => {
                    const existingSlab = acc.find(s => s.slab_id === curr.slab_id);
                    if (existingSlab) {
                        existingSlab.slabs.push({
                            id: curr.id,
                            min_amount: curr.min_amount,
                            max_amount: curr.max_amount,
                            percentage: curr.percentage,
                            is_max: curr.is_max,
                            currency: curr.currency,
                            slab_ctr: curr.slab_ctr,
                            company_id: curr.company_id,
                            user_id: curr.user_id,
                            created_at: curr.created_at,
                            updated_at: curr.updated_at,
                            deleted_at: curr.deleted_at
                        });
                    } else {
                        acc.push({
                            slab_id: curr.slab_id,
                            slab_name: curr.slab_name,
                            commissionSplitId : (curr.commission_split_id && curr.commission_split_id != '') ? curr.commission_split_id : '',
                            closerPercentage : curr.closerPercentage,
                            supporterPercentage : curr.supporterPercentage,
                            slabs: [
                                {
                                    id: curr.id,
                                    min_amount: curr.min_amount,
                                    max_amount: curr.max_amount,
                                    percentage: curr.percentage,
                                    is_max: curr.is_max,
                                    currency: curr.currency,
                                    slab_ctr: curr.slab_ctr,
                                    company_id: curr.company_id,
                                    user_id: curr.user_id,
                                    created_at: curr.created_at,
                                    updated_at: curr.updated_at,
                                    deleted_at: curr.deleted_at
                                },
                            ],
                        });
                    }
                    return acc;
                }, []);
                res.json({
                    status: 200,
                    success: true,
                    message: "Slab list",
                    data: transformedArray
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
                let s4 = dbScript(db_sql['Q183'], { var1: _dt, var2: slabId, var3: checkPermission.rows[0].company_id })
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

module.exports.deleteSlabLayer = async (req, res) => {
    try {
        let userId = req.user.id
        let { slabLayerId } = req.body
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: userId })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {
                await connection.query('BEGIN')

                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q29'], { var1: _dt, var2: slabLayerId, var3: checkPermission.rows[0].company_id })
                let deleteSlab = await connection.query(s4)

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