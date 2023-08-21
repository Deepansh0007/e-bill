const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = mysql.createConnection({
	host: process.env.HOSTNAME,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE
});

router.post("/signup", async (req, res) => {
	const {name, email, password, confirmPassword} = req.body;
	let hashedPassword = await bcrypt.hash(password, 8);
	var value = [name, email, hashedPassword];

	db.query("select * from user where email= ?", [email], (error, result) => {
		if (error) console.log(error);
		if (result.length > 0) res.render("login",{exists : true});
		else call();
	});
	function call() {
		db.query(
			"INSERT INTO `user`(`NAME`, `EMAIL`, `PASSWORD`) VALUES (?)",
			[value],
			(error, result) => {
				if (error) console.log(error);
				else res.render('login',{inserted: true});
			}
		);
	}
});
router.post("/login", async (req, res) => {
	const {email, password, userType} = req.body;
	if (userType == "user") {
		db.query(
			"select userid from user where email = ?",
			[email],
			(error, result) => {
				if (error) console.log(error);
				else {
					const payload = {
						userID: result[0].userid,
					};
					const token = jwt.sign(payload, "HACKER", {
						expiresIn: "1h",
					});
					res.cookie("user", token, {
						httpOnly: true,
						secure: true,
					});
				}
			}
		);
		db.query(
			"select password from user where email = ?",
			[email],
			(error, result) => {
				if (error) console.log(error);
				else if (result.length == 0)
					res.render("login", {userNotRegistered: "True"});
				else {
					bcrypt.compare(password, result[0].password, (error, result) => {
						if (result) {
							res.redirect("/user/dashboard");
						} else res.render("login", {wrongPassword: "True"});
					});
				}
			}
		);
	} else {
		db.query(
			"select password from admin where email = ?",
			[email],
			(error, result) => {
				if (error) console.log(error);
				if (result.length == 0)
					res.render("login", {adminNotRegistered: "True"});
				else {
					bcrypt.compare(password, result[0].password, (error, result) => {
						if (result) res.redirect("/admin/dashboard");
						else res.render("login", {wp: true});
					});
				}
			}
		);
	}
});

module.exports = router;
