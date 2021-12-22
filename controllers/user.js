const { request, resonse } = require('express');
const checker = require('../helpers/checker');
const User = require('../models/user').Users;
const utils  = require('../helpers/utils');
const bcrypt = require('bcryptjs');

async function postLogin(req, res) {
  const body = req.body;
  let user;
  // TODO: Comprobar contraseña

  if (checker.isEmail(body.email_username)) {
    user = await User.findOne({ email: body.email_username });
    if (!user) return res.status(400).json({ message: 'Email does not exist' });
  } else {
    user = await User.findOne({ username: body.email_username });
    if (!user) return res.status(400).json({ message: 'Username does not exist' });
  }

  res.json({ message: 'Login successful', token: utils.generateToken(user._id) });
}

async function postSingUp(req, res) {
  const body = req.body;
  const user = new User(body);

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(body.password, salt);

  try {
    await user.save();
    res.json({ message: 'User created', token: utils.generateToken(user._id) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }

}

module.exports = {
  postLogin,
  postSingUp
}