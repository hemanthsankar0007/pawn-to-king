const { LEVELS } = require("./constants");

const LEVEL_TITLES = {
  Pawn: "Foundations of Control",
  Knight: "Tactical Awakening",
  Bishop: "Strategic Intelligence",
  Rook: "Practical Power",
  Queen: "Competitive Precision",
  King: "Elite Mastery"
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const resolvePlacementRating = ({ chessComRating, fideRating }) => {
  const chessRating = toNumber(chessComRating);
  const fideRatingValue = toNumber(fideRating);

  if (chessRating === null && fideRatingValue === null) {
    return LEVELS[0].min;
  }

  return Math.max(chessRating || 0, fideRatingValue || 0);
};

const getLevelFromRating = (rating) => {
  const normalizedRating = Math.max(0, Number(rating) || 0);

  const matchedLevel = LEVELS.find((level) => normalizedRating <= level.max);
  return matchedLevel ? matchedLevel.name : LEVELS[LEVELS.length - 1].name;
};

const buildPlacementMessage = (levelName) => {
  const trackTitle = LEVEL_TITLES[levelName] || "Chess Mastery";

  return `Congratulations, you are placed in ${levelName.toUpperCase()} Level. ${trackTitle} awaits you.`;
};

const calculatePlacementLevel = (rating) => {
  const levelName = getLevelFromRating(rating);

  return {
    levelName,
    message: buildPlacementMessage(levelName)
  };
};

module.exports = {
  LEVEL_TITLES,
  resolvePlacementRating,
  getLevelFromRating,
  calculatePlacementLevel
};
