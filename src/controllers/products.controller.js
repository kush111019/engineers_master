const connection = require("../database/connection");
const { db_sql, dbScript } = require("../utils/db_scripts");
const {
  mysql_real_escape_string,
  getUserAndSubUser,
} = require("../utils/helper");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const fastcsv = require("fast-csv");
const moduleName = process.env.PRODUCTS_MODULE;
const { uploadProductFile } = require("../utils/uploadfiles");

module.exports.addProduct = async (req, res) => {
  try {
    let userId = req.user.id;
    let {
      productName,
      productImage,
      description,
      availableQuantity,
      price,
      endOfLife,
      currency,
    } = req.body;

    productImage =
      productImage == "" ? process.env.DEFAULT_PRODUCT_IMAGE : productImage;
    await connection.query("BEGIN");
    let s2 = dbScript(db_sql["Q41"], { var1: moduleName, var2: userId });
    let checkPermission = await connection.query(s2);
    if (checkPermission.rows[0].permission_to_create) {
      let s3 = dbScript(db_sql["Q134"], {
        var1: productName,
        var2: checkPermission.rows[0].company_id,
      });
      let findProduct = await connection.query(s3);
      if (findProduct.rowCount == 0) {
        let s4 = dbScript(db_sql["Q82"], {
          var1: mysql_real_escape_string(productName),
          var2: productImage,
          var3: mysql_real_escape_string(description),
          var4: availableQuantity,
          var5: price,
          var6: endOfLife,
          var7: checkPermission.rows[0].company_id,
          var8: currency,
          var9: userId,
        });
        let addProduct = await connection.query(s4);

        let _dt = new Date().toISOString();
        let s7 = dbScript(db_sql["Q280"], {
          var1: _dt,
          var2: checkPermission.rows[0].company_id,
        });
        updateStatusInCompany = await connection.query(s7);

        if (addProduct.rowCount > 0 && updateStatusInCompany.rowCount > 0) {
          await connection.query("COMMIT");
          res.json({
            status: 201,
            success: true,
            message: "Product added successfully",
          });
        } else {
          await connection.query("ROLLBACK");
          res.json({
            status: 400,
            success: false,
            message: "Something went wrong",
          });
        }
      } else {
        res.json({
          status: 400,
          success: false,
          message: "Product Name already exists",
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "Unathorised",
      });
    }
  } catch (error) {
    await connection.query("ROLLBACK");
    res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.updateProduct = async (req, res) => {
  try {
    let userId = req.user.id;
    let {
      productId,
      productName,
      productImage,
      description,
      availableQuantity,
      price,
      endOfLife,
      currency,
    } = req.body;
    await connection.query("BEGIN");
    productImage =
      productImage == "" ? process.env.DEFAULT_PRODUCT_IMAGE : productImage;

    let s3 = dbScript(db_sql["Q41"], { var1: moduleName, var2: userId });
    let checkPermission = await connection.query(s3);
    if (checkPermission.rows[0].permission_to_update) {
      let _dt = new Date().toISOString();
      let s4 = dbScript(db_sql["Q83"], {
        var1: productId,
        var2: mysql_real_escape_string(productName),
        var3: productImage,
        var4: mysql_real_escape_string(description),
        var5: availableQuantity,
        var6: price,
        var7: endOfLife,
        var8: _dt,
        var9: checkPermission.rows[0].company_id,
        var10: currency,
      });
      let updateProduct = await connection.query(s4);
      if (updateProduct.rowCount > 0) {
        await connection.query("COMMIT");
        res.json({
          status: 200,
          success: true,
          message: "Product updated successfully",
        });
      } else {
        await connection.query("ROLLBACK");
        res.json({
          status: 400,
          success: false,
          message: "Something went wrong",
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "Unathorised",
      });
    }
  } catch (error) {
    await connection.query("ROLLBACK");
    res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.productList = async (req, res) => {
  try {
    let userId = req.user.id;
    let s3 = dbScript(db_sql["Q41"], { var1: moduleName, var2: userId });
    let checkPermission = await connection.query(s3);
    if (checkPermission.rows[0].permission_to_view_global) {
      let s4 = dbScript(db_sql["Q84"], {
        var1: checkPermission.rows[0].company_id,
      });
      let productList = await connection.query(s4);
      if (productList.rowCount > 0) {
        res.json({
          status: 200,
          success: true,
          message: "Product List",
          data: productList.rows,
        });
      } else {
        res.json({
          status: 200,
          success: false,
          message: "Empty product list",
          data: [],
        });
      }
    } else if (checkPermission.rows[0].permission_to_view_own) {
      let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
      let s1 = dbScript(db_sql["Q270"], { var1: roleUsers.join(",") });
      let productList = await connection.query(s1);
      if (productList.rowCount > 0) {
        res.json({
          status: 200,
          success: true,
          message: "Product List",
          data: productList.rows,
        });
      } else {
        res.json({
          status: 200,
          success: false,
          message: "Empty product list",
          data: [],
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "Unathorised",
      });
    }
  } catch (error) {
    res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    let userId = req.user.id;
    let { productId } = req.body;
    await connection.query("BEGIN");
    let s3 = dbScript(db_sql["Q41"], { var1: moduleName, var2: userId });
    let checkPermission = await connection.query(s3);
    if (checkPermission.rows[0].permission_to_delete) {
      let s2 = dbScript(db_sql["Q223"], { var1: productId });
      let checkProductInSales = await connection.query(s2);
      if (checkProductInSales.rowCount == 0) {
        let _dt = new Date().toISOString();
        let s4 = dbScript(db_sql["Q85"], {
          var1: productId,
          var2: _dt,
          var3: checkPermission.rows[0].company_id,
        });
        let deleteProduct = await connection.query(s4);
        if (deleteProduct.rowCount > 0) {
          await connection.query("COMMIT");
          res.json({
            status: 200,
            success: true,
            message: "Product deleted successfully",
          });
        } else {
          await connection.query("ROLLBACK");
          res.json({
            status: 400,
            success: false,
            message: "Something went wrong",
          });
        }
      } else {
        res.json({
          status: 200,
          success: false,
          message: "This record has been used by Sales",
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "Unathorised",
      });
    }
  } catch (error) {
    await connection.query("ROLLBACK");
    res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.uploadProductImage = async (req, res) => {
  try {
    let file = req.file;
    let path = `${process.env.PRODUCT_IMAGE_PATH}/${file.filename}`;
    res.json({
      status: 201,
      success: true,
      message: "Product image Uploaded successfully!",
      data: path,
    });
  } catch (error) {
    res.json({
      status: 400,
      success: false,
      message: error.message,
      data: "",
    });
  }
};

// module.exports.uploadProductFile = async (req, res) => {
//     try {
//         let userId = req.user.id
//         let file = req.file
//         await connection.query('BEGIN')
//         let s2 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
//         let checkPermission = await connection.query(s2)
//         if (checkPermission.rows[0].permission_to_create) {
//             uploadProductFile(req, res, async  (err) => {
//                 let promise = new Promise((resolve, reject) => {
//                     let stream = fs.createReadStream(req.file.path);
//                     let csvData = [];
//                     //.on('data') is triggered when a record is parsed,
//                     // so we will get the record (data) in the handler function.
//                     // Each record is pushed to csvData array.
//                     //on('end') is triggered after the parsing is done,
//                     // at the time that we have all records.
//                     let csvStream = fastcsv.parse().on("data", (data) => {
//                         csvData.push(data)
//                     }).on("end", () => {
//                         // remove the first line: header
//                         csvData.shift();
//                         // connect to the PostgreSQL database
//                         // insert csvData into DB
//                         csvData.forEach(async (row) => {
//                             //defualt product image
//                             if (row.length > 0) {
//                                 let s3 = dbScript(db_sql['Q134'], { var1: row[0], var2: checkPermission.rows[0].company_id })
//                                 let findProduct = await connection.query(s3)
//                                 if (findProduct.rowCount == 0) {
//                                     (row[1] == "") ? row[1] = process.env.DEFAULT_PRODUCT_IMAGE : row[1];
//                                     //unique id for every row
//                                     let s4 = dbScript(db_sql['Q87'], { var1: checkPermission.rows[0].company_id, var2: userId })
//                                     connection.query(s4, row, async(err, res) => {
//                                         if (err) {
//                                             await connection.query('ROLLBACk')
//                                             return res.json({
//                                                 status: 400,
//                                                 success: false,
//                                                 message: "Something went wrong"
//                                             })
//                                         }
//                                     });
//                                 }
//                             }
//                         });
//                     })
//                     let exportedData = stream.pipe(csvStream);
//                     if (exportedData) {
//                         resolve(file);
//                     } else {
//                         reject(false)
//                     }
//                 })
//                 promise.then((file) => {
//                     fs.unlink(file.path, (err) => {
//                         if (err) {
//                             throw err
//                         }
//                     })
//                 }).catch(err => {
//                     throw err
//                 })
//                 let _dt = new Date().toISOString();
//                 let s7 = dbScript(db_sql['Q280'], { var1:_dt, var2: checkPermission.rows[0].company_id })
//                 updateStatusInCompany = await connection.query(s7)
//                 if(updateStatusInCompany.rowCount > 0){
//                     await connection.query('COMMIT')
//                     res.json({
//                         status: 201,
//                         success: true,
//                         message: "Products exported to DB"
//                     })
//                 }else{
//                     await connection.query('ROLLBACK')
//                     res.json({
//                         status: 400,
//                         success: false,
//                         message: "Something went wrong"
//                     })
//                 }
//             });
//         } else {
//             res.status(403).json({
//                 success: false,
//                 message: "Unathorised"
//             })
//         }
//     } catch (error) {
//         await connection.query('ROLLBACK')
//         res.json({
//             status: 400,
//             success: false,
//             message: error.message,
//         })
//     }
// }

const handleRollback = async (connection) => {
  await connection.query("ROLLBACK");
};

const handleCommit = async (connection) => {
  await connection.query("COMMIT");
};

const processProductCsvData = async (filePath, userId, checkPermission) => {
  const stream = fs.createReadStream(filePath);
  const csvData = [];

  const csvStream = fastcsv
    .parse()
    .on("data", (data) => {
      csvData.push(data);
    })
    .on("end", async () => {
      csvData.shift();

      for (const row of csvData) {
        if (row.length > 0) {
          const findProductQuery = dbScript(db_sql["Q134"], {
            var1: row[0],
            var2: checkPermission.rows[0].company_id,
          });
          const findProductResult = await connection.query(findProductQuery);

          if (findProductResult.rowCount === 0) {
            // Process and insert product data into the database
            // (assuming you have a function for this, replace with the actual function)
            await processAndInsertProduct(
              row,
              checkPermission.rows[0].company_id,
              userId
            );
          }
        }
      }
    });

  stream.pipe(csvStream);
};

const processAndInsertProduct = async (row, companyId, userId) => {
  try {
    // Your logic for processing and inserting product data
    // Replace this comment with your actual implementation

    // For example, let's assume you have a function to insert product data
    const insertProductQuery = dbScript(db_sql["Q87"], {
      var1: companyId,
      var2: userId,
    });
    await connection.query(insertProductQuery, row);
  } catch (error) {
    // Handle any errors that occur during processing or insertion
    console.error("Error processing and inserting product data:", error);
    throw error; // Propagate the error up to be caught in the higher-level catch block
  }
};

module.exports.uploadProductFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    await connection.query("BEGIN");

    const checkPermissionQuery = dbScript(db_sql["Q41"], {
      var1: moduleName,
      var2: userId,
    });
    const checkPermissionResult = await connection.query(checkPermissionQuery);
    const { permission_to_create } = checkPermissionResult.rows[0];

    if (permission_to_create) {
    //   const uploadProductFileAsync = promisify(uploadProductFile);

    //   await uploadProductFileAsync(req, res);
        uploadProductFile(req, res, async  (err) => {
            if (err) {
                return res.json({
                    status: 400,
                    success: false,
                    message: err.message,
                });
            }

            const filePath = req.file.path;

            if (!fs.existsSync(filePath)) {
                return res.json({
                    status: 404,
                    success: false,
                    message: "File not found",
                });
            }

            await processProductCsvData(filePath, userId, checkPermissionResult);

            // Remove the uploaded file after processing
            await unlinkAsync(filePath);

            await handleCommit(connection);

            res.json({
                status: 201,
                success: true,
                message: "Products exported to DB",
            });
        });
    } else {
      res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }
  } catch (error) {
    await handleRollback(connection);

    res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.productNotes = async (req, res) => {
  try {
    let { id } = req.body;
    let s1 = dbScript(db_sql["Q475"], { var1: id });
    let followupNotes = await connection.query(s1);
    if (followupNotes.rowCount > 0) {
      res.json({
        status: 200,
        success: true,
        message: "Product Follow Up Notes List",
        data: followupNotes.rows,
      });
    } else {
      res.json({
        status: 200,
        success: false,
        message: "Empty product follow notes list",
        data: [],
      });
    }
  } catch (error) {
    res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};
