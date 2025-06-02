# Helpora Admin Verification & Logging Guide

This guide explains how admin verification and logging are implemented for critical actions in Helpora.

---

## 1. Admin Verification Middleware

- File: `middleware/adminVerify.js`
- Ensures only a verified admin can perform sensitive actions (e.g., payment release, deletion).
- Usage:
  ```js
  const adminVerify = require('../middleware/adminVerify');
  router.post('/release', auth, adminVerify, ...);
  ```
- Requires admin password in the request body and checks the user's role.

---

## 2. Logging with Winston

- File: `utils/logger.js`
- Logs all requests and errors to `logs/` directory.
- Use `logger.info()` for normal actions and `logger.error()` for errors/critical actions.
- Example:
  ```js
  const logger = require('../utils/logger');
  logger.info('Payment released by admin', { adminId: req.user.id, paymentId });
  logger.error('Payment release failed', { error });
  ```

---

## 3. Best Practices

- Always require admin verification for critical actions.
- Log all critical actions for auditability.
- Regularly review logs for suspicious activity.

---

For more, see `server.js`, `adminVerify.js`, and `logger.js`.
