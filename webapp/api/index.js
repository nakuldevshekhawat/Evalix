const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'srms-dev-secret-change-in-prod';
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── IN-MEMORY DATA STORE ─────────────────────────────────────
const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

const db = {
  users: [
    { id: '1', username: adminUsername, password: bcrypt.hashSync(adminPassword, 10), role: 'ADMIN',   fullName: 'System Administrator', email: 'admin@evailx.edu' },
    { id: '2', username: 'faculty1', password: bcrypt.hashSync('admin123', 10), role: 'FACULTY', fullName: 'Dr. Priya Sharma',       email: 'priya@srms.edu' },
    { id: '3', username: 'faculty2', password: bcrypt.hashSync('admin123', 10), role: 'FACULTY', fullName: 'Prof. Rahul Mehta',       email: 'rahul@srms.edu' },
  ],
  students: [
    { id: '1', roll: 'CS2024001', name: 'Aarav Sharma',   dept: 'Computer Science', semester: 3, email: 'aarav@example.com',   phone: '9876543210', status: 'active' },
    { id: '2', roll: 'CS2024002', name: 'Diya Patel',     dept: 'Computer Science', semester: 3, email: 'diya@example.com',    phone: '9876543211', status: 'active' },
    { id: '3', roll: 'EC2024001', name: 'Rohan Verma',    dept: 'Electronics',      semester: 5, email: 'rohan@example.com',   phone: '9876543212', status: 'active' },
    { id: '4', roll: 'CS2024003', name: 'Sneha Gupta',    dept: 'Computer Science', semester: 3, email: 'sneha@example.com',   phone: '9876543213', status: 'active' },
    { id: '5', roll: 'ME2024001', name: 'Arjun Mehta',    dept: 'Mechanical',       semester: 4, email: 'arjun@example.com',   phone: '9876543214', status: 'active' },
    { id: '6', roll: 'CS2024004', name: 'Kavya Reddy',    dept: 'Computer Science', semester: 3, email: 'kavya@example.com',   phone: '9876543215', status: 'active' },
    { id: '7', roll: 'MA2024001', name: 'Vikram Singh',   dept: 'Mathematics',      semester: 2, email: 'vikram@example.com',  phone: '9876543216', status: 'active' },
    { id: '8', roll: 'EC2024002', name: 'Ananya Das',     dept: 'Electronics',      semester: 5, email: 'ananya@example.com',  phone: '9876543217', status: 'active' },
  ],
  courses: [
    { id: '1', code: 'CS301', name: 'Data Structures',          credits: 4, dept: 'Computer Science' },
    { id: '2', code: 'CS302', name: 'Database Management',      credits: 4, dept: 'Computer Science' },
    { id: '3', code: 'CS303', name: 'Operating Systems',        credits: 3, dept: 'Computer Science' },
    { id: '4', code: 'EC301', name: 'Digital Electronics',      credits: 4, dept: 'Electronics'      },
    { id: '5', code: 'MA301', name: 'Engineering Mathematics',  credits: 4, dept: 'Mathematics'      },
    { id: '6', code: 'CS304', name: 'Computer Networks',        credits: 3, dept: 'Computer Science' },
    { id: '7', code: 'ME301', name: 'Thermodynamics',           credits: 4, dept: 'Mechanical'       },
  ],
  grades: [
    { id: '1',  studentId: '1', courseId: '1', marks: 88, semester: 3 },
    { id: '2',  studentId: '1', courseId: '2', marks: 76, semester: 3 },
    { id: '3',  studentId: '1', courseId: '5', marks: 92, semester: 3 },
    { id: '4',  studentId: '2', courseId: '1', marks: 67, semester: 3 },
    { id: '5',  studentId: '2', courseId: '2', marks: 55, semester: 3 },
    { id: '6',  studentId: '3', courseId: '4', marks: 38, semester: 5 },
    { id: '7',  studentId: '4', courseId: '1', marks: 95, semester: 3 },
    { id: '8',  studentId: '4', courseId: '2', marks: 91, semester: 3 },
    { id: '9',  studentId: '4', courseId: '3', marks: 87, semester: 3 },
    { id: '10', studentId: '5', courseId: '5', marks: 72, semester: 4 },
    { id: '11', studentId: '5', courseId: '7', marks: 65, semester: 4 },
    { id: '12', studentId: '6', courseId: '1', marks: 81, semester: 3 },
    { id: '13', studentId: '6', courseId: '2', marks: 79, semester: 3 },
    { id: '14', studentId: '7', courseId: '5', marks: 88, semester: 2 },
    { id: '15', studentId: '8', courseId: '4', marks: 94, semester: 5 },
    { id: '16', studentId: '8', courseId: '6', marks: 70, semester: 5 },
    { id: '17', studentId: '1', courseId: '3', marks: 83, semester: 3 },
    { id: '18', studentId: '2', courseId: '3', marks: 48, semester: 3 },
  ],
  activity: [
    { id: '1', type: 'grade',   message: 'Grade recorded for Aarav Sharma — CS301',       time: Date.now() - 120000,  user: 'faculty1' },
    { id: '2', type: 'student', message: 'New student added: Ananya Das (EC2024002)',       time: Date.now() - 600000,  user: 'admin'    },
    { id: '3', type: 'grade',   message: 'Grade updated for Sneha Gupta — CS302',          time: Date.now() - 1800000, user: 'faculty1' },
    { id: '4', type: 'course',  message: 'New course added: Computer Networks (CS304)',    time: Date.now() - 3600000, user: 'admin'    },
    { id: '5', type: 'grade',   message: 'Grade recorded for Ananya Das — EC301',          time: Date.now() - 7200000, user: 'faculty2' },
  ],
};

