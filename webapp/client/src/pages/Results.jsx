import { useEffect, useState } from 'react';
import api from '../api';
import { calcGrade, gradeBadgeClass, calcGpa, gradeToGpa, marksColor, GRADE_COLORS } from '../utils';
import Avatar from '../components/Avatar';

export default function Results() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses]   = useState([]);
  const [grades, setGrades]     = useState([]);
  const [selected, setSelected] = useState('');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/students').then(r => setStudents(r.data)),
      api.get('/courses').then(r => setCourses(r.data)),
      api.get('/grades').then(r => setGrades(r.data)),
    ]);
  }, []);

  const student = students.find(s => s.id === selected);
  const studentGrades = grades.filter(g => g.studentId === selected);
  const avg = studentGrades.length ? Math.round(studentGrades.reduce((a, g) => a + g.marks, 0) / studentGrades.length) : 0;
  const gpa = calcGpa(studentGrades);
  const overall = studentGrades.length ? calcGrade(avg) : null;

  // Rank among all students
  const allAvgs = students.map(s => {
    const sg = grades.filter(g => g.studentId === s.id);
    return { id: s.id, avg: sg.length ? Math.round(sg.reduce((a, g) => a + g.marks, 0) / sg.length) : 0 };
  }).filter(s => grades.some(g => g.studentId === s.id)).sort((a, b) => b.avg - a.avg);
  const rank = allAvgs.findIndex(s => s.id === selected) + 1;
  const totalRanked = allAvgs.length;

  // Total credits
  const totalCredits = studentGrades.reduce((a, g) => a + (courses.find(c => c.id === g.courseId)?.credits || 0), 0);

  const filteredStudents = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.toLowerCase().includes(search.toLowerCase())
  );

  const handlePrint = () => window.print();

  return (
    <>
      <div className="page-header">
        <div><div className="page-title">Result Cards</div><div className="page-sub">Detailed per-student academic report</div></div>
      </div>

      {/* Student Selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="search-bar"
          style={{ flex: 1, maxWidth: 280 }}
          placeholder="🔍  Search student..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="field" style={{ margin: 0, flex: 2, maxWidth: 360 }}>
          <select value={selected} onChange={e => setSelected(e.target.value)} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '10px 14px', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none' }}>
            <option value="">— Select a student —</option>
            {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll})</option>)}
          </select>
        </div>
      </div>

      {/* No student selected */}
      {!selected && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 12 }}>
          {filteredStudents.slice(0, 8).map(s => {
            const sg = grades.filter(g => g.studentId === s.id);
            const sAvg = sg.length ? Math.round(sg.reduce((a, g) => a + g.marks, 0) / sg.length) : null;
            return (
              <div key={s.id} className="student-card" onClick={() => setSelected(s.id)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={s.name} size={40} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-head)' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>{s.roll}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>{s.dept} · Sem {s.semester}</div>
                  </div>
                  {sAvg !== null && (
                    <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, color: marksColor(sAvg) }}>{sAvg}%</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty grades */}
      {selected && !studentGrades.length && (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
            <div style={{ color: 'var(--text2)' }}>No grades recorded for this student yet.</div>
          </div>
        </div>
      )}

      {/* Result Card */}
      {student && studentGrades.length > 0 && (
        <div className="result-card">
          {/* Header */}
          <div className="result-card-header">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <Avatar name={student.name} size={52} />
              <div>
                <div className="result-card-name">{student.name}</div>
                <div className="result-card-meta">{student.roll}</div>
                <div className="result-card-meta">{student.dept} · Semester {student.semester}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <span className="badge badge-indigo">{studentGrades.length} Subjects</span>
                  <span className="badge badge-cyan">{totalCredits} Credits</span>
                  {rank > 0 && <span className="badge badge-amber">Rank #{rank} of {totalRanked}</span>}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="result-card-gpa">
                <div className="result-gpa-val">{gpa}</div>
                <div className="result-gpa-label">SGPA / 10</div>
              </div>
              <div className="result-card-gpa" style={{ background: 'rgba(52,211,153,0.08)', borderColor: 'rgba(52,211,153,0.2)' }}>
                <div className="result-gpa-val" style={{ color: marksColor(avg) }}>{avg}%</div>
                <div className="result-gpa-label">Avg Marks</div>
              </div>
              <div className="result-card-gpa" style={{ background: 'transparent', border: 'none', textAlign: 'center' }}>
                <div className={`grade-chip ${overall === 'F' ? 'fail' : ''}`}>{overall}</div>
                <div className="result-gpa-label">Overall</div>
              </div>
            </div>
          </div>

          {/* Print & action bar */}
          <div className="result-actions">
            <button className="btn btn-ghost btn-sm" onClick={handlePrint}>🖨 Print / Save PDF</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected('')}>← Back</button>
          </div>

          {/* Subject table */}
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Marks</th>
                <th>Performance</th>
                <th>Grade</th>
                <th>GPA Pts</th>
                <th>Sem</th>
              </tr>
            </thead>
            <tbody>
              {studentGrades.map(g => {
                const c  = courses.find(x => x.id === g.courseId);
                const gr = calcGrade(g.marks);
                const gpts = gradeToGpa(gr);
                return (
                  <tr key={g.id}>
                    <td><span className="badge badge-indigo" style={{ fontFamily: 'var(--font-mono)' }}>{c?.code || '?'}</span></td>
                    <td style={{ fontWeight: 500 }}>{c?.name || '?'}</td>
                    <td style={{ color: 'var(--text2)' }}>{c?.credits || '-'}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: marksColor(g.marks) }}>{g.marks}</span>
                    </td>
                    <td style={{ width: 120 }}>
                      <div className="marks-bar">
                        <div className="marks-fill" style={{ width: `${g.marks}%`, background: marksColor(g.marks) }} />
                      </div>
                    </td>
                    <td><span className={gradeBadgeClass(gr)}>{gr}</span></td>
                    <td style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--indigo)' }}>{gpts}</td>
                    <td><span className="badge badge-violet">Sem {g.semester}</span></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: 'rgba(99,102,241,0.05)', borderTop: '2px solid rgba(99,102,241,0.2)' }}>
                <td colSpan={2} style={{ padding: '14px 16px', fontFamily: 'var(--font-head)', fontWeight: 700, letterSpacing: 2, fontSize: 11, color: 'var(--text2)' }}>AGGREGATE RESULT</td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--violet)' }}>{totalCredits} Cr</td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 16, color: marksColor(avg) }}>{avg}%</td>
                <td style={{ padding: '14px 16px' }}>
                  <div className="marks-bar">
                    <div className="marks-fill" style={{ width: `${avg}%`, background: marksColor(avg) }} />
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}><span className={gradeBadgeClass(overall)}>{overall}</span></td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 16, color: 'var(--indigo)' }}>{gpa}</td>
                <td />
              </tr>
            </tfoot>
          </table>

          {/* Summary footer */}
          <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border2)', display: 'flex', gap: 24, fontSize: 11, color: 'var(--text2)' }}>
            <span>Subjects Passed: <strong style={{ color: 'var(--emerald)' }}>{studentGrades.filter(g => g.marks >= 40).length}</strong></span>
            <span>Subjects Failed: <strong style={{ color: 'var(--rose)' }}>{studentGrades.filter(g => g.marks < 40).length}</strong></span>
            <span>Highest: <strong style={{ color: 'var(--indigo)' }}>{Math.max(...studentGrades.map(g => g.marks))}%</strong></span>
            <span>Lowest: <strong style={{ color: 'var(--amber)' }}>{Math.min(...studentGrades.map(g => g.marks))}%</strong></span>
          </div>
        </div>
      )}
    </>
  );
}
