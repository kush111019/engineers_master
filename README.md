# sales-service
Web Backend for Sales services

# upload the schema
Upload schema(hirise_sales_schema.sql) to the database

# update .env file
`For host, database, SMTP, Stripe Publisher key and SECRET_KEY,  and URL's`

# run the seeder commands
1. `npm run seedSuperAdmin`
2. `npm run seedModules`
3. `npm run seedCountryDetails`

# run server
`npm start`

# if you want to build a package
1. `npm install -g pkg`
2. `pkg index.js -o sales-service`
3. `./sales-service`

# commands to execute bundle node.js code in linux
1. `chmod +x index-linux`
2. `./index-linux`

# test server
1. `URL/api` -> To check weather server is running and database is connected or not
