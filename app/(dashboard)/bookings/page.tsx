'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatSlotTime } from '@/lib/booking-utils';
import { toast } from 'sonner';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/bookings')
      .then((res) => res.json())
      .then(({ data }) => setBookings(data || []));
  }, []);

  const today = new Date();
  const upcoming = bookings.filter(b => new Date(b.slot.slot_date) >= today && !['completed', 'no_show', 'declined', 'cancelled_by_renter', 'cancelled_by_landlord'].includes(b.status));
  const past = bookings.filter(b => !upcoming.includes(b));

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this viewing?')) return;
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled_by_renter' })
    });
    if (res.ok) {
      toast.success('Booking cancelled');
      setBookings(bookings.filter(b => b.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-green-500';
      case 'declined': return 'bg-red-500';
      case 'completed': return 'bg-green-500';
      case 'no_show': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Bookings</h1>
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          {upcoming.length === 0 ? <p>No upcoming bookings.</p> : upcoming.map(b => (
            <Card key={b.id}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  {b.property.title}
                  <Badge className={getStatusColor(b.status)}>{b.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{b.property.address_line1}</p>
                <p>{new Date(b.slot.slot_date).toLocaleDateString()} at {formatSlotTime(b.slot.start_time, b.slot.end_time)}</p>
                {b.unit && <p className="text-sm">Unit: {b.unit.name}</p>}
                <Button variant="destructive" className="mt-4" onClick={() => handleCancel(b.id)}>Cancel</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="past">
          {past.map(b => (
            <Card key={b.id} className="mb-4">
              <CardHeader>
                <CardTitle className="flex justify-between">
                  {b.property.title}
                  <Badge className={getStatusColor(b.status)}>{b.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{b.property.address_line1}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
