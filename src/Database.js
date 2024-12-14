const mysql = require("mysql");

const dbConfig = {
  host: "26.142.134.35",
  port: "6033",
  user: "aris",
  password: "aksa0502",
  database: "db_memsys",
};
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database", dbConfig.database);
});

module.exports = connection;
