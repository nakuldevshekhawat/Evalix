import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import Modal from '../components/Modal';
import SkeletonLoader from '../components/SkeletonLoader';
import { calcGrade, gradeBadgeClass, marksColor, SEMESTERS } from '../utils';

const BLANK = { studentId: '', courseId: '', marks: '', semester: 1 };

export default function Grades() {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const isAdmin = user?.role === 'ADMIN';

  const [grades, setGrades]   = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(BLANK);
  const [editId, setEditId]   = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [semFilter, setSemFilter] = useState('All');
  const [inlineEdit, setInlineEdit] = useState(null); // {id, marks}
  const [liveGrade, setLiveGrade] = useState('');

  const load = () => Promise.all([
    api.get('/grades').then(r => setGrades(r.data)),
    api.get('/students').then(r => setStudents(r.data)),
    api.get('/courses').then(r => setCourses(r.data)),
  ]).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const getName = id => students.find(s => s.id === id)?.name || '?';
  const getCourse = id => courses.find(c => c.id === id);

  const filtered = grades.filter(g => {
    const sName = getName(g.studentId).toLowerCase();
    const cName = (getCourse(g.courseId)?.name || '').toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !q || sName.includes(q) || cName.includes(q);
    const matchSem = semFilter === 'All' || String(g.semester) === String(semFilter);
    return matchSearch && matchSem;
  });

  const openAdd = () => {
    setForm({ ...BLANK, studentId: students[0]?.id || '', courseId: courses[0]?.id || '' });
    setEditId(null); setError(''); setLiveGrade(''); setModal(true);
  };
  const openEdit = (g) => {
    setForm({ studentId: g.studentId, courseId: g.courseId, marks: g.marks, semester: g.semester });
    setLiveGrade(calcGrade(g.marks));
    setEditId(g.id); setError(''); setModal(true);
  };

  const handleMarksChange = (val) => {
    setForm(f => ({ ...f, marks: val }));
    const m = Number(val);
    if (!isNaN(m) && m >= 0 && m <= 100) setLiveGrade(calcGrade(m));
    else setLiveGrade('');
  };

  const save = async () => {
    const m = Number(form.marks);
    if (isNaN(m) || m < 0 || m > 100) { setError('Marks must be between 0 and 100'); return; }
    try {
      if (editId) {
        await api.put(`/grades/${editId}`, { ...form, marks: m });
        toast.success('Grade updated!');
      } else {
        await api.post('/grades', { ...form, marks: m });
        toast.success('Grade recorded!');
      }
      setModal(false); load();
    } catch (e) { setError(e.response?.data?.error || 'Error saving grade'); }
  };

  const del = async (id) => {
    const ok = await confirm('Delete this grade entry permanently?', 'Delete Grade?');
    if (!ok) return;
    try {
      await api.delete(`/grades/${id}`);
      toast.success('Grade deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  // Inline edit save
  const saveInline = async () => {
    if (!inlineEdit) return;
    const m = Number(inlineEdit.marks);
    if (isNaN(m) || m < 0 || m > 100) { toast.error('Marks must be 0–100'); return; }
    try {
      await api.put(`/grades/${inlineEdit.id}`, { marks: m });
      toast.success('Grade updated!');
      setInlineEdit(null);
      load();
    } catch { toast.error('Update failed'); }
  };

  if (loading) return (
    <>
      <div className="page-header"><div><div className="page-title">Grades</div><div className="page-sub">Loading...</div></div></div>
      <div className="table-wrap"><SkeletonLoader rows={8} cols={5} /></div>
    </>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Record Grades</div>
          <div className="page-sub">{filtered.length} grade entries</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Grade</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="search-bar" placeholder="🔍  Search student or course..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="search-bar" style={{ width: 'auto' }} value={semFilter} onChange={e => setSemFilter(e.target.value)}>
          <option value="All">All Semesters</option>
          {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text2)' }}>
          💡 Click marks to edit inline
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr>
            <th>Student</th><th>Course</th><th>Marks</th><th>Grade</th><th>Semester</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(g => {
              const gr = calcGrade(g.marks);
              const c  = getCourse(g.courseId);
              const isInline = inlineEdit?.id === g.id;
              return (
                <tr key={g.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{getName(g.studentId)}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c?.name || '?'}</div>
                    {c && <div style={{ fontSize: 10, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>{c.code}</div>}
                  </td>
                  <td>
                    {isInline ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input
                          className="inline-edit-input"
                          type="number" min="0" max="100"
                          value={inlineEdit.marks}
                          onChange={e => setInlineEdit(ie => ({ ...ie, marks: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') saveInline(); if (e.key === 'Escape') setInlineEdit(null); }}
                          autoFocus
                        />
                        <button className="btn btn-success btn-xs" onClick={saveInline}>✓</button>
                        <button className="btn btn-ghost btn-xs" onClick={() => setInlineEdit(null)}>✕</button>
                      </div>
                    ) : (
                      <div
                        style={{ cursor: 'pointer', display: 'inline-block' }}
                        onClick={() => setInlineEdit({ id: g.id, marks: g.marks })}
                        title="Click to edit"
                      >
                        <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: marksColor(g.marks) }}>{g.marks}</span>
                        <div className="marks-bar" style={{ width: 60, marginTop: 4 }}>
                          <div className="marks-fill" style={{ width: `${g.marks}%`, background: marksColor(g.marks) }} />
                        </div>
                      </div>
                    )}
                  </td>
                  <td><span className={gradeBadgeClass(gr)}>{gr}</span></td>
                  <td><span className="badge badge-violet">Sem {g.semester}</span></td>
                  <td className="action-btns">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(g)}>Edit</button>
                    {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => del(g.id)}>Delete</button>}
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr><td colSpan={6} className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div>No grades found</div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal} title={editId ? 'Edit Grade' : 'Record New Grade'} onClose={() => setModal(false)} onSave={save}>
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
          <div className="field">
            <label>Marks (0–100)</label>
            <input type="number" min="0" max="100" value={form.marks}
              onChange={e => handleMarksChange(e.target.value)} placeholder="85" />
            {liveGrade && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>Grade Preview:</span>
                <span className={gradeBadgeClass(liveGrade)}>{liveGrade}</span>
                {form.marks && (
                  <div className="marks-bar" style={{ flex: 1 }}>
                    <div className="marks-fill" style={{ width: `${form.marks}%`, background: marksColor(Number(form.marks)) }} />
                  </div>
                )}
              </div>
            )}
          </div>
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
