import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from 'flowbite-react';

function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-black">UFoundIt</h1>
        <p className="text-xl text-gray-600 mb-8">
          Reuniting people with their lost belongings
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/create-item">
            <Button color="dark" size="lg">
              Report Lost Item
            </Button>
          </Link>
          <Link to="/create-item">
            <Button color="light" size="lg">
              Report Found Item
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <Card className="text-center">
          <h3 className="text-2xl font-bold mb-2">Report Items</h3>
          <p className="text-gray-600">
            Easily report lost or found items with detailed descriptions and photos
          </p>
        </Card>

        <Card className="text-center">
          <h3 className="text-2xl font-bold mb-2">Search & Match</h3>
          <p className="text-gray-600">
            Search through listings to find your lost items or help return found items
          </p>
        </Card>

        <Card className="text-center">
          <h3 className="text-2xl font-bold mb-2">Safe Exchange</h3>
          <p className="text-gray-600">
            Use our custodian drop-off locations for secure item exchanges
          </p>
        </Card>
      </div>

      <div className="mt-16 bg-gray-50 p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-4 text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div>
            <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">
              1
            </div>
            <h4 className="font-bold mb-2">Create Account</h4>
            <p className="text-gray-600 text-sm">Sign up to start reporting items</p>
          </div>
          <div>
            <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">
              2
            </div>
            <h4 className="font-bold mb-2">Report Item</h4>
            <p className="text-gray-600 text-sm">Add details about lost or found items</p>
          </div>
          <div>
            <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">
              3
            </div>
            <h4 className="font-bold mb-2">Connect</h4>
            <p className="text-gray-600 text-sm">Message users about matching items</p>
          </div>
          <div>
            <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">
              4
            </div>
            <h4 className="font-bold mb-2">Reunite</h4>
            <p className="text-gray-600 text-sm">Arrange pickup through custodians</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
