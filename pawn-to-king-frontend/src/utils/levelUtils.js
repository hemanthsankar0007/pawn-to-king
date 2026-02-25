export const LEVELS = [
  { name: "Pawn", min: 100, max: 1000 },
  { name: "Knight", min: 1000, max: 1200 },
  { name: "Bishop", min: 1200, max: 1400 },
  { name: "Rook", min: 1400, max: 1500 },
  { name: "Queen", min: 1500, max: 1600 },
  { name: "King", min: 1600, max: 1700 }
];

export const LEVEL_NAMES = LEVELS.map((level) => level.name);

export const LEVEL_META = [
  {
    name: "Pawn",
    ratingRange: "100-1000",
    powerTitle: "Foundations of Control",
    tagline: "Build unshakable chess fundamentals.",
    focus: "Foundation track focused on legal moves, safety, and essential beginner game flow.",
    topicCount: 20
  },
  {
    name: "Knight",
    ratingRange: "1000-1200",
    powerTitle: "Tactical Awakening",
    tagline: "Develop sharp calculation and attacking vision.",
    focus: "Tactical mastery track with combinations, forcing lines, and practical tactical execution.",
    topicCount: 40
  },
  {
    name: "Bishop",
    ratingRange: "1200-1400",
    powerTitle: "Strategic Intelligence",
    tagline: "Learn to plan, restrict, and outmaneuver.",
    focus: "Strategic track centered on positional planning, structures, and long-term advantages.",
    topicCount: 40
  },
  {
    name: "Rook",
    ratingRange: "1400-1500",
    powerTitle: "Practical Power",
    tagline: "Convert advantages and dominate middlegames.",
    focus: "Middlegame strength track with practical conversion, initiative, and evaluation tools.",
    topicCount: 20
  },
  {
    name: "Queen",
    ratingRange: "1500-1600",
    powerTitle: "Competitive Precision",
    tagline: "Master calculation under pressure.",
    focus: "Advanced competitive play focused on deep calculation, preparation, and decision quality.",
    topicCount: 20
  },
  {
    name: "King",
    ratingRange: "1600-1700",
    powerTitle: "Elite Mastery",
    tagline: "Think, prepare, and compete like a champion.",
    focus: "Elite mastery track for endgame depth, competitive resilience, and tournament excellence.",
    topicCount: 20
  }
];

export const toLevelSlug = (value) => String(value || "").trim().toLowerCase();

export const toLevelName = (slug) =>
  LEVEL_NAMES.find((level) => level.toLowerCase() === toLevelSlug(slug)) || null;

export const getLevelIndex = (levelName) =>
  LEVEL_NAMES.findIndex((level) => level.toLowerCase() === toLevelSlug(levelName));

export const getNextLevelTopicPath = (levelName, topicNumber) =>
  `/topic/${toLevelSlug(levelName)}/${topicNumber}`;

export const getUserProgress = (profile) => {
  const progressData =
    profile?.progress && typeof profile.progress === "object" ? profile.progress : {};

  const currentLevel = progressData.currentLevel ?? profile?.user?.currentLevel ?? "Pawn";
  const currentTopic = Number.parseInt(progressData.currentTopic ?? profile?.user?.currentTopic ?? 1, 10);
  const totalTopics = Number.parseInt(progressData.totalTopics ?? profile?.totalTopics ?? 20, 10);
  const completedTopics = Number.parseInt(
    progressData.completedTopics ?? profile?.completedTopics ?? Math.max(currentTopic - 1, 0),
    10
  );

  const fallbackPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const percentageRaw =
    progressData.percentage ??
    profile?.progressPercentage ??
    (typeof profile?.progress === "number" ? profile.progress : fallbackPercentage);

  const percentage = Math.max(0, Math.min(100, Number.parseInt(percentageRaw, 10) || 0));

  return {
    currentLevel,
    currentTopic: Math.max(1, currentTopic || 1),
    completedTopics: Math.max(0, completedTopics || 0),
    totalTopics: Math.max(1, totalTopics || 20),
    percentage
  };
};
