const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const jwt = require("jsonwebtoken");

const db = mysql.createConnection({
	host: process.env.HOSTNAME,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
});

router.get("/dashboard", (req, res) => {
	var userData = {};
	if (req.cookies.user) {
		const cookieData = jwt.verify(req.cookies.user, "HACKER");
		const userID = cookieData.userID;
		db.query(
			'SELECT count(*) as count FROM `bills` where STATUS = "paid" and userid = ?',
			[userID],
			(error, result) => {
				if (error) console.log(error);
				else {
					userData["first"] = result[0].count;
				}
			}
		);
		db.query(
			'SELECT count(*) as count FROM `bills` where STATUS = "pending" and userid = ?',
			[userID],
			(error, result) => {
				if (error) console.log(error);
				else {
					userData["second"] = result[0].count;
				}
			}
		);
		db.query(
			"SELECT count(*) as count FROM `complaints` where userid = ?",
			[userID],
			(error, result) => {
				if (error) console.log(error);
				else {
					userData["third"] = result[0].count;
				}
				res.render("dashboard", {dashboardData: userData});
			}
		);
	} else {
		res.sendStatus(401);
	}
});

router.get("/bills", (req, res) => {
	if (req.cookies.user) {
		const userData = jwt.verify(req.cookies.user, "HACKER");
		const userID = userData.userID;
		db.query(
			'SELECT `BILLID`, `USERID`, `ADMINID`, `BILLDATE`, `DUEDATE`, `AMOUNT`, `UNITS`, `STATUS` FROM `bills` WHERE status = "pending" and userid = ?',
			[userID],
			(error, result) => {
				if (error) console.log(error);
				else {
					console.log(result);
					res.render("bills", {data: result});
				}
			}
		);
	} else {
		res.sendStatus(401);
	}
});
router.get("/transaction", (req, res) => {
	if (req.cookies.user) {
		const userData = jwt.verify(req.cookies.user, "HACKER");
		const userID = userData.userID;
		db.query(
			`SELECT transactionid, date, payable,bills.billid FROM transactions, bills where bills.status="paid" and transactions.billid= bills.billid and bills.userid =?`,
			[userID],
			(error, result) => {
				if (error) console.log(error);
				else res.render("transaction", {data: result});
			}
		);
	} else {
		res.sendStatus(401);
	}
});
router.get("/complaints", (req, res) => {
	if (req.cookies.user) {
		const userData = jwt.verify(req.cookies.user, "HACKER");
		const userID = userData.userID;
		db.query(
			"select * from complaints where userid = ?",
			[userID],
			(error, result) => {
				res.render("complaints", {data: result});
			}
		);
	} else {
		res.sendStatus(401);
	}
});
router.post("/paid", (req, res) => {
	const billid = req.body.id;
	const date = req.body.date;
	const amt = req.body.amt;
	db.query(
		`update bills set status = "paid" where billid = ?`,
		[billid],
		(result, err) => {
			if (err) console.log(err);
			db.query(
				"INSERT INTO `transactions`(`BILLID`, `DATE`, `PAYABLE`) VALUES (?,?,?)",
				[billid, date, amt],
				(error, result) => {
					if (error) console.log(error);
				}
			);
			res.redirect("/user/bills");
		}
	);
});
router.post("/generate", (req, res) => {
	const complaint = req.body.complaint;
	const userData = jwt.verify(req.cookies.user, "HACKER");
	const userID = userData.userID;
	db.query(
		'INSERT INTO `complaints`(`USERID`, `ADMINID`, `STATUS`, `COMPLAINT`) VALUES (?, 1, "pending",?)',
		[userID, complaint],
		(err, result) => {}
	);
});

module.exports = router;
