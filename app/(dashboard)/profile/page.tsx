'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Upload, User } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/profile', { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: profile.full_name, phone: profile.phone }) 
    });
    if (res.ok) toast.success('Profile updated successfully');
    else toast.error('Failed to update profile');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/upload/avatar', { method: 'POST', body: formData });
    if (res.ok) {
      const { url } = await res.json();
      setProfile({ ...profile, avatar_url: url });
      toast.success('Avatar updated');
    } else {
      toast.error('Failed to upload image');
    }
    setUploading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and avatar.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 border">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback><User className="w-8 h-8 text-muted-foreground" /></AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {uploading ? 'Uploading...' : 'Change Avatar'}
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={profile.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Account Role</Label>
                <Input id="role" value={profile.role?.toUpperCase() || ''} disabled />
              </div>
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
