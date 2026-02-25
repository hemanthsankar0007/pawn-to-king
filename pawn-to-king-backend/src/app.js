const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const joinRoutes = require("./routes/joinRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const topicRoutes = require("./routes/topicRoutes");
const topicDetailRoutes = require("./routes/topicDetailRoutes");
const curriculumRoutes = require("./routes/curriculumRoutes");
const homeworkRoutes = require("./routes/homeworkRoutes");
const classroomRoutes = require("./routes/classroomRoutes");
const bonusRoutes = require("./routes/bonusRoutes");
const levelRoutes = require("./routes/levelRoutes");
const configRoutes = require("./routes/configRoutes");
const adminTimetableRoutes = require("./routes/adminTimetableRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const batchAssignmentRoutes = require("./routes/batchAssignmentRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminCurriculumRoutes = require("./routes/adminCurriculumRoutes");

const app = express();

const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : ["*"];

const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

const isOriginAllowed = (origin) => {
  if (!origin) {
    return true;
  }

  if (configuredOrigins.includes("*")) {
    return true;
  }

  if (configuredOrigins.includes(origin)) {
    return true;
  }

  return localhostOriginPattern.test(origin);
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/join", joinRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/curriculum", curriculumRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/topic", topicDetailRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/classroom", classroomRoutes);
app.use("/api/bonus", bonusRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/config", configRoutes);
app.use("/api/admin/timetable", adminTimetableRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api", batchAssignmentRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin/curriculum", adminCurriculumRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, _req, res, _next) => {
  res.status(error.status || 500).json({
    message: error.message || "Internal server error"
  });
});

module.exports = app;
