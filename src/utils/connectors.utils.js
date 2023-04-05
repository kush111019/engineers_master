const connection = require('../database/connection');
const { dbScript, db_sql } = require('../utils/db_scripts');
const { mysql_real_escape_string } = require('../utils/helper')


module.exports.titleFn = async (jobtitle, company_id) => {
    let titleId = '';
    let s3 = dbScript(db_sql['Q192'], { var1: jobtitle, var2: company_id })
    let findTitle = await connection.query(s3)
    if (findTitle.rowCount == 0) {
        let s4 = dbScript(db_sql['Q178'], { var1: jobtitle, var2: company_id })
        let insertTitle = await connection.query(s4)
        return titleId = insertTitle.rows[0].id
    } else {
        return titleId = findTitle.rows[0].id
    }
}

module.exports.sourceFn = async (source, company_id) => {
    let sourceId = '';
    let s5 = dbScript(db_sql['Q191'], { var1: (source !== '') ? source : 'hubspot', var2: company_id })
    let findSource = await connection.query(s5)
    if (findSource.rowCount == 0) {
        let s6 = dbScript(db_sql['Q186'], { var1: 'hubspot', var2: company_id })
        let insertSource = await connection.query(s6)
        return sourceId = insertSource.rows[0].id
    } else {
        return sourceId = findSource.rows[0].id
    }
}

module.exports.industryFn = async (industry, company_id) => {
    let industryId = '';
    if (industry) {
        let s7 = dbScript(db_sql['Q193'], { var1: industry, var2: company_id })
        let findIndustry = await connection.query(s7)
        if (findIndustry.rowCount == 0) {
            let s8 = dbScript(db_sql['Q182'], { var1: industry, var2: company_id })
            let insertIndustry = await connection.query(s8)
            return industryId = insertIndustry.rows[0].id
        } else {
            return industryId = findIndustry.rows[0].id
        }
    } else {
        return industryId
    }
}

module.exports.customerFnForHubspot = async (data, accessData, industryId) => {
    let customerId = ''
    let s12 = dbScript(db_sql['Q312'], { var1: mysql_real_escape_string(data.properties.company), var2: accessData.company_id })
    let findCustomer = await connection.query(s12)
    if (findCustomer.rowCount == 0) {
        let s9 = dbScript(db_sql['Q36'], { var1: accessData.user_id, var2: mysql_real_escape_string(data.properties.company), var3: accessData.company_id, var4: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var5: 'UNITED STATE DOLLAR (USD)', var6: (industryId == '') ? 'null' : industryId })
        let createCustomer = await connection.query(s9)
        return customerId = createCustomer.rows[0].id
    } else {
        return customerId = findCustomer.rows[0].id
    }
}

module.exports.customerFnForsalesforce = async (data, accessData, industryId) => {
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
        return customerId = createCustomer.rows[0].id
    } else {
        return customerId = findCustomer.rows[0].id
    }
}

module.exports.leadFnForHubspot = async (leadName, titleId, sourceId, customerId, data, accessData, leadId) => {
    let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(leadName), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.properties.email), var4: data.properties.phone, var5: (data.properties.address) ? mysql_real_escape_string(data.properties.address) : "", var6: sourceId ? sourceId : 'null', var7: '', var8: data.properties.website ? data.properties.website : '', var9: '', var10: false, var11: 'null', var12: '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.id, var18: 'hubspot', var19: leadId ? leadId : 'null' })
    let createLead = await connection.query(s11)
}

module.exports.leadFnForsalesforce = async (titleId, sourceId, customerId, data, accessData, leadId) => {
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

    let s11 = dbScript(db_sql['Q169'], { var1: mysql_real_escape_string(data.Name), var2: titleId ? titleId : 'null', var3: mysql_real_escape_string(data.Email), var4: data.Phone, var5: mysql_real_escape_string(leadAddress), var6: sourceId ? sourceId : 'null', var7: '', var8: data.Website ? data.Website : 'null', var9: '', var10: false, var11: 'null', var12: data.Description ? mysql_real_escape_string(data.Description) : '', var13: accessData.user_id, var14: accessData.company_id, var15: customerId ? customerId : 'null', var16: 'lead', var17: data.uniqueId__c, var18: 'salesforce', var19: leadId ? leadId : 'null' })
    let createLead = await connection.query(s11)
}

