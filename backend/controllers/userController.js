const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwtService = require('../config/jwtService');
const bcrypt = require('bcryptjs');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please Enter all the Fields.');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('This user already exists.');
  }

  const user = await User.create({
    name,
    email,
    password,
    pic
  });

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: jwtService(user._id)
    });
  } else {
    res.status(400);
    throw new Error('This user was not found');
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  const matchPassword = bcrypt.compare(password, user.password);

  if (user && matchPassword) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: jwtService(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials. Please verify and try again.');
  }
});

module.exports = { registerUser, authUser };