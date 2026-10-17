const express = require("express");
const userRouter = require("./user");
const walletRouter = require("./wallet");

const router = express.Router();

router.use("/user", userRouter);
router.use("/wallet", walletRouter);

module.exports = router;