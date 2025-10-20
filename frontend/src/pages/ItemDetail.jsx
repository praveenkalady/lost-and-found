import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Badge, Button, Spinner } from 'flowbite-react';
import api from '../utils/api';
import DropoffRequestModal from '../components/DropoffRequestModal';
import PickupRequestModal from '../components/PickupRequestModal';

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDropoffModal, setShowDropoffModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await api.get(`/items/${id}`);
      setItem(response.data);
    } catch (error) {
      setError('Failed to load item details');
      console.error('Failed to fetch item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await api.delete(`/items/${id}`);
      navigate('/items');
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <Card className="max-w-2xl mx-auto">
        <p className="text-center text-red-600">{error || 'Item not found'}</p>
        <Link to="/items">
          <Button color="dark" className="w-full mt-4">Back to Items</Button>
        </Link>
      </Card>
    );
  }

  const isOwner = currentUser && currentUser.id === item.user_id;

  return (
    <div className="max-w-4xl mx-auto">
      <Button color="light" onClick={() => navigate('/items')} className="mb-4">
        ← Back to Items
      </Button>

      <Card>
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{item.title}</h1>
          <Badge color={item.status === 'lost' ? 'failure' : 'success'} className="text-lg">
            {item.status.toUpperCase()}
          </Badge>
        </div>

        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full max-h-96 object-cover rounded-lg mb-6"
          />
        )}

        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg mb-2">Description</h3>
            <p className="text-gray-700">{item.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-600">Category</h4>
              <p>{item.category}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-600">Location</h4>
              <p>{item.location}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-600">Date {item.status === 'lost' ? 'Lost' : 'Found'}</h4>
              <p>{formatDate(item.date_lost_found)}</p>
            </div>
            {item.reward_offered > 0 && (
              <div>
                <h4 className="font-semibold text-gray-600">Reward Offered</h4>
                <p className="text-green-600 font-bold text-lg">${item.reward_offered}</p>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-600 mb-2">Contact Information</h4>
            <p><strong>Name:</strong> {item.owner_name}</p>
            {item.owner_email && <p><strong>Email:</strong> {item.owner_email}</p>}
            {item.owner_phone && <p><strong>Phone:</strong> {item.owner_phone}</p>}
          </div>

          <div className="text-sm text-gray-500">
            <p>Posted on {formatDate(item.created_at)}</p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            {isOwner ? (
              <div className="flex gap-3">
                <Button 
                  color="success" 
                  onClick={() => setShowPickupModal(true)}
                  className="flex-1"
                >
                  📦 Request Pickup
                </Button>
                <Button color="failure" onClick={handleDelete} className="flex-1">
                  Delete Item
                </Button>
              </div>
            ) : currentUser ? (
              <div className="flex gap-3">
                <Link 
                  to="/messages" 
                  state={{ 
                    itemId: item.id, 
                    ownerId: item.user_id,
                    ownerName: item.owner_name,
                    itemTitle: item.title
                  }} 
                  className="flex-1"
                >
                  <Button color="dark" className="w-full">
                    💬 Contact Owner
                  </Button>
                </Link>
                <Button 
                  color="info" 
                  onClick={() => setShowDropoffModal(true)}
                  className="flex-1"
                >
                  📤 Drop Off
                </Button>
              </div>
            ) : (
              <Link to="/login" className="w-full">
                <Button color="dark" className="w-full">
                  Login to Contact Owner
                </Button>
              </Link>
            )}
          </div>

          {/* Custodian Modals */}
          <DropoffRequestModal
            item={item}
            isOpen={showDropoffModal}
            onClose={() => setShowDropoffModal(false)}
            onSuccess={() => alert('Drop-off request submitted! Check My Requests to track status.')}
          />
          <PickupRequestModal
            item={item}
            isOpen={showPickupModal}
            onClose={() => setShowPickupModal(false)}
            onSuccess={() => {}}
          />
        </div>
      </Card>
    </div>
  );
}

export default ItemDetail;
