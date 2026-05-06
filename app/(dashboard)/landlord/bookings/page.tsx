'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function LandlordBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);

  const fetchBookings = async () => {
    const res = await fetch('/api/bookings');
    const { data } = await res.json();
    setBookings(data || []);
  };
  useEffect(() => { fetchBookings(); }, []);

  const handleAction = async (id: string, status: string) => {
    const res = await fetch(`/api/bookings/${id}`, { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }) 
    });
    if (res.ok) {
      toast.success('Booking updated');
      fetchBookings();
    }
  };

  const grouped = bookings.reduce((acc, b) => {
    if (!acc[b.property.title]) acc[b.property.title] = [];
    acc[b.property.title].push(b);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bookings Received</h1>
      <Tabs defaultValue={Object.keys(grouped)[0]}>
        <TabsList>
          {Object.keys(grouped).map(p => <TabsTrigger key={p} value={p}>{p}</TabsTrigger>)}
        </TabsList>
        {(Object.entries(grouped) as [string, any[]][]).map(([prop, bs]) => (
          <TabsContent key={prop} value={prop}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Renter</TableHead>
                  <TableHead>Date / Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bs.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.renter.full_name}</TableCell>
                    <TableCell>{new Date(b.slot.slot_date).toLocaleDateString()} {b.slot.start_time}</TableCell>
                    <TableCell><Badge>{b.status}</Badge></TableCell>
                    <TableCell className="flex gap-2">
                      {b.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleAction(b.id, 'confirmed')}>Confirm</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleAction(b.id, 'declined')}>Decline</Button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <>
                          <Button size="sm" onClick={() => handleAction(b.id, 'completed')}>Complete</Button>
                          <Button size="sm" variant="outline" onClick={() => handleAction(b.id, 'no_show')}>No Show</Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
