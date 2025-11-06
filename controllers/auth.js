const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user'); 

const saltRounds = 12;

router.post('/signup', async (req, res) => {
  try {
  
    const userInDatabase = await User.findOne({ email: req.body.email });
    if (userInDatabase) {
      return res.status(409).json({ err: 'Email already taken.' });
    }
    
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      hashedPassword: bcrypt.hashSync(req.body.password, saltRounds)
    });

    const payload = { name: user.name, email: user.email, _id: user._id };

    const token = jwt.sign({ payload }, process.env.JWT_SECRET);

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ err: 'Invalid credentials.' });
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password, user.hashedPassword
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ err: 'Invalid credentials.' });
    }

    const payload = { name: user.name, email: user.email, _id: user._id };

    const token = jwt.sign({ payload }, process.env.JWT_SECRET);

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;