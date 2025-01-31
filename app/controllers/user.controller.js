const User = require("../models/user.model");

// Fetch user details for a given email, excluding password
exports.fetchDetails = async (req, res) => {
  try {
    const { email } = req.query; // Get email from the query parameter
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Fetch the user details for the given email and exclude password
    const userDetails = await User.findOne({ email }, { password: 0 });
    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(userDetails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details", error });
  }
};

// Add user details including email and password
exports.addDetails = async (req, res) => {
  try {
    const { email, password, userType, username, about, highestQualification, university, cgpa, linkedIn, github, leetcode, codechef, portfolio, company, role, track, avatar } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create a new user with the provided details
    const newUser = new User({
      email,
      password,
      userType,
      username,
      about,
      highestQualification,
      university,
      cgpa,
      linkedIn,
      github,
      leetcode,
      codechef,
      portfolio,
      company,
      role,
      track,
      avatar
    });

    // Save the user details to the database
    await newUser.save();
    res.status(201).json({ message: "User details added successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error adding user details", error });
  }
};
