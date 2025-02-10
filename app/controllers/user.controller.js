const User = require("../models/user.model");

// Fetch user details for a given email or id, excluding password
exports.fetchDetails = async (req, res) => {
  try {
    const { email, id } = req.query; // Get email or id from query parameters

    if (!email && !id) {
      return res.status(400).json({ message: "Either email or ID is required" });
    }

    // Create a query object based on the available parameter
    const query = email ? { email } : { _id: id };

    // Fetch the user details and exclude password
    const userDetails = await User.findOne(query, { password: 0 });

    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(userDetails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details", error });
  }
};


exports.fetchUsers = async (req, res) => {
  try {
    const { userType,email } = req.query;

    if (!userType) {
      return res.status(400).json({ message: "userType is required" });
    }

    const users = await User.find({ userType }).select("-password");
    const currentUser = await User.findOne({email});

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    // Transform the data
    const transformedUsers = users.filter((user)=>!user.likedUsers.includes(currentUser._id.toString())).map((user) => ({
      ...user.toObject(),
      socialMedia: [
        { name: "LinkedIn", url: user.linkedin || "#" },
        { name: "Github", url: user.github || "#" },
        { name: "Leetcode", url: user.leetcode || "#" },
        { name: "CodeChef", url: user.codechef || "#" },
        { name: "Portfolio", url: user.portfolio || "#" },
      ],
    }));

    res.status(200).json(transformedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// Add user details 
exports.addDetails = async (req, res) => {
  try {
    const {
      email, userType, username, about, highestQualification, university,
      cgpa, linkedin, github, leetcode, codechef, portfolio,
      company, role, track, avatar
    } = req.body;

    const userDetails = await User.findOne({ email });

    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userDetails.track && userDetails.track.trim() !== "") {
      return res.status(400).json({ message: "User details already exist." });
    }

    // Update the existing user document
    Object.assign(userDetails, {
      userType,
      username,
      about,
      highestQualification,
      university,
      cgpa,
      linkedin,
      github,
      leetcode,
      codechef,
      portfolio,
      company,
      role,
      track,
      avatar
    });

    // Save the updated user details
    await userDetails.save();

    res.status(200).json({ message: "User details updated successfully", user: userDetails });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user details", error: error.message });
  }
};


exports.likeUser = async (req, res) => {
  try {
    const { email, likedUserEmail } = req.body;

    console.log("Request received with email:", email, " and likedUserEmail:", likedUserEmail);

    // Find users
    const user = await User.findOne({ email });
    const likedUser = await User.findOne({ email: likedUserEmail });

    console.log("Found user:", user);
    console.log("Found likedUser:", likedUser);

    if (!user || !likedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Ensure likedUsers is always an array
    if (!user.likedUsers) user.likedUsers = [];
    if (!likedUser.likedUsers) likedUser.likedUsers = [];

    // Ensure IDs are compared correctly
    const likedUserId = likedUser._id.toString();
    const userId = user._id.toString();

    // Check if the user has already liked this person
    if (user.likedUsers.includes(likedUserId)) {
      return res.status(400).json({ message: "User already liked" });
    }

    // Add liked user to the list
    user.likedUsers.push(likedUserId);
    await user.save();

    // Check if mutual match exists
    if (likedUser.likedUsers.includes(userId)) {
      user.matchedUser = likedUserId;
      likedUser.matchedUser = userId;

      await user.save();
      await likedUser.save();

      return res.status(200).json({ message: "It's a match!", user, likedUser });
    }

    res.status(200).json({ message: "User liked successfully", user });
  } catch (error) {
    console.error("Error in likeUser:", error);
    res.status(500).json({ message: "Error while sending like", error: error.message });
  }
};
