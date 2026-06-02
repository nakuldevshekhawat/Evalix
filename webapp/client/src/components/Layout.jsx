import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminNav = [
  { to: '/students', label: 'Students', icon: '◉' },
  { to: '/courses', label: 'Courses', icon: '◈' },
  { to: '/users', label: 'Users', icon: '◎' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="brand">SRMS<span>.</span></div>
          <div className={`role-badge ${user?.role === 'FACULTY' ? 'faculty' : ''}`}>{user?.role}</div>
        </div>
        <div className="topbar-right">
          <span>{user?.username}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="app-body">
        <div className="sidebar">
          <div className="nav-section">
            <div className="nav-label">Overview</div>
            <NavLink className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to="/" end>
              <span>◈</span> Dashboard
            </NavLink>
          </div>
          {user?.role === 'ADMIN' && (
            <div className="nav-section">
              <div className="nav-label">Manage</div>
              {adminNav.map(n => (
                <NavLink key={n.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to={n.to}>
                  <span>{n.icon}</span> {n.label}
                </NavLink>
              ))}
            </div>
          )}
          <div className="nav-section">
            <div className="nav-label">Grades</div>
            <NavLink className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to="/grades">
              <span>◆</span> Record Grades
            </NavLink>
            <NavLink className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} to="/results">
              <span>◇</span> Result Cards
            </NavLink>
          </div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
