// Google Controller - Handles Google OAuth authentication and user verification
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const client = require("../utils.js/config");
const User = require("../Models/User");

// Function to verify Google Token
const verifyGoogleToken = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID, // Use environment variable for Client ID
  });

  const payload = ticket.getPayload();
  return payload;
};

module.exports = {
  googleAuth: async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    try {
      const googleUser = await verifyGoogleToken(token);

      // Check if user already exists
      let user = await User.findOne({ email: googleUser.email });

      if (!user) {
        // If user does not exist, create new
        user = new User({
          name: googleUser.name,
          email: googleUser.email,
          password: "googlelogin", // Google login doesn't require password
        });

        await user.save();
      }

      // Generate JWT Token
      const jwtToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET, // Use environment variable for JWT secret
        { expiresIn: "24h" }
      );

      res.json({
        jwtToken,
        role: user.role,
        name: user.name,
        email: user.email,
        userId: user._id,
        phone: user.phone || null,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  },
};
