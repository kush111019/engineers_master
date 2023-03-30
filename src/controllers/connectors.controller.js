const LinkedIn = require('node-linkedin')(process.env.LINKEDIN_CLIENT_ID, process.env.LINKEDIN_CLIENT_SECRET, process.env.REDIRECT_URL)
const hubspot = require('@hubspot/api-client')
const connection = require('../database/connection');
const { dbScript, db_sql } = require('../utils/db_scripts');
const moduleName = process.env.DASHBOARD_MODULE
const { Connection, OAuth2 } = require('jsforce');
const { mysql_real_escape_string } = require('../utils/helper')
const axios = require('axios');

//for salesforce
const oauth2Client = new OAuth2({
    clientId: process.env.SALESFORCE_CONSUMER_KEY,
    clientSecret: process.env.SALESFORCE_CONSUMER_SECRET,
    redirectUri: process.env.REDIRECT_URL, // Your redirect URL
});

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
            res.json({
                status: 200,
                success: true,
                data: authUrl,
            })
        }
        if (provider == 'hubspot') {
            // let scop = ['content','social','automation','actions','timeline','forms','files','tickets']
            // const authUrl =
            //     'https://app.hubspot.com/oauth/authorize' +
            //     `?client_id=${process.env.HUBSPOT_CLIENT_ID}` +
            //     `&redirect_uri=${process.env.REDIRECT_URL}` +
            //     `&scope=${encodeURIComponent(scop.join(' '))}`
            const scope = ['content']
            const authUrl = hubspotClient.oauth.getAuthorizationUrl(process.env.HUBSPOT_CLIENT_ID, process.env.REDIRECT_URL, scope)
            res.json({
                status: 200,
                success: true,
                data: authUrl,
            })
        }
        if (provider == 'salesforce') {
            const conn = new Connection({
                loginUrl: 'https://login.salesforce.com',
            });

            const authUrl = oauth2Client.getAuthorizationUrl({
                scope: 'api', // The Salesforce API scope you want to access
            });

            console.log('Visit this URL to authenticate with Salesforce:', authUrl);
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
                        let s4 = dbScript(db_sql['Q319'], { var1: 'linked_in_token', var2: accessToken, var3: 'linked_in_status', var4: true, var5: _dt, var6: userId, var7: findUser.rows[0].company_id })
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

                let token = await hubspotClient.oauth.tokensApi.createToken(
                    'authorization_code',
                    code, // the code you received from the oauth flow
                    process.env.REDIRECT_URL,
                    process.env.HUBSPOT_CLIENT_ID,
                    process.env.HUBSPOT_CLIENT_SECRET,
                )
                console.log(token);
                let s2 = dbScript(db_sql['Q317'], { var1: userId, var2: findUser.rows[0].company_id })
                let getConnectors = await connection.query(s2)
                if (getConnectors.rowCount == 0) {
                    let s3 = dbScript(db_sql['Q323'], { var1: userId, var2: findUser.rows[0].company_id, var3: token.accessToken, var4: true })
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
                    let s4 = dbScript(db_sql['Q319'], { var1: 'hubspot_token', var2: token.accessToken, var3: 'hubspot_status', var4: true, var5: _dt, var6: userId, var7: findUser.rows[0].company_id })
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
                res.json({
                    status: 400,
                    success: false,
                    message: "Something went wrong"
                })
            }
            if (provider == 'salesforce') {
                const authorizationCode = code; // The code received from the redirect URL
                oauth2Client.requestToken(authorizationCode, async (err, result) => {
                    if (err) {
                        return res.json({
                            status: 400,
                            success: false,
                            message: err.message
                        })
                    }
                    const accessToken = result.access_token;

                    let s2 = dbScript(db_sql['Q317'], { var1: userId, var2: findUser.rows[0].company_id })
                    let getConnectors = await connection.query(s2)
                    if (getConnectors.rowCount == 0) {
                        let s3 = dbScript(db_sql['Q321'], { var1: userId, var2: findUser.rows[0].company_id, var3: accessToken, var4: true })
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
                        let s4 = dbScript(db_sql['Q319'], { var1: 'salesforce_token', var2: accessToken, var3: 'salesforce_status', var4: true, var5: _dt, var6: userId, var7: findUser.rows[0].company_id })
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

module.exports.searchLead = async (req, res) => {
    try {
        await connection.query('BEGIN')
        let s1 = dbScript(db_sql['Q318'], {})
        let findAccessToken = await connection.query(s1)
        if (findAccessToken.rowCount > 0) {
            for (let accessData of findAccessToken.rows) {
                if (accessData.salesforce_status) {
                    const accessToken = accessData.salesforce_token;

                    axios.get('https://login.salesforce.com/services/oauth2/userinfo', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    })
                        .then(response => {

                            const apiUrl = `${response.data.urls.custom_domain}` + `${process.env.SALESFORCE_API_VERSION}`;
                            const query = 'SELECT Name,Title,Company,Street,City,State,Country,Address,Phone,Email,Website,Description,LeadSource,Industry FROM Lead';
                            axios({
                                method: 'get',
                                url: `${apiUrl}query/?q=${query}`,
                                headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                },
                            })
                                .then(async (response) => {
                                    if (response.data.records.length > 0) {
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
                                            let s10 = dbScript(db_sql['Q322'], { var1: mysql_real_escape_string(data.Email), var2: mysql_real_escape_string(data.Name) })
                                            let checkLead = await connection.query(s10)
                                            if (checkLead.rowCount == 0) {
                                                let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(data.Name), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.Email), var4: data.Phone, var5: mysql_real_escape_string(leadAddress), var6: sourceId ? sourceId : 'null', var7: '', var8: data.Website ? data.Website : 'null', var9: '', var10: false, var11: 'null', var12: data.Description ? mysql_real_escape_string(data.Description) : '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead' })
                                                let createLead = await connection.query(s11)
                                            }
                                        }
                                        let _dt = new Date().toISOString();
                                        let s12 = dbScript(db_sql['Q278'], { var1: _dt, var2: accessData.company_id })
                                        let updateStatusInCompany = await connection.query(s12)
                                    }

                                })
                                .catch(async (error) => {
                                    console.log(error)
                                });
                        })
                        .catch(async (error) => {
                            console.log(error)
                        });
                }
                if (accessData.hubspot_status) {
                    const hubspotClient = new hubspot.Client({ "accessToken": accessData.hubspot_token });

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

                            let leadName = data.properties.firstname+' '+data.properties.lastname 

                            let s10 = dbScript(db_sql['Q322'], { var1: mysql_real_escape_string(data.properties.email), var2: mysql_real_escape_string(leadName) })

                            let checkLead = await connection.query(s10)
                            if (checkLead.rowCount == 0) {
                                let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(leadName), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.properties.email), var4: data.properties.phone, var5: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var6: sourceId ? sourceId : 'null', var7: '', var8: data.properties.website ? data.properties.website : '', var9: '', var10: false, var11: 'null', var12:  '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead' })
                                let createLead = await connection.query(s11)
                            }
                        }
                        let _dt = new Date().toISOString();
                        let s12 = dbScript(db_sql['Q278'], { var1: _dt, var2: accessData.company_id })
                        let updateStatusInCompany = await connection.query(s12)
                    } 
                }
            }
        } 
    } catch (error) {
        console.log(error)
    }
}