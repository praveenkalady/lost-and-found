import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function NotificationToast({ notification, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const showTimer = setTimeout(() => setVisible(true), 100);
    
    // Auto-dismiss after 10 seconds
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 600); // Allow fade animation to complete
    }, 10000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 500);
  };

  const statusColors = {
    lost: 'text-red-600',
    found: 'text-green-600'
  };

  const bgColor = notification.status === 'lost' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const iconBg = notification.status === 'lost' ? 'bg-red-100' : 'bg-green-100';
  const iconColor = notification.status === 'lost' ? 'text-red-600' : 'text-green-600';

  return (
    <div
      className={`transition-all duration-500 ease-out transform ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div className={`bg-white rounded-lg shadow-lg border-2 ${bgColor} p-4 w-96 mb-3`}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconBg} ${iconColor}`}>
            {notification.status === 'lost' ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 mb-1">
              🔔 New {notification.status === 'lost' ? 'Lost' : 'Found'} Item
            </p>
            <p className={`text-base font-semibold ${statusColors[notification.status]} mb-2`}>
              {notification.title}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <span className="bg-gray-100 px-2 py-1 rounded font-medium">{notification.category}</span>
              <span>📍 {notification.location}</span>
            </div>
            <Link
              to={`/items/${notification.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all"
              onClick={handleClose}
            >
              View Details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Close button */}
          <button
            type="button"
            className="flex-shrink-0 text-gray-400 hover:text-gray-900 transition-colors"
            onClick={handleClose}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationToast;
