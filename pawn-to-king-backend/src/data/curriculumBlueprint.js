const { LEVEL_NAMES } = require("../utils/constants");

const CURRICULUM_LEVELS = [
  {
    levelName: "Pawn",
    description: "Foundation track focused on legal moves, safety, and essential beginner game flow.",
    sections: [
      {
        name: "Foundations",
        topics: [
          "Understanding the Chessboard & Coordinates",
          "Pawn Movement & Promotion Rules",
          "Rook Movement & Open Files",
          "Bishop Movement & Diagonal Control",
          "Knight Movement & Fork Awareness",
          "Queen Power & Piece Coordination",
          "King Movement & Safety Basics",
          "Capturing Pieces & Material Value",
          "Check, Checkmate & Escape Methods",
          "Draw Rules: Stalemate, Threefold & 50-Move Rule",
          "Castling: Timing & Strategy",
          "En Passant Explained Clearly",
          "Basic Checkmate Patterns (Back Rank & Ladder)",
          "King + Queen Checkmate Technique",
          "King + Rook Checkmate Technique",
          "Opening Principles: Control the Center",
          "Piece Development & Tempo",
          "Avoiding Common Beginner Blunders",
          "Playing a Complete Mini Game",
          "Pawn Level Championship Test"
        ]
      }
    ]
  },
  {
    levelName: "Knight",
    description: "Tactical mastery track with combinations, forcing lines, and practical tactical execution.",
    sections: [
      {
        name: "Tactical Foundations",
        topics: [
          "What is a Tactical Opportunity?",
          "Knight Forks & Double Attacks",
          "Absolute Pins Explained",
          "Relative Pins & Pressure",
          "Skewers in Practical Play",
          "Discovered Attacks & Checks",
          "Double Check & Forcing Play",
          "Removing the Defender",
          "Overloading a Piece",
          "Deflection Tactics"
        ]
      },
      {
        name: "Tactical Patterns",
        topics: [
          "Attraction & Decoy Sacrifices",
          "Back Rank Weakness",
          "Smothered Mate Pattern",
          "Greek Gift Sacrifice (Bxh7+)",
          "Clearance Sacrifice",
          "Zwischenzug (Intermediate Move)",
          "Trapping Opponent Pieces",
          "Tactical Motif Combination",
          "Mate in One Training",
          "Knight Tactical Trial I"
        ]
      },
      {
        name: "Calculation & Vision",
        topics: [
          "Candidate Moves Selection",
          "Checks, Captures, Threats Method",
          "Visualizing 2 Moves Ahead",
          "Visualizing 3 Moves Ahead",
          "Counting Attackers & Defenders",
          "Identifying Forcing Lines",
          "Tactical Defense Techniques",
          "Avoiding Tactical Blunders",
          "Time Management in Sharp Positions",
          "Knight Tactical Trial II"
        ]
      },
      {
        name: "Practical Tactical Play",
        topics: [
          "Tactics in Open Positions",
          "Tactics in Closed Positions",
          "Combining Multiple Motifs",
          "Creating Tactical Traps",
          "Solving Under Time Pressure",
          "Mixed Tactical Battle Set",
          "Reviewing Tactical Mistakes",
          "Practical Puzzle Simulation",
          "Advanced Tactical Challenge",
          "Knight Grand Championship Test"
        ]
      }
    ]
  },
  {
    levelName: "Bishop",
    description: "Strategic track centered on positional planning, structures, and long-term advantages.",
    sections: [
      {
        name: "Positional Basics",
        topics: [
          "What is Chess Strategy?",
          "Understanding Pawn Structure",
          "Isolated Pawn Strategy",
          "Doubled Pawns: Weakness or Strength?",
          "Backward Pawn Explained",
          "Weak Squares & Outposts",
          "Strong Outposts for Knights",
          "Good Bishop vs Bad Bishop",
          "Open vs Closed Positions",
          "Bishop Strategy Trial I"
        ]
      },
      {
        name: "Planning & Structure",
        topics: [
          "Creating a Long-Term Plan",
          "Improving Your Worst Piece",
          "Centralization of Pieces",
          "Space Advantage Concepts",
          "Static vs Dynamic Advantages",
          "Minor Piece Coordination",
          "Prophylaxis (Preventing Opponent Plans)",
          "Restricting Opponent Activity",
          "Transition from Opening to Middlegame",
          "Bishop Strategy Trial II"
        ]
      },
      {
        name: "Advanced Strategy",
        topics: [
          "Pawn Breaks & Timing",
          "The Art of Blockade",
          "Color Complex Strategy",
          "Opposite-Colored Bishop Strategy",
          "Positional Sacrifice Basics",
          "Targeting Structural Weaknesses",
          "King Activity in the Middlegame",
          "Long-Term Positional Pressure",
          "Strategic Imbalances (Material vs Activity)",
          "Bishop Strategy Trial III"
        ]
      },
      {
        name: "Practical Strategic Play",
        topics: [
          "Evaluating Positions Objectively",
          "Playing Without Immediate Tactics",
          "Converting Small Advantages",
          "Defending Slightly Worse Positions",
          "Handling Equal Positions",
          "Strategic Case Study Analysis",
          "Planning in Real Tournament Games",
          "Full Positional Simulation",
          "Deep Strategy Review",
          "Bishop Grand Championship Test"
        ]
      }
    ]
  },
  {
    levelName: "Rook",
    description: "Middlegame strength track with practical conversion, initiative, and evaluation tools.",
    sections: [
      {
        name: "Middlegame Practical Strength",
        topics: [
          "Open Files & Rook Activity",
          "Doubling Rooks Effectively",
          "Rook on the 7th Rank",
          "Pawn Break Execution",
          "Initiative & Momentum",
          "Opposite-Side Castling Attacks",
          "Attacking the King Safely",
          "Defensive Resource Techniques",
          "Evaluating Complex Positions",
          "Simplification Strategy",
          "Exchange Decisions",
          "Converting Material Advantage",
          "Handling Imbalanced Positions",
          "Practical Endgame Transition",
          "Annotating Your Own Games",
          "Game Analysis Framework",
          "Playing Under Time Pressure",
          "Practical Middlegame Case Study",
          "Full Game Review Session",
          "Rook Level Championship Test"
        ]
      }
    ]
  },
  {
    levelName: "Queen",
    description: "Advanced competitive play focused on deep calculation, preparation, and decision quality.",
    sections: [
      {
        name: "Advanced Competitive Play",
        topics: [
          "Deep Calculation Techniques",
          "Long Forcing Variations",
          "Exchange Sacrifice Strategy",
          "Dynamic Compensation",
          "Imbalance Evaluation",
          "Zugzwang Concepts",
          "Advanced Pawn Structures",
          "Initiative vs Material",
          "Prophylactic Mastery",
          "Complex Position Evaluation",
          "Advanced Endgame Planning",
          "Psychological Pressure in Games",
          "Tournament Preparation Methods",
          "Opening Repertoire Construction",
          "Opponent Profiling",
          "Critical Decision Moments",
          "Advanced Defensive Mastery",
          "Competitive Simulation I",
          "Competitive Simulation II",
          "Queen Grand Championship Test"
        ]
      }
    ]
  },
  {
    levelName: "King",
    description: "Elite mastery track for endgame depth, competitive resilience, and tournament excellence.",
    sections: [
      {
        name: "Mastery & Elite Preparation",
        topics: [
          "Advanced King & Pawn Endgames",
          "Opposition & Triangulation",
          "Advanced Rook Endgames",
          "Minor Piece Endgames",
          "Endgame Calculation Accuracy",
          "Converting Winning Positions",
          "Saving Difficult Positions",
          "Playing for a Win in Equal Games",
          "Strategic Risk Management",
          "Long-Term Planning at Master Level",
          "Advanced Game Preparation",
          "Deep Opening Analysis",
          "Fighting Spirit & Resilience",
          "Handling Tournament Pressure",
          "Time Scramble Techniques",
          "Full Game Annotation Practice",
          "Tournament Round Simulation",
          "Post-Game Self Evaluation",
          "Building a Personal Chess Identity",
          "King Grandmaster Final Test"
        ]
      }
    ]
  }
];

