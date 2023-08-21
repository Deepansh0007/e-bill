const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bodyparser = require("body-parser");
router.use(bodyparser.json());
const db = mysql.createConnection({
	host: process.env.HOSTNAME,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
});

router.get("/dashboard", (req, res) => {
	let data = {};
	db.query(`select count(*) as c from user`, (error, result) => {
		data["user"] = result[0].c;
	});
	db.query(
		`select count(*) as c from bills where status = "paid"`,
		(error, result) => {
			data["paid"] = result[0].c;
		}
	);
	db.query(
		`select count(*) as c from bills where status = "pending"`,
		(error, result) => {
			data["pending"] = result[0].c;
		}
	);
	db.query(`select sum(amount) as c from bills`, (error, result) => {
		let amt = result[0].c.toLocaleString("hi-IN"); //en-us
		data["amt"] = amt;
	});
	db.query(`select count(*) as c from bills`, (error, result) => {
		data["bills"] = result[0].c;
	});
	db.query(
		`select count(*) as c from complaints where status = "pending"`,
		(error, result) => {
			data["complaints"] = result[0].c;
			console.log(data);
			res.render("adminDashboard", {admin: data});
		}
	);
});
router.get("/bills", (req, res) => {
	let send = {};
	db.query(
		"select * from bills, user where bills.userid = user.userid",
		(error, result) => {
			if (error) console.log(error);
			else send["data"] = result;
		}
	);
	db.query("select name,userid from user", (error, result) => {
		if (error) console.log(error);
		else {
			send["bill"] = result;
			console.log(send);
			res.render("adminBills", {user: send});
		}
	});
});
router.get("/customers", (req, res) => {
	db.query("select * from user", (error, result) => {
		if (error) console.log(error);
		else res.render("adminCustomers", {data: result});
	});
});
router.get("/complaints", (req, res) => {
	db.query(
		'select * from complaints where status = "pending"',
		(error, result) => {
			if (error) console.log(error);
			else {
				console.log(result);
				res.render("adminComplaints", {data: result});
			}
		}
	);
});
router.post("/generate", (req, res) => {
	const {userid, units} = req.body;
	let userr = {};
	console.log(userid);
	console.log(units);
	let today = new Date();
	let date = today.toLocaleDateString("en-IN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	console.log(date);
	let due = new Date(today.setDate(today.getDate() + 30)).toLocaleDateString(
		"en-IN",
		{
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}
	);
	console.log(due);
	let amount = units * 20;
	console.log(amount);
	db.query(
		"INSERT INTO `bills`(`USERID`, `ADMINID`, `BILLDATE`, `DUEDATE`, `AMOUNT`, `UNITS`, `STATUS`) VALUES (?,?,?,?,?,?,?)",
		[userid, "1", date, due, amount, units, "pending"],
		(error, result) => {
			if (error) console.log(error);
			else {
				db.query(
					"select * from bills,user where bills.userid = user.userid",
					(error, result) => {
						if (error) console.log(error);
						else {
							userr["data"] = result;
						}
					}
				);
				db.query("select name,userid from user", (error, result) => {
					if (error) console.log(error);
					else {
						userr["bill"] = result;
						res.render("adminBills", {user: userr});
					}
				});
			}
		}
	);
});
router.post("/processed", (req, res) => {
	let cid = req.body.cid;
	console.log(cid);
	db.query(
		"UPDATE `complaints` SET `STATUS`='processed' WHERE complaintid = ?",
		[cid],
		(error, result) => {
			if (error) console.log(error);
		}
	);
	db.query(
		'select * from complaints where status = "pending"',
		(error, result) => {
			if (error) console.log(error);
			else {
				console.log(result);
				res.render("adminComplaints", {data: result});
			}
		}
	);
});
module.exports = router;
