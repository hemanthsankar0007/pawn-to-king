const express = require("express");
const { submitApplication } = require("../controllers/joinController");

const router = express.Router();

router.post("/", submitApplication);

module.exports = router;
