import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'FACULTY' });
  const [error, setError] = useState('');

  const load = () => api.get('/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.username || !form.password) { setError('Username and password required'); return; }
    try {
      await api.post('/users', form);
      setModal(false); load();
    } catch (e) { setError(e.response?.data?.error || 'Error'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`); load();
  };

  return (
    <>
      <div className="page-header">
        <div><div className="page-title">Users</div><div className="page-sub">Manage system access</div></div>
        <button className="btn btn-sm" onClick={() => { setForm({ username: '', password: '', role: 'FACULTY' }); setError(''); setModal(true); }}>+ Add User</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Username</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-orange' : 'badge-green'}`}>{u.role}</span></td>
                <td>
                  {u.username !== 'admin'
                    ? <button className="btn btn-danger btn-sm" onClick={() => del(u.id)}>Delete</button>
                    : <span style={{ fontSize: 11, color: 'var(--muted)' }}>Protected</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} title="Add User" onClose={() => setModal(false)} onSave={save}>
        <div className="field"><label>Username</label><input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="faculty2" /></div>
        <div className="field"><label>Password</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" /></div>
        <div className="field"><label>Role</label>
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="FACULTY">Faculty</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        {error && <div className="error-msg">{error}</div>}
      </Modal>
    </>
  );
}
