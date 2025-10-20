import React, { useEffect, useState } from 'react';
import { Card, Button, TextInput } from 'flowbite-react';
import api from '../utils/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile/me');
      setUser(res.data);
      setForm({ full_name: res.data.full_name || '', phone: res.data.phone || '' });
    } catch (e) {
      console.error('Failed to load profile', e);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put('/profile/me', form);
      setUser(res.data.user);
      setEditing(false);
      // Update cached user
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      if (stored) {
        localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data.user }));
      }
    } catch (e) {
      console.error('Failed to save profile', e);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <p>Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">Email</label>
            <TextInput value={user.email} readOnly />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">Full Name</label>
            <TextInput
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              disabled={!editing}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">Phone</label>
            <TextInput
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={!editing}
            />
          </div>

          <div className="flex gap-4 pt-2">
            {editing ? (
              <>
                <Button color="dark" onClick={saveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button color="light" onClick={() => (setEditing(false), setForm({ full_name: user.full_name || '', phone: user.phone || '' }))}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button color="dark" onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Profile;
