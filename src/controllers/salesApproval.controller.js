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
        // if (checkPermission.rows[0].permission_to_create) {

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
        // } else {
        //     res.status(403).json({
        //         success: false,
        //         message: "Unathorised"
        //     })
        // }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.approveRequestDetails = async (req, res) => {
    try {
        let userId = req.user.id;
        let { approval_id, sales_id } = req.body;
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
           
            let s2 = dbScript(db_sql['Q350'], { var1: approval_id, var2: sales_id })
            let getAllApproveRequestDetails = await connection.query(s2)
            if (getAllApproveRequestDetails.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Approve request details for sales',
                    data: getAllApproveRequestDetails.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty approve request details',
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

module.exports.acceptOrRejectApproveRequestForSales = async (req, res) => {
    try {
        let userId = req.user.id
        let { sales_id, approval_status, approval_id } = req.body
        await connection.query('BEGIN');
        //add notification deatils
        let notification_typeId = sales_id;
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)

        // if (checkPermission.rows[0].permission_to_create) {
            let _dt = new Date().toISOString();

            let s2 = dbScript(db_sql['Q348'], { var1: _dt, var2: approval_status, var3: sales_id })
            let updateSalesApprovalStatusInSales = await connection.query(s2)
            let s3 = dbScript(db_sql['Q349'], { var1: _dt, var2: approval_status, var3: approval_id, var4: sales_id })
            let updateSalesApprovalStatus = await connection.query(s3)

            if (updateSalesApprovalStatusInSales.rowCount > 0 && updateSalesApprovalStatus.rowCount > 0) {
                // add notification in notification list
                let notification_userId = [updateSalesApprovalStatus.rows[0].requested_user_id];
                if (approval_status == 'Accepted') {
                    await notificationsOperations({ type: 1, msg: 1.7, notification_typeId, notification_userId }, userId);
                } else {
                    await notificationsOperations({ type: 1, msg: 1.8, notification_typeId, notification_userId }, userId);
                }
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: `Sales approval request has been ${approval_status.toLowerCase()} successfully`
                })

            } else {
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong"
                })
            }
        // } else {
        //     res.status(403).json({
        //         success: false,
        //         message: "UnAthorised"
        //     })
        // }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}

module.exports.allApproveRequestList = async (req, res) => {
    try {
        let userId = req.user.id;
        let {  sales_id } = req.query;
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
           
            let s2 = dbScript(db_sql['Q351'], { var1: sales_id })
            let getAllApproveRequestList = await connection.query(s2)
            if (getAllApproveRequestList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Approve request list for sales',
                    data: getAllApproveRequestList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty approve request list',
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
