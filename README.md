# Training Log

A full-stack workout tracking application with **JWT authentication, MySQL, workout analytics, and AI-powered coaching using Google Gemini**.

## Overview

**Training Log** is a full-stack fitness application that allows users to record and review their strength-training sessions.

Users can create an account, securely log in, record exercises with weight, sets, and reps, view their workout history, track training statistics, and get AI-generated insights based on their recent workouts.

### Core Features

* User registration and login
* Password hashing with bcrypt
* JWT-based authentication
* Protected backend routes
* Workout logging
* Workout history
* Training statistics
* Workout day streak
* Total training volume
* AI-powered coaching with Google Gemini
* Responsive React interface

---

## Tech Stack

### Frontend

* **React 19**
* **Vite**
* **React Router**
* **Axios**
* **CSS**

### Backend

* **Node.js**
* **Express.js**
* **MySQL**
* **mysql2**
* **bcrypt**
* **JSON Web Token**
* **CORS**
* **dotenv**
* **Google Gemini API**

---

## Architecture

```text
┌──────────────────────┐
│      React + Vite    │
│       Frontend       │
└──────────┬───────────┘
           │
           │ Axios / REST API
           ▼
┌──────────────────────┐
│   Node.js + Express   │
│       Backend        │
└──────┬───────┬───────┘
       │       │
       │       │
       ▼       ▼
┌──────────┐ ┌──────────────┐
│  MySQL   │ │  Gemini AI   │
│ Database │ │    Coach     │
└──────────┘ └──────────────┘
       │
       ▼
┌──────────────────────┐
│    JWT Middleware    │
│  Protected Routes    │
└──────────────────────┘
```

---

## Project Structure

```text
training_log/
│
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   └── vite.config.js
│
└── README.md
```

---

# Getting Started

## Prerequisites

Make sure you have installed:

* [Node.js](https://nodejs.org/)
* npm
* MySQL
* Git
* Google Gemini API key

---

## 1. Clone the Repository

```bash
git clone https://github.com/alpha-byte-2/training_log.git
cd training_log
```

---

## 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=training_log

JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key

PORT=5000
```

### Environment Variables

| Variable         | Description                 |
| ---------------- | --------------------------- |
| `DB_HOST`        | MySQL server host           |
| `DB_USER`        | MySQL username              |
| `DB_PASSWORD`    | MySQL password              |
| `DB_NAME`        | MySQL database name         |
| `JWT_SECRET`     | Secret used for JWT signing |
| `GEMINI_API_KEY` | Google Gemini API key       |
| `PORT`           | Backend server port         |

> **Important:** Never commit your `.env` file, database password, JWT secret, or Gemini API key to GitHub.

---

# Database Setup

Create the database:

```sql
CREATE DATABASE training_log;
```

Select the database:

```sql
USE training_log;
```

Create the `users` table:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
```

Create the `workouts` table:

```sql
CREATE TABLE workouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise VARCHAR(255) NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    sets INT NOT NULL,
    reps INT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

# Running the Application

## Start Backend

From the `backend` directory:

```bash
node server.js
```

For development:

```bash
npx nodemon server.js
```

The backend runs on:

```text
http://localhost:5000
```

---

## Start Frontend

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# API Documentation

## Authentication

### Register

```http
POST /api/auth/register
```

Request:

```json
{
  "username": "john",
  "password": "password123"
}
```

Response:

```json
{
  "message": "User registered successfully!"
}
```

---

### Login

```http
POST /api/auth/login
```

Request:

```json
{
  "username": "john",
  "password": "password123"
}
```

Response:

```json
{
  "auth": true,
  "token": "your-jwt-token",
  "username": "john"
}
```

The frontend stores the returned JWT and uses it for authenticated requests.

---

# Workout API

## Add Workout

```http
POST /api/workouts
```

Authentication:

```http
Authorization: Bearer <token>
```

Request:

```json
{
  "exercise": "Deadlift",
  "weight": 100,
  "sets": 3,
  "reps": 5
}
```

---

## Get Workout History

```http
GET /api/workouts
```

Authentication:

```http
Authorization: Bearer <token>
```

Returns the authenticated user's workout history.

---

# AI Coach

## Get Coaching Insight

```http
POST /api/ai/coach
```

Authentication:

```http
Authorization: Bearer <token>
```

The backend retrieves the user's recent workout history and sends it to Google Gemini for analysis.

The AI coach is designed to identify specific patterns in the training data, such as:

* Progressive overload
* Stalled exercises
* Volume imbalance
* Other noticeable training patterns

It then returns a short coaching insight with an actionable next step.

---

# Training Statistics

The dashboard calculates three basic statistics.

### Sessions Logged

Total number of workouts recorded by the user.

### Day Streak

Tracks consecutive days on which workouts were logged.

### Total Volume

Calculated as:

```text
Weight × Sets × Reps
```

For example:

```text
100 kg × 3 sets × 5 reps = 1500 kg
```

---

# Authentication Flow

```text
User Registration
       │
       ▼
Password
       │
       ▼
bcrypt Hash
       │
       ▼
MySQL
```

Login:

```text
Username + Password
       │
       ▼
   MySQL User
       │
       ▼
bcrypt Verification
       │
       ▼
      JWT
       │
       ▼
Frontend localStorage
```

Protected request:

```text
Frontend
   │
   │ Authorization: Bearer <JWT>
   ▼
Express Middleware
   │
   ▼
JWT Verification
   │
   ▼
req.userId
   │
   ▼
Protected API
   │
   ▼
MySQL
```

---

# Frontend Scripts

From the `frontend` directory:

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

# Security

The application currently uses:

* bcrypt password hashing
* JWT authentication
* Protected API endpoints
* Parameterized SQL queries
* Environment variables for sensitive configuration
* CORS configuration
* Authorization headers for protected requests

### Environment Variables

Sensitive values such as:

```text
DB_PASSWORD
JWT_SECRET
GEMINI_API_KEY
```

should remain in `.env` and should never be committed to the repository.

---

# Future Improvements

Planned improvements include:

* [ ] Edit workouts
* [ ] Delete workouts
* [ ] Exercise-specific progress charts
* [ ] Personal records
* [ ] Weekly and monthly analytics
* [ ] Workout programs
* [ ] User profile
* [ ] Refresh-token authentication
* [ ] More advanced AI coaching
* [ ] Production deployment

---

# Learning Outcomes

This project demonstrates practical experience with:

* React development
* React state management
* React Router
* REST API development
* Express.js
* Middleware
* JWT authentication
* Password hashing
* MySQL database integration
* SQL queries
* Axios
* Environment variables
* AI API integration
* Full-stack application architecture

---

# Author

**Aman Choudhary**

GitHub: [@alpha-byte-2](https://github.com/alpha-byte-2)

Repository: [training_log](https://github.com/alpha-byte-2/training_log)

---

## License

This project is created for educational and development purposes.
