const express = require("express");

const router = express.Router();

const { getTenants } = require("../controllers/userController");

router.get("/tenants", getTenants);

module.exports = router;
