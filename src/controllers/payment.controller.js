const connection = require('../database/connection')
const uuid = require("node-uuid")
const { db_sql, dbScript } = require('../utils/db_scripts');
const stripe = require('stripe')(process.env.SECRET_KEY)


module.exports.plansList = async (req, res) => {
    try {
        let s2 = await dbScript(db_sql['Q111'], {})
        let planData = await connection.query(s2)
        if (planData.rowCount > 0) {
            res.json({
                status: 200,
                success: true,
                message: "Plans list",
                data: planData.rows
            })
        } else {
            if (planData.rows.length == 0) {
                req.json({
                    status: 200,
                    success: true,
                    message: "Empty Plans list",
                    data: planData.rows
                })
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong",
                    data: ""
                })
            }
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}