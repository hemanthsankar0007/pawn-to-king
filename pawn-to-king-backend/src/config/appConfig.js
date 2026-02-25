const AppConfig = require("../models/AppConfig");

const DEFAULT_HOMEWORK_LINK = "https://lichess.org/study/aCDNMaTP";

const ensureAppConfig = async () => {
  let config = await AppConfig.findOne();

  if (!config) {
    config = await AppConfig.create({
      defaultHomeworkLink: DEFAULT_HOMEWORK_LINK
    });
  }

  return config;
};

const seedAppConfig = async () => {
  const existing = await AppConfig.findOne().select("_id").lean();

  if (!existing) {
    await AppConfig.create({
      defaultHomeworkLink: DEFAULT_HOMEWORK_LINK
    });
    console.log("Default homework link seeded.");
  }
};

module.exports = {
  ensureAppConfig,
  seedAppConfig
};
