'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatSlotTime } from '@/lib/booking-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Unit {
  id: string;
  name: string;
}

interface Slot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_viewers: number;
  current_viewers: number;
}

interface ViewingSlotPickerProps {
  propertyId: string;
  units: Unit[];
  isLoggedIn: boolean;
}

export function ViewingSlotPicker({ propertyId, units, isLoggedIn }: ViewingSlotPickerProps) {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [unitId, setUnitId] = useState<string>('whole');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    fetch(`/api/viewing-slots?property_id=${propertyId}`)
      .then((res) => res.json())
      .then((json) => {
        setSlots(json.data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error('Failed to load slots');
      });
  }, [propertyId, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="mb-4">Sign in to book a viewing</p>
          <div className="flex justify-center gap-2">
            <Button onClick={() => router.push('/login')}>Log In</Button>
            <Button variant="outline" onClick={() => router.push('/register')}>Register</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
      </div>
    );
  }

  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.slot_date]) acc[slot.slot_date] = [];
    acc[slot.slot_date].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  const handleConfirm = async () => {
    setIsBooking(true);
    setError(null);
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slot_id: selectedSlot?.id,
        property_id: propertyId,
        unit_id: unitId === 'whole' ? null : unitId,
        renter_notes: notes,
      }),
    });

    if (res.status === 201) {
      toast.success('Booking confirmed! Check your dashboard.');
      router.push('/dashboard/bookings');
    } else if (res.status === 409) {
      setError('This slot is no longer available. Please select another.');
      setIsBooking(false);
    } else if (res.status === 401) {
      router.push('/login');
    } else {
      toast.error('Something went wrong. Please try again.');
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedSlots).map(([date, dateSlots]) => (
        <div key={date}>
          <h3 className="font-semibold mb-4">{new Date(date).toLocaleDateString()}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dateSlots.map((slot) => {
              const remaining = slot.max_viewers - slot.current_viewers;
              const isFull = remaining <= 0;

              return (
                <Card key={slot.id} className={isFull ? 'bg-muted' : ''}>
                  <CardContent className="p-4 space-y-2">
                    <p className="font-medium">{formatSlotTime(slot.start_time, slot.end_time)}</p>
                    <p className="text-sm text-muted-foreground">
                      {isFull ? 'Fully Booked' : `${remaining} spot(s) remaining`}
                    </p>
                    {!isFull && (
                      <Button onClick={() => setSelectedSlot(slot)} variant={selectedSlot?.id === slot.id ? 'default' : 'secondary'}>
                        {selectedSlot?.id === slot.id ? 'Selected' : 'Select'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {selectedSlot && (
        <div className="border-t pt-8 space-y-4">
          <h3 className="font-semibold">Confirm Viewing</h3>
          <p>{new Date(selectedSlot.slot_date).toLocaleDateString()} at {formatSlotTime(selectedSlot.start_time, selectedSlot.end_time)}</p>
          <Select onValueChange={setUnitId} defaultValue="whole">
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whole">Viewing whole property</SelectItem>
              {units.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Textarea placeholder="Optional notes for landlord..." onChange={(e) => setNotes(e.target.value)} />
          <Button onClick={handleConfirm} disabled={isBooking}>
            {isBooking ? 'Confirming...' : 'Confirm Booking'}
          </Button>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
}
