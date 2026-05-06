'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch('/api/profile').then(res => res.json()).then(({ data }) => setProfile(data));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/profile', { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile) 
    });
    if (res.ok) toast.success('Profile updated');
  };

  if (!profile) return null;

  return (
    <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="space-y-1">
        <Label htmlFor="full_name">Name</Label>
        <Input id="full_name" value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} />
      </div>
      <Button type="submit">Save Changes</Button>
    </form>
  );
}
