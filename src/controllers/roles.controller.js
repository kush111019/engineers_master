const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string } = require('../utils/helper')


//---------------------------------------Modules----------------------------------------------

module.exports.moduleList = async (req, res) => {
    try {
        userEmail = req.user.email

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0) {

            let s3 = dbScript(db_sql['Q7'], {})
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

//-------------------------------------Roles-------------------------------------------------
module.exports.rolesList = async (req, res) => {
    try {
        userEmail = req.user.email

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            let list = []
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)

            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q16'], { var1: findAdmin.rows[0].company_id })
                let rolesList = await connection.query(s4)
                for (let data of rolesList.rows) {
                    let modulePermissions = []

                    let s8 = dbScript(db_sql['Q24'], { var1: data.id, var2: findAdmin.rows[0].company_id })
                    let getUser = await connection.query(s8)

                    if (data.reporter != '') {
                        for (let moduleId of JSON.parse(data.module_ids)) {
                            let s5 = dbScript(db_sql['Q39'], { var1: data.id, var2: moduleId })
                            let permissionList = await connection.query(s5)

                            for (permissionData of permissionList.rows) {
                                modulePermissions.push({
                                    moduleId: moduleId,
                                    permissionToCreate: permissionData.permission_to_create,
                                    permissionToUpdate: permissionData.permission_to_update,
                                    permissionToView: permissionData.permission_to_view,
                                    permissionToDelete: permissionData.permission_to_delete
                                })
                            }
                        }
                        let s7 = dbScript(db_sql['Q14'], { var1: data.reporter })
                        let reporterRole = await connection.query(s7)

                        list.push({
                            roleId: data.id,
                            roleName: data.role_name,
                            reporterId: (reporterRole.rowCount > 0) ? reporterRole.rows[0].id : "",
                            reporterRole: (reporterRole.rowCount > 0) ? reporterRole.rows[0].role_name : "",
                            modulePermissions: modulePermissions,
                            isUserAssigned: (getUser.rowCount > 0) ? true : false
                        })
                    } else {
                        for (moduleId of JSON.parse(data.module_ids)) {
                            let s5 = dbScript(db_sql['Q39'], { var1: data.id, var2: moduleId })
                            let permissionList = await connection.query(s5)

                            for (permissionData of permissionList.rows) {
                                modulePermissions.push({
                                    moduleId: moduleId,
                                    permissionToCreate: permissionData.permission_to_create,
                                    permissionToUpdate: permissionData.permission_to_update,
                                    permissionToView: permissionData.permission_to_view,
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
                            isUserAssigned: (getUser.rowCount > 0) ? true : false
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

module.exports.createRole = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            roleName,
            reporter,
            modulePermissions
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')
                let roleId = uuid.v4()

                let s4 = dbScript(db_sql['Q15'], { var1: roleId, var2: mysql_real_escape_string(roleName), var3: reporter, var4: findAdmin.rows[0].company_id })

                createRole = await connection.query(s4)

                let moduleIds = []
                for (let moduleData of modulePermissions) {

                    moduleIds.push(moduleData.moduleId)

                    let permissionId = uuid.v4()
                    let s5 = dbScript(db_sql['Q22'], { var1: permissionId, var2: createRole.rows[0].id, var3: moduleData.moduleId, var4: moduleData.permissionToCreate, var5: moduleData.permissionToUpdate, var6: moduleData.permissionToDelete, var7: moduleData.permissionToView, var8: findAdmin.rows[0].id })

                    addPermission = await connection.query(s5)
                }

                let _dt = new Date().toISOString();
                let s6 = dbScript(db_sql['Q38'], { var1: JSON.stringify(moduleIds), var2: _dt, var3: createRole.rows[0].id })
                updateRole = await connection.query(s6)

                await connection.query('COMMIT')

                if (createRole.rowCount > 0 && addPermission.rowCount > 0 && updateRole.rowCount > 0) {
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

module.exports.updateRole = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            roleId,
            roleName,
            reporter,
            modulePermissions
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q28'], { var1: mysql_real_escape_string(roleName), var2: reporter, var3: roleId, var4: _dt, var5: findAdmin.rows[0].company_id })

                let updateRole = await connection.query(s4)

                for (let moduleData of modulePermissions) {

                    let s5 = dbScript(db_sql['Q29'], { var1: moduleData.permissionToCreate, var2: moduleData.permissionToView, var3: moduleData.permissionToUpdate, var4: moduleData.permissionToDelete, var5: roleId, var6: _dt, var7: moduleData.moduleId })
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

module.exports.deleteRole = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            roleId,
            status
        } = req.body

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {

                let _dt = new Date().toISOString();

                await connection.query('BEGIN')

                let updateRole;
                let updatePermission;

                if (status.toLowerCase() == "child") {
                    let s4 = dbScript(db_sql['Q18'], { var1: roleId })
                    let roleData = await connection.query(s4)
                    if (roleData.rowCount > 0) {

                        for (data of roleData.rows) {

                            let s5 = dbScript(db_sql['Q30'], { var1: data.id, var2: _dt })
                            updateRole = await connection.query(s5)

                            let s6 = dbScript(db_sql['Q31'], { var1: data.id, var2: _dt })
                            updatePermission = await connection.query(s6)
                        }
                        if (updateRole.rowCount > 0 && updatePermission.rowCount > 0) {
                            await connection.query('COMMIT')
                            res.json({
                                status: 200,
                                success: true,
                                message: "Role deleted successfully"
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
                        await connection.query('ROLLBACK')
                        res.json({
                            status: 400,
                            success: false,
                            message: "No child available for given role"
                        })
                    }
                } else if (status.toLowerCase() == "all") {
                    let s7 = dbScript(db_sql['Q30'], { var1: roleId, var2: _dt })
                    updateRole = await connection.query(s7)

                    let s9 = dbScript(db_sql['Q50'], { var1: roleId, var2: _dt })
                    updateChildRole = await connection.query(s9)

                    let s10 = dbScript(db_sql['Q31'], { var1: roleId, var2: _dt })
                    updatePermission = await connection.query(s10)

                    if (updateRole.rowCount > 0 && updatePermission.rowCount > 0) {
                        await connection.query('COMMIT')
                        res.json({
                            status: 200,
                            success: true,
                            message: "Role deleted successfully"
                        })
                    } else {
                        await connection.query('ROLLBACK')
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

module.exports.userWiseRoleList = async (req, res) => {
    try {
        userEmail = req.user.email

        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q34'], { var1: findAdmin.rows[0].company_id })
                let RolesList = await connection.query(s4)

                if (RolesList.rows.length > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Role list",
                        data: RolesList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty roles list",
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

module.exports.usersListByRoleId = async (req, res) => {
    try {
        let userEmail = req.user.email
        let {
            roleId
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'users'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let s4 = dbScript(db_sql['Q24'], { var1: roleId, var2: findAdmin.rows[0].company_id })
                let userList = await connection.query(s4)
                if (userList.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Users list",
                        data: userList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty users list",
                        data: []
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

module.exports.moveRole = async (req, res) => {
    try {
        userEmail = req.user.email
        let {
            roleId,
            reporter
        } = req.body
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Role'
        if (findAdmin.rows.length > 0) {
            let s2 = dbScript(db_sql['Q45'], { var1: moduleName })
            let findModule = await connection.query(s2)
            let s3 = dbScript(db_sql['Q39'], { var1: findAdmin.rows[0].role_id, var2: findModule.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {

                let s4 = dbScript(db_sql['Q14'], { var1: roleId })
                let findRole = await connection.query(s4)

                if (findRole.rowCount > 0) {
                    let _dt = new Date().toISOString();

                    await connection.query('BEGIN')
                    let s5 = dbScript(db_sql['Q28'], {
                        var1: findRole.rows[0].role_name, var2: reporter,
                        var3: roleId, var4: _dt, var5: findAdmin.rows[0].company_id
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
