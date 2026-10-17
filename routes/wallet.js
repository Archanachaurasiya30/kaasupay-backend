const express = require("express");
const { Wallet } = require("../db");
const { authMiddleware } = require("../middleware");

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
  const wallet = await Wallet.findOne({ userId: req.userId });
  if (!wallet) {
    return res.status(404).json({ error: "Wallet not found" });
  }
  res.json({
    balance: wallet.balance,
    display: "₹" + (wallet.balance / 100).toFixed(2),
  });
});

module.exports = router;