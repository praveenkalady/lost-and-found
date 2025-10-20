import React, { useState, useEffect } from 'react';
import { Card, Spinner } from 'flowbite-react';
import api from '../utils/api';

function Custodians() {
  const [custodians, setCustodians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustodians();
  }, []);

  const fetchCustodians = async () => {
    try {
      const response = await api.get('/custodians');
      setCustodians(response.data.custodians);
    } catch (error) {
      console.error('Failed to fetch custodians:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Drop-off Locations</h1>
        <p className="text-gray-600">
          Safe and secure locations where you can drop off found items or pick up your lost belongings.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="xl" />
        </div>
      ) : custodians.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">No custodian locations available at the moment.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {custodians.map((custodian) => (
            <Card key={custodian.id}>
              <h3 className="text-xl font-bold mb-2">{custodian.name}</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <strong className="text-gray-900">Area:</strong>
                  <p>{custodian.location}</p>
                </div>

                <div>
                  <strong className="text-gray-900">Address:</strong>
                  <p>{custodian.address}</p>
                </div>

                {custodian.phone && (
                  <div>
                    <strong className="text-gray-900">Phone:</strong>
                    <p>{custodian.phone}</p>
                  </div>
                )}

                {custodian.email && (
                  <div>
                    <strong className="text-gray-900">Email:</strong>
                    <p>{custodian.email}</p>
                  </div>
                )}

                {custodian.operating_hours && (
                  <div>
                    <strong className="text-gray-900">Operating Hours:</strong>
                    <p>{custodian.operating_hours}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Custodians;
