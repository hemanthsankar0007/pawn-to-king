export const LEVEL_CONFIG = {
  Pawn: {
    rating: "100-1000",
    themeColor: "#C9A227",
    background: "pawn-bg",
    pieceImage: "/assets/pawn.png",
    title: "Foundations of Control",
    subtitle: "Build unshakable chess fundamentals."
  },
  Knight: {
    rating: "1000-1200",
    themeColor: "#3B82F6",
    background: "knight-bg",
    pieceImage: "/assets/knight.png",
    title: "Tactical Awakening",
    subtitle: "Develop sharp calculation and attacking vision."
  },
  Bishop: {
    rating: "1200-1400",
    themeColor: "#8B5CF6",
    background: "bishop-bg",
    pieceImage: "/assets/bishop.png",
    title: "Strategic Intelligence",
    subtitle: "Learn to plan, restrict, and outmaneuver."
  },
  Rook: {
    rating: "1400-1500",
    themeColor: "#22C55E",
    background: "rook-bg",
    pieceImage: "/assets/rook.png",
    title: "Practical Power",
    subtitle: "Convert advantages and dominate middlegames."
  },
  Queen: {
    rating: "1500-1600",
    themeColor: "#EAB308",
    background: "queen-bg",
    pieceImage: "/assets/queen.png",
    title: "Competitive Precision",
    subtitle: "Master calculation under pressure."
  },
  King: {
    rating: "1600-1700",
    themeColor: "#FB7185",
    background: "king-bg",
    pieceImage: "/assets/king.png",
    title: "Elite Mastery",
    subtitle: "Think, prepare, and compete like a champion."
  }
};

export const DEFAULT_LEVEL_CONFIG = {
  rating: "N/A",
  themeColor: "#D4AF37",
  background: "pawn-bg",
  pieceImage: "/assets/default-piece.svg",
  title: "Level Track",
  subtitle: "Structured progression."
};

export const getLevelConfig = (levelName) => LEVEL_CONFIG[levelName] || DEFAULT_LEVEL_CONFIG;
