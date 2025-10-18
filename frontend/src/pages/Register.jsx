import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Label, TextInput, Card, Select } from 'flowbite-react';
import api from '../utils/api';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'owner'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <h2 className="text-3xl font-bold text-center mb-6">Register</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block mb-2 text-sm font-medium text-gray-900">Full Name</label>
            <TextInput
              id="full_name"
              type="text"
              required
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
            <TextInput
              id="email"
              type="email"
              required
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900">Phone (optional)</label>
            <TextInput
              id="phone"
              type="tel"
              placeholder="123-456-7890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Password</label>
            <TextInput
              id="password"
              type="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900">I am a</label>
            <Select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="owner">Owner (looking for lost items)</option>
              <option value="finder">Finder (reporting found items)</option>
            </Select>
          </div>

          <Button type="submit" color="dark" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : 'Register'}
          </Button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-black font-semibold hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default Register;
