'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Calendar, Clock, User } from 'lucide-react';

export default function LandlordBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    const res = await fetch('/api/bookings');
    const { data } = await res.json();
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleAction = async (id: string, status: string) => {
    const res = await fetch(`/api/bookings/${id}`, { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }) 
    });
    if (res.ok) {
      toast.success(`Booking status updated to ${status}`);
      fetchBookings();
    } else {
      toast.error('Failed to update booking');
    }
  };

  const grouped = bookings.reduce((acc, b) => {
    if (!acc[b.property.title]) acc[b.property.title] = [];
    acc[b.property.title].push(b);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) return <div>Loading...</div>;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      declined: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      no_show: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return <Badge variant="outline" className={variants[status] || 'bg-gray-100'}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookings Received</h1>
        <p className="text-muted-foreground mt-1">Manage viewing requests for your properties.</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground">No bookings received yet.</p>
        </div>
      ) : (
        <Tabs defaultValue={Object.keys(grouped)[0]} className="w-full">
          <TabsList className="mb-6">
            {Object.keys(grouped).map(p => <TabsTrigger key={p} value={p}>{p}</TabsTrigger>)}
          </TabsList>
          
          {(Object.entries(grouped) as [string, any[]][]).map(([prop, bs]) => (
            <TabsContent key={prop} value={prop} className="border rounded-xl overflow-hidden bg-card shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Renter</TableHead>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bs.map((b: any) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {b.renter.full_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {new Date(b.slot.slot_date).toLocaleDateString()}
                          <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                          {b.slot.start_time.slice(0, 5)}
                        </div>
                      </TableCell>
                      <TableCell>{b.unit?.name || 'Whole property'}</TableCell>
                      <TableCell>{getStatusBadge(b.status)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          {b.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => handleAction(b.id, 'confirmed')}>
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleAction(b.id, 'declined')}>
                                <XCircle className="w-4 h-4 mr-2" /> Decline
                              </Button>
                            </>
                          )}
                          {b.status === 'confirmed' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleAction(b.id, 'completed')}>Complete</Button>
                              <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => handleAction(b.id, 'no_show')}>No Show</Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
