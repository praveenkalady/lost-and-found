import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from 'flowbite-react';
import api from '../utils/api';

function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [custodians, setCustodians] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pickupRequests, setPickupRequests] = useState([]);
  const [dropoffRequests, setDropoffRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      window.location.href = '/';
      return;
    }
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, itemsRes, custodiansRes, notificationsRes, pickupRes, dropoffRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/items'),
        api.get('/custodians'),
        api.get('/messages/notifications'),
        api.get('/custodians/admin/pickup'),
        api.get('/custodians/admin/dropoff')
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setItems(itemsRes.data.items);
      setCustodians(custodiansRes.data.custodians);
      setNotifications(notificationsRes.data.notifications || []);
      setPickupRequests(pickupRes.data.requests);
      setDropoffRequests(dropoffRes.data.requests);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/admin/items/${itemId}`);
      setItems(items.filter(i => i.id !== itemId));
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const deleteCustodian = async (custodianId) => {
    if (!window.confirm('Are you sure you want to delete this custodian?')) return;

    try {
      await api.delete(`/admin/custodians/${custodianId}`);
      setCustodians(custodians.filter(c => c.id !== custodianId));
    } catch (error) {
      alert('Failed to delete custodian');
    }
  };

  const openStatusModal = (item) => {
    setSelectedItem(item);
    setShowStatusModal(true);
  };

  const updateItemStatus = async (newStatus) => {
    if (!selectedItem) return;

    try {
      await api.put(`/items/${selectedItem.id}`, { status: newStatus });
      setItems(items.map(i => i.id === selectedItem.id ? { ...i, status: newStatus } : i));
      setShowStatusModal(false);
      setSelectedItem(null);
      
      // Show success message
      alert(`Item status updated to ${newStatus}`);
    } catch (error) {
      alert('Failed to update item status');
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await api.put(`/messages/notifications/${notificationId}/read`);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  const updatePickupRequest = async (requestId, status) => {
    try {
      await api.put(`/custodians/admin/pickup/${requestId}`, { status });
      setPickupRequests(pickupRequests.map(r => r.id === requestId ? { ...r, status } : r));
      alert(`Pickup request ${status}`);
    } catch (error) {
      alert('Failed to update pickup request');
    }
  };

  const updateDropoffRequest = async (requestId, status) => {
    try {
      await api.put(`/custodians/admin/dropoff/${requestId}`, { status });
      setDropoffRequests(dropoffRequests.map(r => r.id === requestId ? { ...r, status } : r));
      alert(`Drop-off request ${status}`);
    } catch (error) {
      alert('Failed to update drop-off request');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {notifications.length > 0 && (
          <Badge color="failure" size="lg">
            {notifications.length} New Notifications
          </Badge>
        )}
      </div>

      {/* Notifications Alert */}
      {notifications.length > 0 && (
        <Card className="mb-6 bg-yellow-50">
          <h3 className="text-lg font-bold mb-3">Recent Notifications</h3>
          <div className="space-y-2">
            {notifications.slice(0, 5).map((notif) => (
              <div key={notif.id} className="flex justify-between items-start p-3 bg-white rounded">
                <div className="flex-1">
                  <p className="font-semibold">{notif.title}</p>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
                <Button 
                  size="xs" 
                  color="light"
                  onClick={() => markNotificationRead(notif.id)}
                >
                  Dismiss
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Total Users</h3>
          <p className="text-4xl font-bold">{stats?.total_users || 0}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Total Items</h3>
          <p className="text-4xl font-bold">{stats?.total_items || 0}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Lost Items</h3>
          <p className="text-4xl font-bold text-red-600">{stats?.lost_items || 0}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Found Items</h3>
          <p className="text-4xl font-bold text-green-600">{stats?.found_items || 0}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Matched Items</h3>
          <p className="text-4xl font-bold text-blue-600">{stats?.matched_items || 0}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Total Messages</h3>
          <p className="text-4xl font-bold">{stats?.total_messages || 0}</p>
        </Card>
      </div>

      {/* Management Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'items'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Items
            </button>
            <button
              onClick={() => setActiveTab('custodians')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'custodians'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Custodians
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Requests ({pickupRequests.length + dropoffRequests.length})
            </button>
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Verified</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.id} className="bg-white hover:bg-gray-50">
                      <td className="px-6 py-4">{user.id}</td>
                      <td className="px-6 py-4 font-medium">{user.full_name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <Badge color={user.role === 'admin' ? 'failure' : 'info'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_verified ? (
                          <Badge color="success">Yes</Badge>
                        ) : (
                          <Badge color="gray">No</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {user.role !== 'admin' && (
                          <Button 
                            size="xs" 
                            color="failure"
                            onClick={() => deleteUser(user.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Owner</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Active</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => (
                    <tr key={item.id} className="bg-white hover:bg-gray-50">
                      <td className="px-6 py-4">{item.id}</td>
                      <td className="px-6 py-4 font-medium">{item.title}</td>
                      <td className="px-6 py-4">{item.category}</td>
                      <td className="px-6 py-4">
                        <Badge color={item.status === 'lost' ? 'failure' : 'success'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">{item.owner_name}</td>
                      <td className="px-6 py-4">{item.location}</td>
                      <td className="px-6 py-4">
                        {item.is_active ? (
                          <Badge color="success">Yes</Badge>
                        ) : (
                          <Badge color="gray">No</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button 
                            size="xs" 
                            color="dark"
                            onClick={() => openStatusModal(item)}
                          >
                            Update Status
                          </Button>
                          <Button 
                            size="xs" 
                            color="failure"
                            onClick={() => deleteItem(item.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Custodian Requests</h2>
            
            {/* Pickup Requests */}
            <h3 className="text-lg font-semibold mb-3 mt-6">Pickup Requests ({pickupRequests.length})</h3>
            {pickupRequests.length === 0 ? (
              <Card>
                <p className="text-center text-gray-600 py-4">No pickup requests</p>
              </Card>
            ) : (
              <div className="space-y-3 mb-8">
                {pickupRequests.map((request) => (
                  <Card key={request.id}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-lg">{request.item_title}</h4>
                          <Badge color={
                            request.status === 'pending' ? 'warning' :
                            request.status === 'approved' ? 'info' :
                            request.status === 'completed' ? 'success' : 'failure'
                          }>
                            {request.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Owner:</strong> {request.owner_name} ({request.owner_email})</p>
                          <p><strong>Category:</strong> {request.category}</p>
                          <p><strong>Custodian:</strong> {request.custodian_name} - {request.location}</p>
                          <p><strong>Verification Code:</strong> <span className="font-mono text-blue-600 font-bold">{request.verification_code}</span></p>
                          {request.notes && <p><strong>Notes:</strong> {request.notes}</p>}
                          <p className="text-xs text-gray-500">Requested: {new Date(request.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {request.status === 'pending' && (
                          <>
                            <Button size="xs" color="success" onClick={() => updatePickupRequest(request.id, 'approved')}>
                              Approve
                            </Button>
                            <Button size="xs" color="failure" onClick={() => updatePickupRequest(request.id, 'rejected')}>
                              Reject
                            </Button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <Button size="xs" color="dark" onClick={() => updatePickupRequest(request.id, 'completed')}>
                            Mark Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Drop-off Requests */}
            <h3 className="text-lg font-semibold mb-3 mt-6">Drop-off Requests ({dropoffRequests.length})</h3>
            {dropoffRequests.length === 0 ? (
              <Card>
                <p className="text-center text-gray-600 py-4">No drop-off requests</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {dropoffRequests.map((request) => (
                  <Card key={request.id}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-lg">{request.item_title}</h4>
                          <Badge color={
                            request.status === 'pending' ? 'warning' :
                            request.status === 'approved' ? 'info' :
                            request.status === 'completed' ? 'success' : 'failure'
                          }>
                            {request.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Finder:</strong> {request.finder_name} ({request.finder_email})</p>
                          <p><strong>Category:</strong> {request.category}</p>
                          <p><strong>Custodian:</strong> {request.custodian_name} - {request.location}</p>
                          {request.notes && <p><strong>Notes:</strong> {request.notes}</p>}
                          <p className="text-xs text-gray-500">Requested: {new Date(request.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {request.status === 'pending' && (
                          <>
                            <Button size="xs" color="success" onClick={() => updateDropoffRequest(request.id, 'approved')}>
                              Approve
                            </Button>
                            <Button size="xs" color="failure" onClick={() => updateDropoffRequest(request.id, 'rejected')}>
                              Reject
                            </Button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <Button size="xs" color="dark" onClick={() => updateDropoffRequest(request.id, 'completed')}>
                            Mark Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Custodians Tab */}
        {activeTab === 'custodians' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Operating Hours</th>
                    <th className="px-6 py-3">Active</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {custodians.map((custodian) => (
                    <tr key={custodian.id} className="bg-white hover:bg-gray-50">
                      <td className="px-6 py-4">{custodian.id}</td>
                      <td className="px-6 py-4 font-medium">{custodian.name}</td>
                      <td className="px-6 py-4">{custodian.location}</td>
                      <td className="px-6 py-4">{custodian.phone}</td>
                      <td className="px-6 py-4">{custodian.operating_hours}</td>
                      <td className="px-6 py-4">
                        {custodian.is_active ? (
                          <Badge color="success">Yes</Badge>
                        ) : (
                          <Badge color="gray">No</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          size="xs" 
                          color="failure"
                          onClick={() => deleteCustodian(custodian.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-black bg-opacity-50">
          <div className="relative w-full max-w-md mx-auto">
            <div className="relative bg-white rounded-lg shadow">
              <div className="flex items-start justify-between p-5 border-b rounded-t">
                <h3 className="text-xl font-semibold text-gray-900">Update Item Status</h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                  onClick={() => setShowStatusModal(false)}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                {selectedItem && (
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold">Item: {selectedItem.title}</p>
                      <p className="text-sm text-gray-600">Current Status: {selectedItem.status}</p>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">New Status</label>
                      <div className="space-y-2">
                        <Button 
                          color="failure" 
                          className="w-full"
                          onClick={() => updateItemStatus('lost')}
                        >
                          Mark as Lost
                        </Button>
                        <Button 
                          color="success" 
                          className="w-full"
                          onClick={() => updateItemStatus('found')}
                        >
                          Mark as Found
                        </Button>
                        <Button 
                          color="info" 
                          className="w-full"
                          onClick={() => updateItemStatus('matched')}
                        >
                          Mark as Matched
                        </Button>
                        <Button 
                          color="dark" 
                          className="w-full"
                          onClick={() => updateItemStatus('returned')}
                        >
                          Mark as Returned
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
