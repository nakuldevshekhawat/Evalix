import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { DEPTS } from '../utils';

const BLANK = { code: '', name: '', credits: 4, dept: 'Computer Science' };

export default function Courses() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/courses').then(r => setCourses(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(BLANK); setEditId(null); setError(''); setModal(true); };
  const openEdit = (c) => { setForm({ code: c.code, name: c.name, credits: c.credits, dept: c.dept }); setEditId(c.id); setError(''); setModal(true); };

  const save = async () => {
    if (!form.code || !form.name) { setError('Code and name required'); return; }
    try {
      if (editId) await api.put(`/courses/${editId}`, form);
      else await api.post('/courses', form);
      setModal(false); load();
    } catch (e) { setError(e.response?.data?.error || 'Error'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this course?')) return;
    await api.delete(`/courses/${id}`); load();
  };

  return (
    <>
      <div className="page-header">
        <div><div className="page-title">Courses</div><div className="page-sub">Manage course catalogue</div></div>
        {isAdmin && <button className="btn btn-sm" onClick={openAdd}>+ Add Course</button>}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Code</th><th>Course Name</th><th>Credits</th><th>Department</th>{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id}>
                <td><span className="badge badge-purple">{c.code}</span></td>
                <td>{c.name}</td>
                <td>{c.credits}</td>
                <td>{c.dept}</td>
                {isAdmin && (
                  <td className="action-btns">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(c.id)}>Del</button>
                  </td>
                )}
              </tr>
            ))}
            {!courses.length && <tr><td colSpan={isAdmin ? 5 : 4} className="empty-state">No courses</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} title={editId ? 'Edit Course' : 'Add Course'} onClose={() => setModal(false)} onSave={save}>
        <div className="form-row">
          <div className="field"><label>Course Code</label><input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="CS301" /></div>
          <div className="field"><label>Course Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Data Structures" /></div>
        </div>
        <div className="form-row">
          <div className="field"><label>Credits</label><input type="number" min="1" max="6" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: +e.target.value }))} /></div>
          <div className="field"><label>Department</label>
            <select value={form.dept} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))}>
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        {error && <div className="error-msg">{error}</div>}
      </Modal>
    </>
  );
}
