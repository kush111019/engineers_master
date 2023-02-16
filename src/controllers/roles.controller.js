const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string ,getUserAndSubUser} = require('../utils/helper')
const moduleName = process.env.ROLES_MODULE


//---------------------------------------Modules----------------------------------------------

module.exports.moduleList = async (req, res) => {
    try {
        let s3 = dbScript(db_sql['Q6'], {})
        let moduleList = await connection.query(s3)
        if (moduleList.rows.length > 0) {
            res.json({
                status: 200,
                success: true,
                message: "Module list",
                data: moduleList.rows
            })
        } else {
            res.json({
                status: 200,
                success: false,
                message: "Empty module list",
                data: []
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

//-------------------------------------Roles-------------------------------------------------
module.exports.rolesList = async (req, res) => {
    try {
        let userId = req.user.id

        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)

        if (checkPermission.rows[0].permission_to_view_global) {
            let list = []
            let s3 = dbScript(db_sql['Q14'], { var1: checkPermission.rows[0].company_id })
            let rolesList = await connection.query(s3)
            console.log(s3)
            for (let data of rolesList.rows) {
                let modulePermissions = []

                if (data.reporter != '') {
                    for (let moduleId of JSON.parse(data.module_ids)) {
                        let s5 = dbScript(db_sql['Q35'], { var1: moduleId, var2: data.id })
                        let permissionList = await connection.query(s5)
                        for (let permissionData of permissionList.rows) {
                            modulePermissions.push({
                                moduleId: moduleId,
                                permissionToCreate: permissionData.permission_to_create,
                                permissionToUpdate: permissionData.permission_to_update,
                                permissionToViewGlobal: permissionData.permission_to_view_global,
                                permissionToViewOwn: permissionData.permission_to_view_own,
                                permissionToDelete: permissionData.permission_to_delete
                            })
                        }
                    }
                    let s6 = dbScript(db_sql['Q12'], { var1: data.reporter })
                    let reporterRole = await connection.query(s6)
                    list.push({
                        roleId: data.id,
                        roleName: data.role_name,
                        reporterId: reporterRole.rows[0].id,
                        reporterRole: reporterRole.rows[0].role_name,
                        modulePermissions: modulePermissions,
                        isUserAssigned: (data.assigned_user_id) ? true : false
                    })
                   
                } else {
                    for (let moduleId of JSON.parse(data.module_ids)) {
                        let s7 = dbScript(db_sql['Q35'], { var1: moduleId, var2: data.id })
                        let permissionList = await connection.query(s7)

                        for (let permissionData of permissionList.rows) {
                            modulePermissions.push({
                                moduleId: moduleId,
                                permissionToCreate: permissionData.permission_to_create,
                                permissionToUpdate: permissionData.permission_to_update,
                                permissionToViewGlobal: permissionData.permission_to_view_global,
                                permissionToViewOwn: permissionData.permission_to_view_own,
                                permissionToDelete: permissionData.permission_to_delete
                            })
                        }
                    }
                    list.push({
                        roleId: data.id,
                        roleName: data.role_name,
                        reporterId: "",
                        reporterRole: "",
                        modulePermissions: modulePermissions,
                        isUserAssigned: (data.assigned_user_id) ? true : false
                    })
                }
            }
            if (list.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Role list",
                    data: list
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty role list",
                    data: []
                })
            }

        }
        else if (checkPermission.rows[0].permission_to_view_own) {
            let list = []
            let roleIds = []
            roleIds.push(checkPermission.rows[0].role_id)
            let getRoles = async (id) => {
                let s7 = dbScript(db_sql['Q16'], { var1: id })
                let getChild = await connection.query(s7);
                if (getChild.rowCount > 0) {
                    for (let item of getChild.rows) {
                        if (roleIds.includes(item.id) == false) {
                            roleIds.push(item.id)
                            await getRoles(item.id)
                        }
                    }
                }
            }
            await getRoles(checkPermission.rows[0].role_id)
            for (let roleId of roleIds) {
                let s3 = dbScript(db_sql['Q12'], { var1: roleId,var2: checkPermission.rows[0].company_id  })
                console.log(s3)
                let rolesList = await connection.query(s3)
                for (let data of rolesList.rows) {
                    let modulePermissions = []

                    if (data.reporter != '') {
                        for (let moduleId of JSON.parse(data.module_ids)) {
                            let s5 = dbScript(db_sql['Q35'], { var1: moduleId, var2: data.id })
                            let permissionList = await connection.query(s5)

                            for (let permissionData of permissionList.rows) {
                                modulePermissions.push({
                                    moduleId: moduleId,
                                    permissionToCreate: permissionData.permission_to_create,
                                    permissionToUpdate: permissionData.permission_to_update,
                                    permissionToViewGlobal: permissionData.permission_to_view_global,
                                    permissionToViewOwn: permissionData.permission_to_view_own,
                                    permissionToDelete: permissionData.permission_to_delete
                                })
                            }
                        }
                        let s6 = dbScript(db_sql['Q12'], { var1: data.reporter })
                        let reporterRole = await connection.query(s6)

                        list.push({
                            roleId: data.id,
                            roleName: data.role_name,
                            reporterId: reporterRole.rows[0].id,
                            reporterRole: reporterRole.rows[0].role_name,
                            modulePermissions: modulePermissions,
                            isUserAssigned: (data.assigned_user_id) ? true : false
                        })
                    } else {
                        for (let moduleId of JSON.parse(data.module_ids)) {
                            let s7 = dbScript(db_sql['Q35'], { var1: moduleId, var2: data.id })
                            let permissionList = await connection.query(s7)

                            for (let permissionData of permissionList.rows) {
                                modulePermissions.push({
                                    moduleId: moduleId,
                                    permissionToCreate: permissionData.permission_to_create,
                                    permissionToUpdate: permissionData.permission_to_update,
                                    permissionToViewGlobal: permissionData.permission_to_view_global,
                                    permissionToViewOwn: permissionData.permission_to_view_own,
                                    permissionToDelete: permissionData.permission_to_delete
                                })
                            }
                        }
                        list.push({
                            roleId: data.id,
                            roleName: data.role_name,
                            reporterId: "",
                            reporterRole: "",
                            modulePermissions: modulePermissions,
                            isUserAssigned: (data.assigned_user_id ) ? true : false
                        })
                    }
                }
            }

            if (list.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Role list",
                    data: list
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty role list",
                    data: []
                })
            }
        }
        else {
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

module.exports.createRole = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            roleName,
            reporter,
            modulePermissions
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_create) {
            await connection.query('BEGIN')
            let roleId = uuid.v4()

            let s4 = dbScript(db_sql['Q13'], { var1: roleId, var2: mysql_real_escape_string(roleName), var3: reporter, var4: checkPermission.rows[0].company_id, var5: userId })
            createRole = await connection.query(s4)

            let addPermission;
            let moduleIds = []

            for (let moduleData of modulePermissions) {

                moduleIds.push(moduleData.moduleId)

                let permissionId = uuid.v4()
                let s5 = dbScript(db_sql['Q20'], { var1: permissionId, var2: createRole.rows[0].id, var3: moduleData.moduleId, var4: moduleData.permissionToCreate, var5: moduleData.permissionToUpdate, var6: moduleData.permissionToDelete, var7: moduleData.permissionToViewGlobal, var8: moduleData.permissionToViewOwn, var9: checkPermission.rows[0].id })
                addPermission = await connection.query(s5)
            }

            let _dt = new Date().toISOString();
            let s6 = dbScript(db_sql['Q34'], { var1: JSON.stringify(moduleIds), var2: _dt, var3: createRole.rows[0].id })
            updateRole = await connection.query(s6)

            if (createRole.rowCount > 0 && addPermission.rowCount > 0 && updateRole.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "Role created successfully",
                    data: {
                        roleId: createRole.rows[0].id
                    }
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

module.exports.updateRole = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            roleId,
            roleName,
            reporter,
            modulePermissions
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_update) {

            await connection.query('BEGIN')
            let _dt = new Date().toISOString();
            let s4 = dbScript(db_sql['Q25'], { var1: mysql_real_escape_string(roleName), var2: reporter, var3: roleId, var4: _dt, var5: checkPermission.rows[0].company_id })

            let updateRole = await connection.query(s4)

            for (let moduleData of modulePermissions) {
                let s5 = dbScript(db_sql['Q26'], { var1: moduleData.permissionToCreate, var2: moduleData.permissionToViewGlobal, var3: moduleData.permissionToUpdate, var4: moduleData.permissionToDelete, var5: roleId, var6: _dt, var7: moduleData.moduleId, var8: moduleData.permissionToViewOwn })
                updatePermission = await connection.query(s5)
            }

            await connection.query('COMMIT')

            if (updateRole.rowCount > 0 && updatePermission.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Role updated successfully"
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

module.exports.deleteRole = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            roleId,
            status
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_delete) {
            let _dt = new Date().toISOString();
            if (status.toLowerCase() == "child") {
                let roleIds = []
                let getRoles = async (id) => {
                    let s7 = dbScript(db_sql['Q16'], { var1: id })
                    let getChild = await connection.query(s7);
                    if (getChild.rowCount > 0) {
                        for (let item of getChild.rows) {
                            if (roleIds.includes(item.id) == false) {
                                roleIds.push(item.id)
                                await getRoles(item.id)
                            }
                        }
                    }
                }
                await getRoles(roleId)
                if (roleIds.length > 0) {
                    for (let id of roleIds) {
                        await connection.query('BEGIN')
                        let s5 = dbScript(db_sql['Q27'], { var1: id, var2: _dt })
                        updateRole = await connection.query(s5)

                        let s6 = dbScript(db_sql['Q28'], { var1: id, var2: _dt })
                        updatePermission = await connection.query(s6)
                    }
                    if (updatePermission.rowCount > 0 && updateRole.rowCount > 0) {
                        await connection.query('COMMIT')
                        res.json({
                            status: 200,
                            success: true,
                            message: "Role deleted successfully"
                        })
                    } else {
                        await connection.query('ROLLBACK')
                        res.json({
                            status: 200,
                            success: false,
                            message: "Something went wrong"
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "No child available for given role"
                    })
                }
            } else if (status.toLowerCase() == "all") {
                let roleIds = []
                roleIds.push(roleId)
                let getRoles = async (id) => {
                    if (roleIds.includes(id) == false) {
                        roleIds.push(id)
                    }
                    let s7 = dbScript(db_sql['Q16'], { var1: id })
                    let getChild = await connection.query(s7);
                    if (getChild.rowCount > 0) {
                        for (let item of getChild.rows) {
                            if (roleIds.includes(item.id) == false) {
                                roleIds.push(item.id)
                                await getRoles(item.id)
                            }
                        }
                    }
                }
                await getRoles(roleId)
                if (roleIds.length > 0) {
                    for (let id of roleIds) {
                        await connection.query('BEGIN')
                        let s5 = dbScript(db_sql['Q27'], { var1: id, var2: _dt })
                        updateRole = await connection.query(s5)

                        let s6 = dbScript(db_sql['Q28'], { var1: id, var2: _dt })
                        updatePermission = await connection.query(s6)
                    }
                    if (updatePermission.rowCount > 0 && updateRole.rowCount > 0) {
                        await connection.query('COMMIT')
                        res.json({
                            status: 200,
                            success: true,
                            message: "Role deleted successfully"
                        })
                    } else {
                        await connection.query('ROLLBACK')
                        res.json({
                            status: 200,
                            success: false,
                            message: "Something went wrong"
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Role not found"
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

module.exports.moveRole = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            roleId,
            reporter
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_update) {

            let s4 = dbScript(db_sql['Q12'], { var1: roleId })
            let findRole = await connection.query(s4)

            if (findRole.rowCount > 0) {
                let _dt = new Date().toISOString();

                await connection.query('BEGIN')
                let s5 = dbScript(db_sql['Q25'], {
                    var1: findRole.rows[0].role_name, var2: reporter,
                    var3: roleId, var4: _dt, var5: checkPermission.rows[0].company_id
                })
                let moveRole = await connection.query(s5)
                if (moveRole.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Role moved successfully"
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
                res.json({
                    status: 400,
                    success: false,
                    message: "Role not found"
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
