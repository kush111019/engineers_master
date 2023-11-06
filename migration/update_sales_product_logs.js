const { Pool } = require("pg");
const uuid = require("node-uuid");
require("dotenv").config();

var connection = new Pool({
  host: process.env.HOST,
  user: process.env.DATABASE_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  charset: "utf8mb4",
});

connection.query(
  `DO $$
  BEGIN
      IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'follow_up_notes' AND column_name = 'notes_type') THEN
          ALTER TABLE follow_up_notes
          ADD COLUMN notes_type VARCHAR(255) DEFAULT '1';
      END IF;
  END $$;`,
  (err) => {
    if (err) {
      throw err;
    }
  }
);

connection.end();
process.exit();