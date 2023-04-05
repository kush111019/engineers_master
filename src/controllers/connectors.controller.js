const LinkedIn = require('node-linkedin')(process.env.LINKEDIN_CLIENT_ID, process.env.LINKEDIN_CLIENT_SECRET, process.env.REDIRECT_URL)
const hubspot = require('@hubspot/api-client')
const { Connection, OAuth2 } = require('jsforce');
const axios = require('axios');
const FormData = require('form-data');
const qs = require('qs');
const connection = require('../database/connection');
const { dbScript, db_sql } = require('../utils/db_scripts');
const moduleName = process.env.DASHBOARD_MODULE
const { mysql_real_escape_string } = require('../utils/helper')

//Sales Force auth client
const oauth2Client = new OAuth2({
    clientId: process.env.SALESFORCE_CONSUMER_KEY,
    clientSecret: process.env.SALESFORCE_CONSUMER_SECRET,
    redirectUri: process.env.REDIRECT_URL, // Your redirect URL
});

//Hubspot auth client
const hubspotClient = new hubspot.Client({ developerApiKey: process.env.HUBSPOT_API_KEY })


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
        if (provider.toLowerCase() == 'linkedin') {
            let scope = ['r_liteprofile', 'r_emailaddress'];
            const authUrl = LinkedIn.auth.authorize(scope, 'state');
            res.json({
                status: 200,
                success: true,
                data: authUrl,
            })
        }
        if (provider.toLowerCase() == 'hubspot') {
            const scope = ['content']
            const authUrl = hubspotClient.oauth.getAuthorizationUrl(process.env.HUBSPOT_CLIENT_ID, process.env.REDIRECT_URL, scope)
            res.json({
                status: 200,
                success: true,
                data: authUrl,
            })
        }
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
        const { code, state, provider } = req.query;
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findUser = await connection.query(s1)
        if (findUser.rowCount > 0) {
            if (provider.toLowerCase() == 'linkedin') {
                await connection.query('BEGIN')
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
                        console.error(error.response.data);
                    });
            }
        } else {
            await connection.query('ROLLBACK')
            res.json({
                status: 400,
                success: false,
                message: "Invalid user",
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
                        accessToken = accessData.salesforce_token
                    }

                    axios.get('https://login.salesforce.com/services/oauth2/userinfo', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    })
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
                                                let titleId = '';
                                                let s3 = dbScript(db_sql['Q192'], { var1: data.Title, var2: accessData.company_id })
                                                let findTitle = await connection.query(s3)
                                                if (findTitle.rowCount == 0) {
                                                    let s4 = dbScript(db_sql['Q178'], { var1: data.Title, var2: accessData.company_id })
                                                    let insertTitle = await connection.query(s4)
                                                    titleId = insertTitle.rows[0].id
                                                } else {
                                                    titleId = findTitle.rows[0].id
                                                }

                                                let sourceId = '';
                                                let s5 = dbScript(db_sql['Q191'], { var1: data.LeadSource, var2: accessData.company_id })
                                                let findSource = await connection.query(s5)
                                                if (findSource.rowCount == 0) {
                                                    let s6 = dbScript(db_sql['Q186'], { var1: data.LeadSource, var2: accessData.company_id })
                                                    let insertSource = await connection.query(s6)
                                                    sourceId = insertSource.rows[0].id
                                                } else {
                                                    sourceId = findSource.rows[0].id
                                                }

                                                let industryId = '';
                                                if (data.Industry) {
                                                    let s7 = dbScript(db_sql['Q193'], { var1: data.Industry, var2: accessData.company_id })
                                                    let findIndustry = await connection.query(s7)
                                                    if (findIndustry.rowCount == 0) {
                                                        let s8 = dbScript(db_sql['Q182'], { var1: data.Industry, var2: accessData.company_id })
                                                        let insertIndustry = await connection.query(s8)
                                                        industryId = insertIndustry.rows[0].id
                                                    } else {
                                                        industryId = findIndustry.rows[0].id
                                                    }
                                                }

                                                let address = ''
                                                if (data.Street) {
                                                    address = address.concat(data.Street + ',')
                                                }
                                                if (data.City) {
                                                    address = address.concat(data.City + ',')
                                                }
                                                if (data.State) {
                                                    address = address.concat(data.State + ',')
                                                }
                                                if (data.Country) {
                                                    address = address.concat(data.Country)
                                                }

                                                // Remove the trailing comma, if any
                                                if (address.slice(-1) === ',') {
                                                    address = address.slice(0, -1);
                                                }

                                                let customerId = ''
                                                let s12 = dbScript(db_sql['Q312'], { var1: mysql_real_escape_string(data.Company), var2: accessData.company_id })
                                                let findCustomer = await connection.query(s12)
                                                if (findCustomer.rowCount == 0) {
                                                    let s9 = dbScript(db_sql['Q36'], { var1: accessData.user_id, var2: mysql_real_escape_string(data.Company), var3: accessData.company_id, var4: mysql_real_escape_string(address), var5: 'UNITED STATE DOLLAR (USD)', var6: (industryId == '') ? 'null' : industryId })
                                                    let createCustomer = await connection.query(s9)
                                                    customerId = createCustomer.rows[0].id
                                                } else {
                                                    customerId = findCustomer.rows[0].id
                                                }

                                                let leadAddress = ''
                                                if (data.Address.street) {
                                                    leadAddress = leadAddress.concat(data.Address.street + ',')
                                                }
                                                if (data.Address.city) {
                                                    leadAddress = leadAddress.concat(data.Address.city + ',')
                                                }
                                                if (data.Address.state) {
                                                    leadAddress = leadAddress.concat(data.Address.state + ',')
                                                }
                                                if (data.Address.country) {
                                                    leadAddress = leadAddress.concat(data.Address.country)
                                                }
                                                // Remove the trailing comma, if any
                                                if (leadAddress.slice(-1) === ',') {
                                                    leadAddress = leadAddress.slice(0, -1);
                                                }
                                                let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(data.Name), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.Email), var4: data.Phone, var5: mysql_real_escape_string(leadAddress), var6: sourceId ? sourceId : 'null', var7: '', var8: data.Website ? data.Website : 'null', var9: '', var10: false, var11: 'null', var12: data.Description ? mysql_real_escape_string(data.Description) : '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.uniqueId__c, var18: 'salesforce', var19: 'null' })
                                                let createLead = await connection.query(s11)
                                            }
                                        } else {
                                            for (let data of response.data.records) {
                                                if (new Date(accessData.salesforce_last_sync) < new Date(data.LastModifiedDate)) {
                                                    let titleId = '';
                                                    let s3 = dbScript(db_sql['Q192'], { var1: data.Title, var2: accessData.company_id })
                                                    let findTitle = await connection.query(s3)
                                                    if (findTitle.rowCount == 0) {
                                                        let s4 = dbScript(db_sql['Q178'], { var1: data.Title, var2: accessData.company_id })
                                                        let insertTitle = await connection.query(s4)
                                                        titleId = insertTitle.rows[0].id
                                                    } else {
                                                        titleId = findTitle.rows[0].id
                                                    }

                                                    let sourceId = '';
                                                    let s5 = dbScript(db_sql['Q191'], { var1: data.LeadSource, var2: accessData.company_id })
                                                    let findSource = await connection.query(s5)
                                                    if (findSource.rowCount == 0) {
                                                        let s6 = dbScript(db_sql['Q186'], { var1: data.LeadSource, var2: accessData.company_id })
                                                        let insertSource = await connection.query(s6)
                                                        sourceId = insertSource.rows[0].id
                                                    } else {
                                                        sourceId = findSource.rows[0].id
                                                    }

                                                    let industryId = '';
                                                    if (data.Industry) {
                                                        let s7 = dbScript(db_sql['Q193'], { var1: data.Industry, var2: accessData.company_id })
                                                        let findIndustry = await connection.query(s7)
                                                        if (findIndustry.rowCount == 0) {
                                                            let s8 = dbScript(db_sql['Q182'], { var1: data.Industry, var2: accessData.company_id })
                                                            let insertIndustry = await connection.query(s8)
                                                            industryId = insertIndustry.rows[0].id
                                                        } else {
                                                            industryId = findIndustry.rows[0].id
                                                        }
                                                    }

                                                    let address = ''
                                                    if (data.Street) {
                                                        address = address.concat(data.Street + ',')
                                                    }
                                                    if (data.City) {
                                                        address = address.concat(data.City + ',')
                                                    }
                                                    if (data.State) {
                                                        address = address.concat(data.State + ',')
                                                    }
                                                    if (data.Country) {
                                                        address = address.concat(data.Country)
                                                    }

                                                    // Remove the trailing comma, if any
                                                    if (address.slice(-1) === ',') {
                                                        address = address.slice(0, -1);
                                                    }

                                                    let customerId = ''
                                                    let s12 = dbScript(db_sql['Q312'], { var1: mysql_real_escape_string(data.Company), var2: accessData.company_id })
                                                    let findCustomer = await connection.query(s12)
                                                    if (findCustomer.rowCount == 0) {
                                                        let s9 = dbScript(db_sql['Q36'], { var1: accessData.user_id, var2: mysql_real_escape_string(data.Company), var3: accessData.company_id, var4: mysql_real_escape_string(address), var5: 'UNITED STATE DOLLAR (USD)', var6: (industryId == '') ? 'null' : industryId })
                                                        let createCustomer = await connection.query(s9)
                                                        customerId = createCustomer.rows[0].id
                                                    } else {
                                                        customerId = findCustomer.rows[0].id
                                                    }

                                                    let leadAddress = ''
                                                    if (data.Address.street) {
                                                        leadAddress = leadAddress.concat(data.Address.street + ',')
                                                    }
                                                    if (data.Address.city) {
                                                        leadAddress = leadAddress.concat(data.Address.city + ',')
                                                    }
                                                    if (data.Address.state) {
                                                        leadAddress = leadAddress.concat(data.Address.state + ',')
                                                    }
                                                    if (data.Address.country) {
                                                        leadAddress = leadAddress.concat(data.Address.country)
                                                    }
                                                    // Remove the trailing comma, if any
                                                    if (leadAddress.slice(-1) === ',') {
                                                        leadAddress = leadAddress.slice(0, -1);
                                                    }

                                                    let s10 = dbScript(db_sql['Q322'], { var1: data.uniqueId__c })
                                                    let checkLead = await connection.query(s10)
                                                    if (checkLead.rowCount > 0) {
                                                        let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(data.Name), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.Email), var4: data.Phone, var5: mysql_real_escape_string(leadAddress), var6: sourceId ? sourceId : 'null', var7: '', var8: data.Website ? data.Website : 'null', var9: '', var10: false, var11: 'null', var12: data.Description ? mysql_real_escape_string(data.Description) : '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.uniqueId__c, var18: 'salesforce', var19: checkLead.rows[0].id })
                                                        let createLead = await connection.query(s11)
                                                    }else{
                                                        let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(data.Name), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.Email), var4: data.Phone, var5: mysql_real_escape_string(leadAddress), var6: sourceId ? sourceId : 'null', var7: '', var8: data.Website ? data.Website : 'null', var9: '', var10: false, var11: 'null', var12: data.Description ? mysql_real_escape_string(data.Description) : '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.uniqueId__c, var18: 'salesforce', var19: 'null' })
                                                        let createLead = await connection.query(s11)
                                                    }
                                                } else {
                                                    let s10 = dbScript(db_sql['Q322'], { var1: data.uniqueId__c })
                                                    let checkLead = await connection.query(s10)
                                                    if (checkLead.rowCount == 0) {
                                                        let titleId = '';
                                                        let s3 = dbScript(db_sql['Q192'], { var1: data.Title, var2: accessData.company_id })
                                                        let findTitle = await connection.query(s3)
                                                        if (findTitle.rowCount == 0) {
                                                            let s4 = dbScript(db_sql['Q178'], { var1: data.Title, var2: accessData.company_id })
                                                            let insertTitle = await connection.query(s4)
                                                            titleId = insertTitle.rows[0].id
                                                        } else {
                                                            titleId = findTitle.rows[0].id
                                                        }

                                                        let sourceId = '';
                                                        let s5 = dbScript(db_sql['Q191'], { var1: data.LeadSource, var2: accessData.company_id })
                                                        let findSource = await connection.query(s5)
                                                        if (findSource.rowCount == 0) {
                                                            let s6 = dbScript(db_sql['Q186'], { var1: data.LeadSource, var2: accessData.company_id })
                                                            let insertSource = await connection.query(s6)
                                                            sourceId = insertSource.rows[0].id
                                                        } else {
                                                            sourceId = findSource.rows[0].id
                                                        }

                                                        let industryId = '';
                                                        if (data.Industry) {
                                                            let s7 = dbScript(db_sql['Q193'], { var1: data.Industry, var2: accessData.company_id })
                                                            let findIndustry = await connection.query(s7)
                                                            if (findIndustry.rowCount == 0) {
                                                                let s8 = dbScript(db_sql['Q182'], { var1: data.Industry, var2: accessData.company_id })
                                                                let insertIndustry = await connection.query(s8)
                                                                industryId = insertIndustry.rows[0].id
                                                            } else {
                                                                industryId = findIndustry.rows[0].id
                                                            }
                                                        }

                                                        let address = ''
                                                        if (data.Street) {
                                                            address = address.concat(data.Street + ',')
                                                        }
                                                        if (data.City) {
                                                            address = address.concat(data.City + ',')
                                                        }
                                                        if (data.State) {
                                                            address = address.concat(data.State + ',')
                                                        }
                                                        if (data.Country) {
                                                            address = address.concat(data.Country)
                                                        }

                                                        // Remove the trailing comma, if any
                                                        if (address.slice(-1) === ',') {
                                                            address = address.slice(0, -1);
                                                        }

                                                        let customerId = ''
                                                        let s12 = dbScript(db_sql['Q312'], { var1: mysql_real_escape_string(data.Company), var2: accessData.company_id })
                                                        let findCustomer = await connection.query(s12)
                                                        if (findCustomer.rowCount == 0) {
                                                            let s9 = dbScript(db_sql['Q36'], { var1: accessData.user_id, var2: mysql_real_escape_string(data.Company), var3: accessData.company_id, var4: mysql_real_escape_string(address), var5: 'UNITED STATE DOLLAR (USD)', var6: (industryId == '') ? 'null' : industryId })
                                                            let createCustomer = await connection.query(s9)
                                                            customerId = createCustomer.rows[0].id
                                                        } else {
                                                            customerId = findCustomer.rows[0].id
                                                        }

                                                        let leadAddress = ''
                                                        if (data.Address.street) {
                                                            leadAddress = leadAddress.concat(data.Address.street + ',')
                                                        }
                                                        if (data.Address.city) {
                                                            leadAddress = leadAddress.concat(data.Address.city + ',')
                                                        }
                                                        if (data.Address.state) {
                                                            leadAddress = leadAddress.concat(data.Address.state + ',')
                                                        }
                                                        if (data.Address.country) {
                                                            leadAddress = leadAddress.concat(data.Address.country)
                                                        }
                                                        // Remove the trailing comma, if any
                                                        if (leadAddress.slice(-1) === ',') {
                                                            leadAddress = leadAddress.slice(0, -1);
                                                        }

                                                        let s10 = dbScript(db_sql['Q322'], { var1: data.uniqueId__c })
                                                        let checkLead = await connection.query(s10)
                                                        if (checkLead.rowCount > 0) {
                                                            let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(data.Name), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.Email), var4: data.Phone, var5: mysql_real_escape_string(leadAddress), var6: sourceId ? sourceId : 'null', var7: '', var8: data.Website ? data.Website : 'null', var9: '', var10: false, var11: 'null', var12: data.Description ? mysql_real_escape_string(data.Description) : '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.uniqueId__c, var18: 'salesforce', var19: 'null' })
                                                            let createLead = await connection.query(s11)
                                                        }
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
            if (accessData.hubspot_status) {
                await connection.query('BEGIN')
                try {
                    let curDate = new Date();
                    let expiryDate = new Date(accessData.hubspot_expiry)
                    let accessToken = ''
                    if (expiryDate < curDate) {
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
                    const apiResponse = await hubspotClient.crm.contacts.basicApi.getPage(limit, after, properties, propertiesWithHistory, associations, archived);
                    let leadsData = apiResponse.results
                    if (leadsData.length > 0) {
                        let s1 = dbScript(db_sql['Q308'], { var1: accessData.company_id })
                        let findSyncLead = await connection.query(s1)

                        if (findSyncLead.rowCount == 0) {
                            //Initial insertion
                            for (let data of leadsData) {
                                let titleId = '';
                                let s3 = dbScript(db_sql['Q192'], { var1: data.properties.jobtitle, var2: accessData.company_id })
                                let findTitle = await connection.query(s3)
                                if (findTitle.rowCount == 0) {
                                    let s4 = dbScript(db_sql['Q178'], { var1: data.properties.jobtitle, var2: accessData.company_id })
                                    let insertTitle = await connection.query(s4)
                                    titleId = insertTitle.rows[0].id
                                } else {
                                    titleId = findTitle.rows[0].id
                                }

                                let sourceId = '';
                                let s5 = dbScript(db_sql['Q191'], { var1: 'hubspot', var2: accessData.company_id })
                                let findSource = await connection.query(s5)
                                if (findSource.rowCount == 0) {
                                    let s6 = dbScript(db_sql['Q186'], { var1: 'hubspot', var2: accessData.company_id })
                                    let insertSource = await connection.query(s6)
                                    sourceId = insertSource.rows[0].id
                                } else {
                                    sourceId = findSource.rows[0].id
                                }

                                let industryId = '';
                                if (data.properties.industry) {
                                    let s7 = dbScript(db_sql['Q193'], { var1: data.properties.industry, var2: accessData.company_id })
                                    let findIndustry = await connection.query(s7)
                                    if (findIndustry.rowCount == 0) {
                                        let s8 = dbScript(db_sql['Q182'], { var1: data.properties.industry, var2: accessData.company_id })
                                        let insertIndustry = await connection.query(s8)
                                        industryId = insertIndustry.rows[0].id
                                    } else {
                                        industryId = findIndustry.rows[0].id
                                    }
                                }

                                let customerId = ''
                                let s12 = dbScript(db_sql['Q312'], { var1: mysql_real_escape_string(data.properties.company), var2: accessData.company_id })
                                let findCustomer = await connection.query(s12)
                                if (findCustomer.rowCount == 0) {
                                    let s9 = dbScript(db_sql['Q36'], { var1: accessData.user_id, var2: mysql_real_escape_string(data.properties.company), var3: accessData.company_id, var4: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var5: 'UNITED STATE DOLLAR (USD)', var6: (industryId == '') ? 'null' : industryId })
                                    let createCustomer = await connection.query(s9)
                                    customerId = createCustomer.rows[0].id
                                } else {
                                    customerId = findCustomer.rows[0].id
                                }

                                let leadName = data.properties.firstname + ' ' + data.properties.lastname

                                let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(leadName), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.properties.email), var4: data.properties.phone, var5: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var6: sourceId ? sourceId : 'null', var7: '', var8: data.properties.website ? data.properties.website : '', var9: '', var10: false, var11: 'null', var12: '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.id, var18: 'hubspot', var19: 'null' })
                                let createLead = await connection.query(s11)
                            }
                        } else {
                            for (let data of leadsData) {
                                if (new Date(accessData.hubspot_last_sync) < new Date(data.updatedAt)) {
                                    let titleId = '';
                                    let s3 = dbScript(db_sql['Q192'], { var1: data.properties.jobtitle, var2: accessData.company_id })
                                    let findTitle = await connection.query(s3)
                                    if (findTitle.rowCount == 0) {
                                        let s4 = dbScript(db_sql['Q178'], { var1: data.properties.jobtitle, var2: accessData.company_id })
                                        let insertTitle = await connection.query(s4)
                                        titleId = insertTitle.rows[0].id
                                    } else {
                                        titleId = findTitle.rows[0].id
                                    }

                                    let sourceId = '';
                                    let s5 = dbScript(db_sql['Q191'], { var1: 'hubspot', var2: accessData.company_id })
                                    let findSource = await connection.query(s5)
                                    if (findSource.rowCount == 0) {
                                        let s6 = dbScript(db_sql['Q186'], { var1: 'hubspot', var2: accessData.company_id })
                                        let insertSource = await connection.query(s6)
                                        sourceId = insertSource.rows[0].id
                                    } else {
                                        sourceId = findSource.rows[0].id
                                    }

                                    let industryId = '';
                                    if (data.properties.industry) {
                                        let s7 = dbScript(db_sql['Q193'], { var1: data.properties.industry, var2: accessData.company_id })
                                        let findIndustry = await connection.query(s7)
                                        if (findIndustry.rowCount == 0) {
                                            let s8 = dbScript(db_sql['Q182'], { var1: data.properties.industry, var2: accessData.company_id })
                                            let insertIndustry = await connection.query(s8)
                                            industryId = insertIndustry.rows[0].id
                                        } else {
                                            industryId = findIndustry.rows[0].id
                                        }
                                    }

                                    let customerId = ''
                                    let s12 = dbScript(db_sql['Q312'], { var1: mysql_real_escape_string(data.properties.company), var2: accessData.company_id })
                                    let findCustomer = await connection.query(s12)
                                    if (findCustomer.rowCount == 0) {
                                        let s9 = dbScript(db_sql['Q36'], { var1: accessData.user_id, var2: mysql_real_escape_string(data.properties.company), var3: accessData.company_id, var4: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var5: 'UNITED STATE DOLLAR (USD)', var6: (industryId == '') ? 'null' : industryId })
                                        let createCustomer = await connection.query(s9)
                                        customerId = createCustomer.rows[0].id
                                    } else {
                                        customerId = findCustomer.rows[0].id
                                    }

                                    let leadName = data.properties.firstname + ' ' + data.properties.lastname

                                    let s10 = dbScript(db_sql['Q322'], { var1: data.id })
                                    let checkLead = await connection.query(s10)
                                    if (checkLead.rowCount > 0) {
                                        let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(leadName), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.properties.email), var4: data.properties.phone, var5: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var6: sourceId ? sourceId : 'null', var7: '', var8: data.properties.website ? data.properties.website : '', var9: '', var10: false, var11: 'null', var12: '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.id, var18: 'hubspot', var19: checkLead.rows[0].id })
                                        let createLead = await connection.query(s11)
                                    }else{
                                        let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(leadName), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.properties.email), var4: data.properties.phone, var5: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var6: sourceId ? sourceId : 'null', var7: '', var8: data.properties.website ? data.properties.website : '', var9: '', var10: false, var11: 'null', var12: '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.id, var18: 'hubspot', var19: 'null' })
                                        let createLead = await connection.query(s11)
                                    }
                                } else {
                                    let s10 = dbScript(db_sql['Q322'], { var1: data.id })
                                    let checkLead = await connection.query(s10)
                                    if (checkLead.rowCount == 0) {
                                        let titleId = '';
                                        let s3 = dbScript(db_sql['Q192'], { var1: data.properties.jobtitle, var2: accessData.company_id })
                                        let findTitle = await connection.query(s3)
                                        if (findTitle.rowCount == 0) {
                                            let s4 = dbScript(db_sql['Q178'], { var1: data.properties.jobtitle, var2: accessData.company_id })
                                            let insertTitle = await connection.query(s4)
                                            titleId = insertTitle.rows[0].id
                                        } else {
                                            titleId = findTitle.rows[0].id
                                        }

                                        let sourceId = '';
                                        let s5 = dbScript(db_sql['Q191'], { var1: 'hubspot', var2: accessData.company_id })
                                        let findSource = await connection.query(s5)
                                        if (findSource.rowCount == 0) {
                                            let s6 = dbScript(db_sql['Q186'], { var1: 'hubspot', var2: accessData.company_id })
                                            let insertSource = await connection.query(s6)
                                            sourceId = insertSource.rows[0].id
                                        } else {
                                            sourceId = findSource.rows[0].id
                                        }

                                        let industryId = '';
                                        if (data.properties.industry) {
                                            let s7 = dbScript(db_sql['Q193'], { var1: data.properties.industry, var2: accessData.company_id })
                                            let findIndustry = await connection.query(s7)
                                            if (findIndustry.rowCount == 0) {
                                                let s8 = dbScript(db_sql['Q182'], { var1: data.properties.industry, var2: accessData.company_id })
                                                let insertIndustry = await connection.query(s8)
                                                industryId = insertIndustry.rows[0].id
                                            } else {
                                                industryId = findIndustry.rows[0].id
                                            }
                                        }

                                        let customerId = ''
                                        let s12 = dbScript(db_sql['Q312'], { var1: mysql_real_escape_string(data.properties.company), var2: accessData.company_id })
                                        let findCustomer = await connection.query(s12)
                                        if (findCustomer.rowCount == 0) {
                                            let s9 = dbScript(db_sql['Q36'], { var1: accessData.user_id, var2: mysql_real_escape_string(data.properties.company), var3: accessData.company_id, var4: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var5: 'UNITED STATE DOLLAR (USD)', var6: (industryId == '') ? 'null' : industryId })
                                            let createCustomer = await connection.query(s9)
                                            customerId = createCustomer.rows[0].id
                                        } else {
                                            customerId = findCustomer.rows[0].id
                                        }

                                        let leadName = data.properties.firstname + ' ' + data.properties.lastname

                                        let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(leadName), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.properties.email), var4: data.properties.phone, var5: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var6: sourceId ? sourceId : 'null', var7: '', var8: data.properties.website ? data.properties.website : '', var9: '', var10: false, var11: 'null', var12: '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.id, var18: 'hubspot', var19: 'null' })
                                        let createLead = await connection.query(s11)
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
                    console.log(error)
                }
            }
        }
    }
}

module.exports.leadReSync = async (req, res) => {
    let userId = req.user.id
    const { provider } = req.query;
    let s1 = dbScript(db_sql['Q8'], { var1: userId })
    let findUser = await connection.query(s1)
    if (findUser.rowCount > 0) {
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
                                console.log(res.data, "res data");
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
                        accessToken = accessData.salesforce_token
                    }
                    axios.get('https://login.salesforce.com/services/oauth2/userinfo', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    })
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
                                                let titleId = '';
                                                let s3 = dbScript(db_sql['Q192'], { var1: data.Title, var2: accessData.company_id })
                                                let findTitle = await connection.query(s3)
                                                if (findTitle.rowCount == 0) {
                                                    let s4 = dbScript(db_sql['Q178'], { var1: data.Title, var2: accessData.company_id })
                                                    let insertTitle = await connection.query(s4)
                                                    titleId = insertTitle.rows[0].id
                                                } else {
                                                    titleId = findTitle.rows[0].id
                                                }

                                                let sourceId = '';
                                                let s5 = dbScript(db_sql['Q191'], { var1: data.LeadSource, var2: accessData.company_id })
                                                let findSource = await connection.query(s5)
                                                if (findSource.rowCount == 0) {
                                                    let s6 = dbScript(db_sql['Q186'], { var1: data.LeadSource, var2: accessData.company_id })
                                                    let insertSource = await connection.query(s6)
                                                    sourceId = insertSource.rows[0].id
                                                } else {
                                                    sourceId = findSource.rows[0].id
                                                }

                                                let industryId = '';
                                                if (data.Industry) {
                                                    let s7 = dbScript(db_sql['Q193'], { var1: data.Industry, var2: accessData.company_id })
                                                    let findIndustry = await connection.query(s7)
                                                    if (findIndustry.rowCount == 0) {
                                                        let s8 = dbScript(db_sql['Q182'], { var1: data.Industry, var2: accessData.company_id })
                                                        let insertIndustry = await connection.query(s8)
                                                        industryId = insertIndustry.rows[0].id
                                                    } else {
                                                        industryId = findIndustry.rows[0].id
                                                    }
                                                }

                                                let address = ''
                                                if (data.Street) {
                                                    address = address.concat(data.Street + ',')
                                                }
                                                if (data.City) {
                                                    address = address.concat(data.City + ',')
                                                }
                                                if (data.State) {
                                                    address = address.concat(data.State + ',')
                                                }
                                                if (data.Country) {
                                                    address = address.concat(data.Country)
                                                }

                                                // Remove the trailing comma, if any
                                                if (address.slice(-1) === ',') {
                                                    address = address.slice(0, -1);
                                                }

                                                let customerId = ''
                                                let s12 = dbScript(db_sql['Q312'], { var1: mysql_real_escape_string(data.Company), var2: accessData.company_id })
                                                let findCustomer = await connection.query(s12)
                                                if (findCustomer.rowCount == 0) {
                                                    let s9 = dbScript(db_sql['Q36'], { var1: accessData.user_id, var2: mysql_real_escape_string(data.Company), var3: accessData.company_id, var4: mysql_real_escape_string(address), var5: 'UNITED STATE DOLLAR (USD)', var6: (industryId == '') ? 'null' : industryId })
                                                    let createCustomer = await connection.query(s9)
                                                    customerId = createCustomer.rows[0].id
                                                } else {
                                                    customerId = findCustomer.rows[0].id
                                                }

                                                let leadAddress = ''
                                                if (data.Address.street) {
                                                    leadAddress = leadAddress.concat(data.Address.street + ',')
                                                }
                                                if (data.Address.city) {
                                                    leadAddress = leadAddress.concat(data.Address.city + ',')
                                                }
                                                if (data.Address.state) {
                                                    leadAddress = leadAddress.concat(data.Address.state + ',')
                                                }
                                                if (data.Address.country) {
                                                    leadAddress = leadAddress.concat(data.Address.country)
                                                }
                                                // Remove the trailing comma, if any
                                                if (leadAddress.slice(-1) === ',') {
                                                    leadAddress = leadAddress.slice(0, -1);
                                                }
                                                let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(data.Name), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.Email), var4: data.Phone, var5: mysql_real_escape_string(leadAddress), var6: sourceId ? sourceId : 'null', var7: '', var8: data.Website ? data.Website : 'null', var9: '', var10: false, var11: 'null', var12: data.Description ? mysql_real_escape_string(data.Description) : '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.uniqueId__c, var18: 'salesforce', var19: 'null' })
                                                let createLead = await connection.query(s11)
                                            }
                                        } else {
                                            for (let data of response.data.records) {
                                                if (new Date(accessData.salesforce_last_sync) < new Date(data.LastModifiedDate)) {
                                                    let titleId = '';
                                                    let s3 = dbScript(db_sql['Q192'], { var1: data.Title, var2: accessData.company_id })
                                                    let findTitle = await connection.query(s3)
                                                    if (findTitle.rowCount == 0) {
                                                        let s4 = dbScript(db_sql['Q178'], { var1: data.Title, var2: accessData.company_id })
                                                        let insertTitle = await connection.query(s4)
                                                        titleId = insertTitle.rows[0].id
                                                    } else {
                                                        titleId = findTitle.rows[0].id
                                                    }

                                                    let sourceId = '';
                                                    let s5 = dbScript(db_sql['Q191'], { var1: data.LeadSource, var2: accessData.company_id })
                                                    let findSource = await connection.query(s5)
                                                    if (findSource.rowCount == 0) {
                                                        let s6 = dbScript(db_sql['Q186'], { var1: data.LeadSource, var2: accessData.company_id })
                                                        let insertSource = await connection.query(s6)
                                                        sourceId = insertSource.rows[0].id
                                                    } else {
                                                        sourceId = findSource.rows[0].id
                                                    }

                                                    let industryId = '';
                                                    if (data.Industry) {
                                                        let s7 = dbScript(db_sql['Q193'], { var1: data.Industry, var2: accessData.company_id })
                                                        let findIndustry = await connection.query(s7)
                                                        if (findIndustry.rowCount == 0) {
                                                            let s8 = dbScript(db_sql['Q182'], { var1: data.Industry, var2: accessData.company_id })
                                                            let insertIndustry = await connection.query(s8)
                                                            industryId = insertIndustry.rows[0].id
                                                        } else {
                                                            industryId = findIndustry.rows[0].id
                                                        }
                                                    }

                                                    let address = ''
                                                    if (data.Street) {
                                                        address = address.concat(data.Street + ',')
                                                    }
                                                    if (data.City) {
                                                        address = address.concat(data.City + ',')
                                                    }
                                                    if (data.State) {
                                                        address = address.concat(data.State + ',')
                                                    }
                                                    if (data.Country) {
                                                        address = address.concat(data.Country)
                                                    }

                                                    // Remove the trailing comma, if any
                                                    if (address.slice(-1) === ',') {
                                                        address = address.slice(0, -1);
                                                    }

                                                    let customerId = ''
                                                    let s12 = dbScript(db_sql['Q312'], { var1: mysql_real_escape_string(data.Company), var2: accessData.company_id })
                                                    let findCustomer = await connection.query(s12)
                                                    if (findCustomer.rowCount == 0) {
                                                        let s9 = dbScript(db_sql['Q36'], { var1: accessData.user_id, var2: mysql_real_escape_string(data.Company), var3: accessData.company_id, var4: mysql_real_escape_string(address), var5: 'UNITED STATE DOLLAR (USD)', var6: (industryId == '') ? 'null' : industryId })
                                                        let createCustomer = await connection.query(s9)
                                                        customerId = createCustomer.rows[0].id
                                                    } else {
                                                        customerId = findCustomer.rows[0].id
                                                    }

                                                    let leadAddress = ''
                                                    if (data.Address.street) {
                                                        leadAddress = leadAddress.concat(data.Address.street + ',')
                                                    }
                                                    if (data.Address.city) {
                                                        leadAddress = leadAddress.concat(data.Address.city + ',')
                                                    }
                                                    if (data.Address.state) {
                                                        leadAddress = leadAddress.concat(data.Address.state + ',')
                                                    }
                                                    if (data.Address.country) {
                                                        leadAddress = leadAddress.concat(data.Address.country)
                                                    }
                                                    // Remove the trailing comma, if any
                                                    if (leadAddress.slice(-1) === ',') {
                                                        leadAddress = leadAddress.slice(0, -1);
                                                    }

                                                    let s10 = dbScript(db_sql['Q322'], { var1: data.uniqueId__c })
                                                    let checkLead = await connection.query(s10)
                                                    if (checkLead.rowCount > 0) {
                                                        let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(data.Name), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.Email), var4: data.Phone, var5: mysql_real_escape_string(leadAddress), var6: sourceId ? sourceId : 'null', var7: '', var8: data.Website ? data.Website : 'null', var9: '', var10: false, var11: 'null', var12: data.Description ? mysql_real_escape_string(data.Description) : '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.uniqueId__c, var18: 'salesforce', var19: checkLead.rows[0].id })
                                                        let createLead = await connection.query(s11)
                                                    }else{
                                                        let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(data.Name), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.Email), var4: data.Phone, var5: mysql_real_escape_string(leadAddress), var6: sourceId ? sourceId : 'null', var7: '', var8: data.Website ? data.Website : 'null', var9: '', var10: false, var11: 'null', var12: data.Description ? mysql_real_escape_string(data.Description) : '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.uniqueId__c, var18: 'salesforce', var19: 'null' })
                                                        let createLead = await connection.query(s11) 
                                                    }
                                                } else {
                                                    let s10 = dbScript(db_sql['Q322'], { var1: data.uniqueId__c })
                                                    let checkLead = await connection.query(s10)
                                                    if (checkLead.rowCount == 0) {
                                                        let titleId = '';
                                                        let s3 = dbScript(db_sql['Q192'], { var1: data.Title, var2: accessData.company_id })
                                                        let findTitle = await connection.query(s3)
                                                        if (findTitle.rowCount == 0) {
                                                            let s4 = dbScript(db_sql['Q178'], { var1: data.Title, var2: accessData.company_id })
                                                            let insertTitle = await connection.query(s4)
                                                            titleId = insertTitle.rows[0].id
                                                        } else {
                                                            titleId = findTitle.rows[0].id
                                                        }

                                                        let sourceId = '';
                                                        let s5 = dbScript(db_sql['Q191'], { var1: data.LeadSource, var2: accessData.company_id })
                                                        let findSource = await connection.query(s5)
                                                        if (findSource.rowCount == 0) {
                                                            let s6 = dbScript(db_sql['Q186'], { var1: data.LeadSource, var2: accessData.company_id })
                                                            let insertSource = await connection.query(s6)
                                                            sourceId = insertSource.rows[0].id
                                                        } else {
                                                            sourceId = findSource.rows[0].id
                                                        }

                                                        let industryId = '';
                                                        if (data.Industry) {
                                                            let s7 = dbScript(db_sql['Q193'], { var1: data.Industry, var2: accessData.company_id })
                                                            let findIndustry = await connection.query(s7)
                                                            if (findIndustry.rowCount == 0) {
                                                                let s8 = dbScript(db_sql['Q182'], { var1: data.Industry, var2: accessData.company_id })
                                                                let insertIndustry = await connection.query(s8)
                                                                industryId = insertIndustry.rows[0].id
                                                            } else {
                                                                industryId = findIndustry.rows[0].id
                                                            }
                                                        }

                                                        let address = ''
                                                        if (data.Street) {
                                                            address = address.concat(data.Street + ',')
                                                        }
                                                        if (data.City) {
                                                            address = address.concat(data.City + ',')
                                                        }
                                                        if (data.State) {
                                                            address = address.concat(data.State + ',')
                                                        }
                                                        if (data.Country) {
                                                            address = address.concat(data.Country)
                                                        }

                                                        // Remove the trailing comma, if any
                                                        if (address.slice(-1) === ',') {
                                                            address = address.slice(0, -1);
                                                        }

                                                        let customerId = ''
                                                        let s12 = dbScript(db_sql['Q312'], { var1: mysql_real_escape_string(data.Company), var2: accessData.company_id })
                                                        let findCustomer = await connection.query(s12)
                                                        if (findCustomer.rowCount == 0) {
                                                            let s9 = dbScript(db_sql['Q36'], { var1: accessData.user_id, var2: mysql_real_escape_string(data.Company), var3: accessData.company_id, var4: mysql_real_escape_string(address), var5: 'UNITED STATE DOLLAR (USD)', var6: (industryId == '') ? 'null' : industryId })
                                                            let createCustomer = await connection.query(s9)
                                                            customerId = createCustomer.rows[0].id
                                                        } else {
                                                            customerId = findCustomer.rows[0].id
                                                        }

                                                        let leadAddress = ''
                                                        if (data.Address.street) {
                                                            leadAddress = leadAddress.concat(data.Address.street + ',')
                                                        }
                                                        if (data.Address.city) {
                                                            leadAddress = leadAddress.concat(data.Address.city + ',')
                                                        }
                                                        if (data.Address.state) {
                                                            leadAddress = leadAddress.concat(data.Address.state + ',')
                                                        }
                                                        if (data.Address.country) {
                                                            leadAddress = leadAddress.concat(data.Address.country)
                                                        }
                                                        // Remove the trailing comma, if any
                                                        if (leadAddress.slice(-1) === ',') {
                                                            leadAddress = leadAddress.slice(0, -1);
                                                        }

                                                        let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(data.Name), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.Email), var4: data.Phone, var5: mysql_real_escape_string(leadAddress), var6: sourceId ? sourceId : 'null', var7: '', var8: data.Website ? data.Website : 'null', var9: '', var10: false, var11: 'null', var12: data.Description ? mysql_real_escape_string(data.Description) : '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.uniqueId__c, var18: 'salesforce', var19: 'null' })
                                                        let createLead = await connection.query(s11)
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
            if (provider.toLowerCase() == 'hubspot' && accessData.hubspot_status) {
                await connection.query('BEGIN')
                try {
                    let curDate = new Date();
                    let expiryDate = new Date(accessData.hubspot_expiry)
                    let accessToken = ''
                    if (expiryDate < curDate) {
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
                    const apiResponse = await hubspotClient.crm.contacts.basicApi.getPage(limit, after, properties, propertiesWithHistory, associations, archived);
                    let leadsData = apiResponse.results
                    if (leadsData.length > 0) {
                        let s1 = dbScript(db_sql['Q308'], { var1: accessData.company_id })
                        let findSyncLead = await connection.query(s1)

                        if (findSyncLead.rowCount == 0) {
                            //Initial insertion
                            for (let data of leadsData) {
                                let titleId = '';
                                let s3 = dbScript(db_sql['Q192'], { var1: data.properties.jobtitle, var2: accessData.company_id })
                                let findTitle = await connection.query(s3)
                                if (findTitle.rowCount == 0) {
                                    let s4 = dbScript(db_sql['Q178'], { var1: data.properties.jobtitle, var2: accessData.company_id })
                                    let insertTitle = await connection.query(s4)
                                    titleId = insertTitle.rows[0].id
                                } else {
                                    titleId = findTitle.rows[0].id
                                }

                                let sourceId = '';
                                let s5 = dbScript(db_sql['Q191'], { var1: 'hubspot', var2: accessData.company_id })
                                let findSource = await connection.query(s5)
                                if (findSource.rowCount == 0) {
                                    let s6 = dbScript(db_sql['Q186'], { var1: 'hubspot', var2: accessData.company_id })
                                    let insertSource = await connection.query(s6)
                                    sourceId = insertSource.rows[0].id
                                } else {
                                    sourceId = findSource.rows[0].id
                                }

                                let industryId = '';
                                if (data.properties.industry) {
                                    let s7 = dbScript(db_sql['Q193'], { var1: data.properties.industry, var2: accessData.company_id })
                                    let findIndustry = await connection.query(s7)
                                    if (findIndustry.rowCount == 0) {
                                        let s8 = dbScript(db_sql['Q182'], { var1: data.properties.industry, var2: accessData.company_id })
                                        let insertIndustry = await connection.query(s8)
                                        industryId = insertIndustry.rows[0].id
                                    } else {
                                        industryId = findIndustry.rows[0].id
                                    }
                                }

                                let customerId = ''
                                let s12 = dbScript(db_sql['Q312'], { var1: mysql_real_escape_string(data.properties.company), var2: accessData.company_id })
                                let findCustomer = await connection.query(s12)
                                if (findCustomer.rowCount == 0) {
                                    let s9 = dbScript(db_sql['Q36'], { var1: accessData.user_id, var2: mysql_real_escape_string(data.properties.company), var3: accessData.company_id, var4: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var5: 'UNITED STATE DOLLAR (USD)', var6: (industryId == '') ? 'null' : industryId })
                                    let createCustomer = await connection.query(s9)
                                    customerId = createCustomer.rows[0].id
                                } else {
                                    customerId = findCustomer.rows[0].id
                                }

                                let leadName = data.properties.firstname + ' ' + data.properties.lastname

                                let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(leadName), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.properties.email), var4: data.properties.phone, var5: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var6: sourceId ? sourceId : 'null', var7: '', var8: data.properties.website ? data.properties.website : '', var9: '', var10: false, var11: 'null', var12: '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.id, var18: 'hubspot', var19: 'null' })
                                let createLead = await connection.query(s11)
                            }
                        } else {
                            for (let data of leadsData) {
                                console.log(data);
                                if (new Date(accessData.hubspot_last_sync) < new Date(data.updatedAt)) {
                                    let titleId = '';
                                    let s3 = dbScript(db_sql['Q192'], { var1: data.properties.jobtitle, var2: accessData.company_id })
                                    let findTitle = await connection.query(s3)
                                    if (findTitle.rowCount == 0) {
                                        let s4 = dbScript(db_sql['Q178'], { var1: data.properties.jobtitle, var2: accessData.company_id })
                                        let insertTitle = await connection.query(s4)
                                        titleId = insertTitle.rows[0].id
                                    } else {
                                        titleId = findTitle.rows[0].id
                                    }

                                    let sourceId = '';
                                    let s5 = dbScript(db_sql['Q191'], { var1: 'hubspot', var2: accessData.company_id })
                                    let findSource = await connection.query(s5)
                                    if (findSource.rowCount == 0) {
                                        let s6 = dbScript(db_sql['Q186'], { var1: 'hubspot', var2: accessData.company_id })
                                        let insertSource = await connection.query(s6)
                                        sourceId = insertSource.rows[0].id
                                    } else {
                                        sourceId = findSource.rows[0].id
                                    }

                                    let industryId = '';
                                    if (data.properties.industry) {
                                        let s7 = dbScript(db_sql['Q193'], { var1: data.properties.industry, var2: accessData.company_id })
                                        let findIndustry = await connection.query(s7)
                                        if (findIndustry.rowCount == 0) {
                                            let s8 = dbScript(db_sql['Q182'], { var1: data.properties.industry, var2: accessData.company_id })
                                            let insertIndustry = await connection.query(s8)
                                            industryId = insertIndustry.rows[0].id
                                        } else {
                                            industryId = findIndustry.rows[0].id
                                        }
                                    }

                                    let customerId = ''
                                    let s12 = dbScript(db_sql['Q312'], { var1: mysql_real_escape_string(data.properties.company), var2: accessData.company_id })
                                    let findCustomer = await connection.query(s12)
                                    if (findCustomer.rowCount == 0) {
                                        let s9 = dbScript(db_sql['Q36'], { var1: accessData.user_id, var2: mysql_real_escape_string(data.properties.company), var3: accessData.company_id, var4: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var5: 'UNITED STATE DOLLAR (USD)', var6: (industryId == '') ? 'null' : industryId })
                                        let createCustomer = await connection.query(s9)
                                        customerId = createCustomer.rows[0].id
                                    } else {
                                        customerId = findCustomer.rows[0].id
                                    }

                                    let leadName = data.properties.firstname + ' ' + data.properties.lastname

                                    let s10 = dbScript(db_sql['Q322'], { var1: data.id })
                                    let checkLead = await connection.query(s10)
                                    if (checkLead.rowCount > 0) {
                                        let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(leadName), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.properties.email), var4: data.properties.phone, var5: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var6: sourceId ? sourceId : 'null', var7: '', var8: data.properties.website ? data.properties.website : '', var9: '', var10: false, var11: 'null', var12: '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.id, var18: 'hubspot', var19: checkLead.rows[0].id })
                                        let createLead = await connection.query(s11)
                                    }
                                    else{
                                        let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(leadName), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.properties.email), var4: data.properties.phone, var5: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var6: sourceId ? sourceId : 'null', var7: '', var8: data.properties.website ? data.properties.website : '', var9: '', var10: false, var11: 'null', var12: '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.id, var18: 'hubspot', var19: 'null' })
                                        let createLead = await connection.query(s11) 
                                    }
                                } else {
                                    let s10 = dbScript(db_sql['Q322'], { var1: data.id })
                                    let checkLead = await connection.query(s10)
                                    if (checkLead.rowCount == 0) {
                                        let titleId = '';
                                        let s3 = dbScript(db_sql['Q192'], { var1: data.properties.jobtitle, var2: accessData.company_id })
                                        let findTitle = await connection.query(s3)
                                        if (findTitle.rowCount == 0) {
                                            let s4 = dbScript(db_sql['Q178'], { var1: data.properties.jobtitle, var2: accessData.company_id })
                                            let insertTitle = await connection.query(s4)
                                            titleId = insertTitle.rows[0].id
                                        } else {
                                            titleId = findTitle.rows[0].id
                                        }

                                        let sourceId = '';
                                        let s5 = dbScript(db_sql['Q191'], { var1: 'hubspot', var2: accessData.company_id })
                                        let findSource = await connection.query(s5)
                                        if (findSource.rowCount == 0) {
                                            let s6 = dbScript(db_sql['Q186'], { var1: 'hubspot', var2: accessData.company_id })
                                            let insertSource = await connection.query(s6)
                                            sourceId = insertSource.rows[0].id
                                        } else {
                                            sourceId = findSource.rows[0].id
                                        }

                                        let industryId = '';
                                        if (data.properties.industry) {
                                            let s7 = dbScript(db_sql['Q193'], { var1: data.properties.industry, var2: accessData.company_id })
                                            let findIndustry = await connection.query(s7)
                                            if (findIndustry.rowCount == 0) {
                                                let s8 = dbScript(db_sql['Q182'], { var1: data.properties.industry, var2: accessData.company_id })
                                                let insertIndustry = await connection.query(s8)
                                                industryId = insertIndustry.rows[0].id
                                            } else {
                                                industryId = findIndustry.rows[0].id
                                            }
                                        }

                                        let customerId = ''
                                        let s12 = dbScript(db_sql['Q312'], { var1: mysql_real_escape_string(data.properties.company), var2: accessData.company_id })
                                        let findCustomer = await connection.query(s12)
                                        if (findCustomer.rowCount == 0) {
                                            let s9 = dbScript(db_sql['Q36'], { var1: accessData.user_id, var2: mysql_real_escape_string(data.properties.company), var3: accessData.company_id, var4: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var5: 'UNITED STATE DOLLAR (USD)', var6: (industryId == '') ? 'null' : industryId })
                                            let createCustomer = await connection.query(s9)
                                            customerId = createCustomer.rows[0].id
                                        } else {
                                            customerId = findCustomer.rows[0].id
                                        }

                                        let leadName = data.properties.firstname + ' ' + data.properties.lastname

                                        let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(leadName), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.properties.email), var4: data.properties.phone, var5: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var6: sourceId ? sourceId : 'null', var7: '', var8: data.properties.website ? data.properties.website : '', var9: '', var10: false, var11: 'null', var12: '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.id, var18: 'hubspot', var19: 'null' })
                                        let createLead = await connection.query(s11)
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
        res.json({
            status: 400,
            success: false,
            message: "Invalid user",
        })
    }
}

module.exports.proLeadsList = async (req, res) => {
    try {
        let userId = req.user.id
        let { provider } = req.query
        let s1 = dbScript(db_sql['Q8'], { var1: userId })
        let findUser = await connection.query(s1)
        if (findUser.rowCount > 0) {
            let type = 'lead'
            let leadList
            if (provider.toLowerCase() == 'all') {
                let s2 = dbScript(db_sql['Q326'], { var1: findUser.rows[0].company_id, var2: type })
                leadList = await connection.query(s2)
            } else {
                let s3 = dbScript(db_sql['Q327'], { var1: findUser.rows[0].company_id, var2: type, var3 : provider.toLowerCase() })
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