const connection = require('../database/connection')
const { db_sql, dbScript } = require('../utils/db_scripts');
const uuid = require("node-uuid");
const { mysql_real_escape_string } = require('../utils/helper')
const fs = require("fs");
const fastcsv = require("fast-csv");

module.exports.addProduct = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            productName,
            productImage,
            description,
            availableQuantity,
            price,
            tax,
            currency
        } = req.body

        productImage = (productImage == "") ? 'http://143.198.102.134:3003/productImages/defaultproductImage.png' : productImage;

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Products'
        if (findAdmin.rows.length > 0) {
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {
                await connection.query('BEGIN')
                let id = uuid.v4()
                let s4 = dbScript(db_sql['Q92'], { var1: id, var2: productName, var3: productImage, var4: mysql_real_escape_string(description), var5: availableQuantity, var6: price, var7: tax, var8: findAdmin.rows[0].company_id, var9 : currency })
                let addProduct = await connection.query(s4)
                if (addProduct.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: "Product added successfully"
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

module.exports.updateProduct = async (req, res) => {
    try {
        let userId = req.user.id
        let {
            productId,
            productName,
            productImage,
            description,
            availableQuantity,
            price,
            tax,
            currency
        } = req.body

        productImage = (productImage == "") ? 'http://143.198.102.134:3003/productImages/defaultproductImage.png' : productImage;

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Products'
        if (findAdmin.rows.length > 0) {
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_update) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q93'], { var1: productId, var2: productName, var3: productImage, var4: mysql_real_escape_string(description), var5: availableQuantity, var6: price, var7: tax, var8: _dt, var9: findAdmin.rows[0].company_id, var10 : currency })
                let updateProduct = await connection.query(s4)
                if (updateProduct.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Product updated successfully"
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

module.exports.productList = async (req, res) => {
    try {
        let userId = req.user.id
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Products'
        if (findAdmin.rows.length > 0) {
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_view) {
                let s4 = dbScript(db_sql['Q94'], { var1: findAdmin.rows[0].company_id })
                let productList = await connection.query(s4)
                if (productList.rowCount > 0) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Product List",
                        data: productList.rows
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty product list",
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

module.exports.deleteProduct = async (req, res) => {
    try {
        let userId = req.user.id
        let { productId } = req.body
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Products'
        if (findAdmin.rows.length > 0) {
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_delete) {
                await connection.query('BEGIN')
                let _dt = new Date().toISOString();
                let s4 = dbScript(db_sql['Q95'], { var1: productId, var2: _dt, var3: findAdmin.rows[0].company_id })
                let deleteProduct = await connection.query(s4)
                if (deleteProduct.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: "Product deleted successfully"
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

module.exports.uploadProductImage = async (req, res) => {
    try {
        let file = req.file
        let path = `http://143.198.102.134:3003/productImages/${file.originalname}`;
        res.json({
            status: 201,
            success: true,
            message: "Product image Uploaded successfully!",
            data: path
        })

    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
            data: ""
        })
    }
}

module.exports.uploadProductFile = async (req, res) => {
    try {
        let userId = req.user.id
        let file = req.file

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        let moduleName = 'Products'
        if (findAdmin.rows.length > 0) {
            let s3 = dbScript(db_sql['Q41'], { var1: moduleName , var2: findAdmin.rows[0].id })
            let checkPermission = await connection.query(s3)
            if (checkPermission.rows[0].permission_to_create) {

                let promise = new Promise((resolve, reject) => {
                    let stream = fs.createReadStream(file.path);
                    let csvData = [];
                    //.on('data') is triggered when a record is parsed,
                    // so we will get the record (data) in the handler function.
                    // Each record is pushed to csvData array.
                    //on('end') is triggered after the parsing is done,
                    // at the time that we have all records.
                    let csvStream = fastcsv.parse().on("data", (data) => {
                        csvData.push(data)
                    }).on("end", () => {
                        // remove the first line: header
                        csvData.shift();
                        // connect to the PostgreSQL database
                        // insert csvData into DB 
                        csvData.forEach(row => {
                            //defualt product image 
                            (row[1] == "") ? row[1] = 'http://143.198.102.134:3003/productImages/defaultproductImage.png' : row[1];
                            
                            //unique id for every row 
                            id = uuid.v4()
                            let s4 = dbScript(db_sql['Q97'], { var1: id, var2: findAdmin.rows[0].company_id })
                            connection.query(s4, row, (err, res) => {
                                if (err) {
                                    
                                    throw err
                                }
                            });
                        });
                    })
                    let exportedData = stream.pipe(csvStream);
                    if (exportedData) {
                        resolve(file);
                    } else {
                        reject(false)
                    }
                })
                promise.then((file) => {
                    fs.unlink(file.path, (err) => {
                        if (err) {
                            throw err
                        }
                    })
                }).catch(err => {
                    throw err
                })

                res.json({
                    status: 201,
                    success: true,
                    message: "Products exported to DB"
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
