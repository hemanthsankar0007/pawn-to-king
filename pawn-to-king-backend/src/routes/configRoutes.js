const express = require("express");
const AppConfig = require("../models/AppConfig");
const { ensureAppConfig } = require("../config/appConfig");

const router = express.Router();

router.get("/homework-link", async (_req, res) => {
  try {
    const config = await ensureAppConfig();

    return res.json({ link: config.defaultHomeworkLink });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load homework link" });
  }
});

router.put("/homework-link", async (req, res) => {
  try {
    const { link } = req.body || {};
    const trimmedLink = String(link || "").trim();

    if (!trimmedLink) {
      return res.status(400).json({ message: "Valid link is required" });
    }

    let config = await AppConfig.findOne();

    if (!config) {
      config = new AppConfig({ defaultHomeworkLink: trimmedLink });
    } else {
      config.defaultHomeworkLink = trimmedLink;
    }

    await config.save();

    return res.json({ message: "Homework link updated successfully", link: config.defaultHomeworkLink });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to update homework link" });
  }
});

module.exports = router;
