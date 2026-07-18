import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import Modal from '../components/Modal';
import SkeletonLoader from '../components/SkeletonLoader';
import { DEPTS } from '../utils';

const BLANK = { code: '', name: '', credits: 4, dept: 'Computer Science' };
const DEPT_COLORS = {
  'Computer Science': 'badge-indigo',
  'Electronics': 'badge-cyan',
  'Mechanical': 'badge-amber',
  'Civil': 'badge-emerald',
  'Mathematics': 'badge-violet',
  'Physics': 'badge-sky',
  'Chemistry': 'badge-rose',
};

export default function Courses() {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const isAdmin = user?.role === 'ADMIN';

  const [courses, setCourses]   = useState([]);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(BLANK);
  const [editId, setEditId]     = useState(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [view, setView]         = useState('cards');

  const load = () => api.get('/courses').then(r => setCourses(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = courses.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()) || c.dept.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(BLANK); setEditId(null); setError(''); setModal(true); };
  const openEdit = (c) => { setForm({ code: c.code, name: c.name, credits: c.credits, dept: c.dept }); setEditId(c.id); setError(''); setModal(true); };

  const save = async () => {
    if (!form.code || !form.name) { setError('Course code and name are required'); return; }
    try {
      if (editId) {
        await api.put(`/courses/${editId}`, form);
        toast.success('Course updated!');
      } else {
        await api.post('/courses', form);
        toast.success(`Course ${form.code} added!`);
      }
      setModal(false); load();
    } catch (e) { setError(e.response?.data?.error || 'Error'); }
  };

  const del = async (id, name) => {
    const ok = await confirm(`Delete course "${name}"? All associated grades will also be deleted.`, 'Delete Course?');
    if (!ok) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return (
    <>
      <div className="page-header"><div><div className="page-title">Courses</div><div className="page-sub">Loading...</div></div></div>
      <div className="table-wrap"><SkeletonLoader rows={5} cols={4} /></div>
    </>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Courses</div>
          <div className="page-sub">{filtered.length} courses in catalogue</div>
        </div>
        <div className="page-actions">
          <div className="view-toggle">
            <button className={`view-btn ${view === 'cards' ? 'active' : ''}`} onClick={() => setView('cards')}>⊞</button>
            <button className={`view-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')}>☰</button>
          </div>
          {isAdmin && <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Course</button>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input className="search-bar" placeholder="🔍  Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Cards View */}
      {view === 'cards' && (
        <div className="courses-grid">
          {filtered.map(c => (
            <div key={c.id} className="course-card">
              <div className="course-card-top">
                <div>
                  <span className={`badge ${DEPT_COLORS[c.dept] || 'badge-indigo'}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{c.code}</span>
                </div>
                {isAdmin && (
                  <div className="action-btns">
                    <button className="btn btn-ghost btn-xs" onClick={() => openEdit(c)}>Edit</button>
                    <button className="btn btn-danger btn-xs" onClick={() => del(c.id, c.name)}>×</button>
                  </div>
                )}
              </div>
              <div className="course-name">{c.name}</div>
              <div className="course-meta">
                <span className={`badge ${DEPT_COLORS[c.dept] || 'badge-indigo'}`}>{c.dept.split(' ')[0]}</span>
              </div>
              <div className="course-card-footer">
                <span className="badge badge-violet">⊗ {c.credits} Credits</span>
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>
                  {c.enrolled ?? 0} grade entries
                </span>
              </div>
            </div>
          ))}
          {!filtered.length && (
            <div className="empty-state" style={{ gridColumn: '1/-1', background: 'var(--surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border2)', padding: 60 }}>
              <div className="empty-state-icon">📚</div>
              <div>No courses found</div>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Code</th><th>Course Name</th><th>Credits</th><th>Department</th><th>Enrolled</th>
              {isAdmin && <th>Actions</th>}
            </tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><span className="badge badge-indigo" style={{ fontFamily: 'var(--font-mono)' }}>{c.code}</span></td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td><span className="badge badge-violet">{c.credits} cr</span></td>
                  <td><span className={`badge ${DEPT_COLORS[c.dept] || 'badge-indigo'}`}>{c.dept.split(' ')[0]}</span></td>
                  <td style={{ color: 'var(--text2)', fontSize: 12 }}>{c.enrolled ?? 0} entries</td>
                  {isAdmin && (
                    <td className="action-btns">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(c.id, c.name)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} className="empty-state">No courses found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} title={editId ? 'Edit Course' : 'Add New Course'} onClose={() => setModal(false)} onSave={save}>
        <div className="form-row">
          <div className="field"><label>Course Code</label><input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="CS301" /></div>
          <div className="field"><label>Credits</label><input type="number" min="1" max="6" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: +e.target.value }))} /></div>
        </div>
        <div className="field"><label>Course Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Data Structures and Algorithms" /></div>
        <div className="field"><label>Department</label>
          <select value={form.dept} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))}>
            {DEPTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        {error && <div className="error-msg">{error}</div>}
      </Modal>
    </>
  );
}
