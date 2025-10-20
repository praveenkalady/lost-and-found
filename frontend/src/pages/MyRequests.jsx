import React, { useState, useEffect } from 'react';
import { Card, Badge, Spinner } from 'flowbite-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function MyRequests() {
  const [dropoffRequests, setDropoffRequests] = useState([]);
  const [pickupRequests, setPickupRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pickup');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [dropoffRes, pickupRes] = await Promise.all([
        api.get('/custodians/dropoff/my-requests'),
        api.get('/custodians/pickup/my-requests')
      ]);

      setDropoffRequests(dropoffRes.data.requests);
      setPickupRequests(pickupRes.data.requests);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'completed': return 'success';
      case 'rejected': return 'failure';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Custodian Requests</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('pickup')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pickup'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pickup Requests ({pickupRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('dropoff')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dropoff'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Drop-off Requests ({dropoffRequests.length})
          </button>
        </nav>
      </div>

      {/* Pickup Requests Tab */}
      {activeTab === 'pickup' && (
        <div className="space-y-4">
          {pickupRequests.length === 0 ? (
            <Card>
              <p className="text-center text-gray-600 py-8">
                No pickup requests yet. Request to pick up items from custodian locations.
              </p>
            </Card>
          ) : (
            pickupRequests.map((request) => (
              <Card key={request.id}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link 
                        to={`/items/${request.item_id}`}
                        className="text-lg font-bold text-blue-600 hover:text-blue-800"
                      >
                        {request.item_title}
                      </Link>
                      <Badge color={getStatusColor(request.status)}>
                        {request.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <strong>Custodian:</strong> {request.custodian_name} ({request.location})
                      </p>
                      <p>
                        <strong>Category:</strong> {request.category}
                      </p>
                      {request.verification_code && (
                        <p>
                          <strong>Verification Code:</strong>{' '}
                          <span className="font-mono text-lg text-blue-600 font-bold">
                            {request.verification_code}
                          </span>
                        </p>
                      )}
                      {request.notes && (
                        <p>
                          <strong>Notes:</strong> {request.notes}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Requested on {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {request.status === 'pending' && (
                      <span className="text-yellow-600 text-sm">⏳ Awaiting approval</span>
                    )}
                    {request.status === 'approved' && (
                      <span className="text-blue-600 text-sm">✓ Approved - Show verification code</span>
                    )}
                    {request.status === 'completed' && (
                      <span className="text-green-600 text-sm">✓ Completed</span>
                    )}
                    {request.status === 'rejected' && (
                      <span className="text-red-600 text-sm">✗ Rejected</span>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Drop-off Requests Tab */}
      {activeTab === 'dropoff' && (
        <div className="space-y-4">
          {dropoffRequests.length === 0 ? (
            <Card>
              <p className="text-center text-gray-600 py-8">
                No drop-off requests yet. Help others by dropping off found items at custodian locations.
              </p>
            </Card>
          ) : (
            dropoffRequests.map((request) => (
              <Card key={request.id}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link 
                        to={`/items/${request.item_id}`}
                        className="text-lg font-bold text-blue-600 hover:text-blue-800"
                      >
                        {request.item_title}
                      </Link>
                      <Badge color={getStatusColor(request.status)}>
                        {request.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <strong>Custodian:</strong> {request.custodian_name} ({request.location})
                      </p>
                      <p>
                        <strong>Category:</strong> {request.category}
                      </p>
                      {request.notes && (
                        <p>
                          <strong>Notes:</strong> {request.notes}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Requested on {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {request.status === 'pending' && (
                      <span className="text-yellow-600 text-sm">⏳ Awaiting approval</span>
                    )}
                    {request.status === 'approved' && (
                      <span className="text-blue-600 text-sm">✓ Approved - Drop off item</span>
                    )}
                    {request.status === 'completed' && (
                      <span className="text-green-600 text-sm">✓ Item dropped off</span>
                    )}
                    {request.status === 'rejected' && (
                      <span className="text-red-600 text-sm">✗ Rejected</span>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default MyRequests;
