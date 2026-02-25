const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { resolveRoleByEmail } = require("../utils/roleUtils");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || typeof decoded !== "object" || !decoded.userId) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.userId).select("_id email role currentLevel currentTopic");

    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const resolvedRole = resolveRoleByEmail(user.email);
    if (user.role !== resolvedRole) {
      user.role = resolvedRole;
      await user.save({ validateBeforeSave: false });
    }

    req.user = {
      userId: String(user._id),
      email: user.email,
      role: resolvedRole,
      currentLevel: user.currentLevel,
      currentTopic: user.currentTopic
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
