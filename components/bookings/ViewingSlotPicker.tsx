'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatSlotTime } from '@/lib/booking-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Calendar, Users, CheckCircle2, AlertCircle } from 'lucide-react';

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
  user: any;
}

export function ViewingSlotPicker({ propertyId, units, user }: ViewingSlotPickerProps) {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [unitId, setUnitId] = useState<string>('whole');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = !!user;
  const isRenter = user?.role === 'renter';

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
        toast.error('Failed to load viewing slots');
      });
  }, [propertyId, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <>
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-muted-foreground">Sign in to book a viewing for this property.</p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => router.push('/login')}>Log In</Button>
              <Button variant="outline" onClick={() => router.push('/register')}>Register</Button>
            </div>
          </CardContent>
        </Card>

        {/* Sticky Mobile Bar for Logged Out */}
        <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-white dark:bg-slate-950 border-t shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.15)] z-50">
          <Button 
            asChild
            className="w-full bg-green-600 text-white py-6 rounded-xl font-bold text-lg hover:bg-green-700 h-auto"
          >
            <a href="#viewing-slots">Book a Viewing</a>
          </Button>
        </div>
      </>
    );
  }

  if (!isRenter) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-8 text-center space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <h3 className="font-semibold text-lg">Account Type Restricted</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            You are currently signed in as a <span className="font-bold text-foreground">{user.role}</span>. Only <span className="font-bold text-foreground">renter</span> accounts can book viewing slots.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
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
      router.push('/bookings');
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
    <div className="space-y-8 pb-20 md:pb-0">
      {Object.entries(groupedSlots).map(([date, dateSlots]) => (
        <div key={date} className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <Calendar className="w-5 h-5" />
            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dateSlots.map((slot) => {
              const remaining = slot.max_viewers - slot.current_viewers;
              const isFull = remaining <= 0;

              return (
                <Card key={slot.id} className={`transition-all ${isFull ? 'bg-muted border-none opacity-60' : 'hover:border-green-600/50 hover:shadow-md'}`}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-lg">{formatSlotTime(slot.start_time, slot.end_time)}</p>
                      {isFull && <span className="text-xs bg-muted-foreground/20 text-muted-foreground px-2 py-1 rounded-full uppercase tracking-wider font-semibold">Full</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{isFull ? 'Fully Booked' : `${remaining} spot(s) remaining`}</span>
                    </div>
                    {!isFull && (
                      <Button 
                        onClick={() => setSelectedSlot(slot)} 
                        variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                        className={`w-full ${selectedSlot?.id === slot.id ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      >
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
        <Card className="border-green-600/20 bg-green-50 dark:bg-green-950/20 shadow-md mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-700 dark:text-green-400">Confirm Your Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white dark:bg-background p-5 rounded-xl border shadow-sm space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Selected Slot:</p>
              <p className="font-bold text-lg">{new Date(selectedSlot.slot_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {formatSlotTime(selectedSlot.start_time, selectedSlot.end_time)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit preference</label>
              <Select onValueChange={setUnitId} defaultValue="whole">
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whole">Viewing whole property</SelectItem>
                  {units.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Landlord notes (optional)</label>
              <Textarea 
                placeholder="Any special requests or questions?" 
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="pt-2">
              <Button onClick={handleConfirm} disabled={isBooking} className="w-full bg-green-600 hover:bg-green-700">
                {isBooking ? 'Confirming...' : 'Confirm Booking'}
              </Button>
              {error && (
                <div className="mt-3 flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic Sticky Mobile Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-white dark:bg-slate-950 border-t shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.15)] z-50">
        {selectedSlot ? (
          <Button 
            onClick={handleConfirm} 
            disabled={isBooking}
            className="w-full bg-green-600 text-white py-6 rounded-xl font-bold text-lg hover:bg-green-700 h-auto"
          >
            {isBooking ? 'Confirming...' : 'Confirm Booking'}
          </Button>
        ) : (
          <Button 
            asChild
            className="w-full bg-green-600 text-white py-6 rounded-xl font-bold text-lg hover:bg-green-700 h-auto"
          >
            <a href="#viewing-slots">Book a Viewing</a>
          </Button>
        )}
      </div>
    </div>
  );
}
