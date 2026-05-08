'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Calendar, Clock, Users, Trash2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatSlotTime } from '@/lib/booking-utils';

export default function ManageSlotsPage({ params }: { params: { id: string } }) {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSlot, setNewSlot] = useState({ 
    slot_date: '', 
    start_time: '', 
    end_time: '', 
    max_viewers: 5,
    notes: ''
  });

  const fetchSlots = async () => {
    const res = await fetch(`/api/viewing-slots?property_id=${params.id}`);
    const json = await res.json();
    setSlots(json.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSlots(); }, [params.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch('/api/viewing-slots', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newSlot, property_id: params.id }) 
    });
    if (res.ok) { 
      toast.success('Viewing slot created successfully'); 
      setNewSlot({ slot_date: '', start_time: '', end_time: '', max_viewers: 5, notes: '' });
      fetchSlots(); 
    } else {
      toast.error('Failed to create slot');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/viewing-slots/${id}`, { method: 'DELETE' });
    if (res.ok) { 
      toast.success('Slot cancelled'); 
      fetchSlots(); 
    } else {
      toast.error('Failed to cancel slot. Active bookings may exist.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/landlord/listings"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Viewing Slots</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage available times for property viewings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <Card className="lg:col-span-1 h-fit sticky top-24">
          <CardHeader>
            <CardTitle>Create New Slot</CardTitle>
            <CardDescription>Add a new time window for viewings.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  required 
                  value={newSlot.slot_date} 
                  onChange={e => setNewSlot({...newSlot, slot_date: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Start Time</Label>
                  <Input 
                    id="start" 
                    type="time" 
                    required 
                    value={newSlot.start_time} 
                    onChange={e => setNewSlot({...newSlot, start_time: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End Time</Label>
                  <Input 
                    id="end" 
                    type="time" 
                    required 
                    value={newSlot.end_time} 
                    onChange={e => setNewSlot({...newSlot, end_time: e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="viewers">Max Viewers</Label>
                <Input 
                  id="viewers" 
                  type="number" 
                  min="1" 
                  max="20" 
                  required 
                  value={newSlot.max_viewers} 
                  onChange={e => setNewSlot({...newSlot, max_viewers: parseInt(e.target.value)})} 
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Add Viewing Slot'}
                {!isSubmitting && <Plus className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Slots List */}
        <div className="lg:col-span-2 space-y-4">
          {slots.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-xl bg-card">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No slots scheduled</h3>
              <p className="text-muted-foreground">Start by adding a slot using the form.</p>
            </div>
          ) : (
            <div className="border rounded-xl shadow-sm overflow-hidden bg-card">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead className="text-center">Capacity</TableHead>
                    <TableHead className="text-center">Bookings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="font-medium">{new Date(s.slot_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatSlotTime(s.start_time, s.end_time)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{s.max_viewers}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold">{s.current_viewers || 0}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">Joined</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Cancel this viewing slot?</DialogTitle>
                              <DialogDescription>
                                This will remove the slot from the public listing. If there are active bookings, you should notify the renters first.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="ghost" type="button">Close</Button>
                              <Button variant="destructive" onClick={() => handleDelete(s.id)}>Confirm Cancellation</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
