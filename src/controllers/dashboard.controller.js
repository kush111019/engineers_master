const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');


module.exports.revenues = async (req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        let moduleName = 'Dashboard'
        if (findAdmin.rows.length > 0) {

            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {

                let counts = {}
                let revenueCommissionBydate = []

                let s4 = dbScript(db_sql['Q87'], { var1: findAdmin.rows[0].company_id })
                let customers = await connection.query(s4)
                if (customers.rowCount > 0) {

                    let expectedRevenue = 0;
                    let totalRevenue = 0;
                    let totalCommission = 0;

                    for (data of customers.rows) {
                        if (data.closed_at == null) {
                            expectedRevenue = Number(expectedRevenue) + Number(data.target_amount);
                        } else {
                            let revenueCommissionByDateObj = {}

                            revenueCommissionByDateObj.revenue = Number(data.target_amount)
                            revenueCommissionByDateObj.date = data.closed_at

                            totalRevenue = Number(totalRevenue) + Number(data.target_amount);

                            let s5 = dbScript(db_sql['Q17'], { var1: findAdmin.rows[0].company_id })
                            let slab = await connection.query(s5)
                            if (slab.rowCount > 0) {

                                for (slabData of slab.rows) {

                                    if ((Number(data.target_amount) >= Number(slabData.min_amount)) && slabData.is_max == true) {

                                        let percentage = slabData.percentage
                                        let amount = ((Number(percentage) / 100) * Number(data.target_amount))

                                        revenueCommissionByDateObj.commission = amount.toFixed(2)

                                        totalCommission = totalCommission + amount
                                    }
                                    else if ((Number(data.target_amount) >= Number(slabData.min_amount)) && (Number(data.target_amount) <= Number(slabData.max_amount))) {

                                        let percentage = slabData.percentage
                                        let amount = ((Number(percentage) / 100) * Number(data.target_amount))

                                        revenueCommissionByDateObj.commission = amount.toFixed(2)

                                        totalCommission = totalCommission + amount

                                    }
                                }

                            } else {
                                res.json({
                                    status: 400,
                                    success: false,
                                    message: "Slab not found"
                                })
                            }
                            revenueCommissionBydate.push(revenueCommissionByDateObj)

                        }

                    }
                    counts.expectedRevenue = expectedRevenue
                    counts.totalRevenue = totalRevenue.toFixed(2)
                    counts.totalCommission = totalCommission.toFixed(2)
                    counts.revenueCommissionBydate = revenueCommissionBydate


                } else {
                    counts.totalRevenue = 0
                    counts.expectedRevenue = 0
                    counts.totalCommission = 0
                    counts.revenueCommissionBydate = revenueCommissionBydate
                }

                res.json({
                    status: 200,
                    success: true,
                    message: "Revenues and Commissions",
                    data: counts
                })

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