const levelOrder = new Map(LEVEL_NAMES.map((levelName, index) => [levelName, index]));

const getDifficulty = (levelName, sectionName, orderNumber) => {
  if (levelName === "Pawn") {
    return "Beginner";
  }

  if (levelName === "Knight") {
    if (sectionName === "Tactical Foundations") {
      return "Beginner";
    }
    if (sectionName === "Tactical Patterns" || sectionName === "Calculation & Vision") {
      return "Intermediate";
    }
    return orderNumber <= 35 ? "Intermediate" : "Advanced";
  }

  if (levelName === "Bishop") {
    if (sectionName === "Positional Basics") {
      return "Intermediate";
    }
    return orderNumber <= 32 ? "Intermediate" : "Advanced";
  }

  if (levelName === "Rook") {
    return orderNumber <= 12 ? "Intermediate" : "Advanced";
  }

  return "Advanced";
};

const getDuration = (levelName, orderNumber) => {
  const baseDuration = {
    Pawn: 18,
    Knight: 24,
    Bishop: 26,
    Rook: 30,
    Queen: 34,
    King: 36
  };

  const bump = orderNumber % 4 === 0 ? 6 : orderNumber % 3 === 0 ? 4 : 2;
  return baseDuration[levelName] + bump;
};

const buildCurriculumTopics = () => {
  const topics = [];

  CURRICULUM_LEVELS.forEach((levelEntry) => {
    let orderCounter = 1;

    levelEntry.sections.forEach((section) => {
      section.topics.forEach((title) => {
        const difficultyLevel = getDifficulty(levelEntry.levelName, section.name, orderCounter);
        topics.push({
          levelName: levelEntry.levelName,
          sectionName: section.name,
          orderNumber: orderCounter,
          title,
          shortDescription: `Focused roadmap lesson on ${title.toLowerCase()} to improve practical chess decision-making.`,
          difficultyLevel,
          estimatedDuration: getDuration(levelEntry.levelName, orderCounter),
          learningObjective: `By the end of this lesson, you can confidently apply ${title.toLowerCase()} in practical games.`
        });
        orderCounter += 1;
      });
    });
  });

  return topics;
};

module.exports = {
  CURRICULUM_LEVELS,
  buildCurriculumTopics,
  levelOrder
};
