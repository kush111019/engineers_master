const connection = require("../database/connection");
// const uuid = require("node-uuid");
const { issueJWT } = require("../utils/jwt");
const { resetPasswordMail, resetPasswordMail2 } = require("../utils/sendMail");
const { db_sql, dbScript } = require("../utils/db_scripts");
const {
  mysql_real_escape_string,
  tranformAvailabilityArray,
  convertToLocal,
  convertToTimezone,
  paginatedResults,
  verifyTokenFn,
  reduceArrayWithName1,
} = require("../utils/helper");
const stripe = require("stripe")(process.env.SECRET_KEY);
const { daysEnum } = require("../utils/notificationEnum");


module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let s1 = dbScript(db_sql["Q88"], { var1: email });
    let admin = await connection.query(s1);
    if (admin.rows.length > 0) {
      if (admin.rows[0].encrypted_password == password) {
        let jwtToken = await issueJWT(admin.rows[0]);
        res.send({
          status: 200,
          success: true,
          message: "Login successfull",
          data: {
            token: jwtToken,
          },
        });
      } else {
        res.json({
          status: 400,
          success: false,
          message: "Incorrect Password",
        });
      }
    } else {
      res.json({
        status: 400,
        success: false,
        message: "Super Admin not found",
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

module.exports.showProfile = async (req, res) => {
  try {
    let sAEmail = req.user.email;
    let s1 = dbScript(db_sql["Q88"], { var1: sAEmail });
    let checkSuperAdmin = await connection.query(s1);
    if (checkSuperAdmin.rowCount > 0) {
      let admin = {
        id: checkSuperAdmin.rows[0].id,
        name: checkSuperAdmin.rows[0].name,
        email: checkSuperAdmin.rows[0].email,
      };
      res.json({
        status: 200,
        success: true,
        message: "Super admin data",
        data: admin,
      });
    } else {
      res.json({
        status: 400,
        success: false,
        message: "Super admin not found",
        data: "",
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

module.exports.forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    let s1 = dbScript(db_sql["Q88"], { var1: email });
    let findSuperAdmin = await connection.query(s1);
    if (findSuperAdmin.rowCount > 0) {
      const payload = {
        id: findSuperAdmin.rows[0].id,
        email: findSuperAdmin.rows[0].email,
      };
      let token = await issueJWT(payload);
      let link = `${process.env.AUTH_LINK}/reset-password/${token}`;
      if (process.env.isLocalEmail == "true") {
        await resetPasswordMail2(email, link, findSuperAdmin.rows[0].name);
        res.json({
          status: 200,
          success: true,
          message: "New link sent to your email address",
        });
      } else {
        let emailSend = await resetPasswordMail(
          email,
          link,
          findSuperAdmin.rows[0].name
        );
        if (emailSend.status == 400) {
          res.json({
            status: 400,
            success: false,
            message: "Something went wrong",
          });
        } else {
          res.json({
            status: 200,
            success: true,
            message: "New link sent to your email address",
          });
        }
      }
    } else {
      res.json({
        status: 400,
        success: false,
        message: "Super admin is not exits",
        data: "",
      });
    }
  } catch (error) {
    res.json({
      status: 400,
      success: false,
      message: error.message,
      data: "",
    });
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
    let { password } = req.body;
    await connection.query("BEGIN");
    let superAdmin = await verifyTokenFn(req);
    if (superAdmin) {
      let s1 = dbScript(db_sql["Q88"], { var1: superAdmin.email });
      let checksuperAdmin = await connection.query(s1);
      if (checksuperAdmin.rowCount > 0) {
        let s2 = dbScript(db_sql["Q90"], {
          var1: superAdmin.email,
          var2: password,
        });
        let updatesuperAdmin = await connection.query(s2);
        if (updatesuperAdmin.rowCount == 1) {
          await connection.query("COMMIT");
          res.json({
            status: 200,
            success: true,
            message: "Password changed successfully",
            data: "",
          });
        } else {
          await connection.query("ROLLBACK");
          res.json({
            status: 400,
            success: false,
            message: "Something went wrong",
            data: "",
          });
        }
      } else {
        res.json({
          status: 400,
          success: false,
          message: "superAdmin not found",
          data: "",
        });
      }
    } else {
      res.json({
        status: 400,
        success: false,
        message: "Token not found",
      });
    }
  } catch (error) {
    await connection.query("ROLLBACK");
    res.json({
      status: 400,
      success: false,
      message: error.message,
      data: "",
    });
  }
};

module.exports.companiesList = async (req, res) => {
  try {
    let s2 = dbScript(db_sql["Q89"], {});
    let findCompanies = await connection.query(s2);
    if (findCompanies.rowCount > 0) {
      res.json({
        status: 200,
        success: true,
        message: "Companies List",
        data: findCompanies.rows,
      });
    } else {
      res.json({
        status: 200,
        success: true,
        message: "Empty Company list",
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

module.exports.showUsersByCompanyId = async (req, res) => {
  try {
    let { companyId } = req.query;
    let s2 = dbScript(db_sql["Q15"], { var1: companyId });
    let findUser = await connection.query(s2);
    if (findUser.rowCount > 0) {
      let role;
      for (let userData of findUser.rows) {
        let s3 = dbScript(db_sql["Q12"], { var1: userData.role_id });
        role = await connection.query(s3);
        userData.roleName = role.rows[0].role_name;
      }
      if (role.rowCount > 0) {
        res.json({
          status: 200,
          success: true,
          message: "Company users list",
          data: findUser.rows,
        });
      } else {
        res.json({
          status: 200,
          success: true,
          message: "Empty company users list",
          data: [],
        });
      }
    } else {
      res.json({
        status: 200,
        success: true,
        message: "Something went wrong",
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

module.exports.userWiseCompanyRevenue = async (req, res) => {
  try {
    let { companyId, page, orderBy, startDate, endDate } = req.query;
    let limit = 10;
    let offset = (page - 1) * limit;
    if (
      (startDate != undefined || startDate != "") &&
      (endDate != undefined || endDate != "")
    ) {
      let s4 = dbScript(db_sql["Q80"], {
        var1: companyId,
        var2: limit,
        var3: offset,
        var4: startDate,
        var5: endDate,
      });
      let salesData = await connection.query(s4);
      let salesPerRep = [];
      if (salesData.rowCount > 0) {
        for (let sales of salesData.rows) {
          let revenuePerSales = {};
          revenuePerSales.sales_rep = sales.sales_rep;
          let s5 = dbScript(db_sql["Q256"], { var1: sales.sales_id });
          let recognizedRevenueData = await connection.query(s5);

          if (recognizedRevenueData.rowCount > 0) {
            revenuePerSales.revenue = recognizedRevenueData.rows[0].amount
              ? Number(recognizedRevenueData.rows[0].amount)
              : 0;
          } else {
            revenuePerSales.revenue = 0;
          }
          salesPerRep.push(revenuePerSales);
        }
        if (salesPerRep.length > 0) {
          let returnData = await reduceArrayWithName1(salesPerRep);
          if (orderBy.toLowerCase() == "asc") {
            returnData = returnData.sort((a, b) => {
              return a.revenue - b.revenue;
            });
          } else {
            returnData = returnData.sort((a, b) => {
              return b.revenue - a.revenue;
            });
          }
          res.json({
            status: 200,
            success: true,
            message: "Revenue per user",
            data: returnData,
          });
        } else {
          res.json({
            status: 200,
            success: true,
            message: "Empty revenue per user",
            data: salesPerRep,
          });
        }
      } else {
        res.json({
          status: 200,
          success: true,
          message: "Empty revenue per user",
          data: salesData.rows,
        });
      }
    } else {
      res.json({
        status: 400,
        success: false,
        message: "Start date and End date required",
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

module.exports.lockOrUnlockCompany = async (req, res) => {
  try {
    let { companyId, isLocked } = req.query;

    await connection.query("BEGIN");

    let _dt = new Date().toISOString();

    let s1 = dbScript(db_sql["Q224"], {
      var1: isLocked,
      var2: _dt,
      var3: companyId,
    });
    let lockUnlockCompany = await connection.query(s1);

    let s2 = dbScript(db_sql["Q225"], {
      var1: isLocked,
      var2: companyId,
      var3: _dt,
    });
    let lockUnlockUsers = await connection.query(s2);

    if (lockUnlockCompany.rowCount > 0 && lockUnlockUsers.rowCount > 0) {
      let lock = isLocked == "true" ? "Locked" : "Unlocked";
      await connection.query("COMMIT");
      res.json({
        status: 200,
        success: true,
        message: `Company ${lock} successfully`,
      });
    } else {
      await connection.query("ROLLBACK");
      res.json({
        status: 400,
        success: false,
        message: "Something went wrong",
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

module.exports.dashboard = async (req, res) => {
  try {
    let { page, startDate, endDate, orderBy } = req.query;
    startDate = new Date(startDate);
    startDate.setHours(0, 0, 0, 0);
    let sDate = new Date(startDate).toISOString();
    endDate = new Date(endDate);
    endDate.setHours(23, 59, 59, 999);
    let eDate = new Date(endDate).toISOString();
    let s1 = dbScript(db_sql["Q145"], { var1: sDate, var2: eDate });
    let companyData = await connection.query(s1);
    if (companyData.rowCount > 0) {
      let revenueCommission = [];
      for (let comData of companyData.rows) {
        let targetAmount = 0;
        let commission = 0;
        let revenueCommissionObj = {};
        let s3 = dbScript(db_sql["Q146"], { var1: comData.id });
        let salesData = await connection.query(s3);
        let s4 = dbScript(db_sql["Q468"], { var1: comData.id });
        let salesArchive = await connection.query(s4);
        if (salesData.rowCount > 0) {
          for (let data of salesData.rows) {
            let s2 = dbScript(db_sql["Q161"], { var1: data.slab_id });
            let slab = await connection.query(s2);
            targetAmount = targetAmount + Number(data.amount);
            if (slab.rowCount > 0) {
              let remainingAmount = Number(data.amount);
              let amount = 0;
              //if remainning amount is 0 then no reason to check
              for (
                let i = 0;
                i < slab.rows.length && remainingAmount > 0;
                i++
              ) {
                let slab_percentage = Number(slab.rows[i].percentage);
                let slab_maxAmount = Number(slab.rows[i].max_amount);
                let slab_minAmount = Number(slab.rows[i].min_amount);
                if (slab.rows[i].is_max) {
                  // Reached the last slab
                  amount += (slab_percentage / 100) * remainingAmount;
                  break;
                } else {
                  // This is not the last slab
                  let diff = slab_minAmount == 0 ? 0 : 1;
                  let slab_diff = slab_maxAmount - slab_minAmount + diff;
                  slab_diff =
                    slab_diff > remainingAmount ? remainingAmount : slab_diff;
                  amount += (slab_percentage / 100) * slab_diff;
                  remainingAmount -= slab_diff;
                  if (remainingAmount <= 0) {
                    break;
                  }
                }
              }
              commission = commission + amount;
            }
          }
          if (salesArchive && salesArchive.rows && salesArchive.rows[0]) {
            let archivedAmount = Number(
              salesArchive.rows[0].amount.replaceAll(",", "")
            );
            targetAmount = targetAmount + archivedAmount;
          }
          revenueCommissionObj.name = comData.company_name;
          revenueCommissionObj.revenue = Number(targetAmount);
          revenueCommissionObj.commission = Number(commission);
          revenueCommissionObj.date = comData.created_at;
          revenueCommission.push(revenueCommissionObj);
        }
      }
      if (revenueCommission.length > 0) {
        let paginatedArr = await paginatedResults(revenueCommission, page);
        if (orderBy.toLowerCase() == "asc") {
          paginatedArr = paginatedArr.sort((a, b) => {
            return a.revenue - b.revenue;
          });
        } else {
          paginatedArr = paginatedArr.sort((a, b) => {
            return b.revenue - a.revenue;
          });
        }
        res.json({
          status: 200,
          success: true,
          message: "total revenue and total commission",
          data: paginatedArr,
        });
      } else {
        res.json({
          status: 200,
          success: true,
          message: "Empty total revenue and total commission",
          data: [],
        });
      }
    } else {
      if (companyData.rows.length == 0) {
        res.json({
          status: 200,
          success: true,
          message: "Empty total revenue and total commission",
          data: [],
        });
      } else {
        res.json({
          status: 400,
          success: false,
          message: "Something went wrong",
        });
      }
    }
  } catch (error) {
    res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.totalExpectedRevenueCounts = async (req, res) => {
  try {
    let s1 = dbScript(db_sql["Q89"], {});
    let companyData = await connection.query(s1);
    if (companyData.rowCount > 0) {
      let expectedRevenue = 0;
      let expectedCommission = 0;
      let totalRevenue = 0;
      let totalCommission = 0;

      for (let comData of companyData.rows) {
        let s3 = dbScript(db_sql["Q144"], { var1: comData.id });
        let salesData = await connection.query(s3);

        let totalExpectedRevenue = 0;
        let totalExpectedCommission = 0;
        let totalClosedRevenue = 0;
        let totalClosedCommission = 0;

        if (salesData.rowCount > 0) {
          for (let data of salesData.rows) {
            let s2 = dbScript(db_sql["Q161"], { var1: data.slab_id });
            let slab = await connection.query(s2);

            if (data.closed_at == null) {
              totalExpectedRevenue =
                Number(totalExpectedRevenue) + Number(data.amount);
              let expectedRemainingAmount = Number(data.amount);
              let expectedCommission = 0;
              //if remainning amount is 0 then no reason to check
              for (
                let i = 0;
                i < slab.rows.length && expectedRemainingAmount > 0;
                i++
              ) {
                let slab_percentage = Number(slab.rows[i].percentage);
                let slab_maxAmount = Number(slab.rows[i].max_amount);
                let slab_minAmount = Number(slab.rows[i].min_amount);
                if (slab.rows[i].is_max) {
                  // Reached the last slab
                  expectedCommission +=
                    (slab_percentage / 100) * expectedRemainingAmount;
                  break;
                } else {
                  // This is not the last slab
                  let diff = slab_minAmount == 0 ? 0 : 1;
                  let slab_diff = slab_maxAmount - slab_minAmount + diff;
                  slab_diff =
                    slab_diff > expectedRemainingAmount
                      ? expectedRemainingAmount
                      : slab_diff;
                  expectedCommission += (slab_percentage / 100) * slab_diff;
                  expectedRemainingAmount -= slab_diff;
                  if (expectedRemainingAmount <= 0) {
                    break;
                  }
                }
              }
              totalExpectedCommission =
                totalExpectedCommission + expectedCommission;
            } else {
              totalClosedRevenue =
                Number(totalClosedRevenue.toFixed(2)) + Number(data.amount);

              let remainingAmount = Number(data.amount);
              let commission = 0;
              //if remainning amount is 0 then no reason to check
              for (
                let i = 0;
                i < slab.rows.length && remainingAmount > 0;
                i++
              ) {
                let slab_percentage = Number(slab.rows[i].percentage);
                let slab_maxAmount = Number(slab.rows[i].max_amount);
                let slab_minAmount = Number(slab.rows[i].min_amount);
                if (slab.rows[i].is_max) {
                  // Reached the last slab
                  commission += (slab_percentage / 100) * remainingAmount;
                  break;
                } else {
                  // This is not the last slab
                  let diff = slab_minAmount == 0 ? 0 : 1;
                  let slab_diff = slab_maxAmount - slab_minAmount + diff;
                  slab_diff =
                    slab_diff > remainingAmount ? remainingAmount : slab_diff;
                  commission += (slab_percentage / 100) * slab_diff;
                  remainingAmount -= slab_diff;
                  if (remainingAmount <= 0) {
                    break;
                  }
                }
              }
              totalClosedCommission = totalClosedCommission + commission;
            }
          }
          totalExpectedRevenue = totalExpectedRevenue + totalClosedRevenue;
          totalExpectedCommission =
            totalExpectedCommission + totalClosedCommission;
          totalClosedRevenue = Number(totalClosedRevenue.toFixed(2));
          totalClosedCommission = Number(totalClosedCommission.toFixed(2));
        } else {
          totalExpectedRevenue = 0;
          totalExpectedCommission = 0;
          totalClosedRevenue = 0;
          totalClosedCommission = 0;
        }
        expectedRevenue = expectedRevenue + totalExpectedRevenue;
        expectedCommission = expectedCommission + totalExpectedCommission;
        totalRevenue = totalRevenue + totalClosedRevenue;
        totalCommission = totalCommission + totalClosedCommission;
      }

      res.json({
        status: 200,
        success: true,
        message: "Revenue and total commission",
        data: {
          totalRevenue: totalRevenue,
          totalCommission: totalCommission,
          expectedRevenue: expectedRevenue,
          expectedCommission: expectedCommission,
        },
      });
    } else {
      if (companyData.rows.length == 0) {
        res.json({
          status: 200,
          success: true,
          message: "Empty total revenue and total commission",
          data: {
            totalRevenue: 0,
            totalCommission: 0,
            expectedRevenue: 0,
            expectedCommission: 0,
          },
        });
      } else {
        res.json({
          status: 400,
          success: false,
          message: "Something went wrong",
        });
      }
    }
  } catch (error) {
    res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

//----------------------------------Stripe Plans-------------------------------------

module.exports.addPlan = async (req, res) => {
  try {
    let {
      name,
      type,
      adminAmount,
      userAmount,
      proUserAmount,
      description,
      currency,
    } = req.body;
    let sAEmail = req.user.email;
    await connection.query("BEGIN");
    let s1 = dbScript(db_sql["Q88"], { var1: sAEmail });
    let checkSuperAdmin = await connection.query(s1);
    if (checkSuperAdmin.rowCount > 0) {
      const product = await stripe.products.create({
        name: name,
        description: description,
      });

      const price1 = await stripe.prices.create({
        nickname: "For Admin",
        product: product.id,
        unit_amount: adminAmount * 100,
        currency: currency,
        recurring: { interval: type },
      });

      const price2 = await stripe.prices.create({
        nickname: "For Users",
        product: product.id,
        unit_amount: userAmount * 100,
        currency: currency,
        recurring: { interval: type },
      });

      const price3 = await stripe.prices.create({
        nickname: "For Pro Users",
        product: product.id,
        unit_amount: proUserAmount * 100,
        currency: currency,
        recurring: { interval: type },
      });

      let s2 = dbScript(db_sql["Q91"], {
        var1: product.id,
        var2: product.name,
        var3: product.description,
        var4: product.active,
        var5: price1.id,
        var6: price1.unit_amount,
        var7: price2.id,
        var8: price2.unit_amount,
        var9: price3.id,
        var10: price3.unit_amount,
        var11: price1.recurring.interval,
        var12: price1.currency,
      });
      let addPlan = await connection.query(s2);
      if (addPlan.rowCount > 0) {
        await connection.query("COMMIT");
        res.json({
          status: 200,
          success: true,
          message: "Plan added successfully",
          data: "",
        });
      } else {
        await connection.query("ROLLBACK");
        res.json({
          status: 400,
          success: false,
          message: "Something went wrong",
          data: "",
        });
      }
    } else {
      res.json({
        status: 400,
        success: false,
        message: "Super Admin not found",
        data: "",
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

module.exports.plansList = async (req, res) => {
  try {
    let s2 = await dbScript(db_sql["Q98"], {});
    let planData = await connection.query(s2);
    if (planData.rowCount > 0) {
      res.json({
        status: 200,
        success: true,
        message: "Plans list",
        data: planData.rows,
      });
    } else {
      if (planData.rows.length == 0) {
        res.json({
          status: 200,
          success: true,
          message: "Empty Plans list",
          data: [],
        });
      } else {
        res.json({
          status: 400,
          success: false,
          message: "Something went wrong",
          data: "",
        });
      }
    }
  } catch (error) {
    res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.updatePlan = async (req, res) => {
  try {
    let { planId, name, description } = req.body;
    let sAEmail = req.user.email;
    await connection.query("BEGIN");
    let s1 = dbScript(db_sql["Q88"], { var1: sAEmail });
    let checkSuperAdmin = await connection.query(s1);
    if (checkSuperAdmin.rowCount > 0) {
      let s2 = dbScript(db_sql["Q93"], { var1: planId });
      let planData = await connection.query(s2);
      if (planData.rowCount > 0) {
        const product = await stripe.products.update(
          planData.rows[0].product_id,
          {
            name: name,
            description: description,
          }
        );

        let _dt = new Date().toISOString();

        let s3 = dbScript(db_sql["Q94"], {
          var1: product.name,
          var2: product.description,
          var3: _dt,
          var4: planId,
        });
        let updatePlan = await connection.query(s3);
        if (updatePlan.rowCount > 0) {
          await connection.query("COMMIT");
          res.json({
            status: 200,
            success: true,
            message: "Plan updated successfully",
          });
        } else {
          await connection.query("ROLLBACK");
          res.json({
            status: 400,
            success: false,
            message: "Something went wrong",
            data: "",
          });
        }
      } else {
        res.json({
          status: 400,
          success: false,
          message: "Plan not found",
          data: "",
        });
      }
    } else {
      res.json({
        status: 400,
        success: false,
        message: "Super Admin not found",
        data: "",
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

module.exports.activateOrDeactivatePlan = async (req, res) => {
  try {
    let { planId, activeStatus } = req.body;
    let sAEmail = req.user.email;
    await connection.query("BEGIN");
    let s1 = dbScript(db_sql["Q88"], { var1: sAEmail });
    let checkSuperAdmin = await connection.query(s1);
    if (checkSuperAdmin.rowCount > 0) {
      let s2 = dbScript(db_sql["Q93"], { var1: planId });
      let planData = await connection.query(s2);
      if (planData.rowCount > 0) {
        const product = await stripe.products.update(
          planData.rows[0].product_id,
          {
            active: activeStatus,
          }
        );

        let _dt = new Date().toISOString();
        let s3 = dbScript(db_sql["Q95"], {
          var1: product.active,
          var2: _dt,
          var3: planId,
        });
        let updatePlan = await connection.query(s3);
        if (updatePlan.rowCount > 0) {
          await connection.query("COMMIT");
          let update = activeStatus == true ? "activated" : "deactivated";
          res.json({
            status: 200,
            success: true,
            message: `Plan ${update} successfully`,
          });
        } else {
          await connection.query("ROLLBACK");
          res.json({
            status: 400,
            success: false,
            message: "Something went wrong",
            data: "",
          });
        }
      } else {
        res.json({
          status: 400,
          success: false,
          message: "Plan not found",
          data: "",
        });
      }
    } else {
      res.json({
        status: 400,
        success: false,
        message: "Super Admin not found",
        data: "",
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

//---------------------------------config----------------------------------------

module.exports.addConfig = async (req, res) => {
  try {
    let { trialDays, trialUsers } = req.body;
    let sAEmail = req.user.email;

    await connection.query("BEGIN");
    let s1 = dbScript(db_sql["Q88"], { var1: sAEmail });
    let checkSuperAdmin = await connection.query(s1);
    if (checkSuperAdmin.rowCount > 0) {
      let s2 = dbScript(db_sql["Q100"], { var1: trialDays, var2: trialUsers });
      let addConfig = await connection.query(s2);
      if (addConfig.rowCount > 0) {
        await connection.query("COMMIT");
        res.json({
          status: 201,
          success: true,
          message: "config added successfully",
          data: "",
        });
      } else {
        res.json({
          status: 400,
          success: false,
          message: "Something went wrong",
          data: "",
        });
      }
    } else {
      res.json({
        status: 400,
        success: false,
        message: "Super Admin not found",
        data: "",
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

module.exports.configList = async (req, res) => {
  try {
    let sAEmail = req.user.email;
    let s1 = dbScript(db_sql["Q88"], { var1: sAEmail });
    let checkSuperAdmin = await connection.query(s1);
    if (checkSuperAdmin.rowCount > 0) {
      let s2 = dbScript(db_sql["Q101"], {});
      let configList = await connection.query(s2);

      if (configList.rowCount > 0) {
        res.json({
          status: 200,
          success: true,
          message: "Config list",
          data: configList.rows,
        });
      } else {
        if (configList.rows.length == 0) {
          res.json({
            status: 200,
            success: false,
            message: "Empty Config list",
            data: [],
          });
        } else {
          res.json({
            status: 400,
            success: false,
            message: "Something went wrong",
            data: "",
          });
        }
      }
    } else {
      res.json({
        status: 400,
        success: false,
        message: "Super Admin not found",
        data: "",
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

//-----------------------------------------------------------------------------------

module.exports.allTrialAndSubcribedCompaniesList = async (req, res) => {
  try {
    let s1 = dbScript(db_sql["Q89"], {});
    let companies = await connection.query(s1);
    let s2 = dbScript(db_sql["Q101"], {});
    let configList = await connection.query(s2);
    if (companies.rowCount > 0) {
      let subcribedCompanies = [];
      let trialCompanies = [];
      for (let companyData of companies.rows) {
        let s3 = dbScript(db_sql["Q140"], { var1: companyData.id });
        let actualUserCount = await connection.query(s3);
        let s4 = dbScript(db_sql["Q97"], { var1: companyData.id });
        let transactions = await connection.query(s4);
        if (transactions.rows.length > 0) {
          let expiryDate = new Date(transactions.rows[0].expiry_date * 1000);
          let s4 = dbScript(db_sql["Q93"], {
            var1: transactions.rows[0].plan_id,
          });
          let plan = await connection.query(s4);
          if (plan.rowCount > 0) {
            subcribedCompanies.push({
              companyId: companyData.id,
              companyName: companyData.company_name,
              companyAddress: companyData.company_address,
              companyLogo: companyData.company_logo,
              isImapEnable: companyData.is_imap_enable,
              isMarketingEnable: companyData.is_marketing_enable,
              planName: plan.rows[0].name,
              planInterval: plan.rows[0].interval,
              PlanExpiryDate: expiryDate,
              maxUserCount: Number(transactions.rows[0].user_count) + 1,
              actualUserCount: actualUserCount.rows[0].actual_count,
              totalAmount: Number(transactions.rows[0].total_amount) / 100,
              isLocked: companyData.is_locked,
            });
          }
        } else {
          let expiryDate = new Date(companyData.expiry_date);
          // expiryDate.setDate(expiryDate.getDate() + Number(configList.rows[0].trial_days) )
          trialCompanies.push({
            companyId: companyData.id,
            companyName: companyData.company_name,
            companyAddress: companyData.company_address,
            companyLogo: companyData.company_logo,
            isImapEnable: companyData.is_imap_enable,
            isMarketingEnable: companyData.is_marketing_enable,
            planName: "Trial",
            planInterval: `${configList.rows[0].trial_days} days`,
            PlanExpiryDate: expiryDate,
            maxUserCount: companyData.user_count,
            actualUserCount: actualUserCount.rows[0].actual_count,
            totalAmount: 0,
            isLocked: companyData.is_locked,
          });
        }
      }
      if (subcribedCompanies.length > 0 && trialCompanies.length > 0) {
        res.json({
          status: 200,
          success: true,
          message: "Subscribed/Trial Companies List",
          data: {
            subcribedCompanies: subcribedCompanies,
            trialCompanies: trialCompanies,
          },
        });
      } else {
        res.json({
          status: 200,
          success: false,
          message: "Empty Subscribed/Trial Companies List",
          data: {
            subcribedCompanies: subcribedCompanies,
            trialCompanies: trialCompanies,
          },
        });
      }
    } else {
      res.json({
        status: 200,
        success: false,
        message: "Empty Companies list",
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

module.exports.trialCompaniesList = async (req, res) => {
  try {
    let s1 = dbScript(db_sql["Q89"], {});
    let companies = await connection.query(s1);
    let s2 = dbScript(db_sql["Q101"], {});
    let configList = await connection.query(s2);
    if (companies.rowCount > 0) {
      let trialCompanies = [];
      for (let companyData of companies.rows) {
        let s3 = dbScript(db_sql["Q140"], { var1: companyData.id });
        let actualUserCount = await connection.query(s3);
        let s4 = dbScript(db_sql["Q97"], { var1: companyData.id });
        let transactions = await connection.query(s4);
        if (transactions.rowCount == 0) {
          trialCompanies.push({
            companyId: companyData.id,
            companyName: companyData.company_name,
            companyAddress: companyData.company_address,
            companyLogo: companyData.company_logo,
            isImapEnable: companyData.is_imap_enable,
            isMarketingEnable: companyData.is_marketing_enable,
            planName: "Trial",
            planInterval: `${configList.rows[0].trial_days} days`,
            PlanExpiryDate: new Date(companyData.expiry_date),
            maxUserCount: companyData.user_count,
            actualUserCount: actualUserCount.rows[0].actual_count,
            totalAmount: 0,
            isLocked: companyData.is_locked,
          });
        }
      }
      if (trialCompanies.length > 0) {
        res.json({
          status: 200,
          success: true,
          message: "Trial companies List",
          data: trialCompanies,
        });
      } else {
        res.json({
          status: 200,
          success: false,
          message: "Empty trial companies list",
          data: [],
        });
      }
    } else {
      res.json({
        status: 200,
        success: false,
        message: "Empty Companies list",
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

module.exports.subcribedCompaniesList = async (req, res) => {
  try {
    let s1 = dbScript(db_sql["Q89"], {});
    let companies = await connection.query(s1);
    if (companies.rowCount > 0) {
      let subcribedCompanies = [];
      for (let companyData of companies.rows) {
        let s3 = dbScript(db_sql["Q140"], { var1: companyData.id });
        let actualUserCount = await connection.query(s3);
        let s4 = dbScript(db_sql["Q97"], { var1: companyData.id });
        let transactions = await connection.query(s4);
        if (transactions.rows.length > 0) {
          let expiryDate = new Date(transactions.rows[0].expiry_date * 1000);
          let s4 = dbScript(db_sql["Q93"], {
            var1: transactions.rows[0].plan_id,
          });
          let plan = await connection.query(s4);
          if (plan.rowCount > 0) {
            subcribedCompanies.push({
              companyId: companyData.id,
              companyName: companyData.company_name,
              companyAddress: companyData.company_address,
              companyLogo: companyData.company_logo,
              isImapEnable: companyData.is_imap_enable,
              isMarketingEnable: companyData.is_marketing_enable,
              planName: plan.rows[0].name,
              planInterval: plan.rows[0].interval,
              PlanExpiryDate: expiryDate,
              maxUserCount: Number(transactions.rows[0].user_count) + 1,
              actualUserCount: actualUserCount.rows[0].actual_count,
              totalAmount: Number(transactions.rows[0].total_amount) / 100,
              isLocked: companyData.is_locked,
            });
          }
        }
      }
      if (subcribedCompanies.length) {
        res.json({
          status: 200,
          success: true,
          message: "Subscribed Companies List",
          data: subcribedCompanies,
        });
      } else {
        res.json({
          status: 200,
          success: false,
          message: "Empty Subscribed Companies List",
          data: subcribedCompanies,
        });
      }
    } else {
      res.json({
        status: 200,
        success: false,
        message: "Empty Companies list",
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

module.exports.activeAndCanceledCompanies = async (req, res) => {
  try {
    let sAEmail = req.user.email;
    let s1 = dbScript(db_sql["Q88"], { var1: sAEmail });
    let checkSuperAdmin = await connection.query(s1);
    if (checkSuperAdmin.rowCount > 0) {
      let s2 = dbScript(db_sql["Q89"], {});
      let companies = await connection.query(s2);
      if (companies.rowCount > 0) {
        let activeCompanies = [];
        let canceledCompanies = [];
        for (let companyData of companies.rows) {
          let s3 = dbScript(db_sql["Q97"], { var1: companyData.id });
          let transaction = await connection.query(s3);
          if (transaction.rowCount > 0) {
            for (transactionData of transaction.rows) {
              if (transactionData.is_canceled === false) {
                activeCompanies.push({
                  companyId: companyData.id,
                  companyName: companyData.company_name,
                  companyAddress: companyData.company_address,
                  companyLogo: companyData.company_logo,
                  status: "active",
                  createdAt: companyData.created_at,
                  isLocked: companyData.is_locked,
                });
              } else if (transactionData.is_canceled === true) {
                canceledCompanies.push({
                  companyId: companyData.id,
                  companyName: companyData.company_name,
                  companyAddress: companyData.company_address,
                  companyLogo: companyData.company_logo,
                  status: "cancelled",
                  createdAt: companyData.created_at,
                  isLocked: companyData.is_locked,
                });
              }
            }
          }
        }
        if (activeCompanies.length > 0 || canceledCompanies.length > 0) {
          res.json({
            status: 200,
            success: true,
            message: "Active and canceled companies",
            data: {
              activeCompanies: activeCompanies,
              canceledCompanies: canceledCompanies,
            },
          });
        } else {
          res.json({
            status: 200,
            success: false,
            message: "Empty active and canceled companies",
            data: {
              activeCompanies: activeCompanies,
              canceledCompanies: canceledCompanies,
            },
          });
        }
      } else {
        res.json({
          status: 200,
          success: false,
          message: "Empty companies list",
          data: [],
        });
      }
    } else {
      res.json({
        status: 400,
        success: false,
        message: "Super Admin not found",
        data: "",
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

module.exports.planwiseCompaniesList = async (req, res) => {
  try {
    let { planId } = req.params;
    let sAEmail = req.user.email;
    let s1 = dbScript(db_sql["Q88"], { var1: sAEmail });
    let checkSuperAdmin = await connection.query(s1);
    if (checkSuperAdmin.rowCount > 0) {
      let s2 = dbScript(db_sql["Q104"], { var1: planId });
      let planDetails = await connection.query(s2);

      if (planDetails.rowCount > 0) {
        companiesArr = [];
        for (let planData of planDetails.rows) {
          let s3 = dbScript(db_sql["Q9"], { var1: planData.company_id });
          let companydetails = await connection.query(s3);
          if (companydetails.rowCount > 0) {
            companiesArr.push({
              companyId: companydetails.rows[0].id,
              companyName: companydetails.rows[0].company_name,
              companyLogo: companydetails.rows[0].company_logo,
              companyAddress: companydetails.rows[0].company_address,
            });
          }
        }
        if (companiesArr.length > 0) {
          res.json({
            status: 200,
            success: true,
            message: "Plan wise company details ",
            data: companiesArr,
          });
        } else {
          res.json({
            status: 200,
            success: false,
            message: "Empty plan wise company details ",
            data: companiesArr,
          });
        }
      } else {
        if (planDetails.rows.length == 0) {
          res.json({
            status: 200,
            success: false,
            message: "Not subscribed for this plan",
            data: "",
          });
        } else {
          res.json({
            status: 400,
            success: false,
            message: "Something went wrong",
          });
        }
      }
    } else {
      res.json({
        status: 400,
        success: false,
        message: "Super Admin not found",
        data: "",
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

module.exports.extendExpiryByCompanyId = async (req, res) => {
  try {
    let { companyId } = req.params;
    let { trialDays } = req.body;
    let sAEmail = req.user.email;
    await connection.query("BEGIN");
    let s1 = dbScript(db_sql["Q88"], { var1: sAEmail });
    let checkSuperAdmin = await connection.query(s1);
    if (checkSuperAdmin.rowCount > 0) {
      let s2 = dbScript(db_sql["Q15"], { var1: companyId });
      let companyExpiry = await connection.query(s2);
      let updateExpiry;
      for (let compannyData of companyExpiry.rows) {
        if (compannyData.is_admin == true) {
          let expiryDate = compannyData.expiry_date;
          let extendedExpiry = new Date(
            expiryDate.setDate(expiryDate.getDate() + trialDays)
          ).toISOString();

          let _dt = new Date().toISOString();
          let s3 = dbScript(db_sql["Q102"], {
            var1: extendedExpiry,
            var2: compannyData.id,
            var3: _dt,
          });
          updateExpiry = await connection.query(s3);
        }
      }
      if (updateExpiry.rowCount > 0) {
        await connection.query("COMMIT");
        res.json({
          status: 200,
          success: true,
          message: "Expiry date extended successfully ",
        });
      } else {
        await connection.query("ROLLBACK");
        res.json({
          status: 400,
          success: false,
          message: "something went wrong",
        });
      }
    } else {
      res.json({
        status: 400,
        success: false,
        message: "Super Admin not found",
        data: "",
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

//----------------------------------Enable/disable IMAP---------------------------------

module.exports.enableDisableImapService = async (req, res) => {
  try {
    let sAEmail = req.user.email;
    let { companyId, isImapEnable } = req.body;
    await connection.query("BEGIN");
    let s1 = dbScript(db_sql["Q88"], { var1: sAEmail });
    let checkSuperAdmin = await connection.query(s1);
    if (checkSuperAdmin.rowCount > 0) {
      let _dt = new Date().toISOString();
      let s2 = dbScript(db_sql["Q133"], {
        var1: isImapEnable,
        var2: _dt,
        var3: companyId,
      });
      let updateImapService = await connection.query(s2);

      if (updateImapService.rowCount > 0) {
        let enableOrDisable = isImapEnable == true ? "enabled" : "disabled";
        await connection.query("COMMIT");
        res.json({
          status: 200,
          success: true,
          message: `Imap service ${enableOrDisable}`,
          data: "",
        });
      } else {
        await connection.query("ROLLBACK");
        res.json({
          status: 400,
          success: false,
          message: "something went wrong",
          data: "",
        });
      }
    } else {
      res.json({
        status: 400,
        success: false,
        message: "Super Admin not found",
        data: "",
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

//--------------------------------Enable/disable Marketing----------------------------

module.exports.enableDisableMarketingService = async (req, res) => {
  try {
    let sAEmail = req.user.email;
    let { companyId, isMarketingEnable } = req.body;
    await connection.query("BEGIN");
    let s1 = dbScript(db_sql["Q88"], { var1: sAEmail });
    let checkSuperAdmin = await connection.query(s1);
    if (checkSuperAdmin.rowCount > 0) {
      let _dt = new Date().toISOString();
      let s2 = dbScript(db_sql["Q195"], {
        var1: isMarketingEnable,
        var2: _dt,
        var3: companyId,
      });
      let updateMarketingService = await connection.query(s2);

      if (updateMarketingService.rowCount > 0) {
        let enableOrDisable =
          isMarketingEnable == true ? "enabled" : "disabled";
        await connection.query("COMMIT");
        res.json({
          status: 200,
          success: true,
          message: `Marketing service ${enableOrDisable}`,
          data: "",
        });
      } else {
        await connection.query("ROLLBACK");
        res.json({
          status: 400,
          success: false,
          message: "something went wrong",
          data: "",
        });
      }
    } else {
      res.json({
        status: 400,
        success: false,
        message: "Super Admin not found",
        data: "",
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

//--------------------------------Contact us Mail List---------------------------------
module.exports.contactUsQueriesList = async (req, res) => {
  try {
    let s1 = dbScript(db_sql["Q163"], {});
    let queries = await connection.query(s1);
    if (queries.rowCount > 0) {
      res.json({
        status: 200,
        success: true,
        message: "Queries List",
        data: queries.rows,
      });
    } else {
      res.json({
        status: 200,
        success: false,
        message: "Empty Queries List",
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

//--------------------------------Events---------------------------------
module.exports.addAvailability = async (req, res) => {
  try {
    let { scheduleName, timezone, timeSlot } = req.body;
    await connection.query("BEGIN");
    let s2 = dbScript(db_sql["Q342"], {
      var1: mysql_real_escape_string(scheduleName),
      var2: timezone,
      var3: null,
      var4: null,
    });
    let createAvailability = await connection.query(s2);
    for (let ts of timeSlot) {
      let dayName = daysEnum[ts.day];
      if (ts.checked) {
        for (let subTs of ts.timeSlots) {
          const { utcStart, utcEnd } = await convertToLocal(
            subTs.startTime,
            subTs.endTime,
            timezone
          );
          // inseting time into pro_user_time_slot for the availability check
          let s3 = dbScript(db_sql["Q343"], {
            var1: dayName,
            var2: utcStart,
            var3: utcEnd,
            var4: createAvailability.rows[0].id,
            var5: null,
            var6: ts.checked,
            var7: null,
          });
          let addTimeSlot = await connection.query(s3);
        }
      } else {
        let s3 = dbScript(db_sql["Q343"], {
          var1: dayName,
          var2: "",
          var3: "",
          var4: createAvailability.rows[0].id,
          var5: null,
          var6: ts.checked,
          var7: null,
        });
        let addTimeSlot = await connection.query(s3);
      }
    }
    if (createAvailability.rowCount > 0) {
      await connection.query("COMMIT");
      res.json({
        status: 201,
        success: true,
        message: "Availability scheduled successfully",
        data: createAvailability.rows,
      });
    } else {
      await connection.query("ROLLBACK");
      res.json({
        status: 400,
        success: false,
        message: "Something went wrong",
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

module.exports.listAvailability = async (req, res) => {
  try {
    let s2 = dbScript(db_sql["Q344"], {
      var1: null,
      var2: null,
    });
    let availability = await connection.query(s2);
    if (availability.rowCount > 0) {
      for (let item of availability.rows) {
        // fetching data from pro_user_events for the availability using id
        let s3 = dbScript(db_sql["Q370"], { var1: item.id });
        let findAvailability = await connection.query(s3);
        if (findAvailability.rowCount > 0) {
          item.isAvailabilityAdded = true;
        } else {
          item.isAvailabilityAdded = false;
        }
      }
      let finalArray = await tranformAvailabilityArray(availability.rows);
      res.json({
        status: 200,
        success: true,
        message: "Availability List",
        data: finalArray,
      });
    } else {
      res.json({
        status: 200,
        success: false,
        message: "Empty Availability List",
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

module.exports.detailAvailability = async (req, res) => {
  try {
    let { availabilityId } = req.query;
    let s2 = dbScript(db_sql["Q351"], { var1: availabilityId });
    let availability = await connection.query(s2);
    if (availability.rowCount > 0) {
      //this function is coverting one form of array to different form of array according to need
      let finalArray = await tranformAvailabilityArray(availability.rows);
      for (let item of finalArray[0].time_slots) {
        for (let slot of item.time_slot) {
          // converting utc time to local time
          let { localStart, localEnd } = await convertToTimezone(
            slot.start_time,
            slot.end_time,
            availability.rows[0].timezone
          );

          slot.start_time = localStart;
          slot.end_time = localEnd;
        }
      }
      res.json({
        status: 200,
        success: true,
        message: "Availability Details",
        data: finalArray,
      });
    } else {
      res.json({
        status: 200,
        success: false,
        message: "No details found on this id",
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

module.exports.updateAvailability = async (req, res) => {
  try {
    let { scheduleName, timezone, timeSlots, availabilityId } = req.body;
    await connection.query("BEGIN");
    let _dt = new Date().toISOString();
    // updating the availbiliy of the pro user
    let s2 = dbScript(db_sql["Q352"], {
      var1: mysql_real_escape_string(scheduleName),
      var2: timezone,
      var3: availabilityId,
      var4: _dt,
    });
    let updateAvailability = await connection.query(s2);
    if (updateAvailability.rowCount > 0) {
      let s3 = dbScript(db_sql["Q355"], { var1: _dt, var2: availabilityId });
      let deleteTimeSlots = await connection.query(s3);
      for (let ts of timeSlots) {
        let dayName = daysEnum[ts.day];
        if (ts.checked) {
          for (let subTs of ts.timeSlot) {
            // converting local time to utc time
            const { utcStart, utcEnd } = await convertToLocal(
              subTs.startTime,
              subTs.endTime,
              timezone
            );
            let s3 = dbScript(db_sql["Q343"], {
              var1: dayName,
              var2: utcStart,
              var3: utcEnd,
              var4: availabilityId,
              var5: null,
              var6: ts.checked,
              var7: null,
            });
            let addTimeSlot = await connection.query(s3);
          }
        } else {
          let s3 = dbScript(db_sql["Q343"], {
            var1: dayName,
            var2: "",
            var3: "",
            var4: availabilityId,
            var5: null,
            var6: ts.checked,
            var7: null,
          });
          let addTimeSlot = await connection.query(s3);
        }
      }
      await connection.query("COMMIT");
      res.json({
        status: 200,
        success: true,
        message: "Availability Updated successfully",
      });
    } else {
      await connection.query("ROLLBACK");
      res.json({
        status: 400,
        success: false,
        message: "Something went wrong",
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

module.exports.deleteAvailability = async (req, res) => {
  try {
    let { availabilityId } = req.query;
    await connection.query("BEGIN");
    let _dt = new Date().toISOString();
    let s2 = dbScript(db_sql["Q354"], { var1: _dt, var2: availabilityId });
    let deleteAvailability = await connection.query(s2);
    if (deleteAvailability.rowCount > 0) {
      // updating pro user time slot for the availability
      let s3 = dbScript(db_sql["Q355"], { var1: _dt, var2: availabilityId });
      let deleteTimeSlots = await connection.query(s3);
      if (deleteTimeSlots.rowCount > 0) {
        await connection.query("COMMIT");
        res.json({
          status: 200,
          success: true,
          message: "Availability Deleted successfully",
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
  } catch (error) {
    res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.addEvents = async (req, res) => {
  try {
    let { eventName, meetLink, description, duration, availabilityId } =
      req.body;
    await connection.query("BEGIN");
    let s2 = dbScript(db_sql["Q345"], {
      var1: mysql_real_escape_string(eventName),
      var2: meetLink,
      var3: mysql_real_escape_string(description),
      var4: null,
      var5: null,
      var6: duration,
      var7: availabilityId,
    });
    let addEvent = await connection.query(s2);
    if (addEvent.rowCount > 0) {
      let eventUrl = `${process.env.PRO_EVENT_URL}/${addEvent.rows[0].id}`;
      let s3 = dbScript(db_sql["Q347"], {
        var1: eventUrl,
        var2: addEvent.rows[0].id,
      });
      let updateEventUrl = await connection.query(s3);
      if (updateEventUrl.rowCount > 0) {
        await connection.query("COMMIT");
        res.json({
          status: 201,
          success: true,
          message: "Event created successfully",
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
  } catch (error) {
    await connection.query("ROLLBACK");
    res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.listEvents = async (req, res) => {
  try {
    let s2 = dbScript(db_sql["Q346"], {
      var1: null,
      var2: null,
    });
    let eventList = await connection.query(s2);
    if (eventList.rowCount > 0) {
      for (let event of eventList.rows) {
        let s3 = dbScript(db_sql["Q369"], { var1: event.id });
        let findSchedule = await connection.query(s3);
        if (findSchedule.rowCount > 0) {
          event.isEventScheduled = true;
        } else {
          event.isEventScheduled = false;
        }
      }
      res.json({
        status: 200,
        success: true,
        data: eventList.rows,
      });
    } else {
      res.json({
        status: 200,
        success: false,
        message: "Empty event list",
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

module.exports.updateEvents = async (req, res) => {
  try {
    let {
      eventId,
      eventName,
      meetLink,
      description,
      duration,
      availabilityId,
    } = req.body;
    await connection.query("BEGIN");
    let _dt = new Date().toISOString();
    let s2 = dbScript(db_sql["Q357"], {
      var1: mysql_real_escape_string(eventName),
      var2: meetLink,
      var3: mysql_real_escape_string(description),
      var4: duration,
      var5: availabilityId,
      var6: eventId,
      var7: _dt,
    });
    let updateEvent = await connection.query(s2);
    if (updateEvent.rowCount > 0) {
      await connection.query("COMMIT");
      res.json({
        status: 200,
        success: true,
        message: "Event Updated successfully",
      });
    } else {
      await connection.query("ROLLBACK");
      res.json({
        status: 400,
        success: false,
        message: "Something went wrong",
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

module.exports.deleteEvents = async (req, res) => {
  try {
    let { eventId } = req.query;
    await connection.query("BEGIN");
    let _dt = new Date().toISOString();
    let s2 = dbScript(db_sql["Q358"], { var1: _dt, var2: eventId });
    let updateEvent = await connection.query(s2);
    if (updateEvent.rowCount > 0) {
      await connection.query("COMMIT");
      res.json({
        status: 200,
        success: true,
        message: "Event Deleted successfully",
      });
    } else {
      await connection.query("ROLLBACK");
      res.json({
        status: 400,
        success: false,
        message: "Something went wrong",
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

module.exports.scheduledEvents = async (req, res) => {
  try {
    let s2 = dbScript(db_sql["Q350"], {
      var1: null,
      var2: null,
    });
    let scheduleEvents = await connection.query(s2);
    for (let event of scheduleEvents.rows) {
      // converting utc time to local time
      let result = await convertToTimezone(
        event.start_time,
        event.end_time,
        event.timezone
      );
      event.start_time = result.localStart;
      event.end_time = result.localEnd;
      event.date = new Date(event.date).toLocaleString().split(" ")[0];
    }

    if (scheduleEvents.rowCount > 0) {
      res.json({
        status: 200,
        success: true,
        message: "Scheduled events list",
        data: scheduleEvents.rows,
      });
    } else {
      res.json({
        status: 200,
        success: false,
        message: "Empty Scheduled events list",
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
