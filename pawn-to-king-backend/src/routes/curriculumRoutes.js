const express = require("express");
const {
  getCurriculum,
  getCurriculumByLevel
} = require("../controllers/curriculumController");

const router = express.Router();

router.get("/", getCurriculum);
router.get("/:level", getCurriculumByLevel);

module.exports = router;
