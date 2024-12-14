const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const port = 5000;
const app = express();

// app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));
app.use(express.json());

const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));
// const getMessage = require("./src/Routes/getMessage");
const webhook = require("./src/webHook");

// app.use("/", getMessage);
app.use("/data", webhook);
// Menambahkan handler untuk root path
app.get("/", (req, res) => {
  res.send("Selamat datang di server Express!");
});
app.listen(port, () => {
  console.log(`Server berjalan di port: ${port}`);
});

// exports.apiForward = functions.https.onRequest(app)
