### **BakeryService** (Backend)

```markdown
# 🍞 BakeryService – Backend API for BakeryApp

This is the backend Node.js + Express + MySQL service that powers the BakeryApp frontend. It manages user authentication, orders, product data, cart sessions, and payment confirmations via Square Checkout. It is session-aware and handles pending orders intelligently to support a farmer's market-style order flow.

## Features

- 🔐 User authentication with session cookies
- 📦 Cart and Order management
- 💳 Square payment integration
- 📧 Email notifications for successful orders
- 🗂️ Order archiving and history
- 📅 Logic to restrict pickup to Saturdays (ordered before Wednesday midnight)
- 🔄 Reuse pending `order_id` for incomplete orders

## Technologies

- Node.js (TypeScript)
- Express.js
- MySQL
- Square Checkout API
- Nodemailer (for order email confirmations)
- Redis (for session store – optional)
- dotenv, cookie-parser, express-session

## Setup

```bash
# Install dependencies
npm install

# Create `.env` file
cp .env.example .env

# Environment Variables
PORT=2000
SESSION_SECRET=your_secret_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=bakery_db
SQUARE_ACCESS_TOKEN=...
SQUARE_LOCATION_ID=...
EMAIL_FROM=bakery@example.com
EMAIL_TO=bakery@example.com
SMTP_HOST=smtp.example.com
SMTP_USER=username
SMTP_PASS=password

# Start server
npm run dev

# Compile for production
npm run build


# Deployment Notes
- Ensure your MySQL and Redis services are running
- Consider using pm2 for production
- Use HTTPS with your domain to enable secure cookie handling