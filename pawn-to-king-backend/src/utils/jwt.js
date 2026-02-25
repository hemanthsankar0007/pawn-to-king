const jwt = require("jsonwebtoken");
const { resolveRoleByEmail } = require("./roleUtils");

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const role = resolveRoleByEmail(user.email);

  return jwt.sign(
    {
      userId: user._id,
      role,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = {
  generateToken
};
