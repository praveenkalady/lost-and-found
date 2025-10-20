import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, TextInput, Select, Button, Spinner } from 'flowbite-react';
import api from '../utils/api';

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    location: '',
    date_from: '',
    date_to: ''
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`/search?${params.toString()}`);
      setItems(response.data.items);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setFilters({
      status: '',
      category: '',
      location: '',
      date_from: '',
      date_to: ''
    });
    setItems([]);
    setSearched(false);
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
      <h1 className="text-3xl font-bold mb-6">Search Items</h1>

      {/* Search Form */}
      <Card className="mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="search" className="block mb-2 text-sm font-medium text-gray-900">Search</label>
            <TextInput
              id="search"
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900">Status</label>
              <Select
                id="status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </Select>
            </div>

            <div>
              <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900">Category</label>
              <Select
                id="category"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
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
                placeholder="e.g., Central Park"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="date_from" className="block mb-2 text-sm font-medium text-gray-900">Date From</label>
              <TextInput
                id="date_from"
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="date_to" className="block mb-2 text-sm font-medium text-gray-900">Date To</label>
              <TextInput
                id="date_to"
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" color="dark" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button type="button" color="light" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="xl" />
        </div>
      ) : searched && items.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">No items found. Try adjusting your search criteria.</p>
        </Card>
      ) : items.length > 0 ? (
        <>
          <h2 className="text-xl font-bold mb-4">{items.length} results found</h2>
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
        </>
      ) : null}
    </div>
  );
}

export default Search;
