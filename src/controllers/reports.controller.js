const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const {reduceArray, paginatedResults,paginatedResults1,reduceArrayWithName,reduceArrayWithName1, reduceArrayWithCustomer, reduceArrayWithProduct,getUserAndSubUser} = require('../utils/helper')
const moduleName = process.env.REPORTS_MODULE

module.exports.revenuePerCustomer = async (req, res) => {
    try {
        let userId = req.user.id
        let { page, orderBy, startDate, endDate } = req.query
        startDate = new Date(startDate)
        startDate.setHours(0, 0, 0, 0)
        let sDate = new Date(startDate).toISOString()
        endDate = new Date(endDate)
        endDate.setHours(23, 59, 59, 999)
        let eDate = new Date(endDate).toISOString()
        let limit = 10;
        let offset = (page - 1) * limit
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global) {
            if ((startDate != undefined || startDate != '') && (endDate != undefined || endDate != '')) {
                let s2 = dbScript(db_sql['Q89'], { var1: checkPermission.rows[0].company_id, var2: orderBy, var3: sDate, var4: eDate })
                let customerCompanies = await connection.query(s2)
                if (customerCompanies.rowCount > 0) {
                    let revenuePerCustomerArr = []
                    for(let data of customerCompanies.rows ){
                        if(data.sales_type == 'Perpetual'){
                            let s3 = dbScript(db_sql['Q273'],{var1 : data.sales_commission_id})
                            let recognizedRevenue = await connection.query(s3)
                            if(recognizedRevenue.rowCount > 0){
                                revenuePerCustomerArr.push({
                                    customer_name : data.customer_name || "",
                                    revenue : recognizedRevenue.rows[0].recognized_amount
                                })
                            }
                        }else{
                            let s3 = dbScript(db_sql['Q274'],{var1 : data.sales_commission_id})
                            let recognizedRevenue = await connection.query(s3)
                            if(recognizedRevenue.rowCount > 0){
                                revenuePerCustomerArr.push({
                                    customer_name : data.customer_name || "",
                                    revenue : recognizedRevenue.rows[0].recognized_amount
                                })
                            }
                        } 
                    }
                    let returnData = await reduceArrayWithCustomer(revenuePerCustomerArr)
                    if (returnData.length > 0) {
                        let paginatedArr = await paginatedResults(returnData, page)
                        if (orderBy.toLowerCase() == 'asc') {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return a.revenue - b.revenue
                            })
                        } else {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return b.revenue - a.revenue
                            })
                        }
                        res.json({
                            status: 200,
                            success: true,
                            message: "Revenue per customer",
                            data: paginatedArr
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty revenue per customer",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date required",
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let revenuePerCustomerArr = []
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            if ((startDate != undefined || startDate != '') && (endDate != undefined || endDate != '')) {
                let s2 = dbScript(db_sql['Q170'], {  var1: roleUsers.join("','"), var2: orderBy, var3: sDate, var4: eDate })
                let customerCompanies = await connection.query(s2)
                if(customerCompanies.rowCount > 0){
                    for(let data of customerCompanies.rows ){
                        if(data.sales_type == 'Perpetual'){
                            let s3 = dbScript(db_sql['Q273'],{var1 : data.sales_commission_id})
                            let recognizedRevenue = await connection.query(s3)
                            if(recognizedRevenue.rowCount > 0){
                                revenuePerCustomerArr.push({
                                    customer_name : data.customer_name || "",
                                    revenue : recognizedRevenue.rows[0].recognized_amount
                                })
                            }
                        }else{
                            let s4 = dbScript(db_sql['Q274'],{var1 : data.sales_commission_id})
                            let recognizedRevenue = await connection.query(s4)
                            if(recognizedRevenue.rowCount > 0){
                                revenuePerCustomerArr.push({
                                    customer_name : data.customer_name || "",
                                    revenue : recognizedRevenue.rows[0].recognized_amount
    
                                })
                            }
                        } 
                    }
                }
                if (revenuePerCustomerArr.length > 0) {
                    let returnData = await reduceArrayWithCustomer(revenuePerCustomerArr)
                    if (returnData.length > 0) {
                        let paginatedArr = await paginatedResults(returnData, page)
                        if (orderBy.toLowerCase() == 'asc') {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return a.revenue - b.revenue
                            })
                        } else {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return b.revenue - a.revenue
                            })
                        }
                        res.json({
                            status: 200,
                            success: true,
                            message: "Revenue per customer",
                            data: paginatedArr
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty revenue per customer",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date required",
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

module.exports.revenuePerProduct = async (req, res) => {
    try {
        let userId = req.user.id
        let { page, orderBy, startDate, endDate} = req.query
        startDate = new Date(startDate)
        startDate.setHours(0, 0, 0, 0)
        let sDate = new Date(startDate).toISOString()
        endDate = new Date(endDate)
        endDate.setHours(23, 59, 59, 999)
        let eDate = new Date(endDate).toISOString()
        let limit = 10;
        let offset = (page - 1) * limit
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            if((startDate != undefined || startDate != '') && (endDate != undefined || endDate != '')){
                let s4 = dbScript(db_sql['Q153'], { var1: checkPermission.rows[0].company_id, var2 : orderBy, var3 : sDate, var4: eDate })
                let revenuePerProduct = await connection.query(s4)
                if (revenuePerProduct.rowCount > 0) {
                    let revenuePerProductArr = []
                    for(let data of revenuePerProduct.rows ){
                        if(data.sales_type == 'Perpetual'){
                            let s3 = dbScript(db_sql['Q273'],{var1 : data.sales_commission_id})
                            let recognizedRevenue = await connection.query(s3)
                            if(recognizedRevenue.rowCount > 0){
                                revenuePerProductArr.push({
                                    product_name : data.product_name,
                                    revenue : recognizedRevenue.rows[0].recognized_amount
                                })
                            }
                        }else{
                            let s3 = dbScript(db_sql['Q274'],{var1 : data.sales_commission_id})
                            let recognizedRevenue = await connection.query(s3)
                            if(recognizedRevenue.rowCount > 0){
                                revenuePerProductArr.push({
                                    product_name : data.product_name,
                                    revenue : recognizedRevenue.rows[0].recognized_amount
                                })
                            }
                        } 
                    }
                    let returnData = await reduceArrayWithProduct(revenuePerProductArr)
                    if (returnData.length > 0) {
                        let paginatedArr = await paginatedResults(returnData, page)
                        if (orderBy.toLowerCase() == 'asc') {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return a.revenue - b.revenue
                            })
                        } else {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return b.revenue - a.revenue
                            })
                        }
                        res.json({
                            status: 200,
                            success: true,
                            message: "Revenue per product",
                            data: paginatedArr
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty revenue per product",
                        data: []
                    })
                }
            }else{
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date required",
                })
            }
        }else if(checkPermission.rows[0].permission_to_view_own){
            let revenuePerProductArr = []
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            if((startDate != undefined || startDate != '') && (endDate != undefined || endDate != '')){
                let s4 = dbScript(db_sql['Q171'], {  var1: roleUsers.join("','"), var2 : orderBy, var3 : sDate, var4: eDate })
                // console.log(s4,"s4");
                let revenuePerProduct = await connection.query(s4)
                if(revenuePerProduct.rowCount > 0){
                    for(let product of revenuePerProduct.rows){
                        if(product.sales_type == 'Perpetual'){
                            let s3 = dbScript(db_sql['Q273'],{var1 : product.sales_commission_id})
                            let recognizedRevenue = await connection.query(s3)
                            if(recognizedRevenue.rowCount > 0){ 
                                revenuePerProductArr.push({
                                    product_name : product.product_name,
                                    revenue : recognizedRevenue.rows[0].recognized_amount
                                })
                            }
                        }else{
                            let s4 = dbScript(db_sql['Q274'],{var1 : product.sales_commission_id})
                            let recognizedRevenue = await connection.query(s4)
                            if(recognizedRevenue.rowCount > 0){
                                revenuePerProductArr.push({
                                    product_name : product.product_name,
                                    revenue : recognizedRevenue.rows[0].recognized_amount
                                })
                            }
                        } 
                    }
                }
                if (revenuePerProductArr.length > 0) {
                    let returnData = await reduceArrayWithProduct(revenuePerProductArr)
                    if (returnData.length > 0) {
                        let paginatedArr = await paginatedResults(returnData, page)
                        if (orderBy.toLowerCase() == 'asc') {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return a.revenue - b.revenue
                            })
                        } else {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return b.revenue - a.revenue
                            })
                        }
                        res.json({
                            status: 200,
                            success: true,
                            message: "Revenue per product",
                            data: paginatedArr
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty revenue per product",
                        data: revenuePerProductArr
                    })
                }
            }else{
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date required",
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "Unauthorised"
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

module.exports.revenuePerSalesRep = async (req, res) => {
    try {
        let userId = req.user.id
        let { page, orderBy, startDate, endDate, role_id, isAll, filterBy } = req.query
        startDate = new Date(startDate)
        startDate.setHours(0, 0, 0, 0)
        let sDate = new Date(startDate).toISOString()
        endDate = new Date(endDate)
        endDate.setHours(23, 59, 59, 999)
        let eDate = new Date(endDate).toISOString()
        let limit = 10;
        let offset = (page - 1) * limit
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            if ((startDate != undefined && startDate != '') && (endDate != undefined && endDate != '')) {
                let roleIds = []
                let roleUsers = []
                let revenueCommissionBydate = []
                roleIds.push(role_id)
                if (isAll == 'true') {
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
                    await getRoles(role_id)
                }
                for (let roleId of roleIds) {
                    let s3 = dbScript(db_sql['Q185'], { var1: roleId })
                    let findUsers = await connection.query(s3)
                    if (findUsers.rowCount > 0) {
                        for (let user of findUsers.rows) {
                            roleUsers.push(user.id)
                        }
                    }
                }
                let s4 = dbScript(db_sql['Q258'], { var1: "'" + roleUsers.join("','") + "'", var2: orderBy, var3: sDate, var4: eDate })
                let salesData = await connection.query(s4)
                if (salesData.rowCount > 0) {
                    for (let data of salesData.rows) {
                        let s5 = dbScript(db_sql['Q184'], { var1: data.slab_id })
                        let slab = await connection.query(s5)
                        let revenueCommissionByDateObj = {}
                        if (data.sales_type == 'Perpetual') {
                            let s6 = dbScript(db_sql['Q273'], { var1: data.sales_commission_id })
                            let recognizedRevenue = await connection.query(s6)
                            if (recognizedRevenue.rowCount > 0) {
                                revenueCommissionByDateObj.revenue = Number(recognizedRevenue.rows[0].recognized_amount)
                                revenueCommissionByDateObj.sales_rep = data.sales_rep

                                let remainingAmount = Number(recognizedRevenue.rows[0].recognized_amount);
                                let commission = 0
                                //if remainning amount is 0 then no reason to check 
                                for (let i = 0; i < slab.rows.length && remainingAmount > 0; i++) {
                                    let slab_percentage = Number(slab.rows[i].percentage)
                                    let slab_maxAmount = Number(slab.rows[i].max_amount)
                                    let slab_minAmount = Number(slab.rows[i].min_amount)
                                    if (slab.rows[i].is_max) {
                                        // Reached the last slab
                                        commission += ((slab_percentage / 100) * remainingAmount)
                                        break;
                                    }
                                    else {
                                        // This is not the last slab
                                        let diff = slab_minAmount == 0 ? 0 : 1
                                        let slab_diff = (slab_maxAmount - slab_minAmount + diff)
                                        slab_diff = (slab_diff > remainingAmount) ? remainingAmount : slab_diff
                                        commission += ((slab_percentage / 100) * slab_diff)
                                        remainingAmount -= slab_diff
                                        if (remainingAmount <= 0) {
                                            break;
                                        }
                                    }
                                }
                                if (filterBy.toLowerCase() == 'all') {
                                    revenueCommissionByDateObj.commission = Number(commission.toFixed(2))
                                    revenueCommissionBydate.push(revenueCommissionByDateObj)
                                } else if (filterBy.toLowerCase() == 'lead') {
                                    let s6 = dbScript(db_sql['Q86'], { var1: data.sales_commission_id })
                                    let leadPercentage = await connection.query(s6)
                                    if (leadPercentage.rowCount > 0) {
                                        revenueCommissionByDateObj.commission = ((Number(leadPercentage.rows[0].closer_percentage) / 100) * Number(commission.toFixed(2)))
                                        revenueCommissionBydate.push(revenueCommissionByDateObj)
                                    }
                                } else {
                                    let s6 = dbScript(db_sql['Q59'], { var1: data.sales_commission_id })
                                    let supporterPercentage = await connection.query(s6)
                                    if (supporterPercentage.rowCount > 0) {
                                        let sCommission = 0
                                        for (supporter of supporterPercentage.rows) {
                                            sCommission += ((Number(supporter.supporter_percentage) / 100) * Number(commission.toFixed(2)))
                                        }
                                        revenueCommissionByDateObj.commission = sCommission
                                        revenueCommissionBydate.push(revenueCommissionByDateObj)
                                    }
                                }
                            }
                        } else {
                            let s6 = dbScript(db_sql['Q274'], { var1: data.sales_commission_id })
                            let recognizedRevenue = await connection.query(s6)
                            if (recognizedRevenue.rowCount > 0) {
                                revenueCommissionByDateObj.revenue = Number(recognizedRevenue.rows[0].recognized_amount)
                                revenueCommissionByDateObj.sales_rep = data.sales_rep

                                let remainingAmount = Number(recognizedRevenue.rows[0].recognized_amount);
                                let commission = 0
                                //if remainning amount is 0 then no reason to check 
                                for (let i = 0; i < slab.rows.length && remainingAmount > 0; i++) {
                                    let slab_percentage = Number(slab.rows[i].percentage)
                                    let slab_maxAmount = Number(slab.rows[i].max_amount)
                                    let slab_minAmount = Number(slab.rows[i].min_amount)
                                    if (slab.rows[i].is_max) {
                                        // Reached the last slab
                                        commission += ((slab_percentage / 100) * remainingAmount)
                                        break;
                                    }
                                    else {
                                        // This is not the last slab
                                        let diff = slab_minAmount == 0 ? 0 : 1
                                        let slab_diff = (slab_maxAmount - slab_minAmount + diff)
                                        slab_diff = (slab_diff > remainingAmount) ? remainingAmount : slab_diff
                                        commission += ((slab_percentage / 100) * slab_diff)
                                        remainingAmount -= slab_diff
                                        if (remainingAmount <= 0) {
                                            break;
                                        }
                                    }
                                }
                                if (filterBy.toLowerCase() == 'all') {
                                    revenueCommissionByDateObj.commission = Number(commission.toFixed(2))
                                    revenueCommissionBydate.push(revenueCommissionByDateObj)
                                } else if (filterBy.toLowerCase() == 'lead') {
                                    let s6 = dbScript(db_sql['Q86'], { var1: data.sales_commission_id })
                                    let leadPercentage = await connection.query(s6)
                                    if (leadPercentage.rowCount > 0) {
                                        revenueCommissionByDateObj.commission = ((Number(leadPercentage.rows[0].closer_percentage) / 100) * Number(commission.toFixed(2)))
                                        revenueCommissionBydate.push(revenueCommissionByDateObj)
                                    }
                                } else {
                                    let s6 = dbScript(db_sql['Q59'], { var1: data.sales_commission_id })
                                    let supporterPercentage = await connection.query(s6)
                                    if (supporterPercentage.rowCount > 0) {
                                        let sCommission = 0
                                        for (supporter of supporterPercentage.rows) {
                                            sCommission += ((Number(supporter.supporter_percentage) / 100) * Number(commission.toFixed(2)))
                                        }
                                        revenueCommissionByDateObj.commission = sCommission
                                        revenueCommissionBydate.push(revenueCommissionByDateObj)
                                    }
                                }
                            }
                        }
                    }
                }
                if (revenueCommissionBydate.length > 0) {
                    let returnData = await reduceArrayWithName(revenueCommissionBydate)
                    if (returnData.length > 0) {
                        let paginatedArr = await paginatedResults(returnData, page)
                        if (orderBy.toLowerCase() == 'asc') {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return a.revenue - b.revenue
                            })
                        } else {
                            paginatedArr = paginatedArr.sort((a, b) => {
                                return b.revenue - a.revenue
                            })
                        }
                        res.json({
                            status: 200,
                            success: true,
                            message: "Revenues and Commissions per sales captain",
                            data: paginatedArr
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty Revenues and Commissions per sales captain",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Start date and End date is required",
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "Unauthorised"
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

module.exports.totalRevenue = async (req, res) => {
    try {
        let userId = req.user.id
        let { status, page } = req.query
        let limit = (status == 'Monthly') ? 12 : (status == 'Quarterly') ? 4 : 10;
        let offset = (page - 1) * limit
        let format = (status == 'Monthly') ? 'month' : (status == 'Quarterly') ? 'quarter' : 'year'
        let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s3)
        if (checkPermission.rows[0].permission_to_view_global) {
            let s4 = dbScript(db_sql['Q88'], { var1: checkPermission.rows[0].company_id, var2: format })
            let targetData = await connection.query(s4)
            if (targetData.rowCount > 0) {
                let totalRevenueArr = []
                for(let data of targetData.rows ){
                    if(data.sales_type == 'Perpetual'){
                        let s5 = dbScript(db_sql['Q273'],{var1 : data.sales_commission_id})
                        let recognizedRevenue = await connection.query(s5)
                        if(recognizedRevenue.rowCount > 0){
                            totalRevenueArr.push({
                                date : data.date,
                                revenue : recognizedRevenue.rows[0].recognized_amount
                            })
                        }
                    }else{
                        let s6 = dbScript(db_sql['Q274'],{var1 : data.sales_commission_id})
                        let recognizedRevenue = await connection.query(s6)
                        if(recognizedRevenue.rowCount > 0){
                            totalRevenueArr.push({
                                date : data.date,
                                revenue : recognizedRevenue.rows[0].recognized_amount
                            })
                        }
                    }
                }
                if(totalRevenueArr.length > 0){
                    let returnData = await reduceArray(totalRevenueArr)
                    if (returnData.length > 0) {
                        let paginatedArr = await paginatedResults1(returnData, page, limit)
                        res.json({
                            status: 200,
                            success: true,
                            message: "Total revenue",
                            data: paginatedArr
                        })
                    }
                }else{
                    res.json({
                        status: 200,
                        success: true,
                        message: "Empty Total revenue",
                        data: totalRevenueArr
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty Total revenue",
                    data: targetData.rows
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own) {
            let totalRevenue = [];
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);         
            let s4 = dbScript(db_sql['Q173'], { var1: roleUsers.join("','"), var2: format })
            let targetData = await connection.query(s4)
            if (targetData.rowCount > 0) {
                for(let data of targetData.rows ){
                    if(data.sales_type == 'Perpetual'){
                        let s5 = dbScript(db_sql['Q273'],{var1 : data.sales_commission_id})
                        let recognizedRevenue = await connection.query(s5)
                        if(recognizedRevenue.rowCount > 0){
                            totalRevenue.push({
                                date : data.date ,
                                revenue : recognizedRevenue.rows[0].recognized_amount
                            })
                        }
                    }else{
                        let s6 = dbScript(db_sql['Q274'],{var1 : data.sales_commission_id})
                        let recognizedRevenue = await connection.query(s6)
                        if(recognizedRevenue.rowCount > 0){
                            totalRevenue.push({
                                date : data.date,
                                revenue : recognizedRevenue.rows[0].recognized_amount
                            })
                        }
                    } 
                }
            }
            if (totalRevenue.length > 0) {
                let finalArray = await reduceArray(totalRevenue)
                if (finalArray.length > 0) {
                    let paginatedArr = await paginatedResults1(finalArray, page, limit)
                    res.json({
                        status: 200,
                        success: true,
                        message: "Total revenue",
                        data: paginatedArr
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: true,
                    message: "Empty Total revenue",
                    data: totalRevenue
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

// module.exports.roleWiseRevenue = async (req, res) => {
//     try {
//         let userId = req.user.id
//         let { page, orderBy, startDate, endDate, role_id, isAll } = req.query
//         startDate = new Date(startDate)
//         startDate.setHours(0, 0, 0, 0)
//         let sDate = new Date(startDate).toISOString()
//         endDate = new Date(endDate)
//         endDate.setHours(23, 59, 59, 999)
//         let eDate = new Date(endDate).toISOString()
//         let limit = 10;
//         let offset = (page - 1) * limit
//         let s3 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
//         let checkPermission = await connection.query(s3)
//         if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
//             if ((startDate != undefined && startDate != '') && (endDate != undefined && endDate != '')) {
//                 let roleIds = []
//                 let roleUsers = []
//                 let revenueList = []
//                 roleIds.push(role_id)
//                 if(isAll == 'true'){
//                     let getRoles = async (id) => {
//                         let s7 = dbScript(db_sql['Q16'], { var1: id })
//                         let getChild = await connection.query(s7);
//                         if (getChild.rowCount > 0) {
//                             for (let item of getChild.rows) {
//                                 if (roleIds.includes(item.id) == false) {
//                                     roleIds.push(item.id)
//                                     await getRoles(item.id)
//                                 }
//                             }
//                         }
//                     }
//                     await getRoles(role_id)
//                 }
//                 for(let roleId of roleIds){
//                     let s3 = dbScript(db_sql['Q185'], { var1: roleId })
//                     let findUsers = await connection.query(s3)
//                     if (findUsers.rowCount > 0) {
//                         for (let user of findUsers.rows) {
//                             roleUsers.push(user.id)
//                         }
//                     }
//                 }
//                 let s4 = dbScript(db_sql['Q186'], {  var1: "'"+roleUsers.join("','")+"'", var2: limit, var3: offset, var4: sDate, var5: eDate })
//                 let salesData = await connection.query(s4)
//                 if (salesData.rowCount > 0) {
//                     let returnData = await reduceArrayWithName1(salesData.rows)
//                     if(orderBy.toLowerCase() == 'asc'){
//                         returnData = returnData.sort((a,b) => {
//                             return a.revenue - b.revenue
//                         })
//                     }else{
//                         returnData = returnData.sort((a,b) => {
//                             return b.revenue - a.revenue
//                         })
//                     }
//                     res.json({
//                         status: 200,
//                         success: true,
//                         message: "Revenue per role wise user",
//                         data: returnData
//                     })
//                 } else {
//                     res.json({
//                         status: 200,
//                         success: true,
//                         message: "Empty revenue per role wise user",
//                         data: revenueList
//                     })
//                 }
//             } else {
//                 res.json({
//                     status: 400,
//                     success: false,
//                     message: "Start date and End date is required",
//                 })
//             }
//         } 
//         else {
//             res.status(403).json({
//                 success: false,
//                 message: "Unauthorised"
//             })
//         }
//     } catch (error) {
//         res.json({
//             status: 400,
//             success: false,
//             message: error.message,
//         })
//     }
// }