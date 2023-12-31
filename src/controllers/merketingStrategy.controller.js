const connection = require("../database/connection");
const { db_sql, dbScript } = require("../utils/db_scripts");
const {
  paginatedResults,
  mysql_real_escape_string,
  getUserAndSubUser,
  notificationsOperations,
} = require("../utils/helper");
const moduleName = process.env.MARKETING_MODULE;

module.exports.marketingDashboard = async (req, res) => {
  try {
    let userId = req.user.id;
    let { page, orderBy } = req.query;
    let limit = 10;
    let offset = (page - 1) * limit;
    let s1 = dbScript(db_sql["Q41"], { var1: moduleName, var2: userId });
    let checkPermission = await connection.query(s1);
    if (checkPermission.rows[0].permission_to_view_global) {
      //Total Lead count
      let s2 = dbScript(db_sql["Q174"], {
        var1: checkPermission.rows[0].company_id,
      });
      let leadCount = await connection.query(s2);

      //Total MQL Lead count
      let s3 = dbScript(db_sql["Q194"], {
        var1: checkPermission.rows[0].company_id,
      });
      let MCount = await connection.query(s3);

      //Total Assigned Lead count
      let s4 = dbScript(db_sql["Q213"], {
        var1: checkPermission.rows[0].company_id,
      });
      let ACount = await connection.query(s4);

      //Total Rejected Lead count
      let s5 = dbScript(db_sql["Q217"], {
        var1: checkPermission.rows[0].company_id,
        var2: true,
      });
      let RCount = await connection.query(s5);

      //Total Customer count
      let s6 = dbScript(db_sql["Q219"], {
        var1: checkPermission.rows[0].company_id,
      });
      let CCount = await connection.query(s6);

      let s7 = dbScript(db_sql["Q175"], {
        var1: checkPermission.rows[0].company_id,
        var4: orderBy.toLowerCase(),
      });
      let leadData = await connection.query(s7);

      let s8 = dbScript(db_sql["Q190"], {
        var1: checkPermission.rows[0].company_id,
        var4: orderBy.toLowerCase(),
      });
      let mqlLeads = await connection.query(s8);

      let s9 = dbScript(db_sql["Q212"], {
        var1: checkPermission.rows[0].company_id,
        var4: orderBy.toLowerCase(),
      });
      let assignedLeads = await connection.query(s9);

      let s10 = dbScript(db_sql["Q218"], {
        var1: checkPermission.rows[0].company_id,
        var4: orderBy.toLowerCase(),
        var5: true,
      });
      let rejectedLeads = await connection.query(s10);

      let s11 = dbScript(db_sql["Q220"], {
        var1: checkPermission.rows[0].company_id,
        var4: orderBy.toLowerCase(),
      });
      let customerlist = await connection.query(s11);

      const lists = [
        leadData.rows,
        mqlLeads.rows,
        assignedLeads.rows,
        rejectedLeads.rows,
        customerlist.rows,
      ];
      const counts = {};

      // lists.forEach(list => {
      //     list.forEach(item => {
      //         if (!counts[item.created_by]) {
      //             counts[item.created_by] = {
      //                 created_by: item.created_by,
      //                 count: 0,
      //                 mqlCount: 0,
      //                 assignedCount: 0,
      //                 rejectedCount: 0,
      //                 customerCount: 0
      //             };
      //         }
      //     });
      // });
      // lists.forEach(list => {
      //     list.forEach(item => {
      //         if (list === leadData.rows) counts[item.created_by].count = item.count;
      //         if (list === mqlLeads.rows) counts[item.created_by].mqlCount = item.count;
      //         if (list === assignedLeads.rows) counts[item.created_by].assignedCount = item.count;
      //         if (list === rejectedLeads.rows) counts[item.created_by].rejectedCount = item.count;
      //         if (list === customerlist.rows) {
      //             let count = 0; // Reset count for each user
      //             list.forEach(e => {
      //                 if (e.created_by === item.created_by) {
      //                     count++;
      //                 }
      //             });
      //             counts[item.created_by].customerCount = count;
      //         }
      //     });
      // });
      lists.forEach((list) => {
        list.forEach((item) => {
          if (item.created_by !== null) {
            if (!counts[item.created_by]) {
              counts[item.created_by] = {
                created_by: item.created_by,
                count: 0,
                mqlCount: 0,
                assignedCount: 0,
                rejectedCount: 0,
                customerCount: 0,
              };
            }
          }
        });
      });

      lists.forEach((list) => {
        list.forEach((item) => {
          if (item.created_by !== null) {
            if (list === leadData.rows)
              counts[item.created_by].count = item.count;
            if (list === mqlLeads.rows)
              counts[item.created_by].mqlCount = item.count;
            if (list === assignedLeads.rows)
              counts[item.created_by].assignedCount = item.count;
            if (list === rejectedLeads.rows)
              counts[item.created_by].rejectedCount = item.count;
            if (list === customerlist.rows) {
              let count = 0; // Reset count for each user
              list.forEach((e) => {
                if (e.created_by === item.created_by) {
                  count++;
                }
              });
              counts[item.created_by].customerCount = count;
            }
          }
        });
      });
      let LeadCount = Object.values(counts);
      if (orderBy === "asc") {
        LeadCount = LeadCount.sort(
          (a, b) => parseFloat(a.count) - parseFloat(b.count)
        );
      } else {
        LeadCount = LeadCount.sort(
          (a, b) => parseFloat(b.count) - parseFloat(a.count)
        );
      }
      let paginatedArr = await paginatedResults(LeadCount, page);
      res.json({
        status: 200,
        success: true,
        message: "Lead counts",
        data: {
          totalCount: leadCount.rows[0].count,
          totalMQLCount: MCount.rows[0].count,
          totalAssignedCount: ACount.rows[0].count,
          totalRejectedCount: RCount.rows[0].count,
          totalCustomerCount: CCount.rowCount,
          leadData: paginatedArr,
        },
      });
    } else if (checkPermission.rows[0].permission_to_view_own) {
      let totalCounts = 0;
      let totalMQLCount = 0;
      let totalAssignedCount = 0;
      let totalRejectedCount = 0;
      let totalCustomerCount = 0;
      let leadData = [];
      let ids = [];
      let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
      roleUsers.map((e) => {
        ids.push(e.slice(1, -1));
      });
      //Total Lead count
      let s4 = dbScript(db_sql["Q177"], {
        var1: roleUsers.join(","),
        var2: limit,
        var3: offset,
        var4: orderBy.toLowerCase(),
      });
      let leadCount = await connection.query(s4);
      if (leadCount.rowCount > 0) {
        totalCounts += leadCount.rowCount;
        for (let leads of leadCount.rows) {
          let obj = {};
          let lCount = 0;
          let mCount = 0;
          let aCount = 0;
          let rCount = 0;
          let cCount = 0;
          obj.created_by = leads.created_by;
          obj.count = ids.includes(leads.creator_id) ? lCount + 1 : lCount;
          aCount = obj.assignedCount = ids.includes(
            leads.assigned_sales_lead_to
          )
            ? aCount + 1
            : aCount;
          mCount = obj.mqlCount = leads.marketing_qualified_lead
            ? mCount + 1
            : mCount;
          rCount = obj.rejectedCount = leads.is_rejected ? rCount + 1 : rCount;
          cCount = obj.customerCount = leads.customer_company_id
            ? cCount + 1
            : cCount;

          leadData.push(obj);

          totalMQLCount += mCount;
          totalAssignedCount += aCount;
          totalRejectedCount += rCount;
          totalCustomerCount += cCount;
        }
      }
      let combinedData = leadData.reduce((acc, curr) => {
        let existing = acc.find(
          (item) =>
            item.created_by === curr.created_by &&
            item.customer_id === curr.customer_id
        );
        if (existing) {
          existing.count += curr.count;
          existing.assignedCount += curr.assignedCount;
          existing.mqlCount += curr.mqlCount;
          existing.rejectedCount += curr.rejectedCount;
          existing.customerCount += curr.customerCount;
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);

      res.json({
        status: 200,
        success: true,
        message: "Lead counts",
        data: {
          totalCount: totalCounts,
          totalMQLCount: totalMQLCount,
          totalAssignedCount: totalAssignedCount,
          totalRejectedCount: totalRejectedCount,
          totalCustomerCount: totalCustomerCount,
          leadData: combinedData,
        },
      });
    } else {
      res.status(403).json({
        success: false,
        message: "UnAthorised",
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

//--------------------------------Budget------------------------------------------------

module.exports.addBudget = async (req, res) => {
  try {
    let userId = req.user.id;
    let {
      timeline,
      amount,
      startDate,
      endDate,
      type,
      budgetData,
      description,
    } = req.body;
    await connection.query("BEGIN");
    let s0 = dbScript(db_sql["Q41"], { var1: moduleName, var2: userId });
    let checkPermission = await connection.query(s0);
    if (checkPermission.rows[0].permission_to_create) {
      //add notification deatils
      let s1 = dbScript(db_sql["Q68"], {
        var1: checkPermission.rows[0].company_id,
      });
      let getAdminIdForNotification = await connection.query(s1);
      let notification_userId;
      notification_userId = getAdminIdForNotification.rows[0].id
        ? [getAdminIdForNotification.rows[0].id]
        : [];
      let notification_typeId;

      let s2 = dbScript(db_sql["Q198"], {
        var1: timeline,
        var2: amount,
        var3: startDate,
        var4: endDate,
        var5: userId,
        var6: checkPermission.rows[0].company_id,
      });
      let createBudget = await connection.query(s2);

      if (createBudget.rowCount > 0) {
        if (description.length > 0) {
          for (let descData of description) {
            let s3 = dbScript(db_sql["Q199"], {
              var1: createBudget.rows[0].id,
              var2: mysql_real_escape_string(descData.title),
              var3: descData.amount,
              var4: checkPermission.rows[0].id,
              var5: checkPermission.rows[0].company_id,
            });
            let addDescription = await connection.query(s3);

            let s4 = dbScript(db_sql["Q200"], {
              var1: addDescription.rows[0].id,
              var2: createBudget.rows[0].id,
              var3: mysql_real_escape_string(descData.title),
              var4: descData.amount,
              var5: checkPermission.rows[0].id,
              var6: checkPermission.rows[0].company_id,
            });
            let addDescLog = await connection.query(s4);
          }
        }
        let s5 = dbScript(db_sql["Q201"], {
          var1: createBudget.rows[0].id,
          var2: timeline,
          var3: amount,
          var4: startDate,
          var5: endDate,
          var6: userId,
          var7: checkPermission.rows[0].company_id,
          var8: "Budget Created",
        });
        let addBudgetLog = await connection.query(s5);
        if (budgetData.length > 0) {
          for (let data of budgetData) {
            let s6 = dbScript(db_sql["Q267"], {
              var1: createBudget.rows[0].id,
              var2: data.amount,
              var3: data.startDate,
              var4: data.endDate,
              var5: type,
              var6: userId,
            });
            let addBudgetData = await connection.query(s6);
          }
        }

        if (addBudgetLog.rowCount > 0) {
          // add notification in notification list
          notification_typeId = createBudget.rows[0].id;
          await notificationsOperations(
            { type: 5, msg: 5.1, notification_typeId, notification_userId },
            userId
          );

          await connection.query("COMMIT");
          res.json({
            status: 201,
            success: true,
            message: "Budget added successfully",
            data: createBudget.rows[0].id,
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
    res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.budgetList = async (req, res) => {
  try {
    let userId = req.user.id;
    let s1 = dbScript(db_sql["Q41"], { var1: moduleName, var2: userId });
    let checkPermission = await connection.query(s1);
    if (checkPermission.rows[0].permission_to_view_global) {
      let s2 = dbScript(db_sql["Q202"], {
        var1: checkPermission.rows[0].company_id,
      });
      let budgetList = await connection.query(s2);
      if (budgetList.rowCount > 0) {
        res.json({
          status: 200,
          success: true,
          message: "Budget list",
          data: budgetList.rows,
        });
      } else {
        res.json({
          status: 200,
          success: false,
          message: "Empty budget list",
          data: budgetList.rows,
        });
      }
    } else if (checkPermission.rows[0].permission_to_view_own) {
      let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
      let s5 = dbScript(db_sql["Q205"], { var1: roleUsers.join(",") });
      let budgetList = await connection.query(s5);
      if (budgetList.rowCount > 0) {
        res.json({
          status: 200,
          success: true,
          message: "Budget list",
          data: budgetList.rows,
        });
      } else {
        res.json({
          status: 200,
          success: false,
          message: "Empty budget list",
          data: budgetList.rows,
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

module.exports.budgetDetails = async (req, res) => {
  try {
    let userId = req.user.id;
    let { budgetId } = req.query;
    let s1 = dbScript(db_sql["Q41"], { var1: moduleName, var2: userId });
    let checkPermission = await connection.query(s1);
    if (
      checkPermission.rows[0].permission_to_view_global ||
      checkPermission.rows[0].permission_to_view_own
    ) {
      let s2 = dbScript(db_sql["Q274"], { var1: budgetId });
      let budgetList = await connection.query(s2);
      if (budgetList.rowCount > 0) {
        res.json({
          status: 200,
          success: true,
          message: "Budget details",
          data: budgetList.rows,
        });
      } else {
        res.json({
          status: 200,
          success: false,
          message: "Empty budget details",
          data: budgetList.rows,
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

module.exports.deleteBudget = async (req, res) => {
  try {
    let userId = req.user.id;
    let { budgetId } = req.body;
    await connection.query("BEGIN");
    let s1 = dbScript(db_sql["Q41"], { var1: moduleName, var2: userId });
    let checkPermission = await connection.query(s1);
    if (checkPermission.rows[0].permission_to_delete) {
      let _dt = new Date().toISOString();

      //Need to check if budget is assign to the leads or not
      //budgetId -> budgetDescription -> budgetDesction ID -> customer_company_employees exists hai ya nhi.
      let sc = dbScript(db_sql["Q2031"], { var1: budgetId });
      let budgetData = await connection.query(sc);

      if(budgetData.rows.length > 0 ){
        res.json({
          status: 400,
          success: false,
          message: "Sorry, this budget is assigned to leads",
        });
        return false;
      }

      let s2 = dbScript(db_sql["Q203"], { var1: budgetId, var2: _dt });
      let deleteBudget = await connection.query(s2);

      let s3 = dbScript(db_sql["Q204"], { var1: budgetId, var2: _dt });
      let deleteDescription = await connection.query(s3);

      let s4 = dbScript(db_sql["Q268"], { var1: budgetId, var2: _dt });
      let deleteBudgetData = await connection.query(s4);

      if (deleteBudget.rowCount > 0 && deleteBudgetData.rowCount > 0) {
        await connection.query("COMMIT");
        res.json({
          status: 200,
          success: true,
          message: "Budget deleted successfully",
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
        message: "Unauthorized",
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

module.exports.updateBudget = async (req, res) => {
  try {
    let userId = req.user.id;
    let {
      budgetId,
      timeline,
      amount,
      startDate,
      endDate,
      type,
      budgetData,
      description,
    } = req.body;
    await connection.query("BEGIN");
    let s1 = dbScript(db_sql["Q41"], { var1: moduleName, var2: userId });
    let checkPermission = await connection.query(s1);
    if (checkPermission.rows[0].permission_to_update) {
      //add notification deatils
      let s1 = dbScript(db_sql["Q68"], {
        var1: checkPermission.rows[0].company_id,
      });
      let getAdminIdForNotification = await connection.query(s1);
      let notification_userId;
      notification_userId = getAdminIdForNotification.rows[0].id
        ? [getAdminIdForNotification.rows[0].id]
        : [];
      let notification_typeId = budgetId;

      let _dt = new Date().toISOString();
      let s2 = dbScript(db_sql["Q206"], {
        var1: timeline,
        var2: amount,
        var3: startDate,
        var4: endDate,
        var6: budgetId,
      });
      let updateBudget = await connection.query(s2);

      let s5 = dbScript(db_sql["Q201"], {
        var1: budgetId,
        var2: timeline,
        var3: amount,
        var4: startDate,
        var5: endDate,
        var6: userId,
        var7: checkPermission.rows[0].company_id,
        var8: "Budget updated",
      });

      let addBudgetLog = await connection.query(s5);
      if (budgetData.length > 0) {
        let s6 = dbScript(db_sql["Q269"], { var1: _dt, var2: budgetId });
        let updateBudgetData = await connection.query(s6);

        for (let data of budgetData) {
          let s6 = dbScript(db_sql["Q267"], {
            var1: budgetId,
            var2: data.amount,
            var3: data.startDate,
            var4: data.endDate,
            var5: type,
            var6: userId,
          });
          let addBudgetData = await connection.query(s6);
        }
      }
      if (description.length > 0) {
        for (let desc of description) {
          if (desc.id != "") {
            let s3 = dbScript(db_sql["Q207"], {
              var1: mysql_real_escape_string(desc.title),
              var2: desc.amount,
              var3: desc.id,
            });
            let updateDescription = await connection.query(s3);

            let s4 = dbScript(db_sql["Q200"], {
              var1: updateDescription.rows[0].id,
              var2: budgetId,
              var3: desc.title,
              var4: desc.amount,
              var5: checkPermission.rows[0].id,
              var6: checkPermission.rows[0].company_id,
            });
            let addDescLog = await connection.query(s4);
          } else {
            let s5 = dbScript(db_sql["Q199"], {
              var1: budgetId,
              var2: mysql_real_escape_string(desc.title),
              var3: desc.amount,
              var4: checkPermission.rows[0].id,
              var5: checkPermission.rows[0].company_id,
            });
            let addDescription = await connection.query(s5);
            let s6 = dbScript(db_sql["Q200"], {
              var1: addDescription.rows[0].id,
              var2: budgetId,
              var3: mysql_real_escape_string(desc.title),
              var4: desc.amount,
              var5: checkPermission.rows[0].id,
              var6: checkPermission.rows[0].company_id,
            });
            let addDescLog = await connection.query(s6);
          }
        }
      }
      if (updateBudget.rowCount > 0 && addBudgetLog.rowCount > 0) {
        // add notification in notification list
        await notificationsOperations(
          { type: 5, msg: 5.2, notification_typeId, notification_userId },
          userId
        );

        await connection.query("COMMIT");
        res.json({
          status: 200,
          success: true,
          message: "Budget updated successfully",
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

module.exports.budgetLogList = async (req, res) => {
  try {
    let userId = req.user.id;
    let { budgetId } = req.query;
    let s1 = dbScript(db_sql["Q41"], { var1: moduleName, var2: userId });
    let checkPermission = await connection.query(s1);
    if (checkPermission.rows[0].permission_to_view_global) {
      let s2 = dbScript(db_sql["Q208"], { var1: budgetId });
      let budgetLogList = await connection.query(s2);
      if (budgetLogList.rowCount > 0) {
        res.json({
          status: 200,
          success: true,
          message: "budget logs list",
          data: budgetLogList.rows,
        });
      } else {
        res.json({
          status: 200,
          success: false,
          message: "Empty budget logs list",
          data: budgetLogList.rows,
        });
      }
    } else if (checkPermission.rows[0].permission_to_view_own) {
      let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
      let s5 = dbScript(db_sql["Q209"], {
        var1: budgetId,
        var2: roleUsers.join(","),
      });
      let budgetLogList = await connection.query(s5);
      if (budgetLogList.rowCount > 0) {
        res.json({
          status: 200,
          success: true,
          message: "budget logs list",
          data: budgetLogList.rows,
        });
      } else {
        res.json({
          status: 200,
          success: false,
          message: "Empty budget logs list",
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

module.exports.deleteDescription = async (req, res) => {
  try {
    let userId = req.user.id;
    let { descriptionId } = req.query;
    await connection.query("BEGIN");
    let s1 = dbScript(db_sql["Q41"], { var1: moduleName, var2: userId });
    let checkPermission = await connection.query(s1);
    if (checkPermission.rows[0].permission_to_delete) {
      let _dt = new Date().toISOString();
      let s2 = dbScript(db_sql["Q210"], { var1: _dt, var2: descriptionId });
      let deleteDescription = await connection.query(s2);

      if (deleteDescription.rowCount > 0) {
        await connection.query("COMMIT");
        res.json({
          status: 200,
          success: true,
          message: "Description deleted successfully",
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

module.exports.finalizeBudget = async (req, res) => {
  try {
    let userId = req.user.id;
    let { budgetId } = req.query;
    let { timeline, amount, startDate, endDate } = req.body;
    await connection.query("BEGIN");
    let s1 = dbScript(db_sql["Q41"], { var1: moduleName, var2: userId });
    let checkPermission = await connection.query(s1);
    if (checkPermission.rows[0].permission_to_update) {
      //add notification deatils
      let s2 = dbScript(db_sql["Q70"], {
        var1: checkPermission.rows[0].company_id,
        var2: budgetId,
      });
      let getCreatorIdForNotification = await connection.query(s2);
      let notification_userId;
      notification_userId = getCreatorIdForNotification.rows[0].created_by
        ? [getCreatorIdForNotification.rows[0].created_by]
        : [];
      let notification_typeId = budgetId;

      let _dt = new Date().toISOString();
      let s3 = dbScript(db_sql["Q211"], { var1: budgetId, var2: _dt });
      let finalize = await connection.query(s3);
      if (finalize.rowCount > 0) {
        // add notification in notification list
        await notificationsOperations(
          { type: 5, msg: 5.3, notification_typeId, notification_userId },
          userId
        );

        let s5 = dbScript(db_sql["Q201"], {
          var1: budgetId,
          var2: timeline,
          var3: amount,
          var4: startDate,
          var5: endDate,
          var6: userId,
          var7: checkPermission.rows[0].company_id,
          var8: "Budget Finalized",
        });
        await connection.query(s5);

        await connection.query("COMMIT");
        res.json({
          status: 200,
          success: true,
          message: "Budget finalized successfully",
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

module.exports.marketingActivities = async (req, res) => {
  try {
    let userId = req.user.id;
    let s1 = dbScript(db_sql["Q41"], { var1: moduleName, var2: userId });
    let checkPermission = await connection.query(s1);
    if (checkPermission.rows[0].permission_to_view_own) {
      let s1 = dbScript(db_sql["Q476"], {
        var1: checkPermission.rows[0].company_id,
      });
      let marketingActivities = await connection.query(s1);
      if (marketingActivities.rowCount > 0) {
        res.json({
          status: 200,
          success: true,
          message: "Marketing activities list",
          data: marketingActivities.rows,
        });
      } else {
        res.json({
          status: 400,
          success: false,
          message: "No data found",
        });
      }
    }
    // let s1 = dbScript(db_sql["Q476"]);
    // let marketingActivities = await connection.query(s1);
    // if (marketingActivities.rowCount > 0) {
    //   res.json({
    //     status: 200,
    //     success: true,
    //     message: "Marketing activities list",
    //     data: marketingActivities,
    //   });
    // } else {
    //   res.json({
    //     status: 400,
    //     success: false,
    //     message: "No data found",
    //   });
    // }
  } catch (error) {
    res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};
