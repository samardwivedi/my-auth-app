# Helpora Backend Security & Production Setup Guide

This document explains the security, logging, admin verification, and payment protection mechanisms implemented in your backend.

---

## 1. Security Middleware

- **helmet**: Sets secure HTTP headers to protect against common vulnerabilities.
- **express-rate-limit**: Limits repeated requests to public APIs (default: 100 requests per 15 minutes per IP).
- **xss-clean**: Sanitizes user input to prevent XSS attacks.
- **express-mongo-sanitize**: Prevents NoSQL injection by sanitizing MongoDB queries.

All are initialized in `server.js` before your routes.

---

## 2. Winston Logging

- All requests and errors are logged using Winston (`utils/logger.js`).
- Logs are saved to `logs/error.log` and `logs/combined.log`.
- Console logging is enabled in development.

---

## 3. Admin Verification Middleware

- `middleware/adminVerify.js` ensures only a verified admin can perform critical actions (e.g., payment release).
- Usage: Add `adminVerify` to any sensitive route, e.g.:
  ```js
  const adminVerify = require('../middleware/adminVerify');
  router.post('/release', auth, adminVerify, ...);
  ```
- Requires admin password in the request body and checks the user's role.

---

## 4. Stripe Connect & Payment Security

- Use Stripe Connect for holding and releasing payments between users and helpers.
- All Stripe secrets are stored in `.env`.
- Payment actions are logged with Winston for auditability.
- Example payment release route:
  ```js
  router.post('/release', auth, adminVerify, async (req, res) => {
    // Stripe payout logic here
  });
  ```

---

## 5. Environment Variables

- See `.env.example` for all required secrets and configuration.
- Never commit your real `.env` to version control.

---

## 6. Email & Notifications

- Nodemailer is configured with SMTP credentials from `.env`.
- Emails are sent on signup, request submission, and service confirmation.

---

## 7. General Best Practices

- Use HTTPS in production (set up SSL via your host or reverse proxy).
- Restrict MongoDB Atlas access to your server's IPs.
- Regularly update dependencies and monitor logs for suspicious activity.

---

For more details, see the comments in `server.js` and the referenced middleware and utility files.
