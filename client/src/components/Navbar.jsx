import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-dark-900/80 backdrop-blur-xl border-b border-dark-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center cursor-pointer hover:opacity-80 transition group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-primary-500/25 transition-shadow">
                <span className="text-white font-bold text-lg">📹</span>
              </div>
              <span className="text-white font-bold text-xl hidden sm:inline">
                UniMeet
              </span>
            </button>
          </div>

          {/* User info and logout */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 bg-dark-800/50 px-3 py-1.5 rounded-xl border border-dark-700">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full border border-dark-600"
                />
                <span className="text-dark-200 text-sm font-medium">
                  {user.displayName}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="secondary"
                size="sm"
                className="bg-dark-700 hover:bg-dark-600 text-dark-200 border-dark-600"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
