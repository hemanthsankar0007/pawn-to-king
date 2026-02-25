const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Level = require("../models/Level");
const Topic = require("../models/Topic");
const BonusMaterial = require("../models/BonusMaterial");
const CurriculumTopic = require("../models/CurriculumTopic");
const { LEVEL_NAMES } = require("../utils/constants");
const { CURRICULUM_LEVELS, buildCurriculumTopics } = require("../data/curriculumBlueprint");

dotenv.config();

const levels = LEVEL_NAMES.map((name) => ({
  name,
  meetingLink: "https://meet.google.com/sfq-sdqn-jic?pli=1"
}));

const bonusMaterials = [
  {
    title: "Mastering Pawn Endgames",
    description: "Practical PDF drills for opposition, triangulation, and pawn race conversion.",
    fileUrl: "https://s3.amazonaws.com/pawn-to-king-resources/mastering-pawn-endgames.pdf"
  },
  {
    title: "Winning Middlegame Plans",
    description: "Annotated plan templates for center play, king-side attacks, and structural pressure.",
    fileUrl: "https://s3.amazonaws.com/pawn-to-king-resources/winning-middlegame-plans.pdf"
  },
  {
    title: "Tournament Game Review Workbook",
    description: "Structured worksheet for post-game reflection, blunder tagging, and next-step training.",
    fileUrl: "https://s3.amazonaws.com/pawn-to-king-resources/tournament-review-workbook.pdf"
  }
];

const makeHomeworkQuestions = (title) => [
  {
    question: `What is the key idea in \"${title}\"?`,
    type: "mcq",
    options: [
      "Improve calculation and planning",
      "Ignore king safety",
      "Randomly move pieces",
      "Avoid developing pieces"
    ],
    correctAnswer: "Improve calculation and planning"
  },
  {
    question: "Which practical habit best supports this lesson?",
    type: "mcq",
    options: [
      "Review your own games",
      "Skip analysis",
      "Only play blitz",
      "Memorize lines without understanding"
    ],
    correctAnswer: "Review your own games"
  },
  {
    question: "During a game, what should be checked before moving?",
    type: "mcq",
    options: [
      "Opponent threats",
      "Only your attack",
      "No calculation",
      "Clock only"
    ],
    correctAnswer: "Opponent threats"
  },
  {
    question: "Write one sentence about how you will apply this lesson in a real game.",
    type: "text",
    options: [],
    correctAnswer: "apply"
  }
];

const buildHomeworkTopics = () => {
  const generated = [];

  CURRICULUM_LEVELS.forEach((level) => {
    const titles = level.sections.flatMap((section) => section.topics).slice(0, 20);

    titles.forEach((title, index) => {
      generated.push({
        levelName: level.levelName,
        orderNumber: index + 1,
        title,
        content: `Training lesson focused on ${title.toLowerCase()} for practical improvement.`,
        homeworkQuestions: makeHomeworkQuestions(title)
      });
    });
  });

  return generated;
};

const seedDatabase = async () => {
  try {
    await connectDB();

    const curriculumTopics = buildCurriculumTopics();
    const homeworkTopics = buildHomeworkTopics();

    await Promise.all([
      Level.deleteMany({}),
      Topic.deleteMany({}),
      BonusMaterial.deleteMany({}),
      CurriculumTopic.deleteMany({})
    ]);

    await Level.insertMany(levels, { ordered: true });
    await Topic.insertMany(homeworkTopics, { ordered: true });
    await CurriculumTopic.insertMany(curriculumTopics, { ordered: true });
    await BonusMaterial.insertMany(bonusMaterials, { ordered: true });

    console.log(
      `Seed complete: ${levels.length} levels, ${curriculumTopics.length} curriculum topics, ${homeworkTopics.length} lesson topics, ${bonusMaterials.length} bonus resources.`
    );
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedDatabase();
