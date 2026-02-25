const BonusMaterial = require("../models/BonusMaterial");

const getBonusMaterials = async (_req, res) => {
  try {
    const materials = await BonusMaterial.find().sort({ createdAt: -1 }).lean();
    return res.json({ materials });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch bonus materials" });
  }
};

module.exports = {
  getBonusMaterials
};

