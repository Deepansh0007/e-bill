const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	res.render("login");
});
router.get("/login", (req, res) => {
	res.render("login");
});

router.get("/signup", (req, res) => {
	res.render("signup");
});
router.get("/logout", (req, res) => {
	res.clearCookie("user");
	res.render("login");
});

module.exports = router;