// ─── HELPERS ──────────────────────────────────────────────────
function calcGrade(marks) {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 75) return 'B+';
  if (marks >= 65) return 'B';
  if (marks >= 55) return 'C+';
  if (marks >= 50) return 'C';
  if (marks >= 40) return 'D';
  return 'F';
}
function gradeToGpa(grade) {
  const map = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0 };
  return map[grade] ?? 0;
}
function logActivity(type, message, username) {
  db.activity.unshift({ id: uuidv4(), type, message, time: Date.now(), user: username });
  if (db.activity.length > 50) db.activity.pop();
}

// ─── MIDDLEWARE ───────────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}
function adminOnly(req, res, next) {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  next();
}

// ─── AUTH ─────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, fullName: user.fullName, email: user.email } });
});

app.post('/api/auth/change-password', auth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  if (!user || !bcrypt.compareSync(currentPassword, user.password))
    return res.status(400).json({ error: 'Current password is incorrect' });
  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  user.password = bcrypt.hashSync(newPassword, 10);
  res.json({ ok: true });
});

// ─── ANALYTICS ────────────────────────────────────────────────
app.get('/api/analytics', auth, (req, res) => {
  // Grade distribution
  const gradeDist = {};
  db.grades.forEach(g => { const gr = calcGrade(g.marks); gradeDist[gr] = (gradeDist[gr] || 0) + 1; });

  // Department performance
  const deptMap = {};
  db.students.forEach(s => {
    const sGrades = db.grades.filter(g => g.studentId === s.id);
    if (!sGrades.length) return;
    const avg = sGrades.reduce((a, g) => a + g.marks, 0) / sGrades.length;
    if (!deptMap[s.dept]) deptMap[s.dept] = { total: 0, count: 0, students: 0 };
    deptMap[s.dept].total += avg;
    deptMap[s.dept].count += 1;
    deptMap[s.dept].students += 1;
  });
  const deptPerf = Object.entries(deptMap).map(([dept, d]) => ({
    dept, avg: Math.round(d.total / d.count), students: d.students
  })).sort((a, b) => b.avg - a.avg);

  // Top performers
  const studentAvgs = db.students.map(s => {
    const sGrades = db.grades.filter(g => g.studentId === s.id);
    if (!sGrades.length) return null;
    const avg = Math.round(sGrades.reduce((a, g) => a + g.marks, 0) / sGrades.length);
    const gpa = sGrades.reduce((a, g) => a + gradeToGpa(calcGrade(g.marks)), 0) / sGrades.length;
    return { id: s.id, name: s.name, roll: s.roll, dept: s.dept, avg, gpa: Math.round(gpa * 100) / 100, subjects: sGrades.length };
  }).filter(Boolean).sort((a, b) => b.avg - a.avg);

  // Pass/fail stats
  const passCount = db.grades.filter(g => g.marks >= 40).length;
  const failCount = db.grades.length - passCount;

  // Monthly grade counts (mock — last 6 months)
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const monthlyTrend = months.map((m, i) => ({ month: m, count: Math.floor(Math.random() * 8) + 2 + i }));
  monthlyTrend[5].count = db.grades.length; // last month = actual

  res.json({ gradeDist, deptPerf, topPerformers: studentAvgs.slice(0, 5), passCount, failCount, monthlyTrend });
});

app.get('/api/stats', auth, (req, res) => {
  const pass = db.grades.filter(g => g.marks >= 40).length;
  const avgMarks = db.grades.length ? Math.round(db.grades.reduce((a, g) => a + g.marks, 0) / db.grades.length) : 0;
  res.json({
    students: db.students.length, courses: db.courses.length,
    grades: db.grades.length, passRate: db.grades.length ? Math.round((pass / db.grades.length) * 100) : 0,
    avgMarks,
  });
});

app.get('/api/activity', auth, (req, res) => res.json(db.activity.slice(0, 10)));

// ─── STUDENTS ─────────────────────────────────────────────────
app.get('/api/students', auth, (req, res) => res.json(db.students));

app.post('/api/students', auth, adminOnly, (req, res) => {
  const { roll, name, dept, semester, email, phone, status } = req.body;
  if (!roll || !name) return res.status(400).json({ error: 'Roll and name required' });
  if (db.students.find(s => s.roll === roll)) return res.status(400).json({ error: 'Roll number already exists' });
  const student = { id: uuidv4(), roll, name, dept, semester: Number(semester), email, phone: phone || '', status: status || 'active' };
  db.students.push(student);
  logActivity('student', `New student added: ${name} (${roll})`, req.user.username);
  res.status(201).json(student);
});

app.put('/api/students/:id', auth, adminOnly, (req, res) => {
  const idx = db.students.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.students[idx] = { ...db.students[idx], ...req.body, id: req.params.id };
  res.json(db.students[idx]);
});

app.delete('/api/students/:id', auth, adminOnly, (req, res) => {
  const s = db.students.find(s => s.id === req.params.id);
  db.students = db.students.filter(s => s.id !== req.params.id);
  db.grades = db.grades.filter(g => g.studentId !== req.params.id);
  if (s) logActivity('student', `Student removed: ${s.name} (${s.roll})`, req.user.username);
  res.json({ ok: true });
});

// ─── COURSES ──────────────────────────────────────────────────
app.get('/api/courses', auth, (req, res) => {
  const coursesWithCount = db.courses.map(c => ({
    ...c, enrolled: db.grades.filter(g => g.courseId === c.id).length
  }));
  res.json(coursesWithCount);
});

app.post('/api/courses', auth, adminOnly, (req, res) => {
  const { code, name, credits, dept } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'Code and name required' });
  if (db.courses.find(c => c.code === code)) return res.status(400).json({ error: 'Course code already exists' });
  const course = { id: uuidv4(), code, name, credits: Number(credits), dept };
  db.courses.push(course);
  logActivity('course', `New course added: ${name} (${code})`, req.user.username);
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

// ─── GRADES ───────────────────────────────────────────────────
app.get('/api/grades', auth, (req, res) => res.json(db.grades));

app.post('/api/grades', auth, (req, res) => {
  const { studentId, courseId, marks, semester } = req.body;
  const m = Number(marks);
  if (isNaN(m) || m < 0 || m > 100) return res.status(400).json({ error: 'Marks must be 0-100' });
  const exists = db.grades.find(g => g.studentId === studentId && g.courseId === courseId && g.semester === Number(semester));
  if (exists) return res.status(400).json({ error: 'Grade already exists for this student/course/semester. Use edit instead.' });
  const grade = { id: uuidv4(), studentId, courseId, marks: m, semester: Number(semester) };
  db.grades.push(grade);
  const sName = db.students.find(s => s.id === studentId)?.name || 'Unknown';
  const cCode = db.courses.find(c => c.id === courseId)?.code || 'Unknown';
  logActivity('grade', `Grade recorded for ${sName} — ${cCode}: ${m}`, req.user.username);
  res.status(201).json(grade);
});

app.put('/api/grades/:id', auth, (req, res) => {
  const idx = db.grades.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const m = Number(req.body.marks);
  if (!isNaN(m)) req.body.marks = m;
  db.grades[idx] = { ...db.grades[idx], ...req.body, id: req.params.id };
  const sName = db.students.find(s => s.id === db.grades[idx].studentId)?.name || 'Unknown';
  const cCode = db.courses.find(c => c.id === db.grades[idx].courseId)?.code || 'Unknown';
  logActivity('grade', `Grade updated for ${sName} — ${cCode}: ${db.grades[idx].marks}`, req.user.username);
  res.json(db.grades[idx]);
});

app.delete('/api/grades/:id', auth, adminOnly, (req, res) => {
  db.grades = db.grades.filter(g => g.id !== req.params.id);
  res.json({ ok: true });
});

// ─── USERS ────────────────────────────────────────────────────
app.get('/api/users', auth, adminOnly, (req, res) =>
  res.json(db.users.map(u => ({ id: u.id, username: u.username, role: u.role, fullName: u.fullName, email: u.email })))
);

app.post('/api/users', auth, adminOnly, (req, res) => {
  const { username, password, role, fullName, email } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (db.users.find(u => u.username === username)) return res.status(400).json({ error: 'Username already exists' });
  const user = { id: uuidv4(), username, password: bcrypt.hashSync(password, 10), role: role || 'FACULTY', fullName: fullName || username, email: email || '' };
  db.users.push(user);
  res.status(201).json({ id: user.id, username: user.username, role: user.role, fullName: user.fullName, email: user.email });
});

app.put('/api/users/:id', auth, adminOnly, (req, res) => {
  const idx = db.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const { fullName, email, role } = req.body;
  if (fullName) db.users[idx].fullName = fullName;
  if (email !== undefined) db.users[idx].email = email;
  if (role && db.users[idx].username !== 'admin') db.users[idx].role = role;
  const u = db.users[idx];
  res.json({ id: u.id, username: u.username, role: u.role, fullName: u.fullName, email: u.email });
});

app.delete('/api/users/:id', auth, adminOnly, (req, res) => {
  if (req.params.id === '1') return res.status(400).json({ error: 'Cannot delete admin' });
  db.users = db.users.filter(u => u.id !== req.params.id);
  res.json({ ok: true });
});

// ─── SERVE STATIC FRONTEND (PRODUCTION) ───────────────────────
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => console.log(`SRMS API running on port ${PORT}`));
module.exports = app;
