const mongoose = require("mongoose");
const { MONGO_URL } = require("./config");
// connect db function
async function connectDB() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB");
}
//user schema
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    firstName: { type: String, required: true, trim: true, maxLength: 50 },
    lastName: { type: String, required: true, trim: true, maxLength: 50 },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);
//wallet schema
const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: {    //balance field
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: { validator: Number.isInteger, message: "balance must be whole paise" },
    },
  },
  { timestamps: true }
);
// create user model
const User = mongoose.model("User", userSchema);
const Wallet = mongoose.model("Wallet", walletSchema);  //create wallet model

module.exports = { connectDB, User, Wallet };  