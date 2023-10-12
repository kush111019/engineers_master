const { json } = require("express");
const { dbScript, db_sql } = require("../src/utils/db_scripts");
const { mysql_real_escape_string } = require("../src/utils/helper");
const connection = require("../src/database/connection");

module.exports.setPlayBook = async (companyId, userId, res) => {
    let background = "<p>We offer's data, voice and digital services. 20+ years of management the complex services. Speed available up to 100 GPS.</p>";
    let visionMission = "<p>Operation Stellar Recon is a simulated space mission designed to test and evaluate advanced orbital surveillance and analysis' technologies. The primary objective of this mission is to simulate the deployment of a constellation of satellite assets for monitoring and studying celestial bodies, space debris, and other potential objects of interest within Earth's orbit.</p>";
    let visionMissionImage = `${process.env.PATH}/playBookVision/background.jpg`;
    let productImage = `${process.env.PORT}/playBookProduct/product.jpg`;
    let bestPracticeImage = `${process.env.PATH}/playBookBestPractices/default_best_practice.png`
    let customerProfiling = {
        "columns": [
            "PERSONA",
            "Startups",
            "Midsize",
            "Enterprise"
        ],
        "rows": [
            [
                "<p>INDUSTRY</p>",
                "<p>IT, E-commerce, Networking</p>",
                "<p>Any Industry</p>",
                "<p>Any Industry</p>"
            ],
            [
                "<p>PAIN POINT</p>",
                "<p>CEO, SVP of Sales, Founder</p>",
                "<p>CEO, SVP of Sales, Founder</p>",
                "<p>test</p>"
            ]
        ]
    }
    let leadProcesses =  "<p>inbound selling<p/>\n<p>inbound selling</p>";
    let salesStrategies = "<p>Understand Your Customer: Take the time to thoroughly understand your target audience's needs, preferences, pain points, and buying behaviors. Tailor your approach and messaging to address their specific concerns.Build Relationships: Focus on building strong, genuine relationships with your customers. Develop trust and rapport by being responsive, reliable, and providing excellent customer service.Value Proposition: Clearly communicate the unique value and benefits your product or service offers. Show how it can solve your customer's problems or enhance their lives.</p>";
    let scenarioData = [
        {
            "description": "<p>Lead came to our website and requested for a Demo. The sales team will reach out to the customer to understand their pain-points to address if the product is a right fit for them?</p>",
            "actions": "<p>Break down the products features and benefits Provide real-world examples of how the product has delivered value to other customers.Offer a comparison with competitor products to showcase the competitive pricing., Emphasize the long-term benefits and return on investment.</p>"
        },
        {
            "description": "<p>Customer is interested in upgrading their current plan. Discuss the benefits of the higher-tier plan and address any concerns.</p>",
            "actions": "<p>Break down the products features and benefits Provide real-world examples of how the product has delivered value to other customers.Offer a comparison with competitor products to showcase the competitive pricing., Emphasize the long-term benefits and return on investment.</p>"
        }
    ];
    let salesBestPractices = "<p>sales presentation</p><p>sales strategies</p><p>FAQs</p><p>Sales Info</p>"
    let resourceTitle = "Resources";
    let documentation  = "<p>https://www.dummywebsite.org</p><p>http://www.testsite123.net</p>";
    let documentationTitle = "Documentations";
    let salesStack =  "<p>http://www.samplelink.biz</p>";
    let salesStackTitle = "Sales Stack";
    let companyOverviewTitle = "Company Overview";
    let backgroundTitle =  "Background";
    let visionMissionTitle =  "Vision Mission";
    let productPricingTitle = "Product Pricing";
    let customerProfilingTitle =  "Customer Profiling";
    let salesProcessesTitle = "Sales Processes";
    let leadProcessesTitle =  "Lead Processes";
    let salesStrategiesTitle =  "Sales Strategy";
    let qualifiedLeadTitle =  "Qualified Lead";
    let topCustomerTitle = "Top Customer";
    let topProductTitle =  "Top Product";
    let salesAnalysisTitle = "Sales Analysis";
    let salesScenariosTitle =  "Sales Scenarios";
    let teamRoleTitle =  "Team Role";
    let salesBestPracticeTitle = "Sales Best Practice";
    let salesPresentationTitle = "Sales Presentation";
    let s1 = dbScript(db_sql['Q425'], { var1: companyId, var2: userId, var3: mysql_real_escape_string(background), var4: mysql_real_escape_string(visionMission), var5: visionMissionImage, var6: productImage, var7: JSON.stringify(customerProfiling), var8: mysql_real_escape_string(leadProcesses), var9: mysql_real_escape_string(salesStrategies), var10: JSON.stringify(scenarioData), var11: mysql_real_escape_string(salesBestPractices), var12 : bestPracticeImage, var13: mysql_real_escape_string(resourceTitle),var14: mysql_real_escape_string(documentation),var15: mysql_real_escape_string(documentationTitle),var16: mysql_real_escape_string(salesStack) , var17: mysql_real_escape_string(salesStackTitle),var18: mysql_real_escape_string(companyOverviewTitle),var19: mysql_real_escape_string(backgroundTitle),var20: mysql_real_escape_string(visionMissionTitle),var21: mysql_real_escape_string(productPricingTitle) ,var22: mysql_real_escape_string(customerProfilingTitle),var23: mysql_real_escape_string(salesProcessesTitle) , var24: mysql_real_escape_string(leadProcessesTitle) , var25: mysql_real_escape_string(salesStrategiesTitle),var26: mysql_real_escape_string(qualifiedLeadTitle),var27: mysql_real_escape_string(topCustomerTitle),var28: mysql_real_escape_string(topProductTitle),var29: mysql_real_escape_string(salesAnalysisTitle),var30: mysql_real_escape_string(salesScenariosTitle),var31: mysql_real_escape_string(teamRoleTitle),var32: mysql_real_escape_string(salesBestPracticeTitle),var33: mysql_real_escape_string(salesPresentationTitle)})
    let setData = await connection.query(s1)
    return setData

}