const LEVELS = [
  { name: "Pawn", min: 100, max: 1000 },
  { name: "Knight", min: 1000, max: 1200 },
  { name: "Bishop", min: 1200, max: 1400 },
  { name: "Rook", min: 1400, max: 1500 },
  { name: "Queen", min: 1500, max: 1600 },
  { name: "King", min: 1600, max: 1700 }
];

const LEVEL_NAMES = LEVELS.map((level) => level.name);
const MAX_TOPICS_PER_LEVEL = 20;
const PASSING_SCORE = 70;

module.exports = {
  LEVELS,
  LEVEL_NAMES,
  MAX_TOPICS_PER_LEVEL,
  PASSING_SCORE
};
