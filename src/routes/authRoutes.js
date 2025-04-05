import express from 'express'
import jwt from 'jsonwebtoken'

import User from '../models/User.js';

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: "15d" });
}

// Register route
router.post('/register', async (req, res) => {
 try {
  const {email, username, password} = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

if (password.length < 6) {
  return res.status(400).json({ message: "Password must be at least 6 characters long" });
  
}

if (username.length < 3) {
  return res.status(400).json({ message: "Username must be at least 3 characters long" });
  
}

// Check if user already exists
const existingEmail = await User.findOne({email});
if (existingEmail) {
  return res.status(400).json({ message: "Email already exists" });
}
const existingUsername = await User.findOne({ username });
if (existingUsername) {
  return res.status(400).json({ message: "Username already exists" });
}

// Get random avatar
const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`

// Create new user
const user = new User({ 
  email, 
  username, 
  password,
  profileImage,
 });

// Save user to database

 await user.save();

// Generate a token for the user
const token = generateToken(user._id);

// Send response with token
res.status(201).json({
  token,
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
  },
});
   
 } catch (error) {
  console.log("Error in register route", error);
  res.status(500).json({ message: "Internal server error" });
 }
})

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

// Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }


    // Check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    // Generate a token for the user
    const token = generateToken(user._id);

    // Send response with token
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
      },
    });
    

  } catch (error) {
    console.log("Error in login route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;



// https://app.eraser.io/workspace/gTi3WBeKPaqVpuWAjedu