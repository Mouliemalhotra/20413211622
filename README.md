# 🔗 URL Shortener Microservice & Web App

A full-stack application to shorten URLs, track their usage statistics, and provide user-friendly analytics. Built as part of the AffordMed Campus Hiring Evaluation.

---

## 📸 Screenshot

![Screenshot 2025-07-08 125220](https://github.com/user-attachments/assets/2326d5f8-d8fe-4acf-8073-62136913ce0c)
![image](https://github.com/user-attachments/assets/239ae9ee-f440-4a41-870f-2b53f67d49ed)

![image](https://github.com/user-attachments/assets/703ff98e-b41e-4e4b-b322-ee9615c9a87b)

![image](https://github.com/user-attachments/assets/55929adb-8671-4595-9fa0-79574255196f)

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
