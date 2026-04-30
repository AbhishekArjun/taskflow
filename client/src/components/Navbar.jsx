import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          <span className="text-gradient">TaskFlow</span>
        </Link>
        <div className="nav-links">
          <span className={`badge ${user.role === 'Admin' ? 'badge-admin' : 'badge-member'}`}>
            {user.username} ({user.role})
          </span>
          <Link to="/" className="nav-link flex items-center gap-2">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link to="/projects" className="nav-link flex items-center gap-2">
            <FolderKanban size={18} />
            Projects
          </Link>
          <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2" style={{ padding: '0.5rem 1rem' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
