# Training Log

> A full-stack workout tracking application with JWT authentication, MySQL persistence, workout analytics, and an AI-powered coaching assistant.

## Overview

**Training Log** is a full-stack fitness application designed to help users record and analyze their strength-training sessions.

Users can create an account, securely log in, record exercises with weight, sets, and reps, review their training history, track basic workout statistics, and receive personalized coaching insights generated from their recent training data.

The project combines a **React + Vite frontend** with a **Node.js + Express backend**, **MySQL** for persistent storage, **JWT** for authentication, and **Google Gemini** for AI-powered coaching.

---

## Features

### Authentication

* User registration
* Secure password hashing with bcrypt
* JWT-based authentication
* Protected API routes
* Persistent login using browser local storage
* Logout functionality

### Workout Tracking

* Add exercises to your training log
* Record:

  * Exercise name
  * Weight
  * Sets
  * Reps
* View recent workout sessions
* Automatically associate workouts with the authenticated user

### Training Statistics

The dashboard provides:

* **Sessions Logged** — total number of recorded sessions
* **Day Streak** — consecutive training days
* **Total Volume** — calculated using:

```text
Weight × Sets × Reps
```

### AI Coach

The application includes an AI coaching feature powered by **Google Gemini**.

The AI analyzes recent workout history and provides a short, specific coaching insight based on the user's logged numbers.

It can identify patterns such as:

* Progressive overload
* Stalled lifts
* Volume imbalance
* Other noticeable patterns in recent training

The backend sends the latest 20 workout records to the AI coach for analysis.

---

## Tech Stack

### Frontend

| Technology   | Purpose                           |
| ------------ | --------------------------------- |
| React        | UI development                    |
| Vite         | Development server and build tool |
| React Router | Client-side routing               |
| Axios        | API communication                 |
| CSS          | Styling and responsive UI         |

### Backend

| Technology     | Purpose               |
| -------------- | --------------------- |
| Node.js        | JavaScript runtime    |
| Express.js     | REST API              |
| MySQL          | Database              |
| mysql2         | MySQL database driver |
| bcrypt         | Password hashing      |
| JSON Web Token | Authentication        |
| CORS           | Cross-origin requests |
| dotenv         | Environment variables |
| Google Gemini  | AI coaching           |

---

## Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │     + Vite          │
                    └──────────┬──────────┘
                               │
                               │ Axios / REST API
                               ▼
                    ┌─────────────────────┐
                    │   Express Server    │
                    │      Node.js        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐      ┌──────────┐    ┌────────────┐
        │  MySQL   │      │   JWT    │    │  Gemini AI │
        │ Database │      │   Auth   │    │   Coach    │
        └──────────┘      └──────────┘    └────────────┘
```

---

## Project Structure

```text
training_log/
│
├── backend/
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    │
    ├── src/
    │   ├── assets/
    │   │   ├── hero.png
    │   │   ├── react.svg
    │   │   └── vite.svg
    │   │
    │   ├── App.css
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    │
    ├── .gitignore
    ├── .oxlintrc.json
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

# Getting Started

## Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* MySQL
* Git
* Google Gemini API key

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd training_log
```

---

## 2. Configure the Backend

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

| Variable         | Description              |
| ---------------- | ------------------------ |
| `DB_HOST`        | MySQL server host        |
| `DB_USER`        | MySQL username           |
| `DB_PASSWORD`    | MySQL password           |
| `DB_NAME`        | MySQL database name      |
| `JWT_SECRET`     | Secret used to sign JWTs |
| `GEMINI_API_KEY` | Google Gemini API key    |
| `PORT`           | Backend server port      |

> Never commit your `.env` file or API keys to GitHub.

---

## 3. Configure MySQL

Create the database:

```sql
CREATE DATABASE training_log;
```

The backend expects `users` and `workouts` tables.

Example schema:

```sql
USE training_log;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

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

## 4. Start the Backend

From the `backend` directory:

```bash
node server.js
```

Or use Nodemon during development:

```bash
npx nodemon server.js
```

The backend runs on:

```text
http://localhost:5000
```

---

## 5. Start the Frontend

Open another terminal:

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

Vite will provide a local development URL, typically:

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

Request body:

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

Request body:

```json
{
  "username": "john",
  "password": "password123"
}
```

The server returns a JWT token:

```json
{
  "auth": true,
  "token": "your-jwt-token",
  "username": "john"
}
```

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

Request body:

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

# AI Coach API

## Get Coaching Insight

```http
POST /api/ai/coach
```

Authentication:

```http
Authorization: Bearer <token>
```

The backend retrieves the user's most recent workout records and sends the training data to Gemini.

Example response:

```json
{
  "insight": "Your deadlift volume has increased consistently over your last few sessions. Consider maintaining the current weight for another session while focusing on consistent reps before increasing the load."
}
```

The AI coach is configured to provide a short paragraph containing a specific observation and an actionable next step.

---

# Authentication Flow

```text
Register
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
     MySQL
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

For protected requests:

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
Protected API Route
```

---

# Application Flow

```text
              ┌──────────────┐
              │ Authentication│
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │  Dashboard   │
              └──────┬───────┘
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
       Log Set    Statistics   AI Coach
          │          │          │
          └──────────┼──────────┘
                     ▼
              Workout History
```

---

# NPM Scripts

## Frontend

```bash
npm run dev
```

Start the development server.

```bash
npm run build
```

Create a production build.

```bash
npm run preview
```

Preview the production build.

```bash
npm run lint
```

Run Oxlint.

---

# Security

The application implements several basic security mechanisms:

* Passwords are hashed using bcrypt before storage.
* Protected endpoints require JWT authentication.
* JWT tokens contain the authenticated user's ID.
* Database queries use parameterized values.
* Sensitive configuration is loaded through environment variables.
* API keys are not intended to be stored in frontend code.

---

# Current Limitations

The current version focuses on the core workout logging experience.

Potential future additions include:

* Edit workouts
* Delete workouts
* Exercise-specific progress charts
* Personal records
* Weekly and monthly analytics
* Workout programs
* User profiles
* Refresh-token authentication
* More detailed AI coaching
* Production deployment
* Improved database validation

---

# Future Roadmap

```text
[x] User Authentication
[x] JWT Authorization
[x] Workout Logging
[x] Workout History
[x] Training Statistics
[x] Gemini AI Coach
[ ] Workout Editing
[ ] Workout Deletion
[ ] Progress Charts
[ ] Personal Records
[ ] Workout Programs
[ ] Production Deployment
```

---

# Learning Objectives

This project demonstrates practical implementation of:

* React component development
* React state and lifecycle management
* Client-side routing
* REST API development
* Express middleware
* JWT authentication
* Password hashing
* MySQL database integration
* Protected API endpoints
* Axios API communication
* Environment variable management
* AI API integration
* Full-stack application architecture

---

# Author

**Aman Choudhary**

Built as a full-stack development project to practice modern web development, backend authentication, database integration, and AI-powered application features.

---

## License

This project is for educational and development purposes.
