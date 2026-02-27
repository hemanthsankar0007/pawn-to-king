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
  mustChangePassword: Boolean(userDocument.mustChangePassword),
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

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match." });
    }

    if (String(currentPassword) === String(newPassword)) {
      return res.status(400).json({ message: "New password must be different from current password." });
    }

    const user = await User.findById(req.user.userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(String(currentPassword), String(user.password));
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    user.password = await bcrypt.hash(String(newPassword), 12);
    user.mustChangePassword = false;
    await user.save();

    return res.json({ message: "Password updated successfully." });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to update password right now." });
  }
};

module.exports = {
  login,
  changePassword
};
