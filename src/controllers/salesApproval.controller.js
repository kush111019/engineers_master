const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const { mysql_real_escape_string, getUserAndSubUser, notificationsOperations, getParentUserList } = require('../utils/helper')
const moduleName = process.env.SALES_MODULE
const customerModule = process.env.CUSTOMERS_MODULE
const userModule = process.env.USERS_MODULE


module.exports.getUpperLevelUserList = async (req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q41'], { var1: customerModule, var2: userId })
        let checkPermission = await connection.query(s1)
        let s2 = dbScript(db_sql['Q12'], { var1: checkPermission.rows[0].role_id })
        let roleData = await connection.query(s2)
        if (roleData.rows[0].reporter) {
            let parentList = await getParentUserList(roleData.rows[0], checkPermission.rows[0].company_id);
            if (parentList) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Perent user list',
                    data: parentList
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty perent user list',
                    data: []
                })
            }
        } else {
            res.json({
                status: 200,
                success: false,
                message: "You are the admin role holder you don't need to request for that "
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

module.exports.sendApprovalRequestForSales = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            sales_id,
            percentage,
            description,
            approver_user_id
        } = req.body
        //add notification deatils
        await connection.query('BEGIN')
        let notification_userId = [approver_user_id];
        let notification_typeId = sales_id;

        //here check user all permission's
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_create) {

            let s2 = dbScript(db_sql['Q347'], { var1: percentage, var2: description, var3: sales_id, var4: checkPermission.rows[0].company_id, var5: userId, var6: approver_user_id })
            let addSalesApprovalRequest = await connection.query(s2)

            let _dt = new Date().toISOString();

            let s3 = dbScript(db_sql['Q348'], { var1: _dt, var2: 'Pending', var3: sales_id })
            let updateSalesApprovalStatus = await connection.query(s3)


            if (addSalesApprovalRequest.rowCount > 0 && updateSalesApprovalStatus.rowCount > 0) {
                // add notification in notification list
                await notificationsOperations({ type: 1, msg: 1.6, notification_typeId, notification_userId }, userId);
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "Sales approval request sent successfully",
                    data: addSalesApprovalRequest.rows
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

module.exports.salesDetails = async (req, res) => {
    try {
        let userId = req.user.id;
        let salesId = req.query.id;
        let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s2)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let s3 = dbScript(db_sql['Q292'], { var1: checkPermission.rows[0].company_id, var2: salesId })
            let salesList = await connection.query(s3)
            for (let salesData of salesList.rows) {
                if (salesData.sales_users) {
                    salesData.sales_users.map(value => {
                        if (value.user_type == process.env.CAPTAIN) {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        } else {
                            value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                        }
                    })
                }
            }
            if (salesList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Sales details',
                    data: salesList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty sales commission list',
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

module.exports.addfollowUpNotes = async (req, res) => {
    try {
        let userId = req.user.id
        let { note, salesCommissionId } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_create) {
            let s4 = dbScript(db_sql['Q31'], { var1: salesCommissionId, var2: checkPermission.rows[0].company_id, var3: userId, var4: mysql_real_escape_string(note) })
            let addNote = await connection.query(s4)
            if (addNote.rowCount > 0) {
                res.json({
                    status: 201,
                    success: true,
                    message: "Note created successfully"
                })

            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong"
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

module.exports.notesList = async (req, res) => {
    try {
        let userId = req.user.id
        let { salesCommissionId } = req.query
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let s4 = dbScript(db_sql['Q32'], { var1: salesCommissionId })
            let findNOtes = await connection.query(s4)
            if (findNOtes.rows.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Notes list',
                    data: findNOtes.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty notes list',
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

module.exports.deleteNote = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            noteId
        } = req.body
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_delete) {

            await connection.query('BEGIN')

            let _dt = new Date().toISOString();
            let s4 = dbScript(db_sql['Q66'], { var1: _dt, var2: noteId })
            let deleteDeal = await connection.query(s4)

            await connection.query('COMMIT')

            if (deleteDeal.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Note deleted successfully"
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
