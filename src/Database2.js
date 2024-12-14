const mysql = require("mysql");

const dbConfig = {
  host: "103.181.182.230",
  port: "3306",
  user: "ADM.Haidar.001",
  password: "Blk6eY0Gf2CM",
  database: "sik_tirtayasa",
};

const connection2 = mysql.createConnection(dbConfig);

connection2.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database", dbConfig.database);
});

module.exports = connection2;
