const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userType: { type: String},
  email: { type: String, required: true, unique: true },
  password:{type:String,required:true},
  username: { type: String},
  about: { type: String, default: "" },
  highestQualification: { type: String, default: "" },
  university: { type: String, default: "" },
  cgpa: { type: String, default: "" },
  linkedIn: { type: String, default: "" },
  github: { type: String, default: "" },
  leetcode: { type: String, default: "" },
  codechef: { type: String, default: "" },
  portfolio: { type: String, default: "" },
  company: { type: String, default: "" },
  role: { type: String, default: "" },
  track: { type: String, default: "" },
  avatar: { type: String, default: "" }, // URL or base64 string
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

const User = mongoose.model("user", UserSchema);

module.exports = User;
