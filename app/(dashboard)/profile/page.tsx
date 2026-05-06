'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch('/api/profile').then(res => res.json()).then(setProfile);
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/profile', { method: 'PATCH', body: JSON.stringify(profile) });
    if (res.ok) toast.success('Profile updated');
  };

  if (!profile) return null;

  return (
    <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
      <h1 className="text-2xl font-bold">Profile</h1>
      <Input label="Name" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} />
      <Input label="Phone" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
      <Button type="submit">Save Changes</Button>
    </form>
  );
}
