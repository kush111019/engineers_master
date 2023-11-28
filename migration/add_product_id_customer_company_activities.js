const { Pool } = require("pg");
const uuid = require("node-uuid");
require("dotenv").config();

const pool = new Pool({
  host: process.env.HOST,
  user: process.env.DATABASE_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  charset: "utf8mb4",
});

pool
  .connect()
  .then((client) => {
    return client
      .query(
        `DO $$
      BEGIN
          IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'customer_company_employees_activities' AND column_name = 'product_id') THEN
              ALTER TABLE customer_company_employees_activities
              ADD COLUMN product_id UUID DEFAULT NULL;
          END IF;
      END $$;`
      )
      .then((res) => {
        console.log("Column added successfully:", res);
        client.release(); // Release the client back to the pool
      })
      .catch((err) => {
        console.error("Error adding column:", err);
        client.release();
      });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });
