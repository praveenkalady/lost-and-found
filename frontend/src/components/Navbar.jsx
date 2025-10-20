import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'flowbite-react';
import NotificationDropdown from './NotificationDropdown';

function Navbar({ notifications = [], onClearAllNotifications }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-white text-xl font-bold">
            UFoundIt
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/items" className="text-white hover:text-gray-300">
              Browse Items
            </Link>
            <Link to="/search" className="text-white hover:text-gray-300">
              Search
            </Link>
            <Link to="/custodians" className="text-white hover:text-gray-300">
              Drop-off Locations
            </Link>

            {user ? (
              <>
                <Link to="/create-item">
                  <Button color="light" size="sm">
                    Report Item
                  </Button>
                </Link>
                <NotificationDropdown 
                  notifications={notifications} 
                  onClearAll={onClearAllNotifications}
                />
                <Link to="/messages" className="text-white hover:text-gray-300">
                  Messages
                </Link>
                <Link to="/my-requests" className="text-white hover:text-gray-300">
                  My Requests
                </Link>
                <Link to="/profile" className="text-white hover:text-gray-300">
                  Profile
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-white hover:text-gray-300">
                    Admin
                  </Link>
                )}
                <Button color="light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button color="light" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button color="dark" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
