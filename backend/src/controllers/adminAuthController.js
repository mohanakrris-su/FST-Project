const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

function signAdminToken(admin) {
  return jwt.sign(
    {
      sub: String(admin._id),
      role: "admin",
      email: admin.email
    },
    process.env.JWT_SECRET || "replace-with-a-strong-secret",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );
}

function adminPayload(admin, token) {
  return {
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      active: admin.active,
      lastLoginAt: admin.lastLoginAt || null
    }
  };
}

async function getBootstrapStatus(req, res) {
  const adminCount = await Admin.countDocuments();

  res.json({
    bootstrapRequired: adminCount === 0
  });
}

async function bootstrapAdmin(req, res) {
  const adminCount = await Admin.countDocuments();

  if (adminCount > 0) {
    return res.status(409).json({ message: "Bootstrap is already completed." });
  }

  const { name, email, password, bootstrapKey } = req.body;
  const expectedKey = process.env.ADMIN_BOOTSTRAP_KEY || "smartcareq-admin-bootstrap";

  if (!name || !email || !password || !bootstrapKey) {
    return res.status(400).json({ message: "Name, email, password, and bootstrap key are required." });
  }

  if (bootstrapKey !== expectedKey) {
    return res.status(403).json({ message: "Invalid bootstrap key." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.create({
    name,
    email,
    passwordHash,
    lastLoginAt: new Date()
  });

  const token = signAdminToken(admin);
  res.status(201).json(adminPayload(admin, token));
}

async function loginAdmin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(401).json({ message: "Invalid admin credentials." });
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid admin credentials." });
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = signAdminToken(admin);
  res.json(adminPayload(admin, token));
}

async function getCurrentAdmin(req, res) {
  res.json({
    admin: req.admin
  });
}

async function logoutAdmin(req, res) {
  res.json({
    message: "Logout successful. Remove the stored token on the client."
  });
}

module.exports = {
  getBootstrapStatus,
  bootstrapAdmin,
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin
};
