const { json } = require("express");
const { dbScript, db_sql } = require("../src/utils/db_scripts");
const { mysql_real_escape_string } = require("../src/utils/helper");
const connection = require("../src/database/connection");

module.exports.setPlayBook = async (companyId, userId, res) => {
    let resources = [
        {
            "Company Values": "https://www.dummywebsite.org",
            "Product & Pricing": "http://www.testsite123.net",
            "Product Demos": "https://www.placeholderlink.net",
            "Real-time Statistics": "http://www.samplelink.biz"
        }
    ]
    let background = "We offer data, voice and digital services. 20+ years of management the complex services. Speed available up to 100 GPS.";
    let visionMission = "Operation Stellar Recon is a simulated space mission designed to test and evaluate advanced orbital surveillance and analysis technologies. The primary objective of this mission is to simulate the deployment of a constellation of satellite assets for monitoring and studying celestial bodies, space debris, and other potential objects of interest within Earth's orbit.";
    let visionMissionImage = process.env.PLAYBOOK_DEFAULT_VISIONMISSION_IMAGE_PATH;
    let productImage = process.env.PLAYBOOK_DEFAULT_PRODUCT_IMAGE_PATH;
    let customerProfiling = "<!DOCTYPE html>\n<html>\n<head>\n  <title>Persona Table</title>\n</head>\n<body>\n\n<h1>PERSONA</h1>\n\n<table border=\"1\">\n  <thead>\n    <tr>\n      <th rowspan=\"2\">Persona</th>\n      <th colspan=\"3\">Company Size</th>\n    </tr>\n    <tr>\n      <th>Startups</th>\n      <th>Midsize</th>\n      <th>Enterprise</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td rowspan=\"3\">INDUSTRY</td>\n      <td>Industry A</td>\n      <td>Industry B</td>\n      <td>Industry C</td>\n    </tr>\n    <tr>\n      <td>Industry D</td>\n      <td>Industry E</td>\n      <td>Industry F</td>\n    </tr>\n    <tr>\n      <td>Industry G</td>\n      <td>Industry H</td>\n      <td>Industry I</td>\n    </tr>\n    <tr>\n      <td rowspan=\"3\">PAIN POINTS</td>\n      <td>Pain Point A</td>\n      <td>Pain Point B</td>\n      <td>Pain Point C</td>\n    </tr>\n    <tr>\n      <td>Pain Point D</td>\n      <td>Pain Point E</td>\n      <td>Pain Point F</td>\n    </tr>\n    <tr>\n      <td>Pain Point G</td>\n      <td>Pain Point H</td>\n      <td>Pain Point I</td>\n    </tr>\n    <tr>\n      <td rowspan=\"3\">POINT OF CONTACT</td>\n      <td>Contact A</td>\n      <td>Contact B</td>\n      <td>Contact C</td>\n    </tr>\n    <tr>\n      <td>Contact D</td>\n      <td>Contact E</td>\n      <td>Contact F</td>\n    </tr>\n    <tr>\n      <td>Contact G</td>\n      <td>Contact H</td>\n      <td>Contact I</td>\n    </tr>\n  </tbody>\n</table>\n\n</body>\n</html>"
    let leadProcesses = [
        "inbound selling",
        "outbound selling"
    ];
    let salesStrategies = "Understand Your Customer: Take the time to thoroughly understand your target audience's needs, preferences, pain points, and buying behaviors. Tailor your approach and messaging to address their specific concerns.Build Relationships: Focus on building strong, genuine relationships with your customers. Develop trust and rapport by being responsive, reliable, and providing excellent customer service.Value Proposition: Clearly communicate the unique value and benefits your product or service offers. Show how it can solve your customer's problems or enhance their lives.";
    let scenarioData = [
        {
            "description": "Lead came to our website and requested for a Demo. The sales team will reach out to the customer to understand their pain-points to address if the product is a right fit for them?",
            "actions": "Break down the products features and benefits Provide real-world examples of how the product has delivered value to other customers.Offer a comparison with competitor products to showcase the competitive pricing., Emphasize the long-term benefits and return on investment."
        },
        {
            "description": "Customer is interested in upgrading their current plan. Discuss the benefits of the higher-tier plan and address any concerns.",
            "actions": "Break down the products features and benefits Provide real-world examples of how the product has delivered value to other customers.Offer a comparison with competitor products to showcase the competitive pricing., Emphasize the long-term benefits and return on investment."
        },
        {
            "description": "Prospects is unsure about the pricing. Explain the value proposition of the product and justify the pricing.",
            "actions":
                "Break down the products features and benefits Provide real-world examples of how the product has delivered value to other customers.Offer a comparison with competitor products to showcase the competitive pricing., Emphasize the long-term benefits and return on investment."
        }
    ];
    let salesBestPractices = [
        {
            "sales presentation": "EffectiveSalesTactics.com",
            "sales strategies": "MasteringSalesStrategies.org",
            "FAQs": "WinningSalesApproaches.net",
            "Sales Info": "SalesMastery101.info"
        }
    ]

    let s1 = dbScript(db_sql['Q425'], { var1: companyId, var2: userId, var3: JSON.stringify(resources), var4: mysql_real_escape_string(background), var5: mysql_real_escape_string(visionMission), var6: visionMissionImage, var7: productImage, var8: JSON.stringify(customerProfiling), var9: JSON.stringify(leadProcesses), var10: mysql_real_escape_string(salesStrategies), var11: JSON.stringify(scenarioData), var12: JSON.stringify(salesBestPractices) })
    let setData = await connection.query(s1)
    return setData

}