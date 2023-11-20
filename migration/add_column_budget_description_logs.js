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
          IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'marketing_budget_logs' AND column_name = 'edit_logs') THEN
              ALTER TABLE marketing_budget_logs
              ADD COLUMN edit_logs VARCHAR(255) DEFAULT '';
          END IF;
      END $$;`
      )
      .then((res) => {
        console.log("Column added successfully:", res);
        client.release(); // Release the client back to the pool
        process.exit();
      })
      .catch((err) => {
        console.error("Error adding column:", err);
        client.release(); // Release the client back to the pool
        process.exit();
      });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });
