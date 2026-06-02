import { useEffect, useState } from 'react';
import api from '../api';
import { calcGrade, gradeBadgeClass } from '../utils';

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, courses: 0, grades: 0, passRate: 0 });
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data));
    api.get('/students').then(r => setStudents(r.data));
    api.get('/grades').then(r => setGrades(r.data));
    api.get('/courses').then(r => setCourses(r.data));
  }, []);

  const dist = {};
  grades.forEach(g => { const gr = calcGrade(g.marks); dist[gr] = (dist[gr] || 0) + 1; });
  const ORDER = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
  const RANGES = { 'A+': '90–100', 'A': '80–89', 'B+': '75–79', 'B': '65–74', 'C+': '55–64', 'C': '50–54', 'D': '40–49', 'F': '<40' };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">System overview at a glance</div>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card c1"><div className="stat-val">{stats.students}</div><div className="stat-lbl">Students</div></div>
        <div className="stat-card c2"><div className="stat-val">{stats.courses}</div><div className="stat-lbl">Courses</div></div>
        <div className="stat-card c3"><div className="stat-val">{stats.grades}</div><div className="stat-lbl">Grades Recorded</div></div>
        <div className="stat-card c4"><div className="stat-val">{stats.passRate}%</div><div className="stat-lbl">Pass Rate</div></div>
      </div>
      <div className="two-col">
        <div className="table-wrap">
          <div className="table-header"><div className="table-title">Recent Students</div></div>
          <table>
            <thead><tr><th>Name</th><th>Roll No</th><th>Dept</th></tr></thead>
            <tbody>
              {students.slice(-5).reverse().map(s => (
                <tr key={s.id}><td>{s.name}</td><td>{s.roll}</td><td>{s.dept.split(' ')[0]}</td></tr>
              ))}
              {!students.length && <tr><td colSpan={3} className="empty-state">No students</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-wrap">
          <div className="table-header"><div className="table-title">Grade Distribution</div></div>
          <table>
            <thead><tr><th>Grade</th><th>Count</th><th>Range</th></tr></thead>
            <tbody>
              {ORDER.filter(g => dist[g]).map(g => (
                <tr key={g}>
                  <td><span className={gradeBadgeClass(g)}>{g}</span></td>
                  <td>{dist[g]}</td>
                  <td style={{ color: 'var(--muted)' }}>{RANGES[g]}</td>
                </tr>
              ))}
              {!grades.length && <tr><td colSpan={3} className="empty-state">No grades</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
