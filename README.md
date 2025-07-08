# 🔗 URL Shortener Microservice & Web App

A full-stack application to shorten URLs, track their usage statistics, and provide user-friendly analytics. Built as part of the AffordMed Campus Hiring Evaluation.

---

## 📸 Screenshot

![App Screenshot](./assets/screenshot.png)

---

## 📁 Project Structure

```
full/
├── backend/    # Express.js Microservice API
├── frontend/   # React + Material UI Web App
└── assets/     # Screenshots or images
```

---

## 🚀 Features

### Backend (Node.js + Express)
- Shorten long URLs with optional custom codes
- Set expiration time (default: 30 mins)
- Redirect shortened links
- Track clicks with timestamp and source
- REST API with JSON responses
- Middleware-based request logging

### Frontend (React + Material UI)
- Submit and shorten up to 5 URLs
- View generated short URLs and expiry time
- Clean, responsive UI using Material UI
- Client-side validation for all inputs

---

## 🛠️ Tech Stack

- **Frontend:** React, Material UI, Axios
- **Backend:** Express.js, nanoid, CORS
- **Dev Tools:** Node.js, npm, Git

---

## 📦 Getting Started

### 🖥️ Backend (Express API)

```bash
cd backend
npm install
npm start
```

Runs on: `http://localhost:5000`

---

### 🌐 Frontend (React App)

```bash
cd frontend
npm install
npm start
```

Runs on: `http://localhost:3000`

---

## 🧪 API Endpoints

### `POST /shorturls`
Create a new shortened URL.
```json
{
  "url": "https://example.com/page",
  "validity": 30,
  "shortcode": "mycode"
}
```

### `GET /shorturls/:code`
Redirects to the original URL if not expired.

### `GET /shorturls/:code/stats`
Returns usage stats (clicks, referrer, timestamps, etc.).
