const LinkedIn = require('node-linkedin')(process.env.LINKEDIN_CLIENT_ID, process.env.LINKEDIN_CLIENT_SECRET, process.env.REDIRECT_URL)
const hubspot = require('@hubspot/api-client')
const { Connection, OAuth2 } = require('jsforce');
const axios = require('axios');
const FormData = require('form-data');
const qs = require('qs');
const connection = require('../database/connection');
const { dbScript, db_sql } = require('../utils/db_scripts');
const { titleFn, sourceFn, industryFn, customerFnForHubspot,
    customerFnForsalesforce, leadFnForsalesforce, leadFnForHubspot } = require('../utils/connectors.utils')
const moduleName = process.env.DASHBOARD_MODULE
const salesModule = process.env.SALES_MODULE
const customerModule = process.env.CUSTOMERS_MODULE
const leadModule = process.env.LEADS_MODULE
const { mysql_real_escape_string, mysql_real_escape_string2, tranformAvailabilityArray, getIcalObjectInstance, convertToLocal, convertToTimezone, dateFormattor1, convertTimeToTargetedTz, paginatedResults, getParentUserList, getUserAndSubUser, calculateQuarters, getQuarterMonthsDates, calculateEOLProducts } = require('../utils/helper')
const { issueJWTForPro } = require("../utils/jwt");
const { leadEmail2, eventScheduleMail } = require("../utils/sendMail")
const nodemailer = require("nodemailer");
const { encrypt, decrypt } = require('../utils/crypto');
const { daysEnum } = require('../utils/notificationEnum')


//Sales Force auth client
const oauth2Client = new OAuth2({
    clientId: process.env.SALESFORCE_CONSUMER_KEY,
    clientSecret: process.env.SALESFORCE_CONSUMER_SECRET,
    redirectUri: process.env.REDIRECT_URL, // Your redirect URL
});

//Hubspot auth client
const hubspotClient = new hubspot.Client({ developerApiKey: process.env.HUBSPOT_API_KEY })

module.exports.proUserLogin = async (req, res) => {
    try {
        let { emailAddress, password } = req.body;
        let s1 = dbScript(db_sql['Q329'], { var1: mysql_real_escape_string(emailAddress) })
        let admin = await connection.query(s1)
        if (admin.rows.length > 0) {
            if (admin.rows[0].encrypted_password == password) {
                if (admin.rows[0].is_verified == true) {
                    if (admin.rows[0].is_locked == false) {
                        if (admin.rows[0].is_deactivated == false) {
                            let configuration = {}
                            configuration.id = admin.rows[0].config_id
                            configuration.currency = admin.rows[0].currency,
                                configuration.phoneFormat = admin.rows[0].phone_format,
                                configuration.dateFormat = admin.rows[0].date_format,
                                configuration.beforeClosingDays = (admin.rows[0].before_closing_days) ? admin.rows[0].before_closing_days : '',
                                configuration.afterClosingDays = (admin.rows[0].after_closing_days) ? admin.rows[0].after_closing_days : ''

                            let s2 = dbScript(db_sql['Q125'], { var1: admin.rows[0].id, var2: admin.rows[0].company_id })
                            let imapCreds = await connection.query(s2)
                            let isImapCred = (imapCreds.rowCount == 0) ? false : true

                            let moduleId = JSON.parse(admin.rows[0].module_ids)
                            let modulePemissions = []
                            for (let data of moduleId) {
                                let s3 = dbScript(db_sql['Q58'], { var1: data, var2: admin.rows[0].role_id })
                                let findModulePermissions = await connection.query(s3)
                                modulePemissions.push({
                                    moduleId: data,
                                    moduleName: findModulePermissions.rows[0].module_name,
                                    permissions: findModulePermissions.rows
                                })
                            }

                            let payload = {
                                id: admin.rows[0].id,
                                email: admin.rows[0].email_address,
                                isProUser: true
                            }
                            let jwtToken = await issueJWTForPro(payload);
                            let profileImage = admin.rows[0].avatar

                            res.send({
                                status: 200,
                                success: true,
                                message: "Login Successfull",
                                data: {
                                    token: jwtToken,
                                    id: admin.rows[0].id,
                                    name: admin.rows[0].full_name,
                                    isAdmin: admin.rows[0].is_admin,
                                    roleId: admin.rows[0].role_id,
                                    role: admin.rows[0].role_name,
                                    profileImage: profileImage,
                                    modulePermissions: modulePemissions,
                                    configuration: configuration,
                                    isImapCred: isImapCred,
                                    isImapEnable: admin.rows[0].is_imap_enable,
                                    isMarketingEnable: admin.rows[0].is_marketing_enable,
                                    expiryDate: (admin.rows[0].role_name == 'Admin') ? admin.rows[0].expiry_date : '',
                                    isMainAdmin: admin.rows[0].is_main_admin,
                                    companyName: admin.rows[0].company_name,
                                    companyLogo: admin.rows[0].company_logo
                                }
                            });
                        } else {
                            res.json({
                                status: 400,
                                success: false,
                                message: "deactivated user"
                            })
                        }
                    } else {
                        res.json({
                            status: 400,
                            success: false,
                            message: "Locked by super Admin/Plan Expired"
                        })
                    }
                } else {
                    res.json({
                        status: 400,
                        success: false,
                        message: "Please verify before login"
                    })
                }
            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "Incorrect password"
                })
            }
        } else {
            res.json({
                status: 400,
                success: false,
                message: "Invalid credentials Or Not a pro user"
            })
        }
    }
    catch (error) {
        res.json({
            status: 500,
            success: false,
            message: error.message
        })
    }
}

module.exports.showProfile = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let checkUser = await connection.query(s1)
        if (checkUser.rows.length > 0 && isProUser) {
            let s2 = dbScript(db_sql['Q9'], { var1: checkUser.rows[0].company_id })
            let companyData = await connection.query(s2)
            if (companyData.rowCount > 0) {
                checkUser.rows[0].companyName = companyData.rows[0].company_name
                checkUser.rows[0].companyAddress = companyData.rows[0].company_address
                checkUser.rows[0].companyLogo = companyData.rows[0].company_logo
                checkUser.rows[0].startDate = companyData.rows[0].quarter
            } else {
                checkUser.rows[0].companyName = ""
                checkUser.rows[0].companyAddress = ""
                checkUser.rows[0].companyLogo = ""
                checkUser.rows[0].startDate = ""
            }
            res.json({
                status: 200,
                success: true,
                message: 'User data',
                data: checkUser.rows[0]
            })
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

module.exports.changePassword = async (req, res) => {
    try {
        let userEmail = req.user.email
        let { isProUser } = req.user
        const { oldPassword, newPassword } = req.body;
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q4'], { var1: userEmail })
        let user = await connection.query(s1)
        if (user.rows.length > 0 && isProUser) {
            if (user.rows[0].encrypted_password == oldPassword) {

                let _dt = new Date().toISOString();
                let s2 = dbScript(db_sql['Q5'], { var1: user.rows[0].id, var2: newPassword, var3: _dt, var4: user.rows[0].company_id })
                let updatePass = await connection.query(s2)

                if (updatePass.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.send({
                        status: 201,
                        success: true,
                        message: "Password Changed Successfully!",
                    });
                } else {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: "Something went wrong"
                    })
                }

            } else {
                await connection.query('ROLLBACK')
                res.json({
                    status: 400,
                    success: false,
                    message: "Incorrect Old Password"
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "Unathorised"
            })
        }
    }
    catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 500,
            success: false,
            message: error.message
        })
    }
}

