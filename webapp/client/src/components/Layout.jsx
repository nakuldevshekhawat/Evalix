import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import Avatar from './Avatar';
import Modal from './Modal';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⬡', end: true },
];
const adminNav = [
  { to: '/students', label: 'Students',  icon: '◉' },
  { to: '/courses',  label: 'Courses',   icon: '◈' },
  { to: '/grades',   label: 'Grades',    icon: '◆' },
  { to: '/results',  label: 'Results',   icon: '◇' },
  { to: '/users',    label: 'Users',     icon: '◎' },
];
const facultyNav = [
  { to: '/students', label: 'Students', icon: '◉' },
  { to: '/grades',   label: 'Grades',   icon: '◆' },
  { to: '/results',  label: 'Results',  icon: '◇' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); toast.info('Logged out successfully'); };

  const savePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { setPwError('Minimum 6 characters'); return; }
    setPwLoading(true); setPwError('');
    try {
      await api.post('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwModal(false);
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed successfully!');
    } catch (e) {
      setPwError(e.response?.data?.error || 'Error changing password');
    } finally { setPwLoading(false); }
  };

  const links = user?.role === 'ADMIN' ? adminNav : facultyNav;

  return (
    <div className="layout">
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <button className="btn btn-ghost btn-sm" style={{ padding: '6px 8px', display: 'none' }}
            id="hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <div className="brand">SRMS<span className="brand-dot">.</span></div>
          <span className={`role-badge ${user?.role === 'FACULTY' ? 'faculty' : 'admin'}`}>
            {user?.role}
          </span>
        </div>
        <div className="topbar-right">
          <div className="profile-dropdown-wrap">
            <button className="profile-btn" onClick={() => setProfileOpen(o => !o)}>
              <Avatar name={user?.fullName || user?.username} size={28} />
              <span className="profile-name">{user?.fullName || user?.username}</span>
              <span style={{ fontSize: 10, color: 'var(--text2)' }}>▾</span>
            </button>
            {profileOpen && (
              <div className="profile-dropdown" onClick={() => setProfileOpen(false)}>
                <div className="profile-info">
                  <div className="profile-full">{user?.fullName || user?.username}</div>
                  <div className="profile-email">{user?.email || user?.username + '@srms.edu'}</div>
                </div>
                <button className="dropdown-item" onClick={() => { setPwModal(true); }}>
                  🔑 Change Password
                </button>
                <button className="dropdown-item danger" onClick={handleLogout}>
                  ⎋ Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="app-body">
        {/* Sidebar */}
        <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="nav-section">
            <div className="nav-label">Overview</div>
            {navItems.map(n => (
              <NavLink key={n.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to={n.to} end={n.end}>
                <span className="nav-icon">{n.icon}</span>{n.label}
              </NavLink>
            ))}
          </div>
          <div className="nav-section">
            <div className="nav-label">{user?.role === 'ADMIN' ? 'Manage' : 'Academics'}</div>
            {links.map(n => (
              <NavLink key={n.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to={n.to}>
                <span className="nav-icon">{n.icon}</span>{n.label}
              </NavLink>
            ))}
          </div>
          <div style={{ marginTop: 'auto', padding: '12px 0' }}>
            <button className="logout-btn" style={{ width: '100%' }} onClick={handleLogout}>⎋ Sign Out</button>
          </div>
        </div>

        {/* Main content */}
        <div className="content" onClick={() => { setProfileOpen(false); setSidebarOpen(false); }}>
          <Outlet />
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal open={pwModal} title="Change Password" onClose={() => setPwModal(false)} onSave={savePassword} saveLabel={pwLoading ? 'Saving...' : 'Change Password'} saveDisabled={pwLoading}>
        <div className="field">
          <label>Current Password</label>
          <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder="••••••••" />
        </div>
        <div className="field">
          <label>New Password</label>
          <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="min 6 characters" />
        </div>
        <div className="field">
          <label>Confirm New Password</label>
          <input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="••••••••" />
        </div>
        {pwError && <div className="error-msg">{pwError}</div>}
      </Modal>
    </div>
  );
}
