'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export default function ManageSlotsPage({ params }: { params: { id: string } }) {
  const [slots, setSlots] = useState<any[]>([]);
  const [newSlot, setNewSlot] = useState({ date: '', start_time: '', end_time: '', max_viewers: 5 });

  const fetchSlots = () => fetch(`/api/viewing-slots?property_id=${params.id}`).then(res => res.json()).then(setSlots);
  useEffect(fetchSlots, [params.id]);

  const handleCreate = async () => {
    const res = await fetch('/api/viewing-slots', { method: 'POST', body: JSON.stringify({ ...newSlot, property_id: params.id }) });
    if (res.ok) { toast.success('Slot created'); fetchSlots(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Cancel this slot?')) return;
    const res = await fetch(`/api/viewing-slots/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Slot deleted'); fetchSlots(); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Viewing Slots</h1>
      <div className="flex gap-2">
        <Input type="date" onChange={e => setNewSlot({...newSlot, date: e.target.value})} />
        <Input type="time" onChange={e => setNewSlot({...newSlot, start_time: e.target.value})} />
        <Input type="time" onChange={e => setNewSlot({...newSlot, end_time: e.target.value})} />
        <Button onClick={handleCreate}>Add Slot</Button>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
        <TableBody>
          {slots.map(s => (
            <TableRow key={s.id}>
              <TableCell>{new Date(s.slot_date).toLocaleDateString()}</TableCell>
              <TableCell>{s.start_time} - {s.end_time}</TableCell>
              <TableCell><Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)}>Cancel</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
