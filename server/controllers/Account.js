const models = require('../models');
const bcrypt = require('bcrypt');

const Account = models.Account;

const loginPage = (req, res) => {
  return res.render('login');
};

const logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/tracker' });
  });
};

const signup = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.generate(username, pass, (err, account) => {
    if (err) {
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use.' });
      }
      return res.status(400).json({ error: 'An error occurred' });
    }

    req.session.account = Account.toAPI(account);
    return res.json({ redirect: '/tracker' });
  });
};

// Change password
const changePassword = async (req, res) => {
  if (!req.body.currentPassword || !req.body.newPassword) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  try {
    const account = await Account.findById(req.session.account._id).exec();

    if (!account) {
      return res.status(404).json({ error: 'Account not found!' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(req.body.currentPassword, account.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect!' });
    }

    // Hash new password
    const hash = await Account.generateHash(req.body.newPassword);
    account.password = hash;
    await account.save();

    return res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error changing password!' });
  }
};

// Get user profile/stats
const getProfile = (req, res) => {
  return res.json({
    username: req.session.account.username,
    isPremium: req.session.account.isPremium,
    premiumCredits: req.session.account.premiumCredits,
  });
};

// Purchase premium credits (profit model)
const purchaseCredits = async (req, res) => {
  if (!req.body.amount || req.body.amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount!' });
  }

  try {
    const account = await Account.findById(req.session.account._id).exec();

    if (!account) {
      return res.status(404).json({ error: 'Account not found!' });
    }

    // In demo, we simply add credits
    // In real app, this would integrate with payment processor
    account.premiumCredits += req.body.amount;

    // Unlock premium if they buy any credits
    if (req.body.amount > 0 && !account.isPremium) {
      account.isPremium = true;
    }

    await account.save();

    // Update session
    req.session.account = Account.toAPI(account);

    return res.json({
      message: 'Credits purchased successfully!',
      premiumCredits: account.premiumCredits,
      isPremium: account.isPremium,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error purchasing credits!' });
  }
};

module.exports = {
  loginPage,
  logout,
  login,
  signup,
  changePassword,
  getProfile,
  purchaseCredits,
};
