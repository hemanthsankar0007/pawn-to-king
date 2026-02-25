/**
 * seedFullCurriculum.js
 * ---------------------
 * One-time seed script — safe to re-run (skips existing topics).
 * Run with: node scripts/seedFullCurriculum.js
 *
 * NOTE: Levels (with meetingLink) must already exist in the DB.
 *       This script ONLY inserts Topic documents.
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Topic = require("../src/models/Topic");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not set in .env");
  process.exit(1);
}

// ─── Curriculum Data ───────────────────────────────────────────────────────────

const curriculum = {
  Pawn: [
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
  ],

  Knight: [
    "What is a Tactical Opportunity?",
    "Knight Forks & Double Attacks",
    "Absolute Pins Explained",
    "Relative Pins & Pressure",
    "Skewers in Practical Play",
    "Discovered Attacks & Checks",
    "Double Check & Forcing Play",
    "Removing the Defender",
    "Overloading a Piece",
    "Deflection Tactics",
    "Attraction & Decoy Sacrifices",
    "Back Rank Weakness",
    "Smothered Mate Pattern",
    "Greek Gift Sacrifice (Bxh7+)",
    "Clearance Sacrifice",
    "Zwischenzug (Intermediate Move)",
    "Trapping Opponent Pieces",
    "Tactical Motif Combination",
    "Mate in One Training",
    "Knight Tactical Trial I",
    "Candidate Moves Selection",
    "Checks, Captures, Threats Method",
    "Visualizing 2 Moves Ahead",
    "Visualizing 3 Moves Ahead",
    "Counting Attackers & Defenders",
    "Identifying Forcing Lines",
    "Tactical Defense Techniques",
    "Avoiding Tactical Blunders",
    "Time Management in Sharp Positions",
    "Knight Tactical Trial II",
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
  ],

  Bishop: [
    "What is Chess Strategy?",
    "Understanding Pawn Structure",
    "Isolated Pawn Strategy",
    "Doubled Pawns: Weakness or Strength?",
    "Backward Pawn Explained",
    "Weak Squares & Outposts",
    "Strong Outposts for Knights",
    "Good Bishop vs Bad Bishop",
    "Open vs Closed Positions",
    "Bishop Strategy Trial I",
    "Creating a Long-Term Plan",
    "Improving Your Worst Piece",
    "Centralization of Pieces",
    "Space Advantage Concepts",
    "Static vs Dynamic Advantages",
    "Minor Piece Coordination",
    "Prophylaxis (Preventing Opponent Plans)",
    "Restricting Opponent Activity",
    "Transition from Opening to Middlegame",
    "Bishop Strategy Trial II",
    "Pawn Breaks & Timing",
    "The Art of Blockade",
    "Color Complex Strategy",
    "Opposite-Colored Bishop Strategy",
    "Positional Sacrifice Basics",
    "Targeting Structural Weaknesses",
    "King Activity in the Middlegame",
    "Long-Term Positional Pressure",
    "Strategic Imbalances (Material vs Activity)",
    "Bishop Strategy Trial III",
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
  ],

  Rook: [
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
  ],

  Queen: [
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
  ],

  King: [
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
};

// ─── Seed Function ─────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected\n");

    let created = 0;
    let skipped = 0;

    for (const [levelName, titles] of Object.entries(curriculum)) {
      console.log(`── ${levelName} (${titles.length} topics)`);

      for (let i = 0; i < titles.length; i++) {
        const orderNumber = i + 1;

        // Duplicate-safe: check by unique index (levelName + orderNumber)
        const exists = await Topic.findOne({ levelName, orderNumber }).lean();

        if (exists) {
          console.log(`   [skip] ${orderNumber}. ${titles[i]}`);
          skipped++;
          continue;
        }

        await Topic.create({
          levelName,
          orderNumber,
          title: titles[i],
          // Placeholder content — update via admin panel or another script
          content: `Lesson content for: ${titles[i]}`,
          // Placeholder homework question — required by schema validator
          homeworkQuestions: [
            {
              question: `Review question for: ${titles[i]}`,
              type: "mcq",
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: "Option A"
            }
          ]
        });

        console.log(`   [+]    ${orderNumber}. ${titles[i]}`);
        created++;
      }

      console.log();
    }

    console.log("─────────────────────────────────────────");
    console.log(`✅ Done. Created: ${created}  |  Skipped: ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
