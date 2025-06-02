// Admin verification middleware for critical actions
// Usage: app.post('/api/payments/release', adminVerify, ...)
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = async function adminVerify(req, res, next) {
  try {
    // Require admin password in req.body.adminPassword
    const { adminPassword } = req.body;
    if (!adminPassword) return res.status(400).json({ error: 'Admin password required.' });
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
    const admin = await User.findById(req.user.id);
    if (!admin) return res.status(404).json({ error: 'Admin not found.' });
    const valid = await bcrypt.compare(adminPassword, admin.password);
    if (!valid) return res.status(401).json({ error: 'Invalid admin password.' });
    next();
  } catch (err) {
    res.status(500).json({ error: 'Admin verification failed.' });
  }
};
