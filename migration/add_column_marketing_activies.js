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
          IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'customer_company_employees' AND column_name = 'marketing_activities') THEN
              ALTER TABLE customer_company_employees
              ADD COLUMN marketing_activities VARCHAR(255) DEFAULT '';
          END IF;
      END $$;`
      )
      .then((res) => {
        console.log("Column added successfully:", res);
        client.release(); // Release the client back to the pool
      })
      .catch((err) => {
        console.error("Error adding column:", err);
        client.release(); // Release the client back to the pool
      });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });
