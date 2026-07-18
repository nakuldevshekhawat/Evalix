# Evailx - Premium Student Result Management System

![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![React](https://img.shields.io/badge/React-18-61DAFB)
![License](https://img.shields.io/badge/license-MIT-green)

**Full-Stack Web App** — Built with Node.js + React. Premium UI, no database setup required.

🔴 **Live Demo:** [https://evalix--srms.up.railway.app](https://evalix--srms.up.railway.app)

---

## 🚀 Quick Start — Local Development

No Java or MySQL required. Runs entirely on Node.js.

### Prerequisites
- [Node.js 18+](https://nodejs.org/)

### 1. Install & Start Everything
```bash
npm run install:all
npm run build
npm start
```
*App will run on http://localhost:5000*

### Login Credentials

| Username           | Password     | Role    |
|--------------------|--------------|---------|
| `faculty1`         | `admin123`   | FACULTY |

---

## ✨ Features

### 📊 Analytics Dashboard
- Live **grade distribution donut chart**
- **Department performance bar chart**
- **Sparkline trend lines** on every stat card
- **Top Performers leaderboard** with GPA
- **Real-time activity feed** (grade entries, student additions)

### 👥 Student & Grade Management
- **Table & Card view** toggle
- **Color-coded initials avatars**
- **Advanced filters** — by department, semester, search
- **Student profile modal** — full grade history, GPA, marks bars
- **Inline editing** — click any marks cell to edit directly
- **Live grade preview** — see grade letter as you type marks

### 🏆 Result Cards
- **Printable PDF-quality** result card
- **GPA / 10** (SGPA) and **average percentage**
- **Class rank** (e.g., #2 of 8 students)
- **Total credits** per semester
- Per-subject performance bars
- Pass/Fail/Highest/Lowest subject summary

### 🔐 Authentication
- JWT-based login/logout
- **Profile dropdown** in topbar with avatar
- **Change Password** for logged-in user
- Role-based access (Admin vs Faculty)
- Session persists via localStorage

### 🎨 Premium UI
- **Dark theme** with glassmorphism effects
- **Space Grotesk + Inter** Google Fonts
- Animated hover effects on all cards
- Toast notifications (success / error / warning / info)
- Styled confirm dialogs (no browser `alert()`)

---

## 📐 Grade Scale

| Marks  | Grade | GPA Points |
|--------|-------|-----------|
| 90–100 | A+    | 10        |
| 80–89  | A     | 9         |
| 75–79  | B+    | 8         |
| 65–74  | B     | 7         |
| 55–64  | C+    | 6         |
| 50–54  | C     | 5         |
| 40–49  | D     | 4         |
| < 40   | F     | 0         |

---

## License
MIT © [nakuldevshekhawat](https://github.com/nakuldevshekhawat)
