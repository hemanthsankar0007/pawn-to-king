const { ensureAppConfig } = require("../config/appConfig");

const parseHomeworkLink = (value) => {
  const nextLink = String(value || "").trim();

  if (!nextLink) {
    return { isValid: false, link: "" };
  }

  try {
    const parsed = new URL(nextLink);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { isValid: false, link: "" };
    }
    return { isValid: true, link: parsed.toString() };
  } catch (_error) {
    return { isValid: false, link: "" };
  }
};

const getHomeworkLink = async (_req, res) => {
  try {
    const config = await ensureAppConfig();
    return res.json({ link: config.defaultHomeworkLink });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load homework link right now." });
  }
};

const updateHomeworkLink = async (req, res) => {
  try {
    const { isValid, link } = parseHomeworkLink(req.body?.link);

    if (!isValid) {
      return res.status(400).json({ message: "A valid homework link is required." });
    }

    const config = await ensureAppConfig();
    config.defaultHomeworkLink = link;
    await config.save();

    return res.json({
      message: "Homework link updated.",
      link: config.defaultHomeworkLink
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to update homework link right now." });
  }
};

module.exports = {
  getHomeworkLink,
  updateHomeworkLink
};
