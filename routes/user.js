const express = require("express");
const { z } = require("zod");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Wallet } = require("../db");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");

const router = express.Router();

// Turns a zod error into one short message
function firstError(zodError) {
  const issue = zodError.issues[0];
  const field = issue.path[0] || "body";
  return `${field}: ${issue.message}`;
}

// ---------------- SIGNUP ----------------
const signupSchema = z.object({
  username: z.string().trim().toLowerCase().email("must be a valid email"),
  firstName: z.string().trim().min(1, "is required").max(50, "is too long"),
  lastName: z.string().trim().min(1, "is required").max(50, "is too long"),
  password: z.string().min(6, "must be at least 6 characters"),
});

router.post("/signup", async (req, res) => {
  // 1. Check the data or validate the data
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: firstError(result.error) });
  }
  const { username, firstName, lastName, password } = result.data;

  // 2. check existing user
  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ error: "This email is already registered" });
  }

  // 3. Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  // 4. create new user in databaseor save
  let user;
  try {
    user = await User.create({ username, firstName, lastName, passwordHash });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "This email is already registered" });
    }
    throw err;
  }

  // 5. Create an empty wallet (balance in paise, starts at 0)
  const wallet = await Wallet.create({ userId: user._id, balance: 0 });

  // 6. send signup response if signup success full then give 201 created
  res.status(201).json({
    message: "User created successfully",
    user: { id: user._id, username, firstName, lastName },
    wallet: { id: wallet._id, balance: wallet.balance },
  });
});

// ---------------- SIGNIN ----------------
const signinSchema = z.object({
  username: z.string().trim().toLowerCase().email("must be a valid email"),
  password: z.string().min(1, "is required"),
});
// signin route
router.post("/signin", async (req, res) => {
  // 1. Check the validate request
  const result = signinSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: firstError(result.error) });
  }
  const { username, password } = result.data;

  // 2. Find the user by email
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ error: "Wrong email or password" });
  }

  // 3. Check the password against the saved hash or verify the password
  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    return res.status(401).json({ error: "Wrong email or password" });
  }

  // 4. generate jwt token
  const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "1h" });

  // 5. send signin response
  res.json({ message: "Signed in", token });
});

router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({
    user: {
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    },
  });
});

module.exports = router;