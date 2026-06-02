import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { calcGrade, gradeBadgeClass, SEMESTERS } from '../utils';

const BLANK = { studentId: '', courseId: '', marks: '', semester: 1 };

export default function Grades() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = () => Promise.all([
    api.get('/grades').then(r => setGrades(r.data)),
    api.get('/students').then(r => setStudents(r.data)),
    api.get('/courses').then(r => setCourses(r.data)),
  ]);
  useEffect(() => { load(); }, []);

  const getName = (id) => students.find(s => s.id === id)?.name || '?';
  const getCourse = (id) => courses.find(c => c.id === id);

  const openAdd = () => {
    setForm({ ...BLANK, studentId: students[0]?.id || '', courseId: courses[0]?.id || '' });
    setEditId(null); setError(''); setModal(true);
  };
  const openEdit = (g) => {
    setForm({ studentId: g.studentId, courseId: g.courseId, marks: g.marks, semester: g.semester });
    setEditId(g.id); setError(''); setModal(true);
  };

  const save = async () => {
    const m = Number(form.marks);
    if (isNaN(m) || m < 0 || m > 100) { setError('Marks must be 0–100'); return; }
    try {
      if (editId) await api.put(`/grades/${editId}`, { ...form, marks: m });
      else await api.post('/grades', { ...form, marks: m });
      setModal(false); load();
    } catch (e) { setError(e.response?.data?.error || 'Error'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this grade?')) return;
    await api.delete(`/grades/${id}`); load();
  };

  return (
    <>
      <div className="page-header">
        <div><div className="page-title">Record Grades</div><div className="page-sub">Enter or update student marks</div></div>
        <button className="btn btn-sm" onClick={openAdd}>+ Add Grade</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Student</th><th>Course</th><th>Marks</th><th>Grade</th><th>Semester</th><th>Actions</th></tr></thead>
          <tbody>
            {grades.map(g => {
              const gr = calcGrade(g.marks);
              const c = getCourse(g.courseId);
              return (
                <tr key={g.id}>
                  <td>{getName(g.studentId)}</td>
                  <td>{c?.name || '?'}</td>
                  <td style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{g.marks}</td>
                  <td><span className={gradeBadgeClass(gr)}>{gr}</span></td>
                  <td><span className="badge badge-purple">Sem {g.semester}</span></td>
                  <td className="action-btns">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(g)}>Edit</button>
                    {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => del(g.id)}>Del</button>}
                  </td>
                </tr>
              );
            })}
            {!grades.length && <tr><td colSpan={6} className="empty-state">No grades recorded</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} title={editId ? 'Edit Grade' : 'Record Grade'} onClose={() => setModal(false)} onSave={save}>
        <div className="field"><label>Student</label>
          <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll})</option>)}
          </select>
        </div>
        <div className="field"><label>Course</label>
          <select value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="field"><label>Marks (0–100)</label><input type="number" min="0" max="100" value={form.marks} onChange={e => setForm(f => ({ ...f, marks: e.target.value }))} placeholder="75" /></div>
          <div className="field"><label>Semester</label>
            <select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: +e.target.value }))}>
              {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
        </div>
        {error && <div className="error-msg">{error}</div>}
      </Modal>
    </>
  );
}
