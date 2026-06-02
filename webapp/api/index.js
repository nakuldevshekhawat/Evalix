const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'srms-dev-secret-change-in-prod';
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── IN-MEMORY DATA STORE ─────────────────────────────────────
const db = {
  users: [
    { id: '1', username: 'admin', password: bcrypt.hashSync('admin123', 10), role: 'ADMIN' },
    { id: '2', username: 'faculty1', password: bcrypt.hashSync('admin123', 10), role: 'FACULTY' },
  ],
  students: [
    { id: '1', roll: 'CS2024001', name: 'Rahul Sharma', dept: 'Computer Science', semester: 3, email: 'rahul@example.com' },
    { id: '2', roll: 'CS2024002', name: 'Priya Patel', dept: 'Computer Science', semester: 3, email: 'priya@example.com' },
    { id: '3', roll: 'EC2024001', name: 'Amit Verma', dept: 'Electronics', semester: 5, email: 'amit@example.com' },
    { id: '4', roll: 'CS2024003', name: 'Sneha Gupta', dept: 'Computer Science', semester: 3, email: 'sneha@example.com' },
    { id: '5', roll: 'ME2024001', name: 'Rohan Mehra', dept: 'Mechanical', semester: 4, email: 'rohan@example.com' },
  ],
  courses: [
    { id: '1', code: 'CS301', name: 'Data Structures', credits: 4, dept: 'Computer Science' },
    { id: '2', code: 'CS302', name: 'DBMS', credits: 4, dept: 'Computer Science' },
    { id: '3', code: 'CS303', name: 'Operating Systems', credits: 3, dept: 'Computer Science' },
    { id: '4', code: 'EC301', name: 'Digital Electronics', credits: 4, dept: 'Electronics' },
    { id: '5', code: 'MA301', name: 'Engineering Mathematics', credits: 4, dept: 'Mathematics' },
  ],
  grades: [
    { id: '1', studentId: '1', courseId: '1', marks: 85, semester: 3 },
    { id: '2', studentId: '1', courseId: '2', marks: 78, semester: 3 },
    { id: '3', studentId: '1', courseId: '5', marks: 92, semester: 3 },
    { id: '4', studentId: '2', courseId: '1', marks: 67, semester: 3 },
    { id: '5', studentId: '2', courseId: '2', marks: 55, semester: 3 },
    { id: '6', studentId: '3', courseId: '4', marks: 38, semester: 5 },
    { id: '7', studentId: '4', courseId: '1', marks: 91, semester: 3 },
    { id: '8', studentId: '4', courseId: '2', marks: 88, semester: 3 },
    { id: '9', studentId: '5', courseId: '5', marks: 72, semester: 4 },
  ],
};

// ─── MIDDLEWARE ───────────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
function adminOnly(req, res, next) {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  next();
}

// ─── AUTH ROUTES ──────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// ─── STUDENT ROUTES ───────────────────────────────────────────
app.get('/api/students', auth, (req, res) => res.json(db.students));

app.post('/api/students', auth, adminOnly, (req, res) => {
  const { roll, name, dept, semester, email } = req.body;
  if (!roll || !name) return res.status(400).json({ error: 'Roll and name required' });
  if (db.students.find(s => s.roll === roll))
    return res.status(400).json({ error: 'Roll number already exists' });
  const student = { id: uuidv4(), roll, name, dept, semester: Number(semester), email };
  db.students.push(student);
  res.status(201).json(student);
});

app.put('/api/students/:id', auth, adminOnly, (req, res) => {
  const idx = db.students.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.students[idx] = { ...db.students[idx], ...req.body, id: req.params.id };
  res.json(db.students[idx]);
});

app.delete('/api/students/:id', auth, adminOnly, (req, res) => {
  db.students = db.students.filter(s => s.id !== req.params.id);
  db.grades = db.grades.filter(g => g.studentId !== req.params.id);
  res.json({ ok: true });
});

// ─── COURSE ROUTES ────────────────────────────────────────────
app.get('/api/courses', auth, (req, res) => res.json(db.courses));

app.post('/api/courses', auth, adminOnly, (req, res) => {
  const { code, name, credits, dept } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'Code and name required' });
  const course = { id: uuidv4(), code, name, credits: Number(credits), dept };
  db.courses.push(course);
  res.status(201).json(course);
});

app.put('/api/courses/:id', auth, adminOnly, (req, res) => {
  const idx = db.courses.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.courses[idx] = { ...db.courses[idx], ...req.body, id: req.params.id };
  res.json(db.courses[idx]);
});

app.delete('/api/courses/:id', auth, adminOnly, (req, res) => {
  db.courses = db.courses.filter(c => c.id !== req.params.id);
  db.grades = db.grades.filter(g => g.courseId !== req.params.id);
  res.json({ ok: true });
});

// ─── GRADE ROUTES ─────────────────────────────────────────────
app.get('/api/grades', auth, (req, res) => res.json(db.grades));

app.post('/api/grades', auth, (req, res) => {
  const { studentId, courseId, marks, semester } = req.body;
  if (marks < 0 || marks > 100) return res.status(400).json({ error: 'Marks must be 0-100' });
  const grade = { id: uuidv4(), studentId, courseId, marks: Number(marks), semester: Number(semester) };
  db.grades.push(grade);
  res.status(201).json(grade);
});

app.put('/api/grades/:id', auth, (req, res) => {
  const idx = db.grades.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.grades[idx] = { ...db.grades[idx], ...req.body, id: req.params.id };
  res.json(db.grades[idx]);
});

app.delete('/api/grades/:id', auth, adminOnly, (req, res) => {
  db.grades = db.grades.filter(g => g.id !== req.params.id);
  res.json({ ok: true });
});

// ─── USER ROUTES ──────────────────────────────────────────────
app.get('/api/users', auth, adminOnly, (req, res) =>
  res.json(db.users.map(u => ({ id: u.id, username: u.username, role: u.role })))
);

app.post('/api/users', auth, adminOnly, (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (db.users.find(u => u.username === username))
    return res.status(400).json({ error: 'Username already exists' });
  const user = { id: uuidv4(), username, password: bcrypt.hashSync(password, 10), role };
  db.users.push(user);
  res.status(201).json({ id: user.id, username: user.username, role: user.role });
});

app.delete('/api/users/:id', auth, adminOnly, (req, res) => {
  if (req.params.id === '1') return res.status(400).json({ error: 'Cannot delete admin' });
  db.users = db.users.filter(u => u.id !== req.params.id);
  res.json({ ok: true });
});

// ─── STATS ROUTE ──────────────────────────────────────────────
app.get('/api/stats', auth, (req, res) => {
  const pass = db.grades.filter(g => g.marks >= 40).length;
  res.json({
    students: db.students.length,
    courses: db.courses.length,
    grades: db.grades.length,
    passRate: db.grades.length ? Math.round((pass / db.grades.length) * 100) : 0,
  });
});

app.listen(PORT, () => console.log(`SRMS API running on port ${PORT}`));
module.exports = app;
