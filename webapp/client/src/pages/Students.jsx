import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { DEPTS, SEMESTERS } from '../utils';

const BLANK = { roll: '', name: '', dept: 'Computer Science', semester: 1, email: '' };

export default function Students() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/students').then(r => setStudents(r.data));
  useEffect(() => { load(); }, []);

  const filtered = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(BLANK); setEditId(null); setError(''); setModal(true); };
  const openEdit = (s) => { setForm({ roll: s.roll, name: s.name, dept: s.dept, semester: s.semester, email: s.email }); setEditId(s.id); setError(''); setModal(true); };

  const save = async () => {
    if (!form.roll || !form.name) { setError('Roll number and name are required'); return; }
    try {
      if (editId) await api.put(`/students/${editId}`, form);
      else await api.post('/students', form);
      setModal(false); load();
    } catch (e) { setError(e.response?.data?.error || 'Error saving'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this student and all their grades?')) return;
    await api.delete(`/students/${id}`); load();
  };

  return (
    <>
      <div className="page-header">
        <div><div className="page-title">Students</div><div className="page-sub">Manage student records</div></div>
        {isAdmin && <button className="btn btn-sm" onClick={openAdd}>+ Add Student</button>}
      </div>
      <div className="table-wrap">
        <div className="table-header">
          <div className="table-title">All Students ({filtered.length})</div>
          <input className="search-bar" placeholder="Search name or roll no..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <table>
          <thead><tr><th>Roll No</th><th>Name</th><th>Department</th><th>Semester</th><th>Email</th>{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td><span className="badge badge-purple">{s.roll}</span></td>
                <td>{s.name}</td>
                <td>{s.dept}</td>
                <td><span className="badge badge-orange">Sem {s.semester}</span></td>
                <td style={{ color: 'var(--muted)' }}>{s.email}</td>
                {isAdmin && (
                  <td className="action-btns">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(s.id)}>Del</button>
                  </td>
                )}
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={isAdmin ? 6 : 5} className="empty-state">No students found</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modal} title={editId ? 'Edit Student' : 'Add Student'} onClose={() => setModal(false)} onSave={save}>
        <div className="form-row">
          <div className="field"><label>Roll Number</label><input value={form.roll} onChange={e => setForm(f => ({ ...f, roll: e.target.value }))} placeholder="CS2024001" /></div>
          <div className="field"><label>Full Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" /></div>
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
        <div className="field"><label>Email</label><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="student@example.com" /></div>
        {error && <div className="error-msg">{error}</div>}
      </Modal>
    </>
  );
}
