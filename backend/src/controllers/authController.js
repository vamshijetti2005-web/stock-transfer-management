const authService = require('../services/authService');

async function register(req, res) {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
}

async function login(req, res) {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
}

async function me(req, res) {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    },
  });
}

module.exports = { register, login, me };
