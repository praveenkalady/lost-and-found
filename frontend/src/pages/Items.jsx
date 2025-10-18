import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Select, Button, Spinner } from 'flowbite-react';
import api from '../utils/api';

function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });

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

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      
      const response = await api.get(`/items?${params.toString()}`);
      setItems(response.data.items);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Browse Items</h1>
        <Link to="/create-item">
          <Button color="dark">Report Item</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="status-filter" className="block mb-2 text-sm font-medium text-gray-900">Status</label>
            <Select
              id="status-filter"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Items</option>
              <option value="lost">Lost Items</option>
              <option value="found">Found Items</option>
            </Select>
          </div>
          <div>
            <label htmlFor="category-filter" className="block mb-2 text-sm font-medium text-gray-900">Category</label>
            <Select
              id="category-filter"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              color="light"
              className="w-full"
              onClick={() => setFilters({ status: '', category: '' })}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="xl" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">No items found. Try adjusting your filters.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link key={item.id} to={`/items/${item.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-t-lg mb-4"
                  />
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <Badge color={item.status === 'lost' ? 'failure' : 'success'}>
                    {item.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {item.description}
                </p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p><strong>Category:</strong> {item.category}</p>
                  <p><strong>Location:</strong> {item.location}</p>
                  <p><strong>Date:</strong> {formatDate(item.date_lost_found)}</p>
                  {item.reward_offered > 0 && (
                    <p className="text-green-600 font-semibold">
                      Reward: ${item.reward_offered}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Reported by {item.owner_name}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Items;
