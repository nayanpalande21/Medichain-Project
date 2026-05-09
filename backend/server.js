require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

console.log("JWT:", process.env.JWT_SECRET);

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= DATABASE =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ================= MODELS =================

// USER MODEL
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "patient" },
    phone: String,
    bloodGroup: String,
    address: String,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// RECORD MODEL
const recordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  patientName: String,
  doctorName: String,
  diagnosis: String,
  prescription: String,
  symptoms: String,
  treatment: String,
  recordType: String,
  hospital: String,
  notes: String,
  date: String, 
  blockHash: String,
  previousHash: String,
  blockIndex: Number,
  isVerified: Boolean,
}, { timestamps: true });

const Record = mongoose.model("Record", recordSchema);

// ================= BLOCKCHAIN SIM =================
function generateHash(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}



// ================= AUTH MIDDLEWARE =================
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ================= AUTH ROUTES =================

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, phone, bloodGroup } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Required fields missing" });

   const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
     email: email.toLowerCase(),
      password: hashed,
      role,
      phone,
      bloodGroup,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET
    );

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

   const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= RECORD ROUTES =================

// CREATE RECORD
app.post("/api/records", authMiddleware, async (req, res) => {
  try {
    const { patientName, doctorName, diagnosis } = req.body;

   const last = await Record.findOne({ patientId: req.user.id })
  .sort({ blockIndex: -1 });

const index = last ? last.blockIndex + 1 : 0;
const prevHash = last ? last.blockHash : "0000";

    const blockData = {
      index,
      prevHash,
      patientName,
      doctorName,
      diagnosis,
    };

    const hash = generateHash(blockData);

    const record = await Record.create({
      ...req.body,
      patientId: req.user.id,
      blockHash: hash,
      previousHash: prevHash,
      blockIndex: index,
      isVerified: true,
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET USER RECORDS
app.get("/api/records", authMiddleware, async (req, res) => {
  const records = await Record.find({ patientId: req.user.id });
  res.json(records);
});

// DELETE RECORD
app.delete("/api/records/:id", authMiddleware, async (req, res) => {
  await Record.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ================= HEALTH =================
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});