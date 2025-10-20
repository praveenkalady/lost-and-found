import React, { useState, useEffect } from 'react';
import { Button } from 'flowbite-react';
import api from '../utils/api';

function PickupRequestModal({ item, isOpen, onClose, onSuccess }) {
  const [custodians, setCustodians] = useState([]);
  const [selectedCustodian, setSelectedCustodian] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCustodians();
      setShowSuccess(false);
      setVerificationCode('');
    }
  }, [isOpen]);

  const fetchCustodians = async () => {
    try {
      const response = await api.get('/custodians');
      setCustodians(response.data.custodians);
    } catch (error) {
      console.error('Failed to fetch custodians:', error);
      setError('Failed to load pickup locations');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustodian) {
      setError('Please select a pickup location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/custodians/pickup', {
        item_id: item.id,
        custodian_id: parseInt(selectedCustodian),
        notes
      });

      setVerificationCode(response.data.verification_code);
      setShowSuccess(true);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit pickup request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setVerificationCode('');
    setSelectedCustodian('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {showSuccess ? 'Pickup Request Submitted!' : 'Request Item Pickup'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {showSuccess ? (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Request Submitted Successfully!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your pickup request has been submitted. Please save your verification code.
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-600 mb-2 text-center font-semibold">VERIFICATION CODE</p>
              <p className="text-3xl font-bold text-center text-blue-600 tracking-wider mb-2">
                {verificationCode}
              </p>
              <p className="text-xs text-gray-600 text-center">
                Show this code when picking up your item
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-700">
                <strong>Important:</strong> Save this verification code. You will need to show it when collecting your item from the custodian.
              </p>
            </div>

            <Button
              color="dark"
              className="w-full"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Request to pick up <span className="font-semibold">{item.title}</span> from a custodian location
              </p>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Select Pickup Location *
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
                placeholder="Any additional information to help identify yourself or the item"
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
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default PickupRequestModal;
