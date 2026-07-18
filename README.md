# Evailx

![Java](https://img.shields.io/badge/Java-17+-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![React](https://img.shields.io/badge/React-18-61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![License](https://img.shields.io/badge/license-MIT-green)

**Full-Stack Evailx — Two Versions:**
- 🌐 **Web App** (Node.js + React) — Premium UI, no database setup required
- ☕ **Java Console App** (Java 17 + MySQL + JDBC)

---

## 🚀 Quick Start — Web App (Recommended)

No Java or MySQL required. Runs entirely on Node.js.

### Prerequisites
- [Node.js 18+](https://nodejs.org/)

### 1. Install & Start API Backend

```bash
cd webapp/api
npm install
node index.js
# API running on http://localhost:5000
```

### 2. Install & Start React Frontend

```bash
cd webapp/client
npm install
npm run dev
# App running on http://localhost:5174
```

### 3. Open in Browser

```
http://localhost:5174
```

### Login Credentials

| Username   | Password  | Role    |
|------------|-----------|---------|
| `admin`    | `admin123`| ADMIN   |
| `faculty1` | `admin123`| FACULTY |

---

## ✨ Web App Features

### 📊 Analytics Dashboard
- Live **grade distribution donut chart**
- **Department performance bar chart**
- **Sparkline trend lines** on every stat card
- **Top Performers leaderboard** with GPA
- **Real-time activity feed** (grade entries, student additions)
- 4 animated stat cards (students, courses, grades, pass rate)

### 👥 Student Management
- **Table & Card view** toggle
- **Color-coded initials avatars**
- **Advanced filters** — by department, semester, search
- **Student profile modal** — full grade history, GPA, marks bars
- **Status badges** — Active / Inactive / Graduated
- Add, Edit, Delete students (Admin only)

### 📝 Grade Management
- **Inline editing** — click any marks cell to edit directly
- **Live grade preview** — see grade letter as you type marks
- **Color-coded performance bars** (green → red based on score)
- Filter by semester and student/course search
- Add, Edit, Delete grades

### 🏆 Result Cards
- **Printable PDF-quality** result card
- **GPA / 10** (SGPA) and **average percentage**
- **Class rank** (e.g., #2 of 8 students)
- **Total credits** per semester
- Per-subject performance bars
- Pass/Fail/Highest/Lowest subject summary
- `window.print()` for PDF export

### 📚 Course Management
- **Card & Table** view toggle
- Department color-coded badges
- Enrollment count per course
- Add, Edit, Delete courses (Admin only)

### 👤 User Management (Admin only)
- User stats (admin count, faculty count)
- **Edit** user full name, email, role
- **Avatar** with color-coded initials
- Add new faculty/admin accounts
- Delete users (admin account protected)

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
- **Mobile responsive** layout
- Print CSS for clean result card printing

---

## 🗂 Project Structure

```
evailx/
├── webapp/
│   ├── api/
│   │   ├── index.js              ← Express API (in-memory store, JWT auth)
│   │   └── package.json
│   └── client/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Avatar.jsx        ← Color-coded initials avatar
│       │   │   ├── Charts.jsx        ← SVG donut, bar, sparkline charts
│       │   │   ├── Layout.jsx        ← Sidebar, topbar, profile dropdown
│       │   │   ├── Modal.jsx         ← Reusable modal
│       │   │   └── SkeletonLoader.jsx
│       │   ├── context/
│       │   │   ├── AuthContext.jsx   ← JWT auth state
│       │   │   ├── ConfirmContext.jsx ← Styled confirm dialogs
│       │   │   └── ToastContext.jsx  ← Toast notification system
│       │   ├── pages/
│       │   │   ├── Dashboard.jsx    ← Analytics + charts + leaderboard
│       │   │   ├── Students.jsx     ← Card/table view + filters + GPA
│       │   │   ├── Courses.jsx      ← Card/table view + enrollment
│       │   │   ├── Grades.jsx       ← Inline edit + live preview
│       │   │   ├── Results.jsx      ← Printable result card
│       │   │   ├── Users.jsx        ← User management
│       │   │   └── Login.jsx        ← Animated login
│       │   ├── api.js               ← Axios config + JWT interceptor
│       │   ├── utils.js             ← Grade/GPA calculations
│       │   └── index.css            ← Premium design system
│       └── package.json
│
├── src/main/java/com/evailx/          ← Java Console App
│   ├── config/DBConnection.java
│   ├── model/
│   ├── repository/
│   ├── service/
│   └── ui/MainMenu.java
├── sql/schema.sql                   ← MySQL schema + seed data
├── build.bat                        ← Windows build script
├── build.sh                         ← Linux/Mac build script
└── pom.xml                          ← Maven config (Java 17)
```

---

## ☕ Java Console App Setup

> Requires: Java 17+, MySQL 8.0

### Step 1 — MySQL Schema

```sql
source sql/schema.sql
```

### Step 2 — Configure DB Credentials

Edit `src/main/java/com/evailx/config/DBConnection.java`:

```java
private static final String USER     = "root";
private static final String PASSWORD = "your_password";
```

### Step 3 — Build & Run

**Windows:**
```bat
build.bat run
```

**Linux / Mac:**
```bash
chmod +x build.sh && ./build.sh run
```

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

## 🛠 Tech Stack

### Web App
| Layer     | Technology              |
|-----------|------------------------|
| Frontend  | React 18, Vite 5       |
| Styling   | Vanilla CSS (custom)   |
| Charts    | Pure SVG (no library)  |
| Backend   | Node.js, Express 4     |
| Auth      | JWT (jsonwebtoken)     |
| Fonts     | Space Grotesk, Inter   |

### Java Console App
| Layer      | Technology      |
|------------|----------------|
| Language   | Java 17        |
| Database   | MySQL 8.0      |
| Connector  | JDBC           |
| Build      | Maven 3        |

---

## License

MIT © [nakuldevshekhawat](https://github.com/nakuldevshekhawat)
