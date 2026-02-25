const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const { normalizeEmail, resolveRoleByEmail } = require("../utils/roleUtils");

const sanitizeUser = (userDocument) => ({
  _id: userDocument._id,
  name: userDocument.name,
  email: userDocument.email,
  chessRating: userDocument.chessRating,
  age: userDocument.age,
  phone: userDocument.phone,
  currentLevel: userDocument.currentLevel,
  currentTopic: userDocument.currentTopic,
  role: userDocument.role,
  createdAt: userDocument.createdAt,
  updatedAt: userDocument.updatedAt
});

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const resolvedRole = resolveRoleByEmail(user.email);
    if (user.role !== resolvedRole) {
      user.role = resolvedRole;
      await user.save({ validateBeforeSave: false });
    }

    const token = generateToken(user);
    return res.json({
      message: "Login successful",
      token,
      user: sanitizeUser(user)
    });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to login user" });
  }
};

module.exports = {
  login
};
