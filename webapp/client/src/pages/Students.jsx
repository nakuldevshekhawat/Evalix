import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';
import SkeletonLoader from '../components/SkeletonLoader';
import { DEPTS, SEMESTERS, calcGrade, gradeBadgeClass, calcGpa, marksColor } from '../utils';

const BLANK = { roll: '', name: '', dept: 'Computer Science', semester: 1, email: '', phone: '', status: 'active' };

export default function Students() {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const isAdmin = user?.role === 'ADMIN';

  const [students, setStudents]   = useState([]);
  const [grades, setGrades]       = useState([]);
  const [courses, setCourses]     = useState([]);
  const [search, setSearch]       = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [semFilter, setSemFilter] = useState('All');
  const [view, setView]           = useState('table'); // 'table' | 'cards'
  const [modal, setModal]         = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [detailStudent, setDetailStudent] = useState(null);
  const [form, setForm]           = useState(BLANK);
  const [editId, setEditId]       = useState(null);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(true);

  const load = () => Promise.all([
    api.get('/students').then(r => setStudents(r.data)),
    api.get('/grades').then(r => setGrades(r.data)),
    api.get('/courses').then(r => setCourses(r.data)),
  ]).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const depts = ['All', ...new Set(students.map(s => s.dept))];
  const sems  = ['All', ...new Set(students.map(s => s.semester)).values()].sort();

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q);
    const matchDept = deptFilter === 'All' || s.dept === deptFilter;
    const matchSem  = semFilter === 'All' || String(s.semester) === String(semFilter);
    return matchSearch && matchDept && matchSem;
  });

  const openAdd = () => { setForm(BLANK); setEditId(null); setError(''); setModal(true); };
  const openEdit = (s) => { setForm({ roll: s.roll, name: s.name, dept: s.dept, semester: s.semester, email: s.email || '', phone: s.phone || '', status: s.status || 'active' }); setEditId(s.id); setError(''); setModal(true); };
  const openDetail = (s) => { setDetailStudent(s); setDetailModal(true); };

  const save = async () => {
    if (!form.roll || !form.name) { setError('Roll number and name are required'); return; }
    try {
      if (editId) {
        await api.put(`/students/${editId}`, form);
        toast.success('Student updated successfully!');
      } else {
        await api.post('/students', form);
        toast.success(`Student ${form.name} added!`);
      }
      setModal(false); load();
    } catch (e) { setError(e.response?.data?.error || 'Error saving'); }
  };

  const del = async (id, name) => {
    const ok = await confirm(`This will permanently delete ${name} and all their grade records. This cannot be undone.`, 'Delete Student?');
    if (!ok) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success(`${name} removed successfully`);
      load();
    } catch { toast.error('Failed to delete student'); }
  };

  const getStudentStats = (sId) => {
    const sg = grades.filter(g => g.studentId === sId);
    if (!sg.length) return { avg: null, gpa: null, subjects: 0 };
    const avg = Math.round(sg.reduce((a, g) => a + g.marks, 0) / sg.length);
    const gpa = calcGpa(sg);
    return { avg, gpa, subjects: sg.length };
  };

  const studentGrades = detailStudent ? grades.filter(g => g.studentId === detailStudent.id) : [];
  const detailStats = detailStudent ? getStudentStats(detailStudent.id) : {};

  if (loading) return (
    <>
      <div className="page-header"><div><div className="page-title">Students</div><div className="page-sub">Loading...</div></div></div>
      <div className="table-wrap"><SkeletonLoader rows={6} cols={5} /></div>
    </>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Students</div>
          <div className="page-sub">{filtered.length} of {students.length} students</div>
        </div>
        <div className="page-actions">
          <div className="view-toggle">
            <button className={`view-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')} title="Table view">☰</button>
            <button className={`view-btn ${view === 'cards' ? 'active' : ''}`} onClick={() => setView('cards')} title="Card view">⊞</button>
          </div>
          {isAdmin && <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Student</button>}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="search-bar" placeholder="🔍  Search name, roll, email..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="filter-pills">
          {depts.map(d => (
            <button key={d} className={`pill ${deptFilter === d ? 'active' : ''}`} onClick={() => setDeptFilter(d)}>
              {d === 'All' ? 'All Depts' : d.split(' ')[0]}
            </button>
          ))}
        </div>
        <select className="search-bar" style={{ width: 'auto' }} value={semFilter} onChange={e => setSemFilter(e.target.value)}>
          <option value="All">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>

      {/* Table View */}
      {view === 'table' && (
        <div className="table-wrap">
          <div className="table-header">
            <div className="table-title">All Students ({filtered.length})</div>
          </div>
          <table>
            <thead><tr>
              <th>Student</th><th>Roll No</th><th>Department</th><th>Semester</th><th>Performance</th><th>Status</th>
              {isAdmin && <th>Actions</th>}
            </tr></thead>
            <tbody>
              {filtered.map(s => {
                const st = getStudentStats(s.id);
                return (
                  <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(s)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={s.name} size={32} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-head)' }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text2)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-indigo" style={{ fontFamily: 'var(--font-mono)' }}>{s.roll}</span></td>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>{s.dept}</td>
                    <td><span className="badge badge-violet">Sem {s.semester}</span></td>
                    <td>
                      {st.avg !== null ? (
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: marksColor(st.avg) }}>{st.avg}% <span style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 400 }}>GPA {st.gpa}</span></div>
                          <div className="marks-bar" style={{ width: 80 }}>
                            <div className="marks-fill" style={{ width: `${st.avg}%`, background: marksColor(st.avg) }} />
                          </div>
                        </div>
                      ) : <span style={{ color: 'var(--muted)', fontSize: 11 }}>No grades</span>}
                    </td>
                    <td>
                      <span className={`badge ${s.status === 'active' ? 'badge-emerald' : 'badge-rose'}`}>
                        {s.status || 'active'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="action-btns" onClick={e => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(s.id, s.name)}>Delete</button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr><td colSpan={7} className="empty-state">
                  <div className="empty-state-icon">🎓</div>
                  <div>No students match your filters</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards View */}
      {view === 'cards' && (
        <div className="students-grid">
          {filtered.map(s => {
            const st = getStudentStats(s.id);
            return (
              <div key={s.id} className="student-card" onClick={() => openDetail(s)}>
                <div className="student-card-top">
                  <Avatar name={s.name} size={44} />
                  <div className="student-card-info">
                    <div className="student-card-name">{s.name}</div>
                    <div className="student-card-roll">{s.roll}</div>
                  </div>
                  {st.avg !== null && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 18, color: marksColor(st.avg) }}>{st.avg}%</div>
                      <div style={{ fontSize: 10, color: 'var(--text2)' }}>GPA {st.gpa}</div>
                    </div>
                  )}
                </div>
                <div className="student-card-meta">
                  <span className="badge badge-violet">{s.dept.split(' ')[0]}</span>
                  <span className="badge badge-indigo">Sem {s.semester}</span>
                  <span className={`badge ${s.status === 'active' ? 'badge-emerald' : 'badge-rose'}`}>{s.status || 'active'}</span>
                </div>
                {st.avg !== null && (
                  <div className="marks-bar" style={{ marginTop: 14 }}>
                    <div className="marks-fill" style={{ width: `${st.avg}%`, background: marksColor(st.avg) }} />
                  </div>
                )}
                {isAdmin && (
                  <div className="student-card-actions" onClick={e => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(s.id, s.name)}>Delete</button>
                  </div>
                )}
              </div>
            );
          })}
          {!filtered.length && <div className="empty-state" style={{ gridColumn: '1/-1', background: 'var(--surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border2)', padding: 60 }}>No students found</div>}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modal} title={editId ? 'Edit Student' : 'Add New Student'} onClose={() => setModal(false)} onSave={save}>
        <div className="form-row">
          <div className="field"><label>Roll Number</label><input value={form.roll} onChange={e => setForm(f => ({ ...f, roll: e.target.value }))} placeholder="CS2024001" /></div>
          <div className="field"><label>Full Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Student Name" /></div>
        </div>
        <div className="form-row">
          <div className="field"><label>Department</label>
            <select value={form.dept} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))}>
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field"><label>Semester</label>
            <select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: +e.target.value }))}>
              {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="field"><label>Email</label><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="student@example.com" /></div>
          <div className="field"><label>Phone</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="9876543210" /></div>
        </div>
        <div className="field"><label>Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
          </select>
        </div>
        {error && <div className="error-msg">{error}</div>}
      </Modal>

      {/* Student Detail Modal */}
      {detailStudent && (
        <Modal open={detailModal} title="Student Profile" onClose={() => setDetailModal(false)} onSave={() => setDetailModal(false)} saveLabel="Close">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '0 0 20px', borderBottom: '1px solid var(--border2)' }}>
            <Avatar name={detailStudent.name} size={56} />
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 18 }}>{detailStudent.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{detailStudent.roll} · {detailStudent.dept}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <span className="badge badge-violet">Sem {detailStudent.semester}</span>
                <span className={`badge ${detailStudent.status === 'active' ? 'badge-emerald' : 'badge-rose'}`}>{detailStudent.status}</span>
                {detailStats.avg !== null && <span className="badge badge-indigo">Avg {detailStats.avg}%</span>}
              </div>
            </div>
            {detailStats.gpa !== null && (
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 700, color: 'var(--indigo)' }}>{detailStats.gpa}</div>
                <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: 1 }}>GPA / 10</div>
              </div>
            )}
          </div>
          {studentGrades.length > 0 ? (
            <table>
              <thead><tr><th>Course</th><th>Marks</th><th>Grade</th><th>Sem</th></tr></thead>
              <tbody>
                {studentGrades.map(g => {
                  const c = courses.find(x => x.id === g.courseId);
                  const gr = calcGrade(g.marks);
                  return (
                    <tr key={g.id}>
                      <td><div style={{ fontWeight: 600 }}>{c?.name || '?'}</div><div style={{ fontSize: 10, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>{c?.code}</div></td>
                      <td>
                        <div style={{ fontWeight: 700, color: marksColor(g.marks) }}>{g.marks}</div>
                        <div className="marks-bar" style={{ width: 60, marginTop: 4 }}>
                          <div className="marks-fill" style={{ width: `${g.marks}%`, background: marksColor(g.marks) }} />
                        </div>
                      </td>
                      <td><span className={gradeBadgeClass(gr)}>{gr}</span></td>
                      <td><span className="badge badge-violet">Sem {g.semester}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : <div className="empty-state">No grades recorded for this student</div>}
        </Modal>
      )}
    </>
  );
}
