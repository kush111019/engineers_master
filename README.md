# sales-service
Web Backend for Sales services

# upload the schema
Upload schema(hirise_sales_schema.sql) to the database

# update .env file
`For host, database, SMTP, Stripe Publisher key and SECRET_KEY,  and URL's`

# run the seeder commands
1. `npm run seedSuperAdmin`
2. `npm run migration`
3. `npm run seedModules`
4. `npm run seedCountryDetails`

# run server
`npm start`

# if you want to build a package
1. `npm install -g pkg`
2. `pkg index.js -o sales-service`

# commands to execute bundle node.js code in linux
1. `chmod +x sales-service`
2. `nohup ./sales-service > output.txt`
3. `kill -9 $(lsof -t -i:3003)`

# test server
1. `URL/api` -> To check weather server is running and database is connected or not
