const ADMIN_EMAIL = "hemanthsankarreddy@gmail.com";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const resolveRoleByEmail = (email) =>
  normalizeEmail(email) === ADMIN_EMAIL ? "admin" : "student";

module.exports = {
  ADMIN_EMAIL,
  normalizeEmail,
  resolveRoleByEmail
};
