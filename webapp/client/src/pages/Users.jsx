import { useEffect, useState } from 'react';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';
import SkeletonLoader from '../components/SkeletonLoader';

const BLANK = { username: '', password: '', role: 'FACULTY', fullName: '', email: '' };

export default function Users() {
  const toast = useToast();
  const confirm = useConfirm();

  const [users, setUsers]       = useState([]);
  const [modal, setModal]       = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [form, setForm]         = useState(BLANK);
  const [editForm, setEditForm] = useState({});
  const [editId, setEditId]     = useState(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);

  const load = () => api.get('/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.username || !form.password) { setError('Username and password required'); return; }
    try {
      await api.post('/users', form);
      toast.success(`User ${form.username} created!`);
      setModal(false); setForm(BLANK); load();
    } catch (e) { setError(e.response?.data?.error || 'Error'); }
  };

  const saveEdit = async () => {
    try {
      await api.put(`/users/${editId}`, editForm);
      toast.success('User updated!');
      setEditModal(false); load();
    } catch (e) { setError(e.response?.data?.error || 'Error'); }
  };

  const openEdit = (u) => {
    setEditId(u.id);
    setEditForm({ fullName: u.fullName || '', email: u.email || '', role: u.role });
    setError('');
    setEditModal(true);
  };

  const del = async (id, username) => {
    const ok = await confirm(`Delete user "${username}"? They will lose all access.`, 'Delete User?');
    if (!ok) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      load();
    } catch (e) { toast.error(e.response?.data?.error || 'Delete failed'); }
  };

  if (loading) return (
    <>
      <div className="page-header"><div><div className="page-title">Users</div><div className="page-sub">Loading...</div></div></div>
      <div className="table-wrap"><SkeletonLoader rows={3} cols={4} /></div>
    </>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-sub">Manage system access and roles</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm(BLANK); setError(''); setModal(true); }}>+ Add User</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div className="card" style={{ flex: 1, padding: 0 }}>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>◎</div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700 }}>{users.filter(u => u.role === 'ADMIN').length}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>Administrators</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ flex: 1, padding: 0 }}>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>◉</div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700 }}>{users.filter(u => u.role === 'FACULTY').length}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>Faculty Members</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ flex: 1, padding: 0 }}>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>◈</div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700 }}>{users.length}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>Total Users</div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-header">
          <div className="table-title">System Users</div>
        </div>
        <table>
          <thead><tr><th>User</th><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={u.fullName || u.username} size={36} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-head)' }}>{u.fullName || u.username}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>ID: {u.id}</div>
                    </div>
                  </div>
                </td>
                <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>@{u.username}</span></td>
                <td style={{ color: 'var(--text2)', fontSize: 12 }}>{u.email || '—'}</td>
                <td>
                  <span className={`badge ${u.role === 'ADMIN' ? 'badge-amber' : 'badge-violet'}`}>
                    {u.role === 'ADMIN' ? '⚡ ADMIN' : '◎ FACULTY'}
                  </span>
                </td>
                <td className="action-btns">
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>Edit</button>
                  {u.username !== 'admin'
                    ? <button className="btn btn-danger btn-sm" onClick={() => del(u.id, u.username)}>Delete</button>
                    : <span style={{ fontSize: 11, color: 'var(--muted)', padding: '0 8px' }}>Protected</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Modal open={modal} title="Add New User" onClose={() => setModal(false)} onSave={save}>
        <div className="form-row">
          <div className="field"><label>Full Name</label><input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Dr. Jane Doe" /></div>
          <div className="field"><label>Email</label><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@srms.edu" /></div>
        </div>
        <div className="form-row">
          <div className="field"><label>Username</label><input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="faculty2" /></div>
          <div className="field"><label>Password</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="min 6 chars" /></div>
        </div>
        <div className="field"><label>Role</label>
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="FACULTY">Faculty</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        {error && <div className="error-msg">{error}</div>}
      </Modal>

      {/* Edit User Modal */}
      <Modal open={editModal} title="Edit User" onClose={() => setEditModal(false)} onSave={saveEdit}>
        <div className="field"><label>Full Name</label><input value={editForm.fullName || ''} onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))} /></div>
        <div className="field"><label>Email</label><input value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></div>
        <div className="field"><label>Role</label>
          <select value={editForm.role || 'FACULTY'} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
            <option value="FACULTY">Faculty</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        {error && <div className="error-msg">{error}</div>}
      </Modal>
    </>
  );
}
