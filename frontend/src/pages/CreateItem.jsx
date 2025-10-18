import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextInput, Textarea, Select, Card } from 'flowbite-react';
import api from '../utils/api';

function CreateItem() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'lost',
    location: '',
    date_lost_found: '',
    image_url: '',
    reward_offered: 0
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'Electronics',
    'Documents',
    'Jewelry',
    'Bags',
    'Keys',
    'Clothing',
    'Wallet',
    'Phone',
    'Pet',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/items', formData);
      navigate('/items');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <h1 className="text-3xl font-bold mb-6">Report Item</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900">Item Status</label>
            <Select
              id="status"
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="lost">Lost Item</option>
              <option value="found">Found Item</option>
            </Select>
          </div>

          <div>
            <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900">Title</label>
            <TextInput
              id="title"
              type="text"
              required
              placeholder="e.g., Black iPhone 13 Pro"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">Description</label>
            <Textarea
              id="description"
              required
              rows={4}
              placeholder="Provide detailed description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900">Category</label>
            <Select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="location" className="block mb-2 text-sm font-medium text-gray-900">Location</label>
            <TextInput
              id="location"
              type="text"
              required
              placeholder="e.g., Central Park, NYC"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="date_lost_found" className="block mb-2 text-sm font-medium text-gray-900">Date Lost/Found</label>
            <TextInput
              id="date_lost_found"
              type="date"
              required
              value={formData.date_lost_found}
              onChange={(e) => setFormData({ ...formData, date_lost_found: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="image_url" className="block mb-2 text-sm font-medium text-gray-900">Image URL (optional)</label>
            <TextInput
              id="image_url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          {formData.status === 'lost' && (
            <div>
              <label htmlFor="reward_offered" className="block mb-2 text-sm font-medium text-gray-900">Reward Offered ($)</label>
              <TextInput
                id="reward_offered"
                type="number"
                min="0"
                placeholder="0"
                value={formData.reward_offered}
                onChange={(e) => setFormData({ ...formData, reward_offered: parseFloat(e.target.value) || 0 })}
              />
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" color="dark" className="flex-1" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
            <Button color="light" className="flex-1" onClick={() => navigate('/')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CreateItem;
