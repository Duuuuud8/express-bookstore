/** Database config for database. */


const { Client } = require("pg");
// const {DB_URI} = require("./config");

const db = new Client({
  // connectionString: DB_URI,
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  database: 
    process.env.NODE_ENV === "test"
      ? "books_test"
      : "books"
});

db.connect();


module.exports = db;

// URI making things not work??