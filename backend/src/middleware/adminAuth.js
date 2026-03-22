const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

async function adminAuth(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Admin token is required." });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "replace-with-a-strong-secret");
    const admin = await Admin.findById(payload.sub).select("-passwordHash");

    if (!admin || !admin.active) {
      return res.status(401).json({ message: "Admin account is unavailable." });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired admin token." });
  }
}

module.exports = adminAuth;
