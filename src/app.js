const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyparser = require("body-parser");

const app = express();
app.use(cookieParser());
app.use(bodyparser.json());
dotenv.config({ path: ".//.env" });

const db = mysql.createConnection({
  host: process.env.HOSTNAME,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE
});

const directory = path.join(__dirname, "./css");
const imagesdirectory = path.join(__dirname, "./images");

app.use(express.static(directory));
app.use(express.static(imagesdirectory));

app.set("view engine", "hbs");

db.connect((error) => {
  if (error) console.log(error);
  else {
    console.log("My sql connected");
  }
});
app.use(express.urlencoded({ extended: false }));
app.use("/", require("../routes/website"));
app.use("/auth", require("../routes/auth"));
app.use("/user", require("../routes/user"));
app.use("/admin", require("../routes/admin"));

app.listen(5500, () => {
  console.log("server running");
});
