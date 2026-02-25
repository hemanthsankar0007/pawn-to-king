const Level = require("../models/Level");
const { LEVEL_NAMES } = require("../utils/constants");

const levelIndexMap = new Map(LEVEL_NAMES.map((name, index) => [name, index]));

const getLevels = async (_req, res) => {
  try {
    const levels = await Level.find().select("name meetingLink").lean();
    levels.sort((a, b) => (levelIndexMap.get(a.name) ?? 99) - (levelIndexMap.get(b.name) ?? 99));
    return res.json({ levels });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load levels right now" });
  }
};

module.exports = {
  getLevels
};
