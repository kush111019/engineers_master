# sales-service
Web Backend for Sales services

# upload the schema
Upload schema(hirise_sales_schema.sql) to the database

# update .env file
`For host, database, SMTP, Stripe Publisher key and SECRET_KEY,  and URL's`

# run the seeder commands
1. `node seedSuperAdmin`
2. `node seedModules`
3. `node seedCountryDetails`

# run server
`npm start`

# if you want to build a package
1. `npm install -g pkg`
2. `pkg index.js -o sales-service`
3. `./sales-service`

# test server
`URL/api` -> To check weather server is running and database is connected or not
