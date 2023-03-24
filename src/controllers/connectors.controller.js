const LinkedIn = require('node-linkedin')(process.env.LINKEDIN_CLIENT_ID, process.env.LINKEDIN_CLIENT_SECRET, process.env.REDIRECT_URL)
const connection = require('../database/connection');
const { dbScript, db_sql } = require('../utils/db_scripts');
const moduleName = process.env.DASHBOARD_MODULE

module.exports.connectorsList = async (req, res) => {
    try {
        let userId = req.user.id
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let s2 = dbScript(db_sql['Q317'], { var1: userId, var2: checkPermission.rows[0].company_id })
            let getConnectors = await connection.query(s2)
            let connectorsArr = []
            if (getConnectors.rowCount > 0) {
                getConnectors.rows.map(item => {
                    let connectoresObj = {}
                    connectoresObj.linkedIn = {
                        user_id: item.user_id,
                        company_id: item.company_id,
                        token: item.linked_in_token,
                        status: item.linked_in_status
                    }

                    connectoresObj.hubspot = {
                        user_id: item.user_id,
                        company_id: item.company_id,
                        token: item.hubspot_token,
                        status: item.hubspot_status
                    }

                    connectoresObj.salesForce = {
                        user_id: item.user_id,
                        company_id: item.company_id,
                        token: item.salesforce_token,
                        status: item.salesforce_status
                    }
                    connectorsArr.push(connectoresObj)

                })
                if (connectorsArr) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Connectors list",
                        data: connectorsArr[0]
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty Connectors list",
                        data: {}
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Connectors list",
                    data: {}
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
            message: error.message
        })
    }
}

module.exports.authUrl = async (req, res) => {
    try {
        let { provider } = req.query
        if (provider == 'linkedIn') {
            let scope = ['r_liteprofile', 'r_emailaddress'];
            const authUrl = LinkedIn.auth.authorize(scope, 'state');
            console.log(authUrl, "authUrl");
            res.json({
                status: 200,
                success: true,
                data: authUrl,
            })
        }
        if (provider == 'hubspot') {
            let scop = ['contacts', 'automation']
            const authUrl =
                'https://app.hubspot.com/oauth/authorize' +
                `?client_id=${process.env.HUBSPOT_CLIENT_ID}` +
                `&scope=${scop}` +
                `&redirect_uri=${process.env.REDIRECT_URL}`
            // ; +
            //     `&state=${encodeURIComponent(STATE)}`;

            // Redirect the user
            // res.redirect(authUrl);
            res.json({
                status: 200,
                success: true,
                data: authUrl,
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

module.exports.callback = async (req, res) => {
    try {
        let userId = req.user.id
        const { code, state, provider } = req.query;
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findUser = await connection.query(s1)
        if (findUser.rowCount > 0) {
            if (provider == 'linkedIn') {
                LinkedIn.auth.getAccessToken(code, state, async (err, results) => {
                    if (err) {
                        return res.json({
                            status: 400,
                            success: false,
                            message: err
                        })
                    }
                    const accessToken = results.access_token;
                    let s2 = dbScript(db_sql['Q317'], { var1: userId, var2: findUser.rows[0].company_id })
                    let getConnectors = await connection.query(s2)
                    if (getConnectors.rowCount == 0) {
                        let s3 = dbScript(db_sql['Q316'], { var1: userId, var2: findUser.rows[0].company_id, var3: accessToken, var4: true })
                        let storeAccessToken = await connection.query(s3)
                        if (storeAccessToken.rowCount > 0) {
                            res.json({
                                status: 200,
                                success: true,
                                message: "Token stored successfully"
                            })
                        } else {
                            res.json({
                                status: 400,
                                success: false,
                                message: "Something went wrong"
                            })
                        }
                    } else {
                        let _dt = new Date().toISOString()
                        let s4 = dbScript(db_sql['Q319'], { var1: accessToken, var2: true, var3: userId, var4: findUser.rows[0].company_id, var5: _dt })
                        let storeAccessToken = await connection.query(s4)
                        if (storeAccessToken.rowCount > 0) {
                            res.json({
                                status: 200,
                                success: true,
                                message: "Token updated successfully"
                            })
                        } else {
                            res.json({
                                status: 400,
                                success: false,
                                message: "Something went wrong"
                            })
                        }
                    }

                });
            }
            if (provider == 'hubspot') {

                // let s3 = dbScript(db_sql['Q320'], { var1: userId, var2: findUser.rows[0].company_id, var3: accessToken, var4: true })
                // let storeAccessToken = await connection.query(s3)
                // if (storeAccessToken.rowCount > 0) {
                //     res.json({
                //         status: 200,
                //         success: true,
                //         message: "Token stored successfully"
                //     })
                // } else {
                //     res.json({
                //         status: 400,
                //         success: false,
                //         message: "Something went wrong"
                //     })
                // }
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong"
                })
            }
            if(provider == 'salesforce'){
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
                message: "Invalid user",
            })
        }
    } catch (error) {
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
};

// module.exports.hubspotAuthUrl = async (req, res) => {

// }


module.exports.searchLead = async (req, res) => {
    try {

        let s1 = dbScript(db_sql['Q318'], {})
        let findAccessToken = await connection.query(s1)

        if (findAccessToken.rowCount > 0) {
            console.log(findAccessToken.rows[0].linked_in_token, "findAccessToken.rows[0].linked_in_token");

            const linkedInClient = LinkedIn.init(findAccessToken.rows[0].linked_in_token);
            console.log("linkedInClient");
            linkedInClient.people.id('221992206', function (err, result) {
                console.log(result, err);
                if (err) {
                    console.log(err);
                }
                console.log(result, "result22222222");
            })
            console.log("yyyyyyy");
        } else {
            res.json({
                status: 200,
                success: false,
                message: "Not found",
            })
        }
    } catch (error) {
        console.log(error, "error");
        res.json({
            status: 400,
            success: false,
            message: error.message,
        })
    }
}