import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';
import { initializeSocket, getSocket } from './utils/socket';
import { playNotificationSound } from './utils/notificationSound';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Items from './pages/Items';
import ItemDetail from './pages/ItemDetail';
import CreateItem from './pages/CreateItem';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Custodians from './pages/Custodians';
import Admin from './pages/Admin';
import MyRequests from './pages/MyRequests';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  // Load notifications from localStorage on mount
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [toastNotifications, setToastNotifications] = useState([]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      initializeSocket(user.id);
      
      const socket = getSocket();
      if (socket) {
        // Listen for new items
        socket.on('new_item', (itemData) => {
          // Don't show notification if it's the current user's item
          if (itemData.owner_name !== user.full_name) {
            const notificationData = { ...itemData, timestamp: Date.now() };
            
            // Add to persistent notifications list (for dropdown)
            setNotifications(prev => {
              // Avoid duplicates
              const exists = prev.some(n => n.id === notificationData.id && n.timestamp === notificationData.timestamp);
              if (exists) return prev;
              // Keep only last 50 notifications
              const updated = [notificationData, ...prev];
              return updated.slice(0, 50);
            });
            
            // Add to toast notifications list (temporary)
            setToastNotifications(prev => [notificationData, ...prev]);
            
            // Play notification sound
            playNotificationSound();
          }
        });

        // Listen for item deletions
        socket.on('item_deleted', (data) => {
          const deletedItemId = data.id;
          
          // Remove from persistent notifications
          setNotifications(prev => prev.filter(n => n.id !== deletedItemId));
          
          // Remove from toast notifications
          setToastNotifications(prev => prev.filter(n => n.id !== deletedItemId));
        });
      }
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('new_item');
        socket.off('item_deleted');
      }
    };
  }, []);

  const removeToastNotification = (timestamp) => {
    setToastNotifications(prev => prev.filter(n => n.timestamp !== timestamp));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar 
          notifications={notifications} 
          onClearAllNotifications={clearAllNotifications}
        />
        
        {/* Toast Notification Container - Fixed at top right */}
        <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
          {toastNotifications.map((notification) => (
            <NotificationToast
              key={notification.timestamp}
              notification={notification}
              onClose={() => removeToastNotification(notification.timestamp)}
            />
          ))}
        </div>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/items" element={<Items />} />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/create-item" element={<PrivateRoute><CreateItem /></PrivateRoute>} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
            <Route path="/custodians" element={<Custodians />} />
            <Route path="/my-requests" element={<PrivateRoute><MyRequests /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