//get all user list of any company in that function 
module.exports.usersList = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user

        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rowCount > 0 && isProUser) {
            //check user's on the basis of company id
            let s4 = dbScript(db_sql['Q314'], { var1: findAdmin.rows[0].company_id, var2: false })
            findUsers = await connection.query(s4);

            if (findUsers.rows.length > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Users list',
                    data: findUsers.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty users list",
                    data: []
                })
            }
        } else {
            res.status(403).json({
                success: false,
                message: "Unauthorized",
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

module.exports.usersListForGlobalAndOwn = async (req, res) => {
    let userId = req.user.id
    let { isProUser } = req.user
    let s1 = dbScript(db_sql['Q41'], { var1: salesModule, var2: userId })
    let checkPermission = await connection.query(s1)
    if (checkPermission.rows[0].permission_to_view_global && isProUser) {
        let s2 = dbScript(db_sql['Q314'], { var1: checkPermission.rows[0].company_id, var2: false })
        findUsers = await connection.query(s2);

        if (findUsers.rows.length > 0) {
            res.json({
                status: 200,
                success: true,
                message: 'Users list',
                data: findUsers.rows
            })
        } else {
            res.json({
                status: 200,
                success: false,
                message: "Empty users list",
                data: []
            })
        }
    } else if (checkPermission.rows[0].permission_to_view_own && isProUser) {
        let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
        let s3 = dbScript(db_sql['Q417'], { var1: roleUsers.join(","), var2: false })
        findUsers = await connection.query(s3);

        if (findUsers.rows.length > 0) {
            res.json({
                status: 200,
                success: true,
                message: 'Users list',
                data: findUsers.rows
            })
        } else {
            res.json({
                status: 200,
                success: false,
                message: "Empty users list",
                data: []
            })
        }
    } else {
        res.status(403).json({
            success: false,
            message: "UnAthorised to see sales details"
        })
    }
}

module.exports.connectorsList = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q41'], { var1: moduleName, var2: userId })
        let findUser = await connection.query(s1)
        if (findUser.rowCount > 0 && isProUser) {
            let s2 = dbScript(db_sql['Q317'], { var1: userId, var2: findUser.rows[0].company_id })
            let getConnectors = await connection.query(s2)
            let connectorsArr = []
            if (getConnectors.rowCount > 0) {
                getConnectors.rows.map(item => {
                    let connectoresObj = {}
                    connectoresObj.linkedin = {
                        user_id: item.user_id,
                        company_id: item.company_id,
                        token: item.linked_in_token,
                        status: item.linked_in_status,
                        last_sync: item.linked_in_last_sync
                    }

                    connectoresObj.hubspot = {
                        user_id: item.user_id,
                        company_id: item.company_id,
                        token: item.hubspot_token,
                        status: item.hubspot_status,
                        last_sync: item.hubspot_last_sync
                    }
                    connectoresObj.salesForce = {
                        user_id: item.user_id,
                        company_id: item.company_id,
                        token: item.salesforce_token,
                        status: item.salesforce_status,
                        last_sync: item.salesforce_last_sync
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

        //AuthUrl for linkedin
        if (provider.toLowerCase() == 'linkedin') {
            let scope = ['r_liteprofile', 'r_emailaddress'];
            const authUrl = LinkedIn.auth.authorize(scope, 'state');
            res.json({
                status: 200,
                success: true,
                data: authUrl,
            })
        }

        //AuthUrl for hubspot
        if (provider.toLowerCase() == 'hubspot') {
            const scope = ['content']
            const authUrl = hubspotClient.oauth.getAuthorizationUrl(process.env.HUBSPOT_CLIENT_ID, process.env.REDIRECT_URL, scope)
            res.json({
                status: 200,
                success: true,
                data: authUrl,
            })
        }
        //AuthUrl for salesforce
        if (provider.toLowerCase() == 'salesforce') {
            const conn = new Connection({
                loginUrl: 'https://login.salesforce.com',
            });

            const authUrl = oauth2Client.getAuthorizationUrl({
                // scope: 'api', // The Salesforce API scope you want to access
                scope: 'api refresh_token',
                access_type: 'offline'
            });
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
        let { isProUser } = req.user
        const { code, state, provider } = req.query;
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findUser = await connection.query(s1)
        if (findUser.rowCount > 0 && isProUser) {
            if (provider.toLowerCase() == 'linkedin') {
                await connection.query('BEGIN')
                //generating access token using authorization code for linkedin
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
                            await connection.query('COMMIT')
                            res.json({
                                status: 200,
                                success: true,
                                message: "Token stored successfully"
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
                        let _dt = new Date().toISOString()
                        let s4 = dbScript(db_sql['Q319'], { var1: 'linked_in_token', var2: accessToken, var3: 'linked_in_status', var4: true, var5: _dt, var6: userId, var7: findUser.rows[0].company_id })
                        let storeAccessToken = await connection.query(s4)
                        if (storeAccessToken.rowCount > 0) {
                            await connection.query('COMMIT')
                            res.json({
                                status: 200,
                                success: true,
                                message: "Token updated successfully"
                            })
                        } else {
                            await connection.query('ROLLBACK')
                            res.json({
                                status: 400,
                                success: false,
                                message: "Something went wrong"
                            })
                        }
                    }
                });
            }
            if (provider.toLowerCase() == 'hubspot') {
                await connection.query('BEGIN')
                //generating access token using authorization code for hubspot
                let token = await hubspotClient.oauth.tokensApi.createToken(
                    'authorization_code',
                    code, // the code you received from the oauth flow
                    process.env.REDIRECT_URL,
                    process.env.HUBSPOT_CLIENT_ID,
                    process.env.HUBSPOT_CLIENT_SECRET,
                )
                const currentTimeStamp = new Date().getTime(); // current timestamp in milliseconds
                const newTimeStamp = currentTimeStamp + token.expiresIn;
                let expiry = new Date(newTimeStamp).toISOString()
                let s2 = dbScript(db_sql['Q317'], { var1: userId, var2: findUser.rows[0].company_id })
                let getConnectors = await connection.query(s2)
                if (getConnectors.rowCount == 0) {
                    //sotring the access token if not already stored
                    let s3 = dbScript(db_sql['Q323'], { var1: userId, var2: findUser.rows[0].company_id, var3: token.accessToken, var4: true, var5: token.refreshToken, var6: expiry })
                    let storeAccessToken = await connection.query(s3)
                    if (storeAccessToken.rowCount > 0) {
                        await connection.query('COMMIT')
                        res.json({
                            status: 200,
                            success: true,
                            message: "Token stored successfully"
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
                    //updating the access token if already stored
                    let _dt = new Date().toISOString()
                    let s4 = dbScript(db_sql['Q320'], { var1: token.accessToken, var2: true, var3: token.refreshToken, var4: expiry, var5: userId, var6: findUser.rows[0].company_id })
                    let storeAccessToken = await connection.query(s4)
                    if (storeAccessToken.rowCount > 0) {
                        await connection.query('COMMIT')
                        res.json({
                            status: 200,
                            success: true,
                            message: "Token updated successfully"
                        })
                    } else {
                        await connection.query('ROLLBACK')
                        res.json({
                            status: 400,
                            success: false,
                            message: "Something went wrong"
                        })
                    }
                }
            }
            if (provider.toLowerCase() == 'salesforce') {
                //generating access token using authorization code for salesforce
                await connection.query('BEGIN')
                const authorizationCode = code; // The code received from the redirect URL
                const data = new FormData();
                data.append('grant_type', 'authorization_code');
                data.append('client_id', process.env.SALESFORCE_CONSUMER_KEY);
                data.append('client_secret', process.env.SALESFORCE_CONSUMER_SECRET);
                data.append('redirect_uri', process.env.REDIRECT_URL);
                data.append('code', authorizationCode);

                axios.post('https://login.salesforce.com/services/oauth2/token', data, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                    .then(async (response) => {
                        const expiresIn = 7200; // Default expiration time for Salesforce access tokens
                        const issuedAt = new Date(parseInt(response.data.issued_at));
                        const expirationTime = new Date(issuedAt.getTime() + expiresIn * 1000).toISOString();

                        let s2 = dbScript(db_sql['Q317'], { var1: userId, var2: findUser.rows[0].company_id })
                        let getConnectors = await connection.query(s2)
                        if (getConnectors.rowCount == 0) {
                            //sotring the access token if not already stored
                            let s3 = dbScript(db_sql['Q321'], { var1: userId, var2: findUser.rows[0].company_id, var3: response.data.access_token, var4: true, var5: response.data.refresh_token, var6: expirationTime })
                            let storeAccessToken = await connection.query(s3)
                            if (storeAccessToken.rowCount > 0) {
                                await connection.query('COMMIT')
                                res.json({
                                    status: 200,
                                    success: true,
                                    message: "Token stored successfully"
                                })
                            } else {
                                await connection.query('ROLLABCK')
                                res.json({
                                    status: 400,
                                    success: false,
                                    message: "Something went wrong"
                                })
                            }
                        } else {
                            //updating the access token if already stored
                            let _dt = new Date().toISOString()
                            let s4 = dbScript(db_sql['Q325'], { var1: response.data.access_token, var2: true, var3: response.data.refresh_token, var4: expirationTime, var5: userId, var6: findUser.rows[0].company_id })
                            let storeAccessToken = await connection.query(s4)
                            if (storeAccessToken.rowCount > 0) {
                                await connection.query('COMMIT')
                                res.json({
                                    status: 200,
                                    success: true,
                                    message: "Token updated successfully"
                                })
                            } else {
                                await connection.query('ROLLBACK')
                                res.json({
                                    status: 400,
                                    success: false,
                                    message: "Something went wrong"
                                })
                            }
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                        console.error(error.response.data);
                    });
            }
        } else {
            await connection.query('ROLLBACK')
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
};

module.exports.searchLead = async () => {
    let s1 = dbScript(db_sql['Q318'], {})
    let findAccessToken = await connection.query(s1)
    if (findAccessToken.rowCount > 0) {
        for (let accessData of findAccessToken.rows) {
            if (accessData.salesforce_status) {
                await connection.query('BEGIN')
                try {
                    let curDate = new Date();
                    let expiryDate = new Date(accessData.salesforce_expiry)
                    let accessToken = ''
                    if (expiryDate < curDate) {
                        //if current date is greater than expiry date then we are generating the access token using refresh token
                        const data = qs.stringify({
                            'grant_type': 'refresh_token',
                            'client_id': process.env.SALESFORCE_CONSUMER_KEY,
                            'client_secret': process.env.SALESFORCE_CONSUMER_SECRET,
                            'redirect_uri': process.env.REDIRECT_URL,
                            'refresh_token': accessData.salesforce_refresh_token
                        });

                        const config = {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        };

                        axios.post('https://login.salesforce.com/services/oauth2/token', data, config)
                            .then(async (res) => {
                                const expiresIn = 7200; // Default expiration time for Salesforce access tokens
                                const issuedAt = new Date(parseInt(res.data.issued_at));
                                const expirationTime = new Date(issuedAt.getTime() + expiresIn * 1000).toISOString();

                                accessToken = res.data.access_token

                                let s4 = dbScript(db_sql['Q325'], { var1: res.data.access_token, var2: true, var3: accessData.salesforce_refresh_token, var4: expirationTime, var5: accessData.user_id, var6: accessData.company_id })
                                let storeAccessToken = await connection.query(s4)
                            })
                            .catch((err) => {
                                console.error('Authorization error:', err.message);
                            });
                    } else {
                        //if current date is less than expiry date then we are using the already existing access token
                        accessToken = accessData.salesforce_token
                    }

                    //using access token to fetch user data from salesforce
                    axios.get('https://login.salesforce.com/services/oauth2/userinfo', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    })
                        .then(response => {
                            //searching lead with given below query
                            const apiUrl = `${response.data.urls.custom_domain}` + `${process.env.SALESFORCE_API_VERSION}`;
                            const query = 'SELECT uniqueId__c,Name,Title,Company,Street,City,State,Country,Address,Phone,Email,Website,Description,LeadSource,Industry,LastModifiedDate,createdDate FROM Lead';
                            axios({
                                method: 'get',
                                url: `${apiUrl}query/?q=${query}`,
                                headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                },
                            })
                                .then(async (response) => {
                                    if (response.data.records.length > 0) {
                                        //finding lead stored in db if not already present then inserting very first time
                                        let s1 = dbScript(db_sql['Q308'], { var1: accessData.company_id })
                                        let findSyncLead = await connection.query(s1)
                                        //Initial insertion
                                        if (findSyncLead.rowCount == 0) {
                                            for (let data of response.data.records) {
                                                let titleId = await titleFn(data.Title, accessData.company_id)

                                                let sourceId = await sourceFn(data.LeadSource, accessData.company_id)

                                                let industryId = await industryFn(data.Industry, accessData.company_id)

                                                let customerId = await customerFnForsalesforce(data, accessData, industryId)


                                                let leads = await leadFnForsalesforce(titleId, sourceId, customerId, data, accessData, '')
                                            }
                                        } else {
                                            //if already exists then updating it
                                            for (let data of response.data.records) {
                                                if (new Date(accessData.salesforce_last_sync) < new Date(data.LastModifiedDate)) {
                                                    let titleId = await titleFn(data.Title, accessData.company_id)

                                                    let sourceId = await sourceFn(data.LeadSource, accessData.company_id)

                                                    let industryId = await industryFn(data.Industry, accessData.company_id)

                                                    let customerId = await customerFnForsalesforce(data, accessData, industryId)

                                                    let s10 = dbScript(db_sql['Q322'], { var1: data.uniqueId__c, var2: accessData.company_id })
                                                    let checkLead = await connection.query(s10)
                                                    if (checkLead.rowCount > 0) {
                                                        let leads = await leadFnForsalesforce(titleId, sourceId, customerId, data, accessData, checkLead.rows[0].id)
                                                    } else {
                                                        let leads = await leadFnForsalesforce(titleId, sourceId, customerId, data, accessData, '')
                                                    }
                                                } else {
                                                    let s10 = dbScript(db_sql['Q322'], { var1: data.uniqueId__c, var2: accessData.company_id })
                                                    let checkLead = await connection.query(s10)
                                                    if (checkLead.rowCount == 0) {
                                                        let titleId = await titleFn(data.Title, accessData.company_id)

                                                        let sourceId = await sourceFn(data.LeadSource, accessData.company_id)

                                                        let industryId = await industryFn(data.Industry, accessData.company_id)

                                                        let customerId = await customerFnForsalesforce(data, accessData, industryId)

                                                        let leads = await leadFnForsalesforce(titleId, sourceId, customerId, data, accessData, '')
                                                    }
                                                }
                                            }
                                        }
                                        let _dt = new Date().toISOString();
                                        let s12 = dbScript(db_sql['Q278'], { var1: _dt, var2: accessData.company_id })
                                        let updateStatusInCompany = await connection.query(s12)

                                        let s11 = dbScript(db_sql['Q324'], { var0: 'salesforce_last_sync', var1: _dt, var2: _dt, var3: accessData.user_id, var4: accessData.company_id })
                                        let updateLastSyncDate = await connection.query(s11)

                                        if (updateStatusInCompany.rowCount > 0) {
                                            await connection.query('COMMIT')
                                        } else {
                                            await connection.query('ROLLBACK')
                                        }
                                    }
                                })
                                .catch(async (error) => {
                                    console.log(error)
                                });
                        })
                        .catch(async (error) => {
                            console.log(error)
                        });
                } catch (error) {
                    console.log(error)
                }
            }
            //searching leads for hubspot
            if (accessData.hubspot_status) {
                await connection.query('BEGIN')
                try {
                    let curDate = new Date();
                    let expiryDate = new Date(accessData.hubspot_expiry)
                    let accessToken = ''
                    if (expiryDate < curDate) {
                        //if current date is greater than expiry date then we are generating the access token using refresh token
                        const hubspotClient = new hubspot.Client({ developerApiKey: process.env.HUBSPOT_API_KEY })
                        let token = await hubspotClient.oauth.tokensApi.createToken(
                            'refresh_token',
                            undefined,
                            undefined,
                            process.env.HUBSPOT_CLIENT_ID,
                            process.env.HUBSPOT_CLIENT_SECRET,
                            accessData.hubspot_refresh_token
                        )
                        accessToken = token.accessToken
                        const currentTimeStamp = new Date().getTime();
                        const newTimeStamp = currentTimeStamp + token.expiresIn * 1000;
                        let expiry = new Date(newTimeStamp).toISOString()

                        let s4 = dbScript(db_sql['Q320'], { var1: token.accessToken, var2: true, var3: token.refreshToken, var4: expiry, var5: accessData.user_id, var6: accessData.company_id })
                        let storeAccessToken = await connection.query(s4)

                    } else {
                        //if current date is less than expiry date then we are using the already existing access token
                        accessToken = accessData.hubspot_token
                    }
                    const hubspotClient = new hubspot.Client({ "accessToken": accessToken });

                    const limit = 10;
                    const after = undefined;
                    const properties = [
                        "email,firstname,lastname,phone,company,jobtitle,industry,address,revenue,website,originalsource"
                    ];
                    const propertiesWithHistory = undefined;
                    const associations = undefined;
                    const archived = false;
                    //getting apiResponse using above properties that we want
                    const apiResponse = await hubspotClient.crm.contacts.basicApi.getPage(limit, after, properties, propertiesWithHistory, associations, archived);
                    let leadsData = apiResponse.results
                    if (leadsData.length > 0) {
                        let s1 = dbScript(db_sql['Q308'], { var1: accessData.company_id })
                        let findSyncLead = await connection.query(s1)

                        if (findSyncLead.rowCount == 0) {
                            //Initial insertion
                            for (let data of leadsData) {

                                let titleId = await titleFn(data.properties.jobtitle, accessData.company_id)

                                let sourceId = await sourceFn('', accessData.company_id)

                                let industryId = await industryFn(data.properties.industry, accessData.company_id)

                                let customerId = await customerFnForHubspot(data, accessData, industryId)


                                let leadName = data.properties.firstname + ' ' + data.properties.lastname

                                let leads = await leadFnForHubspot(leadName, titleId, sourceId, customerId, data, accessData, '')
                            }
                        } else {
                            //updating if alreaddy exists
                            for (let data of leadsData) {
                                if (new Date(accessData.hubspot_last_sync) < new Date(data.updatedAt)) {

                                    let titleId = await titleFn(data.properties.jobtitle, accessData.company_id)

                                    let sourceId = await sourceFn('', accessData.company_id)

                                    let industryId = await industryFn(data.properties.industry, accessData.company_id)

                                    let customerId = await customerFnForHubspot(data, accessData, industryId)


                                    let leadName = data.properties.firstname + ' ' + data.properties.lastname

                                    let s10 = dbScript(db_sql['Q322'], { var1: data.id, var2: accessData.company_id })
                                    let checkLead = await connection.query(s10)
                                    if (checkLead.rowCount > 0) {
                                        let leads = await leadFnForHubspot(leadName, titleId, sourceId, customerId, data, accessData, checkLead.rows[0].id)
                                    }
                                    else {
                                        let leads = await leadFnForHubspot(leadName, titleId, sourceId, customerId, data, accessData, '')
                                    }
                                } else {
                                    let s10 = dbScript(db_sql['Q322'], { var1: data.id, var2: accessData.company_id })
                                    let checkLead = await connection.query(s10)
                                    if (checkLead.rowCount == 0) {

                                        let titleId = await titleFn(data.properties.jobtitle, accessData.company_id)

                                        let sourceId = await sourceFn('', accessData.company_id)

                                        let industryId = await industryFn(data.properties.industry, accessData.company_id)

                                        let customerId = await customerFnForHubspot(data, accessData, industryId)


                                        let leadName = data.properties.firstname + ' ' + data.properties.lastname

                                        let leads = await leadFnForHubspot(leadName, titleId, sourceId, customerId, data, accessData, '')
                                    }
                                }
                            }
                        }

                        let _dt = new Date().toISOString();
                        let s12 = dbScript(db_sql['Q278'], { var1: _dt, var2: accessData.company_id })
                        let updateStatusInCompany = await connection.query(s12)

                        let s11 = dbScript(db_sql['Q324'], { var0: 'hubspot_last_sync', var1: _dt, var2: _dt, var3: accessData.user_id, var4: accessData.company_id })
                        let updateLastSyncDate = await connection.query(s11)

                        if (updateStatusInCompany.rowCount > 0) {
                            await connection.query('COMMIT')
                        } else {
                            await connection.query('ROLLBACK')
                        }
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }
}
//to Re Synchronization the lead Data 
module.exports.leadReSync = async (req, res) => {
    let userId = req.user.id
    let { isProUser } = req.user
    const { provider } = req.query;
    let s1 = dbScript(db_sql['Q8'], { var1: userId })
    let findUser = await connection.query(s1)
    if (findUser.rowCount > 0 && isProUser) {
        let s2 = dbScript(db_sql['Q317'], { var1: userId, var2: findUser.rows[0].company_id })
        let getConnectors = await connection.query(s2)
        for (let accessData of getConnectors.rows) {
            if (provider.toLowerCase() == 'salesforce' && accessData.salesforce_status) {
                await connection.query('BEGIN')
                try {
                    let curDate = new Date();
                    let expiryDate = new Date(accessData.salesforce_expiry)
                    let accessToken = ''
                    if (expiryDate < curDate) {
                        ////if current date is greater than expiry date then we are generating the access token using refresh token
                        const data = qs.stringify({
                            'grant_type': 'refresh_token',
                            'client_id': process.env.SALESFORCE_CONSUMER_KEY,
                            'client_secret': process.env.SALESFORCE_CONSUMER_SECRET,
                            'redirect_uri': process.env.REDIRECT_URL,
                            'refresh_token': accessData.salesforce_refresh_token,
                            'scope': 'refresh_token offline_access' // add this line
                        });
                        const config = {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        };
                        axios.post('https://login.salesforce.com/services/oauth2/token', data, config)
                            .then(async (res) => {
                                const expiresIn = 7200; // Default expiration time for Salesforce access tokens
                                const issuedAt = new Date(parseInt(res.data.issued_at));
                                const expirationTime = new Date(issuedAt.getTime() + expiresIn * 1000).toISOString();

                                accessToken = res.data.access_token
                                let s4 = dbScript(db_sql['Q325'], { var1: res.data.access_token, var2: true, var3: accessData.salesforce_refresh_token, var4: expirationTime, var5: accessData.user_id, var6: accessData.company_id })
                                let storeAccessToken = await connection.query(s4)
                            })
                            .catch((err) => {
                                console.error('Authorization error:', err.message);
                            });
                    } else {
                        //if current date is less than expiry date then we are using the already existing access token
                        accessToken = accessData.salesforce_token
                    }
                    axios.get('https://login.salesforce.com/services/oauth2/userinfo', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    })
                        //re syncing the leads data using below query parameters
                        .then(response => {
                            const apiUrl = `${response.data.urls.custom_domain}` + `${process.env.SALESFORCE_API_VERSION}`;
                            const query = 'SELECT uniqueId__c,Name,Title,Company,Street,City,State,Country,Address,Phone,Email,Website,Description,LeadSource,Industry,LastModifiedDate,createdDate FROM Lead';
                            axios({
                                method: 'get',
                                url: `${apiUrl}query/?q=${query}`,
                                headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                },
                            })
                                .then(async (response) => {
                                    if (response.data.records.length > 0) {
                                        let s1 = dbScript(db_sql['Q308'], { var1: accessData.company_id })
                                        let findSyncLead = await connection.query(s1)
                                        //Initial insertion
                                        if (findSyncLead.rowCount == 0) {
                                            for (let data of response.data.records) {
                                                let titleId = await titleFn(data.Title, accessData.company_id)
                                                let sourceId = await sourceFn(data.LeadSource, accessData.company_id)
                                                let industryId = await industryFn(data.Industry, accessData.company_id)

                                                let customerId = await customerFnForsalesforce(data, accessData, industryId)


                                                let leads = await leadFnForsalesforce(titleId, sourceId, customerId, data, accessData, '')
                                            }
                                        } else {
                                            for (let data of response.data.records) {
                                                if (accessData.salesforce_last_sync !== null) {
                                                    if (new Date(accessData.salesforce_last_sync) < new Date(data.LastModifiedDate)) {
                                                        //checing if the last modification date is greater then last resync date if true then updating data
                                                        let titleId = await titleFn(data.Title, accessData.company_id)
                                                        let sourceId = await sourceFn(data.LeadSource, accessData.company_id)

                                                        let industryId = await industryFn(data.Industry, accessData.company_id)

                                                        let customerId = await customerFnForsalesforce(data, accessData, industryId)

                                                        let s10 = dbScript(db_sql['Q322'], { var1: data.uniqueId__c, var2: accessData.company_id })
                                                        let checkLead = await connection.query(s10)
                                                        if (checkLead.rowCount > 0) {
                                                            let leads = await leadFnForsalesforce(titleId, sourceId, customerId, data, accessData, checkLead.rows[0].id)
                                                        } else {
                                                            let leads = await leadFnForsalesforce(titleId, sourceId, customerId, data, accessData, '')
                                                        }
                                                    } else {
                                                        let s10 = dbScript(db_sql['Q322'], { var1: data.uniqueId__c, var2: accessData.company_id })
                                                        let checkLead = await connection.query(s10)
                                                        if (checkLead.rowCount == 0) {
                                                            let titleId = await titleFn(data.Title, accessData.company_id)

                                                            let sourceId = await sourceFn(data.LeadSource, accessData.company_id)

                                                            let industryId = await industryFn(data.Industry, accessData.company_id)

                                                            let customerId = await customerFnForsalesforce(data, accessData, industryId)

                                                            let leads = await leadFnForsalesforce(titleId, sourceId, customerId, data, accessData, '')
                                                        }
                                                    }
                                                } else {
                                                    let s10 = dbScript(db_sql['Q322'], { var1: data.uniqueId__c, var2: accessData.company_id })
                                                    let checkLead = await connection.query(s10)
                                                    if (checkLead.rowCount == 0) {
                                                        let titleId = await titleFn(data.Title, accessData.company_id)

                                                        let sourceId = await sourceFn(data.LeadSource, accessData.company_id)

                                                        let industryId = await industryFn(data.Industry, accessData.company_id)

                                                        let customerId = await customerFnForsalesforce(data, accessData, industryId)

                                                        let leads = await leadFnForsalesforce(titleId, sourceId, customerId, data, accessData, '')
                                                    }

                                                }
                                            }
                                        }
                                        let _dt = new Date().toISOString();
                                        let s12 = dbScript(db_sql['Q278'], { var1: _dt, var2: accessData.company_id })
                                        let updateStatusInCompany = await connection.query(s12)

                                        let s11 = dbScript(db_sql['Q324'], { var0: 'salesforce_last_sync', var1: _dt, var2: _dt, var3: accessData.user_id, var4: accessData.company_id })
                                        let updateLastSyncDate = await connection.query(s11)

                                        if (updateStatusInCompany.rowCount > 0) {
                                            await connection.query('COMMIT')
                                            res.json({
                                                status: 200,
                                                success: true,
                                                message: "Salesforce leads synced successfully"
                                            })
                                        } else {
                                            await connection.query('ROLLBACK')
                                            res.json({
                                                status: 400,
                                                success: false,
                                                message: "Something went wrong"
                                            })
                                        }
                                    }
                                })
                                .catch(async (error) => {
                                    await connection.query('ROLLBACK')
                                    res.json({
                                        status: 400,
                                        success: false,
                                        message: error.message
                                    })
                                });
                        })
                        .catch(async (error) => {
                            await connection.query('ROLLBACK')
                            res.json({
                                status: 400,
                                success: false,
                                message: error.message
                            })
                        });
                } catch (error) {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: error.message
                    })
                }
            }
            //for hubspot 
            if (provider.toLowerCase() == 'hubspot' && accessData.hubspot_status) {
                await connection.query('BEGIN')
                try {
                    let curDate = new Date();
                    let expiryDate = new Date(accessData.hubspot_expiry)
                    let accessToken = ''
                    if (expiryDate < curDate) {
                        //if current date is greater than expiry date then we are generating the access token using refresh token
                        const hubspotClient = new hubspot.Client({ developerApiKey: process.env.HUBSPOT_API_KEY })
                        let token = await hubspotClient.oauth.tokensApi.createToken(
                            'refresh_token',
                            undefined,
                            undefined,
                            process.env.HUBSPOT_CLIENT_ID,
                            process.env.HUBSPOT_CLIENT_SECRET,
                            accessData.hubspot_refresh_token
                        )
                        accessToken = token.accessToken
                        const currentTimeStamp = new Date().getTime();
                        const newTimeStamp = currentTimeStamp + token.expiresIn * 1000;
                        let expiry = new Date(newTimeStamp).toISOString()

                        let s4 = dbScript(db_sql['Q320'], { var1: token.accessToken, var2: true, var3: token.refreshToken, var4: expiry, var5: accessData.user_id, var6: accessData.company_id })
                        let storeAccessToken = await connection.query(s4)
                    } else {
                        //if current date is less than expiry date then we are using the already existing access token
                        accessToken = accessData.hubspot_token
                    }
                    const hubspotClient = new hubspot.Client({ "accessToken": accessToken });

                    const limit = 10;
                    const after = undefined;
                    const properties = [
                        "email,firstname,lastname,phone,company,jobtitle,industry,address,revenue,website,originalsource,createdate,lastmodifieddate"
                    ];
                    const propertiesWithHistory = undefined;
                    const associations = undefined;
                    const archived = false;
                    //getting api response with the help of query parameters provided in peoperties
                    const apiResponse = await hubspotClient.crm.contacts.basicApi.getPage(limit, after, properties, propertiesWithHistory, associations, archived);
                    let leadsData = apiResponse.results
                    if (leadsData.length > 0) {
                        let s1 = dbScript(db_sql['Q308'], { var1: accessData.company_id })
                        let findSyncLead = await connection.query(s1)

                        if (findSyncLead.rowCount == 0) {
                            //Initial insertion
                            for (let data of leadsData) {
                                let titleId = await titleFn(data.properties.jobtitle, accessData.company_id)

                                let sourceId = await sourceFn('', accessData.company_id)

                                let industryId = await industryFn(data.properties.industry, accessData.company_id)
                                let customerId = await customerFnForHubspot(data, accessData, industryId)


                                let leadName = data.properties.firstname + ' ' + data.properties.lastname

                                let leads = await leadFnForHubspot(leadName, titleId, sourceId, customerId, data, accessData, '')
                            }
                        } else {
                            //if first time is inserted then updating it
                            for (let data of leadsData) {
                                if (accessData.hubspot_last_sync !== null) {
                                    if (new Date(accessData.hubspot_last_sync) < new Date(data.updatedAt)) {

                                        let titleId = await titleFn(data.properties.jobtitle, accessData.company_id)

                                        let sourceId = await sourceFn('', accessData.company_id)

                                        let industryId = await industryFn(data.properties.industry, accessData.company_id)

                                        let customerId = await customerFnForHubspot(data, accessData, industryId)

                                        let leadName = data.properties.firstname + ' ' + data.properties.lastname

                                        let s10 = dbScript(db_sql['Q322'], { var1: data.id, var2: accessData.company_id })
                                        let checkLead = await connection.query(s10)
                                        if (checkLead.rowCount > 0) {
                                            let leads = await leadFnForHubspot(leadName, titleId, sourceId, customerId, data, accessData, checkLead.rows[0].id)
                                        }
                                        else {
                                            //Hubspot function for inserting lead data
                                            let leads = await leadFnForHubspot(leadName, titleId, sourceId, customerId, data, accessData, '')
                                        }
                                    } else {
                                        let s10 = dbScript(db_sql['Q322'], { var1: data.id, var2: accessData.company_id })
                                        let checkLead = await connection.query(s10)
                                        if (checkLead.rowCount == 0) {

                                            let titleId = await titleFn(data.properties.jobtitle, accessData.company_id)

                                            let sourceId = await sourceFn('', accessData.company_id)

                                            let industryId = await industryFn(data.properties.industry, accessData.company_id)

                                            let customerId = await customerFnForHubspot(data, accessData, industryId)


                                            let leadName = data.properties.firstname + ' ' + data.properties.lastname

                                            let leads = await leadFnForHubspot(leadName, titleId, sourceId, customerId, data, accessData, '')
                                        }
                                    }
                                } else {
                                    let s10 = dbScript(db_sql['Q322'], { var1: data.id, var2: accessData.company_id })
                                    let checkLead = await connection.query(s10)
                                    if (checkLead.rowCount == 0) {

                                        let titleId = await titleFn(data.properties.jobtitle, accessData.company_id)

                                        let sourceId = await sourceFn('', accessData.company_id)

                                        let industryId = await industryFn(data.properties.industry, accessData.company_id)

                                        let customerId = await customerFnForHubspot(data, accessData, industryId)


                                        let leadName = data.properties.firstname + ' ' + data.properties.lastname

                                        let leads = await leadFnForHubspot(leadName, titleId, sourceId, customerId, data, accessData, '')
                                    }
                                }
                            }
                        }

                        let _dt = new Date().toISOString();
                        let s12 = dbScript(db_sql['Q278'], { var1: _dt, var2: accessData.company_id })
                        let updateStatusInCompany = await connection.query(s12)

                        let s11 = dbScript(db_sql['Q324'], { var0: 'hubspot_last_sync', var1: _dt, var2: _dt, var3: accessData.user_id, var4: accessData.company_id })
                        let updateLastSyncDate = await connection.query(s11)

                        if (updateStatusInCompany.rowCount > 0) {
                            await connection.query('COMMIT')
                            res.json({
                                status: 200,
                                success: true,
                                message: "hubspot leads synced successfully"
                            })
                        } else {
                            await connection.query('ROLLBACK')
                            res.json({
                                status: 400,
                                success: false,
                                message: "Something went wrong"
                            })
                        }
                    }
                } catch (error) {
                    await connection.query('ROLLBACK')
                    res.json({
                        status: 400,
                        success: false,
                        message: error.message
                    })
                }
            }
            //for linked in
            if (provider.toLowerCase() == 'linkedin' && accessData.linked_in_status) {
                res.json({
                    status: 200,
                    success: false,
                    message: "Lead sync api permission not confirmed by Linked In"
                })
            }
        }
    } else {
        await connection.query('ROLLBACK')
        res.status(403).json({
            success: false,
            message: "Unathorised"
        })
    }
}

// module.exports.proLeadsList = async (req, res) => {
//     try {
//         let userId = req.user.id
//         let { isProUser } = req.user
//         let { provider } = req.query
//         let s1 = dbScript(db_sql['Q8'], { var1: userId })
//         let findUser = await connection.query(s1)
//         if (findUser.rowCount > 0 && isProUser) {
//             let type = 'lead'
//             let leadList
//             //getting the lead list from the customer_comany_employees
//             if (provider.toLowerCase() == 'all') {
//                 //for all providers
//                 let s2 = dbScript(db_sql['Q326'], { var1: findUser.rows[0].company_id, var2: userId, var3: type })
//                 leadList = await connection.query(s2)
//             } else {
//                 //for perticular provider
//                 let s3 = dbScript(db_sql['Q327'], { var1: findUser.rows[0].company_id, var2: userId, var3: type, var4: provider.toLowerCase() })
//                 leadList = await connection.query(s3)
//             }

//             if (leadList.rowCount > 0) {
//                 res.json({
//                     status: 200,
//                     success: true,
//                     message: 'Leads list',
//                     data: leadList.rows
//                 })
//             } else {
//                 res.json({
//                     status: 200,
//                     success: false,
//                     message: 'Empty leads list',
//                     data: leadList.rows
//                 })
//             }
//         }
//         else {
//             res.status(403).json({
//                 success: false,
//                 message: "UnAthorised"
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

module.exports.proLeadsList = async (req, res) => {
    try {
        let userId = req.user.id
        let { provider } = req.query
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q41'], { var1: leadModule, var2: userId })
        let checkPermission = await connection.query(s1)
        let type = 'lead';
        if (checkPermission.rows[0].permission_to_view_global && isProUser) {
            let leadList
            if (provider.toLowerCase() == 'all') {
                let s2 = dbScript(db_sql['Q326'], { var1: checkPermission.rows[0].company_id, var2: type })
                leadList = await connection.query(s2)
            } else {
                //for perticular provider
                let s3 = dbScript(db_sql['Q327'], { var1: checkPermission.rows[0].company_id, var2: type, var3: provider.toLowerCase() })
                leadList = await connection.query(s3)
            }
            if (leadList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Leads list',
                    data: leadList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty leads list',
                    data: leadList.rows
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own && isProUser) {
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let findLeadList
            if (provider.toLowerCase() == 'all') {
                let s4 = dbScript(db_sql['Q415'], { var1: roleUsers.join(","), var2: type })
                findLeadList = await connection.query(s4)
            } else {
                //for perticular provider
                let s5 = dbScript(db_sql['Q416'], { var1: roleUsers.join(","), var2: type, var3: provider.toLowerCase() })
                findLeadList = await connection.query(s5)
            }

            if (findLeadList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Leads list',
                    data: findLeadList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty leads list',
                    data: findLeadList.rows
                })
            }
        }
        else {
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

module.exports.salesListForPro = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q41'], { var1: salesModule, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global && isProUser) {
            let s2 = dbScript(db_sql['Q302'], { var1: checkPermission.rows[0].company_id })
            let salesList = await connection.query(s2)

            if (salesList.rowCount > 0) {
                for (let salesData of salesList.rows) {
                    if (salesData.sales_users) {
                        salesData.sales_users.map(value => {
                            if (value.user_type == process.env.CAPTAIN) {
                                //calculating commission for captain
                                value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                            } else {
                                //calculating commission for supportor
                                value.user_commission_amount = (salesData.booking_commission) ? ((Number(value.percentage) / 100) * (salesData.booking_commission)) : 0;
                            }
                        })
                    }
                }
                res.json({
                    status: 200,
                    success: true,
                    message: 'Sales commission list',
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
        } else if (checkPermission.rows[0].permission_to_view_own && isProUser) {
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let s3 = dbScript(db_sql['Q303'], { var1: roleUsers.join(",") })
            salesList = await connection.query(s3)

            if (salesList.rowCount > 0) {
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
                res.json({
                    status: 200,
                    success: true,
                    message: 'Sales list',
                    data: salesList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty sales list',
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

//added salesDetails on 05-07-2023 to show sales details in pro popup on sales metrics
module.exports.salesDetails = async (req, res) => {
    try {
        let userId = req.user.id;
        let salesId = req.query.id;
        let { isProUser } = req.user
        let s2 = dbScript(db_sql['Q41'], { var1: salesModule, var2: userId })
        let checkPermission = await connection.query(s2)
        if (isProUser && checkPermission.rows[0].permission_to_view_global || checkPermission.rows[0].permission_to_view_own) {
            let s3 = dbScript(db_sql['Q421'], { var1: checkPermission.rows[0].company_id, var2: salesId })
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

module.exports.recognizationDetailsPro = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let { salesId } = req.query;
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findUser = await connection.query(s1)
        if (findUser.rowCount > 0 && isProUser) {
            //fetching sales data by sales_id from sales table
            let s3 = dbScript(db_sql['Q249'], { var1: findUser.rows[0].company_id, var2: salesId })
            let salesList = await connection.query(s3)
            let salesObj = {}
            for (let salesData of salesList.rows) {
                if (salesData.lead_data) {
                    for (let leadData of salesData.lead_data) {
                        if (leadData.emp_type == 'lead') {
                            salesObj.customerContractDetails = {
                                lead_name: leadData.full_name,
                                customer_name: leadData.customer_name,
                                lead_title: leadData.title,
                                lead_source: leadData.source,
                                lead_created_at: leadData.created_at,
                                lead_targeted_value: leadData.targeted_value,
                                lead_notes: leadData.additional_marketing_notes,
                                lead_address: leadData.address
                            }
                        }
                    }
                } else {
                    salesObj.customerContractDetails = {
                        lead_name: '',
                        customer_name: '',
                        lead_title: '',
                        lead_source: '',
                        lead_created_at: '',
                        lead_targeted_value: '',
                        lead_notes: '',
                        lead_address: ''
                    }
                }

                salesObj.performanceObligation = {
                    sales_created_at: salesData.created_at,
                    sales_created_by: salesData.created_by,
                    sales_users: salesData.sales_users
                }

                salesObj.determineTransaction = {
                    sales_committed_at: salesData.committed_at,
                    sales_products: salesData.products,
                    sales_commitment_note: salesData.qualification
                }

                if (salesData.is_service_performed) {
                    salesObj.allocatedTransaction = {
                        sales_type: salesData.sales_type,
                        sales_target_amount: salesData.target_amount,
                        sales_target_closing_date: salesData.target_closing_date,
                        sales_recurring_date: salesData.recurring_date,
                        sales_service_performed_at: salesData.service_performed_at,
                        sales_service_perform_note: salesData.service_perform_note
                    }
                } else {
                    salesObj.allocatedTransaction = {
                        sales_type: '',
                        sales_target_amount: '',
                        sales_target_closing_date: '',
                        sales_recurring_date: '',
                        sales_service_performed_at: '',
                        sales_service_perform_note: ''
                    }
                }
                //fetching recognized revenue using sales_id from recoginez_revenue table
                let s5 = dbScript(db_sql['Q231'], { var1: salesData.id })
                let recognizedRevenue = await connection.query(s5)
                if (recognizedRevenue.rowCount > 0) {
                    let recArr = []
                    for (let recData of recognizedRevenue.rows) {
                        let obj = {
                            sales_recognized_amount: recData.recognized_amount,
                            sales_recognized_date: recData.recognized_date,
                            sales_recognized_notes: recData.notes,
                            sales_recognized_invoice: recData.invoice
                        }
                        recArr.push(obj)
                    }
                    salesObj.recognizedRevenue = {
                        sales_recognized_data: recArr
                    }
                } else {
                    salesObj.recognizedRevenue = {
                        sales_recognized_data: []
                    }
                }
            }
            if (salesList.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Sales details',
                    data: salesObj
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: 'Empty sales commission list',
                    data: {}
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

//creating template for sending mail to lead
module.exports.createProEmailTemplate = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let { emailTemplate, templateName, jsonTemplate } = req.body
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findUser = await connection.query(s1)
        if (findUser.rowCount > 0 && isProUser) {
            // checking if emailTemplate is contains {content} section
            if (!emailTemplate.includes('{content}')) {
                // throw new Error('Email template does not contain {content} section.');
                return res.json({
                    status: 400,
                    success: false,
                    message: "Email template does not contain {content} section.",
                })
            }
            let s2 = dbScript(db_sql['Q330'], { var1: userId, var2: findUser.rows[0].company_id, var3: mysql_real_escape_string2(emailTemplate), var4: templateName, var5: mysql_real_escape_string2(jsonTemplate) })
            let createTemplate = await connection.query(s2)
            if (createTemplate.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "Template created successfully"
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
            await connection.query('ROLLBACK')
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
            message: error.message
        })
    }
}

//existing templates list created by user
module.exports.emailTemplateList = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findUser = await connection.query(s1)
        if (findUser.rowCount > 0 && isProUser) {
            let s6 = dbScript(db_sql['Q9'], { var1: findUser.rows[0].company_id })
            let company = await connection.query(s6)
            let s2 = dbScript(db_sql['Q331'], { var1: userId, var2: findUser.rows[0].company_id })
            let templateList = await connection.query(s2)
            let s3 = dbScript(db_sql['Q371'], {})
            let masterTemplate = await connection.query(s3)
            if (templateList.rowCount > 0 || masterTemplate.rowCount > 0) {
                for (let temp of masterTemplate.rows) {
                    if (temp.template.includes('{logo}')) {
                        temp.template = temp.template.replace(/\{logo\}/g, company.rows[0].company_logo);
                    }
                    if (temp.template.includes('{company_name}')) {
                        temp.template = temp.template.replace(/\{company_name\}/g, company.rows[0].company_name);
                    }
                }
                combinedArray = [...masterTemplate.rows, ...templateList.rows];
                res.json({
                    status: 200,
                    success: true,
                    data: combinedArray
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty template list",
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
            message: error.message
        })
    }
}

//updating the email template
module.exports.updateEmailTemplate = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let { templateId, templateName, emailTemplate, jsonTemplate } = req.body
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findUser = await connection.query(s1)
        if (findUser.rowCount > 0 && isProUser) {
            // checking if emailTemplate is contains {content} section
            if (!emailTemplate.includes('{content}')) {
                // throw new Error('Email template does not contain {content} section.');
                return res.json({
                    status: 400,
                    success: false,
                    message: "Email template does not contain {content} section.",
                })
            }
            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q332'], { var1: templateId, var2: _dt, var3: templateName, var4: mysql_real_escape_string2(emailTemplate), var5: mysql_real_escape_string2(jsonTemplate) })
            updateTemplate = await connection.query(s2)
            if (updateTemplate.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Template Updated Successfully"
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
            await connection.query('ROLLBACK')
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
            message: error.message
        })
    }

}

//deleting the email template
module.exports.deleteEmailTemplate = async (req, res) => {
    try {
        userId = req.user.id
        let { isProUser } = req.user
        let { templateId } = req.query
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findUser = await connection.query(s1)
        if (findUser.rowCount > 0 && isProUser) {
            let _dt = new Date().toISOString();
            let s2 = dbScript(db_sql['Q333'], { var1: templateId, var2: _dt })
            let deleteTemplate = await connection.query(s2)
            if (deleteTemplate.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Template Deleted Successfully"
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
            await connection.query('ROLLBACK')
            res.status(403).json({
                success: false,
                message: "Unauthorized",
            })
        }
    } catch (error) {
        await connection.query('ROLLBACK')
        res.json({
            status: 400,
            success: false,
            message: error.message
        })
    }

}

//sending email to lead
module.exports.sendEmailToLead = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let { template, leadEmail, templateName, description } = req.body
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rowCount > 0 && isProUser) {
            let s2 = dbScript(db_sql['Q125'], { var1: findAdmin.rows[0].id, var2: findAdmin.rows[0].company_id })
            let findCreds = await connection.query(s2)
            if (findCreds.rowCount > 0) {
                let credentialObj = {}
                let dpass = decrypt(JSON.parse(findCreds.rows[0].app_password))
                credentialObj.id = findCreds.rows[0].id
                credentialObj.email = findCreds.rows[0].email
                credentialObj.appPassword = dpass
                credentialObj.smtpHost = findCreds.rows[0].smtp_host
                credentialObj.smtpPort = findCreds.rows[0].smtp_port


                // checking if emailTemplate is contains {content} section
                if (!template.includes('{content}')) {
                    // throw new Error('Email template does not contain {content} section.');
                    return res.json({
                        status: 400,
                        success: false,
                        message: "Email template does not contain {content} section.",
                    })
                }
                //replacing the content of the template from the description when sending the mail to lead
                const result = template.replace('{content}', description);

                await leadEmail2(leadEmail, result, templateName, credentialObj);
                res.json({
                    status: 200,
                    success: true,
                    message: "Email sent to Lead",
                })

            } else {
                res.json({
                    status: 400,
                    success: false,
                    message: "SMTP credentials not available. Please add SMTP credentials first.",
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

//adding user's SMTP credentials in order to send mail
module.exports.addSmtpCreds = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let { email, appPassword, smtpHost, smtpPort } = req.body
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rows.length > 0 && isProUser) {
            //sending mail through the provided smtp creds in order to check whether creds are correct
            let transporter = nodemailer.createTransport({
                host: smtpHost,
                port: Number(smtpPort),
                secure: (Number(smtpPort) == 465) ? true : false, // true for 465, false for other ports
                auth: {
                    user: email,
                    pass: appPassword
                }
            });

            // Specify the fields in the email.
            let mailOptions = {
                from: email,
                to: "test@yopmail.com",
                subject: "test Mail",
                text: "This is a test mail to check smtp and port are correct"
            };

            // Send the email.
            // let info = await transporter.sendMail(mailOptions)
            let promise = new Promise((resolve, reject) => {
                let info = transporter.sendMail(mailOptions)
                if (info) {
                    resolve(info)
                } else {
                    reject("error")
                }
            })
            promise.then(async (data) => {
                let encryptedAppPassword = JSON.stringify(encrypt(appPassword))
                let s4 = dbScript(db_sql['Q125'], { var1: findAdmin.rows[0].id, var2: findAdmin.rows[0].company_id })
                let findSmtpcreds = await connection.query(s4)
                if (findSmtpcreds.rowCount == 0) {
                    let s3 = dbScript(db_sql['Q341'], { var1: email, var2: encryptedAppPassword, var3: findAdmin.rows[0].id, var4: smtpHost, var5: smtpPort, var6: findAdmin.rows[0].company_id })
                    let addCredentails = await connection.query(s3)
                    if (addCredentails.rowCount > 0) {
                        await connection.query('COMMIT')
                        res.json({
                            status: 201,
                            success: true,
                            message: "Credentials added successfully"
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
                    let _dt = new Date().toISOString()
                    let s5 = dbScript(db_sql['Q361'], { var1: email, var2: encryptedAppPassword, var3: smtpHost, var4: smtpPort, var5: findSmtpcreds.rows[0].id, var6: _dt })
                    let updateCreds = await connection.query(s5)
                    if (updateCreds.rowCount > 0) {
                        await connection.query('COMMIT')
                        res.json({
                            status: 201,
                            success: true,
                            message: "Credentials added successfully"
                        })
                    } else {
                        await connection.query('ROLLBACK')
                        res.json({
                            status: 400,
                            success: false,
                            message: "Something went wrong"
                        })
                    }
                }
            })
                .catch((err) =>
                    res.json({
                        status: 400,
                        success: false,
                        message: `SMTP Error : ${err.message}`
                    })
                )
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
            message: error.message
        })
    }
}

//providing the credentials list
module.exports.credentialList = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)

        if (findAdmin.rows.length > 0 && isProUser) {
            let s2 = dbScript(db_sql['Q125'], { var1: findAdmin.rows[0].id, var2: findAdmin.rows[0].company_id })
            let credentials = await connection.query(s2)

            let credentialObj = {}

            if (credentials.rowCount > 0) {
                let dpass = decrypt(JSON.parse(credentials.rows[0].app_password))
                credentialObj.id = credentials.rows[0].id
                credentialObj.email = credentials.rows[0].email
                credentialObj.appPassword = dpass
                credentialObj.smtpHost = credentials.rows[0].smtp_host
                credentialObj.smtpPort = credentials.rows[0].smtp_port

                res.json({
                    status: 200,
                    success: true,
                    message: "credential List",
                    data: credentialObj
                })
            } else {
                credentialObj.id = "",
                    credentialObj.email = "",
                    credentialObj.appPassword = "",
                    credentialObj.smtpHost = ""
                credentialObj.smtpPort = ""
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty credential List",
                    data: credentialObj
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

//adding user's availability for events
module.exports.addAvailability = async (req, res) => {
    try {
        let {
            scheduleName,
            timezone,
            timeSlot
        } = req.body;
        await connection.query('BEGIN')
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rows.length > 0 && isProUser) {
            let s2 = dbScript(db_sql['Q342'], { var1: mysql_real_escape_string(scheduleName), var2: timezone, var3: userId, var4: findAdmin.rows[0].company_id })
            let createAvailability = await connection.query(s2)
            for (let ts of timeSlot) {
                let dayName = daysEnum[ts.day]
                if (ts.checked) {
                    for (let subTs of ts.timeSlots) {
                        const { utcStart, utcEnd } = await convertToLocal(subTs.startTime, subTs.endTime, timezone);

                        let s3 = dbScript(db_sql['Q343'], { var1: dayName, var2: utcStart, var3: utcEnd, var4: createAvailability.rows[0].id, var5: findAdmin.rows[0].company_id, var6: ts.checked, var7: userId })
                        let addTimeSlot = await connection.query(s3)
                    }
                } else {
                    let s3 = dbScript(db_sql['Q343'], { var1: dayName, var2: '', var3: '', var4: createAvailability.rows[0].id, var5: findAdmin.rows[0].company_id, var6: ts.checked, var7: userId })
                    let addTimeSlot = await connection.query(s3)
                }
            }
            if (createAvailability.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 201,
                    success: true,
                    message: "Availability scheduled successfully",
                    data: createAvailability.rows
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

//availability list of user that he has created
module.exports.availableTimeList = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rows.length > 0 && isProUser) {
            let s2 = dbScript(db_sql['Q344'], { var1: userId, var2: findAdmin.rows[0].company_id })
            let availability = await connection.query(s2)
            if (availability.rowCount > 0) {
                for (let item of availability.rows) {
                    let s3 = dbScript(db_sql['Q370'], { var1: item.id })
                    let findAvailability = await connection.query(s3)
                    if (findAvailability.rowCount > 0) {
                        item.isAvailabilityAdded = true
                    } else {
                        item.isAvailabilityAdded = false
                    }
                }
                let finalArray = await tranformAvailabilityArray(availability.rows)
                res.json({
                    status: 200,
                    success: true,
                    message: "Availability List",
                    data: finalArray
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Availability List",
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

//showing details of perticular availability through availabilityId
module.exports.availabilityDetails = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let { availabilityId } = req.query
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rows.length > 0 && isProUser) {
            let s2 = dbScript(db_sql['Q351'], { var1: availabilityId })
            let availability = await connection.query(s2)
            if (availability.rowCount > 0) {
                //this function is coverting one form of array to different form of array according to need
                let finalArray = await tranformAvailabilityArray(availability.rows)
                for (let item of finalArray[0].time_slots) {
                    for (let slot of item.time_slot) {
                        // converting utc time to local time
                        let { localStart, localEnd } = await convertToTimezone(slot.start_time, slot.end_time, availability.rows[0].timezone)

                        slot.start_time = localStart
                        slot.end_time = localEnd
                    }
                }
                res.json({
                    status: 200,
                    success: true,
                    message: "Availability Details",
                    data: finalArray
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "No details found on this id"
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

//updating user's availability for events
module.exports.updateAvailability = async (req, res) => {
    try {
        let {
            scheduleName,
            timezone,
            timeSlots,
            availabilityId
        } = req.body;
        await connection.query('BEGIN')
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rows.length > 0 && isProUser) {
            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q352'], { var1: mysql_real_escape_string(scheduleName), var2: timezone, var3: availabilityId, var4: _dt })
            let updateAvailability = await connection.query(s2)
            if (updateAvailability.rowCount > 0) {
                let s3 = dbScript(db_sql['Q355'], { var1: _dt, var2: availabilityId })
                let deleteTimeSlots = await connection.query(s3)
                for (let ts of timeSlots) {
                    let dayName = daysEnum[ts.day]
                    if (ts.checked) {
                        for (let subTs of ts.timeSlot) {
                            // converting local time to utc time
                            const { utcStart, utcEnd } = await convertToLocal(subTs.startTime, subTs.endTime, timezone);
                            let s3 = dbScript(db_sql['Q343'], { var1: dayName, var2: utcStart, var3: utcEnd, var4: availabilityId, var5: findAdmin.rows[0].company_id, var6: ts.checked, var7: userId})
                            let addTimeSlot = await connection.query(s3)
                        }
                    } else {
                        let s3 = dbScript(db_sql['Q343'], { var1: dayName, var2: '', var3: '', var4: availabilityId, var5: findAdmin.rows[0].company_id, var6: ts.checked, var7: userId })
                        let addTimeSlot = await connection.query(s3)
                    }
                }
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Availability Updated successfully"
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

//deleting user's availability using availabilityId
module.exports.deleteAvalability = async (req, res) => {
    try {
        let { availabilityId } = req.query
        await connection.query('BEGIN')
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rows.length > 0 && isProUser) {
            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q354'], { var1: _dt, var2: availabilityId })
            let deleteAvailability = await connection.query(s2)
            if (deleteAvailability.rowCount > 0) {
                let s3 = dbScript(db_sql['Q355'], { var1: _dt, var2: availabilityId })
                let deleteTimeSlots = await connection.query(s3)
                if (deleteTimeSlots.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 200,
                        success: true,
                        message: "Availability Deleted successfully"
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

//deleting available time slots 
module.exports.deleteTimeSlot = async (req, res) => {
    try {
        let { slotId } = req.query
        await connection.query('BEGIN')
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rows.length > 0 && isProUser) {
            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q356'], { var1: _dt, var2: slotId })
            let deleteTimeSlot = await connection.query(s2)
            if (deleteTimeSlot.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Time slot Deleted successfully"
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

//creating event for scheduling meeting
module.exports.createEvent = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let { eventName, meetLink, description, duration, availabilityId } = req.body
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rows.length > 0 && isProUser) {
            let s2 = dbScript(db_sql['Q345'], { var1: mysql_real_escape_string(eventName), var2: meetLink, var3: mysql_real_escape_string(description), var4: userId, var5: findAdmin.rows[0].company_id, var6: duration, var7: availabilityId })
            let addEvent = await connection.query(s2)
            if (addEvent.rowCount > 0) {

                let eventUrl = `${process.env.PRO_EVENT_URL}/${addEvent.rows[0].id}`
                let s3 = dbScript(db_sql['Q347'], { var1: eventUrl, var2: addEvent.rows[0].id })
                let updateEventUrl = await connection.query(s3)
                if (updateEventUrl.rowCount > 0) {
                    await connection.query('COMMIT')
                    res.json({
                        status: 201,
                        success: true,
                        message: "Event created successfully"
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

//all event lists
module.exports.eventsList = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rows.length > 0 && isProUser) {
            let s2 = dbScript(db_sql['Q346'], { var1: userId, var2: findAdmin.rows[0].company_id })
            let eventList = await connection.query(s2)
            if (eventList.rowCount > 0) {
                for (let event of eventList.rows) {
                    let s3 = dbScript(db_sql['Q369'], { var1: event.id })
                    let findSchedule = await connection.query(s3)
                    if (findSchedule.rowCount > 0) {
                        event.isEventScheduled = true
                    } else {
                        event.isEventScheduled = false
                    }
                }
                res.json({
                    status: 200,
                    success: true,
                    data: eventList.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty event list",
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

//event details using eventId
module.exports.eventDetails = async (req, res) => {
    try {
        let { eventId, timezone } = req.query
        let s1 = dbScript(db_sql['Q348'], { var1: eventId })
        let showEventDetails = await connection.query(s1)
        if (showEventDetails.rowCount > 0) {
            if (showEventDetails.rows[0].availability_time_slots.length > 0) {
                let finalArray = await tranformAvailabilityArray(showEventDetails.rows[0].availability_time_slots)
                for (let item of finalArray[0].time_slots) {
                    for (let slot of item.time_slot) {
                        let { localStart, localEnd } = await convertToTimezone(slot.start_time, slot.end_time, timezone)
                        slot.start_time = localStart
                        slot.end_time = localEnd
                    }
                }
                showEventDetails.rows[0].availability_time_slots = finalArray[0]
            }

            let booked_slots = [];
            let s2 = dbScript(db_sql['Q362'], { var1: eventId })
            let scheduledEvents = await connection.query(s2)
            if (scheduledEvents.rowCount > 0) {
                for (let data of scheduledEvents.rows) {
                    booked_slots.push({
                        startTime: data.start_time,
                        endTime: data.end_time
                    })
                }
            }
            showEventDetails.rows[0].booked_slots = booked_slots
            res.json({
                status: 200,
                success: true,
                message: "Event Details",
                data: showEventDetails.rows
            })
        } else {
            res.json({
                status: 200,
                success: false,
                message: "No event found on this Id"
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

//deleting events using eventId
module.exports.deleteEvent = async (req, res) => {
    try {
        let { eventId } = req.query
        await connection.query('BEGIN')
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rows.length > 0 && isProUser) {
            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q358'], { var1: _dt, var2: eventId })
            let updateEvent = await connection.query(s2)
            if (updateEvent.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Event Deleted successfully"
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

//updating events using eventId
module.exports.updateEvent = async (req, res) => {
    try {
        let { eventId, eventName, meetLink, description, duration, availabilityId } = req.body
        await connection.query('BEGIN')
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rows.length > 0 && isProUser) {
            let _dt = new Date().toISOString()
            let s2 = dbScript(db_sql['Q357'], { var1: mysql_real_escape_string(eventName), var2: meetLink, var3: mysql_real_escape_string(description), var4: duration, var5: availabilityId, var6: eventId, var7: _dt })
            let updateEvent = await connection.query(s2)
            if (updateEvent.rowCount > 0) {
                await connection.query('COMMIT')
                res.json({
                    status: 200,
                    success: true,
                    message: "Event Updated successfully"
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

//scheduling event - Lead
module.exports.scheduleEvent = async (req, res) => {
    try {
        let { eventId, eventName, meetLink, date, startTime, endTime, leadName, leadEmail, description, userId, creatorName, creatorEmail, creatorTimezone, companyId, leadTimezone } = req.body
        await connection.query('BEGIN')
        let location = ''
        // for creator ------------------------------------ converting the leads timezone into creators timezone
        const result = await convertTimeToTargetedTz(startTime, endTime, leadTimezone, date, creatorTimezone);

        //creating obj for calendar during scheduling events
        let calObjCreator = await getIcalObjectInstance(result.startTargetedTimezoneStringIso, result.endTargetedTimezoneStringIso, eventName, description, location, meetLink, leadName, leadEmail, creatorTimezone)

        //for sending mail to creator
        let formattedDateString = `${result.startTimeTargetedTimezone} - ${result.endTimeTargetedTimezone}`
        await eventScheduleMail(creatorName, creatorEmail, eventName, meetLink, leadName, leadEmail, description, formattedDateString, creatorTimezone, calObjCreator)

        // for lead ---------------------------------------
        let leadDates = await dateFormattor1(date, startTime, endTime, leadTimezone)
        let calObjLead = await getIcalObjectInstance(leadDates.startDate, leadDates.endDate, eventName, description, location, meetLink, leadName, leadEmail, leadTimezone)

        let formattedString = `${startTime} - ${endTime} - ${date}`

        await eventScheduleMail(leadName, leadEmail, eventName, meetLink, leadName, leadEmail, description, formattedString, leadTimezone, calObjLead)

        //storing scheduled event in DB.
        let s1 = dbScript(db_sql['Q349'], { var1: eventId, var2: result.startTargetedTimezoneStringIso, var3: result.startTargetedTimezoneStringIso, var4: result.endTargetedTimezoneStringIso, var5: mysql_real_escape_string(leadName), var6: leadEmail, var7: mysql_real_escape_string(description), var8: userId, var9: companyId, var10: creatorTimezone })
        let createSchedule = await connection.query(s1)

        if (createSchedule.rowCount > 0) {
            await connection.query('COMMIT')
            res.json({
                status: 201,
                success: true,
                message: "Event scheduled successfully"
            })
        } else {
            await connection.query('ROLLBACK')
            res.json({
                status: 400,
                success: false,
                message: "Something went wrong"
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

//sheduled event list scheduled by leads
module.exports.scheduledEventsList = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rowCount > 0 && isProUser) {

            let s2 = dbScript(db_sql['Q350'], { var1: userId, var2: findAdmin.rows[0].company_id })
            let scheduleEvents = await connection.query(s2)
            for (let event of scheduleEvents.rows) {
                // converting utc time to local time
                let result = await convertToTimezone(event.start_time, event.end_time, event.timezone)
                event.start_time = result.localStart;
                event.end_time = result.localEnd;
                event.date = new Date(event.date).toLocaleString().split(" ")[0];
            }

            if (scheduleEvents.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Scheduled events list",
                    data: scheduleEvents.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Scheduled events list",
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

//sales analysis
module.exports.salesCaptainList = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rowCount > 0 && isProUser) {
            let s2 = dbScript(db_sql['Q363'], { var1: findAdmin.rows[0].company_id })
            let salesCatains = await connection.query(s2)
            if (salesCatains.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Sales captain list",
                    data: salesCatains.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Sales captain list",
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

//sales captain list for global and own
module.exports.salesCaptainListForGlobalAndOwn = async (req, res) => {
    let userId = req.user.id
    let { isProUser } = req.user
    let s1 = dbScript(db_sql['Q41'], { var1: salesModule, var2: userId })
    let checkPermission = await connection.query(s1)
    if (checkPermission.rows[0].permission_to_view_global && isProUser) {
        let s2 = dbScript(db_sql['Q363'], { var1: checkPermission.rows[0].company_id })
        let salesCatains = await connection.query(s2)

        if (salesCatains.rowCount > 0) {
            res.json({
                status: 200,
                success: true,
                message: "Sales captain list",
                data: salesCatains.rows
            })
        } else {
            res.json({
                status: 200,
                success: false,
                message: "Empty Sales captain list",
                data: []
            })
        }
    } else if (checkPermission.rows[0].permission_to_view_own && isProUser) {
        let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
        let s3 = dbScript(db_sql['Q418'], { var1: roleUsers.join(",") })
        let salesCatains = await connection.query(s3)

        if (salesCatains.rowCount > 0) {
            res.json({
                status: 200,
                success: true,
                message: "Sales captain list",
                data: salesCatains.rows
            })
        } else {
            res.json({
                status: 200,
                success: false,
                message: "Empty Sales captain list",
                data: []
            })
        }
    } else {
        res.status(403).json({
            success: false,
            message: "Unathorised"
        })
    }
}

//for metrics
module.exports.salesCaptainListForMetrics = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rowCount > 0 && isProUser) {
            let s2 = dbScript(db_sql['Q413'], { var1: findAdmin.rows[0].company_id })
            let salesCatains = await connection.query(s2)
            if (salesCatains.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Sales captain list",
                    data: salesCatains.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Sales captain list",
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


//sales captain list for metrics own and global
module.exports.salesCaptainListForMetricsGlobalAndOwn = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q41'], { var1: salesModule, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global && isProUser) {
            let s2 = dbScript(db_sql['Q413'], { var1: checkPermission.rows[0].company_id })
            let salesCatains = await connection.query(s2)
            if (salesCatains.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Sales captain list",
                    data: salesCatains.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Sales captain list",
                    data: []
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own && isProUser) {
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0])
            let s3 = dbScript(db_sql['Q419'], { var1: roleUsers.join(",") })
            let salesCatains = await connection.query(s3)
            if (salesCatains.rowCount > 0) {
                res.json({
                    status: 200,
                    success: true,
                    message: "Sales captain list",
                    data: salesCatains.rows
                })
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Sales captain list",
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

module.exports.captainWiseSalesDetails = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let { captainId } = req.query
        if (captainId) {
            let s1 = dbScript(db_sql['Q8'], { var1: userId })
            let findAdmin = await connection.query(s1)
            if (findAdmin.rowCount > 0 && isProUser) {
                let s2 = dbScript(db_sql['Q366'], { var1: captainId })
                let salesIds = await connection.query(s2)
                if (salesIds.rowCount > 0) {
                    let salesIdArr = []
                    salesIds.rows.map((data) => {
                        if (data.sales_ids.length > 0) {
                            salesIdArr.push("'" + data.sales_ids.join("','") + "'")
                        }
                    })
                    let captainWiseSaleObj = {}
                    let s3 = dbScript(db_sql['Q364'], { var1: captainId, var2: salesIdArr.join(",") })
                    let salesDetails = await connection.query(s3)

                    if (salesDetails.rowCount > 0) {
                        let s4 = dbScript(db_sql['Q365'], { var1: captainId, var2: salesIdArr.join(",") })
                        let notesCount = await connection.query(s4)

                        // create map of sales details by sales ID
                        let salesMap = {}
                        for (let sale of salesDetails.rows) {
                            salesMap[sale.id] = { ...sale, notes_count: 0 }
                        }

                        // update sales details with notes count
                        for (const note of notesCount.rows) {
                            const saleId = note.sales_id
                            const notesCount = Number(note.notes_count)
                            if (salesMap[saleId]) {
                                salesMap[saleId].notes_count = notesCount
                            }
                        }

                        // convert sales map back to array
                        const updatedSalesDetails = Object.values(salesMap)

                        // calculate aggregate note counts
                        let notesCountArr = updatedSalesDetails.map((detail) => Number(detail.notes_count || 0))

                        let count = notesCountArr.reduce((acc, val) => acc + val, 0)
                        let avgNotesCount = count / updatedSalesDetails.length
                        let maxNotesCount = Math.max(...notesCountArr)
                        let minNotesCount = Math.min(...notesCountArr)

                        let revenue = 0
                        let recognizedRevenue = []

                        let s5 = dbScript(db_sql['Q367'], { var1: salesIdArr.join(",") })
                        let recognizedAmount = await connection.query(s5)
                        if (recognizedAmount.rowCount > 0) {
                            recognizedAmount.rows.map(amount => {
                                revenue += Number(amount.recognized_amount)
                                recognizedRevenue.push(Number(amount.recognized_amount))
                            })
                        }
                        let days = 0
                        let durationDay = []
                        salesDetails.rows.map((detail) => {
                            days += Number(detail.duration_in_days)
                            durationDay.push(Number(detail.duration_in_days))
                        })
                        let avgClosingTime = days / salesDetails.rowCount
                        let maxClosingTime = Math.max(...durationDay);
                        let minClosingTime = Math.min(...durationDay);

                        let sciiAvg = avgClosingTime;
                        let aboveCount = 0;
                        let belowCount = 0;
                        let sciiCount = 0;
                        if (durationDay.length == 1) {
                            sciiCount = 1
                        } else {
                            for (let i = 0; i < durationDay.length; i++) {
                                if (durationDay[i] > sciiAvg) {
                                    aboveCount++;
                                } else if (durationDay[i] < sciiAvg) {
                                    belowCount++;
                                }
                            }
                            if (aboveCount == 0 && belowCount == 0) {
                                sciiCount = 0
                            } else if (aboveCount == 0 || belowCount == 0) {
                                sciiCount = 1
                            } else {
                                sciiCount = Number(belowCount / aboveCount)
                            }
                        }
                        let avgRecognizedRevenue = revenue / salesDetails.rowCount
                        let maxRecognizedRevenue = Math.max(...recognizedRevenue);
                        let minRecognizedRevenue = Math.min(...recognizedRevenue);

                        captainWiseSaleObj = {
                            salesDetails: updatedSalesDetails,
                            avgRecognizedRevenue: avgRecognizedRevenue,
                            maxRecognizedRevenue: maxRecognizedRevenue,
                            minRecognizedRevenue: minRecognizedRevenue,
                            avgClosingTime: avgClosingTime.toFixed(4),
                            maxClosingTime: maxClosingTime.toFixed(4),
                            minClosingTime: minClosingTime.toFixed(4),
                            avgNotesCount: avgNotesCount,
                            maxNotesCount: maxNotesCount,
                            minNotesCount: minNotesCount,
                            scii: sciiCount
                        }
                    } else {
                        captainWiseSaleObj = {
                            salesDetails: [],
                            avgRecognizedRevenue: 0,
                            maxRecognizedRevenue: 0,
                            minRecognizedRevenue: 0,
                            avgClosingTime: 0,
                            maxClosingTime: 0,
                            minClosingTime: 0,
                            avgNotesCount: 0,
                            maxNotesCount: 0,
                            minNotesCount: 0,
                            sciiCount: 0
                        }
                    }
                    res.json({
                        status: 200,
                        success: true,
                        message: "Captain wise sales details",
                        data: captainWiseSaleObj
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Sales not found",
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
                message: "Please provide a captain id"
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

module.exports.captainWiseGraph = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let { captainId, page } = req.query
        if (captainId) {
            let s1 = dbScript(db_sql['Q8'], { var1: userId })
            let findAdmin = await connection.query(s1)
            if (findAdmin.rowCount > 0 && isProUser) {
                let s2 = dbScript(db_sql['Q366'], { var1: captainId })
                let salesIds = await connection.query(s2)
                if (salesIds.rowCount > 0) {
                    let salesIdArr = []
                    salesIds.rows.map((data) => {
                        if (data.sales_ids.length > 0) {
                            salesIdArr.push("'" + data.sales_ids.join("','") + "'")
                        }
                    })
                    let s3 = dbScript(db_sql['Q364'], { var1: captainId, var2: salesIdArr.join(",") })
                    let salesDetails = await connection.query(s3)

                    if (salesDetails.rowCount > 0) {
                        let s4 = dbScript(db_sql['Q365'], { var1: captainId, var2: salesIdArr.join(",") })
                        let notesCount = await connection.query(s4)

                        // create map of sales details by sales ID
                        let salesMap = {}
                        for (let sale of salesDetails.rows) {
                            salesMap[sale.id] = { ...sale, notes_count: 0 }
                        }

                        // update sales details with notes count
                        for (const note of notesCount.rows) {
                            const saleId = note.sales_id
                            const notesCount = Number(note.notes_count)
                            if (salesMap[saleId]) {
                                salesMap[saleId].notes_count = notesCount
                            }
                        }

                        // convert sales map back to array
                        const updatedSalesDetails = Object.values(salesMap)

                        if (updatedSalesDetails.length > 0) {
                            let result = await paginatedResults(updatedSalesDetails, page)
                            res.json({
                                status: 200,
                                success: true,
                                message: "Sales Details",
                                data: result
                            })
                        }
                    } else {
                        res.json({
                            status: 200,
                            success: false,
                            message: "Empty sales details",
                            data: [],
                        })
                    }
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Sales not found",
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
                message: "Please provide a captain id"
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

// module.exports.sciiSales = async (req, res) => {
//     try {
//         let { page } = req.query
//         let userId = req.user.id
//         let { isProUser } = req.user
//         let s1 = dbScript(db_sql['Q8'], { var1: userId })
//         let findAdmin = await connection.query(s1)
//         if (findAdmin.rowCount > 0 && isProUser) {
//             let s2 = dbScript(db_sql['Q363'], { var1: findAdmin.rows[0].company_id })
//             let salesCatains = await connection.query(s2)
//             let sciiArr = []
//             if (salesCatains.rowCount > 0) {
//                 for (captain of salesCatains.rows) {
//                     let salesIdArr = []
//                     if (captain.sales_ids.length > 0) {
//                         salesIdArr.push("'" + captain.sales_ids.join("','") + "'")
//                     }
//                     let s3 = dbScript(db_sql['Q364'], { var1: captain.user_id, var2: salesIdArr.join(",") })
//                     let salesDetails = await connection.query(s3)
//                     if (salesDetails.rowCount > 0) {
//                         let days = 0
//                         let durationDays = []
//                         salesDetails.rows.map((detail) => {
//                             days += Number(detail.duration_in_days)
//                             durationDays.push(Number(detail.duration_in_days))
//                         })
//                         let avgClosingTime = days / salesDetails.rowCount
//                         let aboveCount = 0;
//                         let belowCount = 0;
//                         let sciiCount = 0;
//                         if (durationDays.length == 1) {
//                             sciiCount = 1
//                         } else {
//                             for (let i = 0; i < durationDays.length; i++) {
//                                 if (durationDays[i] > avgClosingTime) {
//                                     aboveCount++;
//                                 } else if (durationDays[i] < avgClosingTime) {
//                                     belowCount++;
//                                 }
//                             }
//                             if (aboveCount == 0 && belowCount == 0) {
//                                 sciiCount = 0
//                             } else if (aboveCount == 0 || belowCount == 0) {
//                                 sciiCount = 1
//                             } else {
//                                 sciiCount = Number(belowCount / aboveCount)
//                             }
//                         }
//                         sciiArr.push({
//                             captain_id: captain.user_id,
//                             captain_name: captain.full_name,
//                             scii: sciiCount
//                         })
//                     }
//                 }
//                 if (sciiArr.length > 0) {
//                     let result = await paginatedResults(sciiArr, page)
//                     res.json({
//                         status: 200,
//                         success: true,
//                         message: "scii list",
//                         data: result
//                     })
//                 } else {
//                     res.json({
//                         status: 200,
//                         success: false,
//                         message: "Empty scii list",
//                         data: []
//                     })
//                 }
//             } else {
//                 res.json({
//                     status: 200,
//                     success: false,
//                     message: "Empty Sales captain list",
//                     data: []
//                 })
//             }
//         } else {
//             res.status(403).json({
//                 success: false,
//                 message: "Unathorised"
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


//scii index for global and own
module.exports.sciiSales = async (req, res) => {
    try {
        let { page } = req.query
        let userId = req.user.id
        let { isProUser } = req.user
        let s1 = dbScript(db_sql['Q41'], { var1: salesModule, var2: userId })
        let checkPermission = await connection.query(s1)
        if (checkPermission.rows[0].permission_to_view_global && isProUser) {
            let s2 = dbScript(db_sql['Q363'], { var1: checkPermission.rows[0].company_id })
            let salesCatains = await connection.query(s2)
            let sciiArr = []
            if (salesCatains.rowCount > 0) {
                for (captain of salesCatains.rows) {
                    let salesIdArr = []
                    if (captain.sales_ids.length > 0) {
                        salesIdArr.push("'" + captain.sales_ids.join("','") + "'")
                    }
                    let s3 = dbScript(db_sql['Q364'], { var1: captain.user_id, var2: salesIdArr.join(",") })
                    let salesDetails = await connection.query(s3)
                    if (salesDetails.rowCount > 0) {
                        let days = 0
                        let durationDays = []
                        salesDetails.rows.map((detail) => {
                            days += Number(detail.duration_in_days)
                            durationDays.push(Number(detail.duration_in_days))
                        })
                        let avgClosingTime = days / salesDetails.rowCount
                        let aboveCount = 0;
                        let belowCount = 0;
                        let sciiCount = 0;
                        if (durationDays.length == 1) {
                            sciiCount = 1
                        } else {
                            for (let i = 0; i < durationDays.length; i++) {
                                if (durationDays[i] > avgClosingTime) {
                                    aboveCount++;
                                } else if (durationDays[i] < avgClosingTime) {
                                    belowCount++;
                                }
                            }
                            if (aboveCount == 0 && belowCount == 0) {
                                sciiCount = 0
                            } else if (aboveCount == 0 || belowCount == 0) {
                                sciiCount = 1
                            } else {
                                sciiCount = Number(belowCount / aboveCount)
                            }
                        }
                        sciiArr.push({
                            captain_id: captain.user_id,
                            captain_name: captain.full_name,
                            scii: sciiCount
                        })
                    }
                }
                if (sciiArr.length > 0) {
                    let result = await paginatedResults(sciiArr, page)
                    res.json({
                        status: 200,
                        success: true,
                        message: "scii list",
                        data: result
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty scii list",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Sales captain list",
                    data: []
                })
            }
        } else if (checkPermission.rows[0].permission_to_view_own && isProUser) {
            let roleUsers = await getUserAndSubUser(checkPermission.rows[0]);
            let s2 = dbScript(db_sql['Q418'], { var1: roleUsers.join(",") })
            let salesCatains = await connection.query(s2)
            let sciiArr = []
            if (salesCatains.rowCount > 0) {
                for (captain of salesCatains.rows) {
                    let salesIdArr = []
                    if (captain.sales_ids.length > 0) {
                        salesIdArr.push("'" + captain.sales_ids.join("','") + "'")
                    }
                    let s3 = dbScript(db_sql['Q364'], { var1: captain.user_id, var2: salesIdArr.join(",") })
                    let salesDetails = await connection.query(s3)
                    if (salesDetails.rowCount > 0) {
                        let days = 0
                        let durationDays = []
                        salesDetails.rows.map((detail) => {
                            days += Number(detail.duration_in_days)
                            durationDays.push(Number(detail.duration_in_days))
                        })
                        let avgClosingTime = days / salesDetails.rowCount
                        let aboveCount = 0;
                        let belowCount = 0;
                        let sciiCount = 0;
                        if (durationDays.length == 1) {
                            sciiCount = 1
                        } else {
                            for (let i = 0; i < durationDays.length; i++) {
                                if (durationDays[i] > avgClosingTime) {
                                    aboveCount++;
                                } else if (durationDays[i] < avgClosingTime) {
                                    belowCount++;
                                }
                            }
                            if (aboveCount == 0 && belowCount == 0) {
                                sciiCount = 0
                            } else if (aboveCount == 0 || belowCount == 0) {
                                sciiCount = 1
                            } else {
                                sciiCount = Number(belowCount / aboveCount)
                            }
                        }
                        sciiArr.push({
                            captain_id: captain.user_id,
                            captain_name: captain.full_name,
                            scii: sciiCount
                        })
                    }
                }
                if (sciiArr.length > 0) {
                    let result = await paginatedResults(sciiArr, page)
                    res.json({
                        status: 200,
                        success: true,
                        message: "scii list",
                        data: result
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty scii list",
                        data: []
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Sales captain list",
                    data: []
                })
            }
        }
        else {
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

module.exports.commissionReport = async (req, res) => {
    try {
        let userId = req.user.id
        let { isProUser } = req.user
        let { salesRepId, startDate, endDate } = req.query
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findAdmin = await connection.query(s1)
        if (findAdmin.rowCount > 0 && isProUser) {

            let s2 = dbScript(db_sql['Q8'], { var1: salesRepId })
            let finduser = await connection.query(s2)

            let s3 = dbScript(db_sql['Q12'], { var1: finduser.rows[0].role_id })
            let roleData = await connection.query(s3)
            let managerName = ''
            if (roleData.rows[0].reporter) {
                let parentList = await getParentUserList(roleData.rows[0], findAdmin.rows[0].company_id);
                for (let parent of parentList) {
                    if (parent.role_id == roleData.rows[0].reporter) {
                        managerName = parent.full_name
                    }
                }

            }

            let s4 = dbScript(db_sql['Q373'], { var1: salesRepId, var2: startDate, var3: endDate })
            let _dt = new Date().toISOString()
            let commissionData = await connection.query(s4)
            if (commissionData.rowCount > 0) {
                let data = {
                    salesRepName: commissionData.rows[0].sales_rep_name,
                    companyName: commissionData.rows[0].company_name,
                    companyLogo: commissionData.rows[0].company_logo,
                    currentDate: _dt,
                    fromDate: startDate,
                    toDate: endDate,
                    managerName: managerName,
                    report: [],
                    totalPerpetualCommissionEarned: 0,
                    totalSubscriptionCommissionEarned: 0
                };

                for (let row of commissionData.rows) {
                    data.report.push({
                        id: row.id,
                        customerName: row.customer_name,
                        date: row.recognized_date,
                        dealType: row.sales_type,
                        salesRole: row.user_type,
                        earnedCommission: Number(row.commission_amount)
                    });

                    if (row.sales_type === 'Perpetual') {
                        data.totalPerpetualCommissionEarned += Number(row.commission_amount);
                    } else if (row.sales_type === 'Subscription') {
                        data.totalSubscriptionCommissionEarned += Number(row.commission_amount);
                    }

                    data.totalCommission = data.totalPerpetualCommissionEarned + data.totalSubscriptionCommissionEarned
                }
                if (data) {
                    res.json({
                        status: 200,
                        success: true,
                        message: "Commission Report",
                        data: data
                    })
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Empty Commission Report",
                        data: {
                            salesRepName: "",
                            companyName: "",
                            companyLogo: "",
                            currentDate: "",
                            fromDate: "",
                            toDate: "",
                            managerName: "",
                            report: [],
                            totalPerpetualCommissionEarned: 0,
                            totalSubscriptionCommissionEarned: 0,
                            totalCommission: 0
                        }
                    })
                }
            } else {
                res.json({
                    status: 200,
                    success: false,
                    message: "Empty Commission Report",
                    data: {
                        salesRepName: "",
                        companyName: "",
                        companyLogo: "",
                        currentDate: "",
                        fromDate: "",
                        toDate: "",
                        managerName: "",
                        report: [],
                        totalPerpetualCommissionEarned: 0,
                        totalSubscriptionCommissionEarned: 0,
                        totalCommission: 0
                    }
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

module.exports.salesMetricsReport = async (req, res) => {
    try {
        let userId = req.user.id;
        let { isProUser } = req.user;
        let { selectQuarter, includeStatus, captainId } = req.body;
        let s1 = dbScript(db_sql["Q8"], { var1: userId });
        let findAdmin = await connection.query(s1);
        if (findAdmin.rowCount > 0 && isProUser) {

            let s2 = dbScript(db_sql["Q9"], { var1: findAdmin.rows[0].company_id });
            let findQuarter = await connection.query(s2);

            let quarters = await calculateQuarters(findQuarter.rows[0].quarter);
            let selectedStartDate = "";
            let selectedEndDate = "";

            for (const quarter of quarters) {
                if (quarter.quarter == String(selectQuarter)) {
                    selectedStartDate = quarter.start_date;
                    selectedEndDate = quarter.end_date;
                    break;
                }
            }

            let findMonthsDateOfQuarter = await getQuarterMonthsDates(
                selectedStartDate,
                selectedEndDate
            );

            let leadCounts = {}
            let salesActivities = {}
            let totalAndWonDealCount = {}
            let monthlyRecognizedRevenue = {}
            let yearlyRecognizedRevenue = 0;
            let risk_sales_deals = {};
            let missingRR = {};
            let closingDateSlippage = {};
            let eolSales = {}
            let revenueGap = 0;
            let totalLeakage = 0;
            let totalLeakageAmountAll = 0

            //for EOL products date format
            const Sdate = new Date(selectedStartDate);
            const Edate = new Date(selectedEndDate);
            const SformattedDate = Sdate.toISOString().substring(0, 10);
            const EformattedDate = Edate.toISOString().substring(0, 10);

            //current month start date and end date
            // Get the current date
            const currentDate = new Date();

            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);
            let monthlyStartFormattedDate = startDate.toISOString().substring(0, 10);
            let monthlyEndFormattedDate = endDate.toISOString().substring(0, 10);

            function formatDate(dateString) {
                const [year, month, day] = dateString.split('-');
                return `${month}-${day}-${year}`;
            }
            const formattedStartDate = formatDate(monthlyStartFormattedDate);
            const formattedEndDate = formatDate(monthlyEndFormattedDate);

            if (includeStatus !== true) {
                //lead counts
                let s3 = dbScript(db_sql["Q395"], {
                    var1: selectedStartDate,
                    var2: selectedEndDate,
                    var3: captainId,
                });
                let findLeadCounts = await connection.query(s3);
                if (findLeadCounts.rowCount > 0) {
                    leadCounts.total_lead_count = Number(findLeadCounts.rows[0].total_lead_count);
                    leadCounts.converted_lead_count = Number(findLeadCounts.rows[0].converted_lead_count);
                    if (leadCounts.total_lead_count !== 0) {
                        leadCounts.convertedLeadPercentage =
                            (leadCounts.converted_lead_count / leadCounts.total_lead_count) * 100;
                    } else {
                        leadCounts.convertedLeadPercentage = 0;
                    }

                } else {
                    leadCounts.total_lead_count = 0
                    leadCounts.converted_lead_count = 0
                    leadCounts.convertedLeadPercentage = 0
                }

                //sales activity
                let s4 = dbScript(db_sql["Q401"], {
                    var1: selectedStartDate,
                    var2: selectedEndDate,
                    var3: captainId,
                });
                let findSalesActivities = await connection.query(s4);
                if (findSalesActivities.rowCount > 0) {
                    const { total_sales_activities, total_deals_created } = findSalesActivities.rows[0];
                    salesActivities.total_sales_activities = Number(total_sales_activities);
                    salesActivities.total_deals_created = Number(total_deals_created);
                    salesActivities.activity_per_deal = salesActivities.total_deals_created !== 0 ? total_sales_activities / total_deals_created : 0;
                } else {
                    salesActivities.total_sales_activities = 0;
                    salesActivities.total_deals_created = 0;
                    salesActivities.activity_per_deal = 0;
                }

                //finding total open and closed sales in which captainId is captain
                let s5 = dbScript(db_sql["Q404"], { var1: captainId });
                let allSalesIds = await connection.query(s5);
                if (allSalesIds.rowCount > 0) {
                    let allSalesIdArr = [];
                    allSalesIds.rows.map((data) => {
                        if (data.sales_ids.length > 0) {
                            allSalesIdArr.push("'" + data.sales_ids.join("','") + "'");
                        }
                    });

                    //counts of total sales count and converted sales count and won deals count
                    let s6 = dbScript(db_sql["Q397"], {
                        var1: selectedStartDate,
                        var2: selectedEndDate,
                        var3: allSalesIdArr.join(","),
                    });
                    let findTotalAndWonDealCount = await connection.query(s6);
                    if (findTotalAndWonDealCount.rowCount > 0) {
                        const { total_sales_count, closed_sales_count } = findTotalAndWonDealCount.rows[0];
                        totalAndWonDealCount.total_sales_count = Number(total_sales_count);
                        totalAndWonDealCount.closed_sales_count = Number(closed_sales_count);
                        totalAndWonDealCount.winPercentage = total_sales_count > 0 ? (closed_sales_count / total_sales_count) * 100 : 0;
                    } else {
                        totalAndWonDealCount.total_sales_count = 0;
                        totalAndWonDealCount.closed_sales_count = 0;
                        totalAndWonDealCount.winPercentage = 0;
                    }

                    //monthly recognized_revenue Subscription+perpetual on perticular quarter
                    let totalMonthlySubscriptionAmount = 0;
                    let s7 = dbScript(db_sql["Q399"], {
                        var1: formattedStartDate,
                        var2: formattedEndDate,
                        var3: allSalesIdArr.join(","),
                    });
                    let findMonthlyRecognizedRevenue = await connection.query(s7);
                    if (findMonthlyRecognizedRevenue.rowCount > 0) {
                        monthlyRecognizedRevenue = findMonthlyRecognizedRevenue.rows
                        //multiply by 12 to get one year subscription
                        monthlyRecognizedRevenue.forEach(row => {
                            const amount = parseFloat(row.target_amount);
                            const multipliedAmount = amount * 12;
                            totalMonthlySubscriptionAmount += multipliedAmount;
                        });
                    } else {
                        monthlyRecognizedRevenue = []
                        totalMonthlySubscriptionAmount = 0;
                    }

                    //yearly recognized_revenue Subscription+perpetual
                    // let yearlySubscriptionAmount = 0;
                    // let s8 = dbScript(db_sql["Q398"], { var1: yearlyStartFormattedDate, var2: yearlyEndFormattedDate, var3: allSalesIdArr.join(",") });
                    // let findYearlyRecognizedRevenue = await connection.query(s8);
                    // if (findYearlyRecognizedRevenue.rowCount > 0) {
                    //     let yearlyData = findYearlyRecognizedRevenue.rows
                    //     yearlyData.forEach(row => {
                    //         yearlySubscriptionAmount += parseFloat(row.target_amount);
                    //     });
                    // } else {
                    //     yearlySubscriptionAmount = yearlySubscriptionAmount
                    // }
                    // yearlyRecognizedRevenue = parseFloat(yearlySubscriptionAmount + totalMonthlySubscriptionAmount)

                    yearlyRecognizedRevenue = parseFloat(totalMonthlySubscriptionAmount)

                    //sales leakages

                    //find sales deals
                    let s9 = dbScript(db_sql["Q405"], { var1: selectedStartDate, var2: selectedEndDate, var3: allSalesIdArr.join(",") });
                    let findTotalSupport = await connection.query(s9);
                    let high_risk_sales_deals = [];
                    let low_risk_sales_deals = [];
                    let totalHighRiskAmount = 0
                    let totalLowRiskAmount = 0
                    if (findTotalSupport.rowCount > 0) {
                        for (const sale of findTotalSupport.rows) {
                            const isHighRisk = (sale.ids.length < 2 || sale.notes <= 0);
                            const salesDeals = isHighRisk ? high_risk_sales_deals : low_risk_sales_deals;
                            salesDeals.push({ salesId: sale.sales_id, salesName: sale.customer_name, amount: sale.target_amount });
                        }
                        totalHighRiskAmount = high_risk_sales_deals.reduce((total, sale) => total + parseInt(sale.amount), 0);
                        totalLowRiskAmount = low_risk_sales_deals.reduce((total, sale) => total + parseInt(sale.amount), 0);

                        risk_sales_deals.high_risk_sales_deals = high_risk_sales_deals;
                        risk_sales_deals.low_risk_sales_deals = low_risk_sales_deals;
                        risk_sales_deals.total_high_risk_amount = totalHighRiskAmount;
                        risk_sales_deals.total_low_risk_amount = totalLowRiskAmount;
                        risk_sales_deals.total_sales_deals_amount = totalHighRiskAmount + totalLowRiskAmount;
                    } else {
                        risk_sales_deals.high_risk_sales_deals = []
                        risk_sales_deals.low_risk_sales_deals = []
                        risk_sales_deals.total_high_risk_amount = 0;
                        risk_sales_deals.total_low_risk_amount = 0;
                        risk_sales_deals.total_sales_deals_amount = 0
                    }

                    //finding missing rr
                    let s10 = dbScript(db_sql["Q406"], {
                        var1: selectedStartDate,
                        var2: selectedEndDate,
                        var3: allSalesIdArr.join(","),
                    });
                    let findMissingRecognized = await connection.query(s10);

                    let high_risk_missing_rr = [];
                    let low_risk_missing_rr = [];
                    let totalHighRiskRR = 0;
                    let totalLowRiskRR = 0;

                    if (findMissingRecognized.rowCount > 0) {
                        findMissingRecognized.rows.forEach((item) => {
                            if (item.recognized_amount === "0") {
                                high_risk_missing_rr.push({ salesId: item.sales_id, customer_name: item.customer_name, amount: item.target_amount });
                            } else {
                                if (!low_risk_missing_rr[item.sales_id]) {
                                    low_risk_missing_rr[item.sales_id] = {
                                        customer_name: item.customer_name,
                                        salesId: item.sales_id,
                                        recognized_amount: 0,
                                        target_amount: parseFloat(item.target_amount),
                                    };
                                }
                                low_risk_missing_rr[item.sales_id].recognized_amount += parseFloat(item.recognized_amount);
                            }
                        });

                        Object.values(low_risk_missing_rr).forEach((item) => {
                            const amountDifference = parseFloat(item.target_amount) - parseFloat(item.recognized_amount);
                            if (amountDifference > 0) {
                                item.amount = amountDifference;
                            } else {
                                delete low_risk_missing_rr[item.salesId];
                            }
                        });

                        high_risk_missing_rr.forEach((item) => {
                            totalHighRiskRR += parseInt(item.amount);
                        });

                        Object.values(low_risk_missing_rr).forEach((item) => {
                            totalLowRiskRR += parseInt(item.amount);
                        });

                        missingRR.high_risk_missing_rr = high_risk_missing_rr;
                        missingRR.low_risk_missing_rr = Object.values(low_risk_missing_rr);
                    } else {
                        missingRR.high_risk_missing_rr = [];
                        missingRR.low_risk_missing_rr = [];
                    }

                    missingRR.high_risk_total_missing_rr = totalHighRiskRR;
                    missingRR.low_risk_total_missing_rr = totalLowRiskRR;
                    missingRR.all_total_missing_rr = totalHighRiskRR + totalLowRiskRR;
                    totalLeakageAmountClosed = totalHighRiskRR + totalLowRiskRR;

                    //find slippage date
                    let s11 = dbScript(db_sql['Q408'], {
                        var1: selectedStartDate,
                        var2: selectedEndDate,
                        var3: allSalesIdArr.join(","),
                    })
                    let findDateSlippage = await connection.query(s11)

                    const high_risk_sales = [];
                    const low_risk_sales = [];
                    const salesBySalesId = {};
                    let totalLowRiskSlippageAmount = 0
                    let totalHighRiskSlippageAmount = 0
                    if (findDateSlippage.rowCount > 0) {
                        // Group sales by sales_id and track target_closing_dates
                        for (const sale of findDateSlippage.rows) {
                            if (!salesBySalesId[sale.sales_id]) {
                                salesBySalesId[sale.sales_id] = {
                                    targetClosingDates: new Set(),
                                    salesId: sale.sales_id,
                                    customer_name: sale.customer_name,
                                    amount: sale.target_amount
                                };
                            }
                            const salesInfo = salesBySalesId[sale.sales_id];
                            salesInfo.targetClosingDates.add(sale.target_closing_date);
                        }

                        // Categorize sales based on target_closing_dates count
                        for (const salesId in salesBySalesId) {
                            const salesInfo = salesBySalesId[salesId];

                            if (salesInfo.targetClosingDates.size > 1) {
                                high_risk_sales.push({ sales_id: salesId, customer_name: salesInfo.customer_name, missing_amount: salesInfo.amount });
                            } else {
                                low_risk_sales.push({ sales_id: salesId, customer_name: salesInfo.customer_name, missing_amount: salesInfo.amount });
                            }
                        }

                        totalHighRiskSlippageAmount = high_risk_sales.reduce((total, sale) => total + parseInt(sale.missing_amount), 0);
                        totalLowRiskSlippageAmount = low_risk_sales.reduce((total, sale) => total + parseInt(sale.missing_amount), 0);

                        closingDateSlippage.high_risk_sales = high_risk_sales
                        closingDateSlippage.low_risk_sales = low_risk_sales
                        closingDateSlippage.total_high_risk_slippage_amount = totalHighRiskSlippageAmount
                        closingDateSlippage.total_low_risk_slippage_amount = totalLowRiskSlippageAmount
                        closingDateSlippage.all_total_slippage_amount = Number(totalHighRiskSlippageAmount + totalLowRiskSlippageAmount)
                    } else {
                        closingDateSlippage.high_risk_sales = high_risk_sales
                        closingDateSlippage.low_risk_sales = low_risk_sales
                        closingDateSlippage.total_high_risk_slippage_amount = 0
                        closingDateSlippage.total_low_risk_slippage_amount = 0
                        closingDateSlippage.all_total_slippage_amount = 0
                    }

                    //EOL products
                    let s12 = dbScript(db_sql['Q411'], { var1: allSalesIdArr.join(","), var2: SformattedDate, var3: EformattedDate })
                    let findEOLProduct = await connection.query(s12)
                    if (findEOLProduct.rowCount > 0) {
                        let findEOLSales = await calculateEOLProducts(findEOLProduct.rows);
                        eolSales = findEOLSales;
                    } else {
                        eolSales = {
                            highRiskEolSale: [],
                            lowRiskEolSale: []
                        }
                    }

                    let totalHighRiskEolMissingAmount = eolSales.highRiskEolSale.reduce((total, sale) => total + parseInt(sale.target_amount), 0);
                    let totalLowRiskEolMissingAmount = eolSales.lowRiskEolSale.reduce((total, sale) => total + parseInt(sale.target_amount), 0);
                    eolSales.total_high_risk_eol_missing_amount = totalHighRiskEolMissingAmount
                    eolSales.total_low_risk_eol_missing_amount = totalLowRiskEolMissingAmount
                    eolSales.all_total_eol_missing_amount = Number(totalHighRiskEolMissingAmount + totalLowRiskEolMissingAmount)

                    let s13 = dbScript(db_sql['Q407'], { var1: captainId })
                    let findForecastAmount = await connection.query(s13)
                    let totalForecaseAmount = 0
                    if (findForecastAmount.rowCount > 0) {
                        for (let amount of findForecastAmount.rows) {
                            totalForecaseAmount += Number(amount.amount)
                        }
                        revenueGap = totalForecaseAmount - Number(yearlyRecognizedRevenue)
                    } else {
                        revenueGap = 0 - Number(yearlyRecognizedRevenue)
                    }

                    totalLeakageAmountAll = (Number(totalHighRiskAmount) + Number(totalLowRiskAmount) + Number(totalLowRiskRR) + Number(totalHighRiskRR) + Number(totalLowRiskSlippageAmount) + Number(totalHighRiskSlippageAmount) + Number(totalLowRiskEolMissingAmount) + Number(totalHighRiskEolMissingAmount))

                }
                else {
                    return res.json({
                        status: 200,
                        success: false,
                        message: "Sales not found",
                        data: {
                            lead_counts: leadCounts ? leadCounts : 0,
                            sales_activities_per_deal: {
                                total_sales_activities: 0,
                                total_deals_created: 0,
                                activity_per_deal: 0,
                            },
                            sales_counts: {
                                total_sales_count: 0,
                                closed_sales_count: 0,
                                winPercentage: 0,
                            },
                            yearly_recognized_revenue: 0,
                            monthly_revenue: [],
                            risk_sales_deals: {
                                high_risk_sales_deals: [],
                                low_risk_sales_deals: [],
                                total_high_risk_amount: 0,
                                total_low_risk_amount: 0,
                                total_sales_deals_amount: 0

                            },
                            findMissingRR: {
                                high_risk_missing_rr: [],
                                low_risk_missing_rr: [],
                                high_risk_total_missing_rr: 0,
                                low_risk_total_missing_rr: 0,
                                all_total_missing_rr: 0
                            },
                            closingDateSlippage: {
                                high_risk_sales: [],
                                low_risk_sales: [],
                                total_high_risk_slippage_amount: 0,
                                total_low_risk_slippage_amount: 0,
                                all_total_slippage_amount: 0
                            },
                            eolSales: {
                                highRiskEolSale: [],
                                lowRiskEolSale: [],
                                total_high_risk_eol_missing_amount: 0,
                                total_low_risk_eol_missing_amount: 0,
                                all_total_eol_missing_amount: 0
                            },
                            revenueGap: revenueGap,
                            totalLeakage: totalLeakage
                        },
                    });
                }
            } else {
                let s14 = dbScript(db_sql["Q8"], { var1: captainId });
                let findPermission = await connection.query(s14);
                let roleUsers = await getUserAndSubUser(findPermission.rows[0]);
                let s15 = dbScript(db_sql["Q396"], {
                    var1: selectedStartDate,
                    var2: selectedEndDate,
                    var3: roleUsers.join(","),
                });
                let findLeadCounts = await connection.query(s15);
                if (findLeadCounts.rowCount > 0) {
                    leadCounts.total_lead_count = Number(findLeadCounts.rows[0].total_lead_count);
                    leadCounts.converted_lead_count = Number(findLeadCounts.rows[0].converted_lead_count);
                    if (leadCounts.total_lead_count !== 0) {
                        leadCounts.convertedLeadPercentage =
                            (leadCounts.converted_lead_count / leadCounts.total_lead_count) * 100;
                    } else {
                        leadCounts.convertedLeadPercentage = 0;
                    }
                } else {
                    leadCounts.total_lead_count = 0
                    leadCounts.converted_lead_count = 0
                    leadCounts.convertedLeadPercentage = 0
                }

                //sales activity
                let s16 = dbScript(db_sql["Q402"], {
                    var1: selectedStartDate,
                    var2: selectedEndDate,
                    var3: roleUsers.join(","),
                });
                let findSalesActivities = await connection.query(s16);
                if (findSalesActivities.rowCount > 0) {
                    const { total_sales_activities, total_deals_created } = findSalesActivities.rows[0];
                    salesActivities.total_sales_activities = Number(total_sales_activities);
                    salesActivities.total_deals_created = Number(total_deals_created);
                    salesActivities.activity_per_deal = salesActivities.total_deals_created !== 0 ? total_sales_activities / total_deals_created : 0;
                } else {
                    salesActivities.total_sales_activities = 0;
                    salesActivities.total_deals_created = 0;
                    salesActivities.activity_per_deal = 0;
                }

                let s17 = dbScript(db_sql["Q409"], { var1: roleUsers.join(",") });
                let allSalesIds = await connection.query(s17);

                if (allSalesIds.rowCount > 0) {
                    let allSalesIdArr = [];
                    allSalesIds.rows.map((data) => {
                        if (data.sales_ids.length > 0) {
                            allSalesIdArr.push("'" + data.sales_ids.join("','") + "'");
                        }
                    })

                    let s18 = dbScript(db_sql["Q397"], {
                        var1: selectedStartDate,
                        var2: selectedEndDate,
                        var3: allSalesIdArr.join(","),
                    });
                    let findTotalAndWonDealCount = await connection.query(s18);
                    if (findTotalAndWonDealCount.rowCount > 0) {
                        const { total_sales_count, closed_sales_count } = findTotalAndWonDealCount.rows[0];
                        totalAndWonDealCount.total_sales_count = Number(total_sales_count);
                        totalAndWonDealCount.closed_sales_count = Number(closed_sales_count);
                        totalAndWonDealCount.winPercentage = total_sales_count > 0 ? (closed_sales_count / total_sales_count) * 100 : 0;
                    } else {
                        totalAndWonDealCount.total_sales_count = 0;
                        totalAndWonDealCount.closed_sales_count = 0;
                        totalAndWonDealCount.winPercentage = 0;
                    }

                    let totalMonthlySubscriptionAmount = 0;

                    let s7 = dbScript(db_sql["Q399"], {
                        var1: formattedStartDate,
                        var2: formattedEndDate,
                        var3: allSalesIdArr.join(","),
                    });

                    let findMonthlyRecognizedRevenue = await connection.query(s7);
                    if (findMonthlyRecognizedRevenue.rowCount > 0) {
                        monthlyRecognizedRevenue = findMonthlyRecognizedRevenue.rows
                        //multiply by 12 to get one year subscription
                        monthlyRecognizedRevenue.forEach(row => {
                            const amount = parseFloat(row.target_amount);
                            const multipliedAmount = amount * 12;
                            totalMonthlySubscriptionAmount += multipliedAmount;
                        });
                    } else {
                        monthlyRecognizedRevenue = []
                        totalMonthlySubscriptionAmount = 0;
                    }

                    //yearly recognized_revenue Subscription+perpetual
                    // let yearlySubscriptionAmount = 0;
                    // let s8 = dbScript(db_sql["Q398"], { var1: yearlyStartFormattedDate, var2: yearlyEndFormattedDate, var3: allSalesIdArr.join(",") });
                    // let findYearlyRecognizedRevenue = await connection.query(s8);
                    // if (findYearlyRecognizedRevenue.rowCount > 0) {
                    //     let yearlyData = findYearlyRecognizedRevenue.rows
                    //     yearlyData.forEach(row => {
                    //         yearlySubscriptionAmount += parseFloat(row.target_amount);
                    //     });
                    // } else {
                    //     yearlySubscriptionAmount = yearlySubscriptionAmount
                    // }
                    yearlyRecognizedRevenue = parseFloat(totalMonthlySubscriptionAmount)

                    //sales leakages

                    //find sales deals
                    let s9 = dbScript(db_sql["Q405"], { var1: selectedStartDate, var2: selectedEndDate, var3: allSalesIdArr.join(",") });
                    let findTotalSupport = await connection.query(s9);
                    let high_risk_sales_deals = [];
                    let low_risk_sales_deals = [];
                    let totalHighRiskAmount = 0
                    let totalLowRiskAmount = 0
                    if (findTotalSupport.rowCount > 0) {
                        for (const sale of findTotalSupport.rows) {
                            const isHighRisk = sale.ids.length < 2 || sale.notes < 0;
                            const salesDeals = isHighRisk ? high_risk_sales_deals : low_risk_sales_deals;
                            salesDeals.push({ salesId: sale.sales_id, salesName: sale.customer_name, amount: sale.target_amount });
                        }
                        totalHighRiskAmount = high_risk_sales_deals.reduce((total, sale) => total + parseInt(sale.amount), 0);
                        totalLowRiskAmount = low_risk_sales_deals.reduce((total, sale) => total + parseInt(sale.amount), 0);

                        risk_sales_deals.high_risk_sales_deals = high_risk_sales_deals;
                        risk_sales_deals.low_risk_sales_deals = low_risk_sales_deals;
                        risk_sales_deals.total_high_risk_amount = totalHighRiskAmount;
                        risk_sales_deals.total_low_risk_amount = totalLowRiskAmount;
                        risk_sales_deals.total_sales_deals_amount = totalHighRiskAmount + totalLowRiskAmount;
                    } else {
                        risk_sales_deals.high_risk_sales_deals = []
                        risk_sales_deals.low_risk_sales_deals = []
                        risk_sales_deals.total_high_risk_amount = 0;
                        risk_sales_deals.total_low_risk_amount = 0;
                        risk_sales_deals.total_sales_deals_amount = 0
                    }

                    //finding missing rr
                    let s10 = dbScript(db_sql["Q406"], {
                        var1: selectedStartDate,
                        var2: selectedEndDate,
                        var3: allSalesIdArr.join(","),
                    });
                    let findMissingRecognized = await connection.query(s10);

                    let high_risk_missing_rr = [];
                    let low_risk_missing_rr = [];
                    let totalHighRiskRR = 0;
                    let totalLowRiskRR = 0;

                    if (findMissingRecognized.rowCount > 0) {
                        findMissingRecognized.rows.forEach((item) => {
                            if (item.recognized_amount === "0") {
                                high_risk_missing_rr.push({ salesId: item.sales_id, customer_name: item.customer_name, amount: item.target_amount });
                            } else {
                                if (!low_risk_missing_rr[item.sales_id]) {
                                    low_risk_missing_rr[item.sales_id] = {
                                        customer_name: item.customer_name,
                                        salesId: item.sales_id,
                                        recognized_amount: 0,
                                        target_amount: parseFloat(item.target_amount),
                                    };
                                }
                                low_risk_missing_rr[item.sales_id].recognized_amount += parseFloat(item.recognized_amount);
                            }
                        });

                        Object.values(low_risk_missing_rr).forEach((item) => {
                            const amountDifference = item.target_amount - item.recognized_amount;
                            item.amount = amountDifference;
                        });

                        high_risk_missing_rr.forEach((item) => {
                            totalHighRiskRR += parseInt(item.amount);
                        });

                        Object.values(low_risk_missing_rr).forEach((item) => {
                            totalLowRiskRR += parseInt(item.amount);
                        });

                        missingRR.high_risk_missing_rr = high_risk_missing_rr;
                        missingRR.low_risk_missing_rr = Object.values(low_risk_missing_rr);
                    } else {
                        missingRR.high_risk_missing_rr = [];
                        missingRR.low_risk_missing_rr = [];
                    }

                    missingRR.high_risk_total_missing_rr = totalHighRiskRR;
                    missingRR.low_risk_total_missing_rr = totalLowRiskRR;
                    missingRR.all_total_missing_rr = totalHighRiskRR + totalLowRiskRR;
                    totalLeakageAmountClosed = totalHighRiskRR + totalLowRiskRR;

                    //find slippage date
                    let s11 = dbScript(db_sql['Q408'], {
                        var1: selectedStartDate,
                        var2: selectedEndDate,
                        var3: allSalesIdArr.join(","),
                    })
                    let findDateSlippage = await connection.query(s11)

                    const high_risk_sales = [];
                    const low_risk_sales = [];
                    const salesBySalesId = {};
                    let totalLowRiskSlippageAmount = 0
                    let totalHighRiskSlippageAmount = 0
                    if (findDateSlippage.rowCount > 0) {
                        // Group sales by sales_id and track target_closing_dates
                        for (const sale of findDateSlippage.rows) {
                            if (!salesBySalesId[sale.sales_id]) {
                                salesBySalesId[sale.sales_id] = {
                                    targetClosingDates: new Set(),
                                    salesId: sale.sales_id,
                                    customer_name: sale.customer_name,
                                    amount: sale.target_amount
                                };
                            }
                            const salesInfo = salesBySalesId[sale.sales_id];
                            salesInfo.targetClosingDates.add(sale.target_closing_date);
                        }

                        // Categorize sales based on target_closing_dates count
                        for (const salesId in salesBySalesId) {
                            const salesInfo = salesBySalesId[salesId];

                            if (salesInfo.targetClosingDates.size > 1) {
                                high_risk_sales.push({ sales_id: salesId, customer_name: salesInfo.customer_name, missing_amount: salesInfo.amount });
                            } else {
                                low_risk_sales.push({ sales_id: salesId, customer_name: salesInfo.customer_name, missing_amount: salesInfo.amount });
                            }
                        }

                        totalHighRiskSlippageAmount = high_risk_sales.reduce((total, sale) => total + parseInt(sale.missing_amount), 0);
                        totalLowRiskSlippageAmount = low_risk_sales.reduce((total, sale) => total + parseInt(sale.missing_amount), 0);

                        closingDateSlippage.high_risk_sales = high_risk_sales
                        closingDateSlippage.low_risk_sales = low_risk_sales
                        closingDateSlippage.total_high_risk_slippage_amount = totalHighRiskSlippageAmount
                        closingDateSlippage.total_low_risk_slippage_amount = totalLowRiskSlippageAmount
                        closingDateSlippage.all_total_slippage_amount = Number(totalHighRiskSlippageAmount + totalLowRiskSlippageAmount)
                    } else {
                        closingDateSlippage.high_risk_sales = high_risk_sales
                        closingDateSlippage.low_risk_sales = low_risk_sales
                        closingDateSlippage.total_high_risk_slippage_amount = 0
                        closingDateSlippage.total_low_risk_slippage_amount = 0
                        closingDateSlippage.all_total_slippage_amount = 0
                    }

                    //EOL products
                    let s12 = dbScript(db_sql['Q411'], { var1: allSalesIdArr.join(","), var2: SformattedDate, var3: EformattedDate })
                    let findEOLProduct = await connection.query(s12)
                    if (findEOLProduct.rowCount > 0) {
                        let findEOLSales = await calculateEOLProducts(findEOLProduct.rows);
                        eolSales = findEOLSales;
                    } else {
                        eolSales = {
                            highRiskEolSale: [],
                            lowRiskEolSale: []
                        }
                    }

                    let totalHighRiskEolMissingAmount = eolSales.highRiskEolSale.reduce((total, sale) => total + parseInt(sale.target_amount), 0);
                    let totalLowRiskEolMissingAmount = eolSales.lowRiskEolSale.reduce((total, sale) => total + parseInt(sale.target_amount), 0);
                    eolSales.total_high_risk_eol_missing_amount = totalHighRiskEolMissingAmount
                    eolSales.total_low_risk_eol_missing_amount = totalLowRiskEolMissingAmount
                    eolSales.all_total_eol_missing_amount = Number(totalHighRiskEolMissingAmount + totalLowRiskEolMissingAmount)

                    let s13 = dbScript(db_sql['Q410'], { var1: roleUsers.join(",") })
                    let findForecastAmount = await connection.query(s13)
                    let totalForecaseAmount = 0
                    if (findForecastAmount.rowCount > 0) {
                        for (let amount of findForecastAmount.rows) {
                            totalForecaseAmount += Number(amount.amount)
                        }
                        revenueGap = totalForecaseAmount - Number(yearlyRecognizedRevenue)
                    } else {
                        revenueGap = 0 - Number(yearlyRecognizedRevenue)
                    }

                    totalLeakageAmountAll = (Number(totalHighRiskAmount) + Number(totalLowRiskAmount) + Number(totalLowRiskRR) + Number(totalHighRiskRR) + Number(totalLowRiskSlippageAmount) + Number(totalHighRiskSlippageAmount) + Number(totalLowRiskEolMissingAmount) + Number(totalHighRiskEolMissingAmount))
                } else {
                    res.json({
                        status: 200,
                        success: false,
                        message: "Sales not found",
                        data: {
                            lead_counts: findLeadCounts.rows[0] ? findLeadCounts.rows[0] : 0,
                            sales_activities_per_deal: {
                                total_sales_activities: 0,
                                total_deals_created: 0,
                                activity_per_deal: 0,
                            },
                            sales_counts: {
                                total_sales_count: 0,
                                closed_sales_count: 0,
                                winPercentage: 0,
                            },
                            yearly_recognized_revenue: 0,
                            monthly_revenue: [],
                            risk_sales_deals: {
                                high_risk_sales_deals: [],
                                low_risk_sales_deals: [],
                                total_high_risk_amount: 0,
                                total_low_risk_amount: 0,
                                total_sales_deals_amount: 0

                            },
                            findMissingRR: {
                                high_risk_missing_rr: [],
                                low_risk_missing_rr: [],
                                high_risk_total_missing_rr: 0,
                                low_risk_total_missing_rr: 0,
                                all_total_missing_rr: 0
                            },
                            closingDateSlippage: {
                                high_risk_sales: [],
                                low_risk_sales: [],
                                total_high_risk_slippage_amount: 0,
                                total_low_risk_slippage_amount: 0,
                                all_total_slippage_amount: 0
                            },
                            eolSales: {
                                highRiskEolSale: [],
                                lowRiskEolSale: [],
                                total_high_risk_eol_missing_amount: 0,
                                total_low_risk_eol_missing_amount: 0,
                                all_total_eol_missing_amount: 0
                            },
                            revenueGap: 0,
                            totalLeakage: 0
                        },
                    });

                }
            }
            res.json({
                status: 200,
                success: true,
                message: "sales Matrics data",
                data: {
                    lead_counts: leadCounts,
                    sales_activities_per_deal: salesActivities,
                    sales_counts: totalAndWonDealCount,
                    monthly_revenue: monthlyRecognizedRevenue,
                    yearly_recognized_revenue: yearlyRecognizedRevenue,
                    risk_sales_deals: risk_sales_deals,
                    findMissingRR: missingRR,
                    closingDateSlippage: closingDateSlippage,
                    eolSales: eolSales,
                    revenueGap: revenueGap,
                    totalLeakage: totalLeakageAmountAll
                },
            });
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
}

module.exports.getAllApiDeatilsRelatedSales = async (req, res) => {
    try {
        let userId = req.user.id
        let allDetails = {};

        let productModule = process.env.PRODUCTS_MODULE;
        let s1 = dbScript(db_sql['Q41'], { var1: productModule, var2: userId })
        let checkPermissionForProduct = await connection.query(s1)
        if (checkPermissionForProduct.rows[0].permission_to_view_global) {
            // here we are getting product deatils by global permission

            let s2 = dbScript(db_sql['Q84'], { var1: checkPermissionForProduct.rows[0].company_id })
            let productList = await connection.query(s2)
            if (productList.rowCount > 0) {
                allDetails.productList = productList.rows
            } else {
                allDetails.productList = []
            }

        } else if (checkPermissionForProduct.rows[0].permission_to_view_own) {
            // here we are getting product deatils by own permission of user and its child user
            let roleUsers = await getUserAndSubUser(checkPermissionForProduct.rows[0]);

            let s1 = dbScript(db_sql['Q270'], { var1: roleUsers.join(",") })
            let productList = await connection.query(s1)
            if (productList.rowCount > 0) {
                allDetails.productList = productList.rows
            } else {
                allDetails.productList = []
            }

        }

        let customerModule = process.env.CUSTOMERS_MODULE;
        let s2 = dbScript(db_sql['Q41'], { var1: customerModule, var2: userId })
        let checkPermissionForCustomer = await connection.query(s2)
        if (checkPermissionForCustomer.rows[0].permission_to_view_global) {
            // here we are getting customer deatils by global permission

            let s3 = dbScript(db_sql['Q39'], { var1: checkPermissionForCustomer.rows[0].company_id })
            let customerList = await connection.query(s3)
            if (customerList.rowCount > 0) {
                allDetails.customerList = customerList.rows
            } else {
                allDetails.customerList = []
            }

        } else if (checkPermissionForCustomer.rows[0].permission_to_view_own) {
            // here we are getting customer deatils by own permission of user and its child user
            let roleUsers = await getUserAndSubUser(checkPermissionForCustomer.rows[0]);

            let s2 = dbScript(db_sql['Q271'], { var1: roleUsers.join(","), var2: false })
            let customerList = await connection.query(s2)
            if (customerList.rowCount > 0) {
                allDetails.customerList = customerList.rows
            } else {
                allDetails.customerList = []
            }
        }

        let slabModule = process.env.SLABS_MODULE;
        let s3 = dbScript(db_sql['Q41'], { var1: slabModule, var2: userId })
        let checkPermissionForslab = await connection.query(s3)
        if (checkPermissionForslab.rows[0].permission_to_view_global) {
            // here we are getting slab deatils by global permission

            let s5 = dbScript(db_sql['Q17'], { var1: checkPermissionForslab.rows[0].company_id })
            let slabList = await connection.query(s5)
            if (slabList.rowCount > 0) {
                const unique = [...new Map(slabList.rows.map(item => [item['slab_id'], item])).values()]
                allDetails.slabList = unique;
            } else {
                allDetails.slabList = []
            }

        } else if (checkPermissionForslab.rows[0].permission_to_view_own) {
            // here we are getting slab deatils by own permission of user and its child user
            let roleUsers = await getUserAndSubUser(checkPermissionForslab.rows[0]);

            let s4 = dbScript(db_sql['Q17'], { var1: checkPermissionForslab.rows[0].company_id })
            let slabList = await connection.query(s4)
            if (slabList.rowCount > 0) {
                const unique = [...new Map(slabList.rows.map(item => [item['slab_id'], item])).values()]
                allDetails.slabList = unique;
            } else {
                allDetails.slabList = []
            }
        }

        let commissionModule = process.env.COMMISSIONS_MODULE;
        let s4 = dbScript(db_sql['Q41'], { var1: commissionModule, var2: userId })
        let checkPermissionForCommission = await connection.query(s4)
        if (checkPermissionForCommission.rows[0].permission_to_view_global) {
            // here we are getting commissionSlab deatils by global permission

            let s6 = dbScript(db_sql['Q50'], { var1: checkPermissionForCommission.rows[0].company_id })
            let commissionList = await connection.query(s6)
            if (commissionList.rowCount > 0) {
                allDetails.commissionList = commissionList.rows
            } else {
                allDetails.commissionList = []
            }

        } else if (checkPermissionForCommission.rows[0].permission_to_view_own) {
            // here we are getting commissionSlab deatils by own permission of user and its child user
            let roleUsers = await getUserAndSubUser(checkPermissionForCommission.rows[0]);

            let s5 = dbScript(db_sql['Q50'], { var1: checkPermissionForCommission.rows[0].company_id })
            let commissionList = await connection.query(s5)
            if (commissionList.rowCount > 0) {
                allDetails.commissionList = commissionList.rows
            } else {
                allDetails.commissionList = []
            }
        }

        let usersModule = process.env.USERS_MODULE;
        let s5 = dbScript(db_sql['Q41'], { var1: usersModule, var2: userId })
        let checkPermissionForusers = await connection.query(s5)
        if (checkPermissionForusers.rows[0].permission_to_view_global) {
            // here we are getting Users deatils by global permission

            let s4 = dbScript(db_sql['Q15'], { var1: checkPermissionForusers.rows[0].company_id })
            let userList = await connection.query(s4);
            if (userList.rowCount > 0) {
                allDetails.userList = userList.rows
            } else {
                allDetails.userList = []
            }

        } else if (checkPermissionForusers.rows[0].permission_to_view_own) {
            // here we are getting Users deatils by own permission of user and its child user
            let roleUsers = await getUserAndSubUser(checkPermissionForusers.rows[0]);

            let s3 = dbScript(db_sql['Q272'], { var1: roleUsers.join(",") })
            let userList = await connection.query(s3);
            if (userList.rowCount > 0) {
                allDetails.userList = userList.rows
            } else {
                allDetails.userList = []
            }

        }

        if (allDetails) {
            res.json({
                status: 200,
                success: true,
                message: "All details list",
                data: allDetails
            })
        } else {
            res.json({
                status: 200,
                success: false,
                message: "Empty details list",
                data: []
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
