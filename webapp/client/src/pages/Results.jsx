import { useEffect, useState } from 'react';
import api from '../api';
import { calcGrade, gradeBadgeClass } from '../utils';

export default function Results() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    api.get('/students').then(r => setStudents(r.data));
    api.get('/courses').then(r => setCourses(r.data));
    api.get('/grades').then(r => setGrades(r.data));
  }, []);

  const student = students.find(s => s.id === selected);
  const studentGrades = grades.filter(g => g.studentId === selected);
  const avg = studentGrades.length ? Math.round(studentGrades.reduce((a, g) => a + g.marks, 0) / studentGrades.length) : 0;
  const overall = studentGrades.length ? calcGrade(avg) : null;

  return (
    <>
      <div className="page-header">
        <div><div className="page-title">Result Cards</div><div className="page-sub">Per-student semester report</div></div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'flex-end' }}>
        <div className="field" style={{ margin: 0, flex: 1, maxWidth: 300 }}>
          <label>Select Student</label>
          <select value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="">-- Choose a student --</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll})</option>)}
          </select>
        </div>
      </div>

      {selected && !studentGrades.length && (
        <div className="empty-state" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 40 }}>
          No grades recorded for this student.
        </div>
      )}

      {student && studentGrades.length > 0 && (
        <div className="result-card">
          <div className="result-card-header">
            <div>
              <div className="result-card-name">{student.name}</div>
              <div className="result-card-meta">{student.roll} · {student.dept} · Semester {student.semester}</div>
              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)' }}>
                Subjects: {studentGrades.length} &nbsp;|&nbsp; Average Marks: {avg}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className={`grade-chip${overall === 'F' ? ' fail' : ''}`}>{overall}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>Overall Grade</div>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Code</th><th>Course</th><th>Credits</th><th>Marks</th><th>Grade</th><th>Semester</th></tr>
            </thead>
            <tbody>
              {studentGrades.map(g => {
                const c = courses.find(x => x.id === g.courseId);
                const gr = calcGrade(g.marks);
                return (
                  <tr key={g.id}>
                    <td><span className="badge badge-purple">{c?.code || '?'}</span></td>
                    <td>{c?.name || '?'}</td>
                    <td>{c?.credits || '-'}</td>
                    <td style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{g.marks}</td>
                    <td><span className={gradeBadgeClass(gr)}>{gr}</span></td>
                    <td>Sem {g.semester}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--surface2)' }}>
                <td colSpan={3} style={{ padding: '10px 16px', fontSize: 11, color: 'var(--muted)', letterSpacing: 2 }}>AGGREGATE</td>
                <td style={{ padding: '10px 16px', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15 }}>{avg}</td>
                <td style={{ padding: '10px 16px' }}><span className={gradeBadgeClass(overall)}>{overall}</span></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}
