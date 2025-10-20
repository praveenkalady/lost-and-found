import React, { useState, useEffect } from 'react';
import { Button } from 'flowbite-react';
import api from '../utils/api';

function DropoffRequestModal({ item, isOpen, onClose, onSuccess }) {
  const [custodians, setCustodians] = useState([]);
  const [selectedCustodian, setSelectedCustodian] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCustodians();
    }
  }, [isOpen]);

  const fetchCustodians = async () => {
    try {
      const response = await api.get('/custodians');
      setCustodians(response.data.custodians);
    } catch (error) {
      console.error('Failed to fetch custodians:', error);
      setError('Failed to load drop-off locations');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustodian) {
      setError('Please select a drop-off location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/custodians/dropoff', {
        item_id: item.id,
        custodian_id: parseInt(selectedCustodian),
        notes
      });

      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit drop-off request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9999, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            Drop Off Item at Custodian
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Request to drop off <span className="font-semibold">{item.title}</span> at a custodian location
            </p>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Select Drop-off Location *
            </label>
            <select
              value={selectedCustodian}
              onChange={(e) => setSelectedCustodian(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            >
              <option value="">Choose a location...</option>
              {custodians.map((custodian) => (
                <option key={custodian.id} value={custodian.id}>
                  {custodian.name} - {custodian.location}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Any additional information about the item condition, etc."
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              color="dark"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button
              type="button"
              color="light"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DropoffRequestModal;
