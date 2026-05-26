'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatSlotTime } from '@/lib/booking-utils';
import { toast } from 'sonner';
import { Calendar, Home, MapPin, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { EmptyState } from '@/components/shared/EmptyState';

const canRenterCancel = (status: string) => ['pending', 'confirmed'].includes(status);

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/bookings')
      .then((res) => res.json())
      .then(({ data }) => {
        setBookings(data || []);
      });
  }, []);

  const now = new Date();
  const upcoming = bookings.filter(b => {
    const slotDate = new Date(`${b.slot.slot_date}T${b.slot.start_time}`);
    return slotDate >= now && !['completed', 'no_show', 'declined', 'cancelled_by_renter', 'cancelled_by_landlord'].includes(b.status);
  });
  const past = bookings.filter(b => !upcoming.find(u => u.id === b.id));

  const handleCancel = async (id: string) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled_by_renter' })
    });
    if (res.ok) {
      toast.success('Booking cancelled successfully');
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled_by_renter' } : b));
    } else {
      toast.error('Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      declined: 'bg-red-100 text-red-800 border-red-200',
      cancelled_by_renter: 'bg-gray-100 text-gray-800 border-gray-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      no_show: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return <Badge variant="outline" className={variants[status] || 'bg-gray-100'}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground mt-1">Manage your upcoming and past property viewings.</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {upcoming.length === 0 ? (
            <EmptyState 
              icon={Calendar}
              title="No upcoming bookings"
              description="You haven't scheduled any property viewings yet. Browse our listings to find your next home."
              action={{
                label: "Find a property",
                href: "/listings"
              }}
              className="border-2 border-dashed rounded-2xl bg-card"
            />
          ) : upcoming.map(b => (
            <Card key={b.id} className="shadow-sm">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{b.property.title}</h3>
                    {getStatusBadge(b.status)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{b.property.address_line1}, {b.property.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(b.slot.slot_date).toLocaleDateString()} at {formatSlotTime(b.slot.start_time, b.slot.end_time)}</span>
                  </div>
                  {b.unit && <p className="text-sm">Unit: <span className="font-medium">{b.unit.name}</span></p>}
                </div>
                
                {canRenterCancel(b.status) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-destructive hover:bg-destructive/10">
                        <XCircle className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel this viewing?</DialogTitle>
                        <DialogDescription>Are you sure you want to cancel your viewing at {b.property.title}? This action cannot be undone.</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="ghost" type="button">Keep Booking</Button>
                        <Button variant="destructive" onClick={() => handleCancel(b.id)}>Confirm Cancellation</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {past.map(b => (
            <Card key={b.id} className="opacity-75">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{b.property.title}</h3>
                    <p className="text-sm text-muted-foreground">{new Date(b.slot.slot_date).toLocaleDateString()}</p>
                  </div>
                  {getStatusBadge(b.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
