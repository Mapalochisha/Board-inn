'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, TrendingUp, MapPin, PieChart, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(json => {
        if (json.data) setStats(json.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load analytics");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const bookingStatusData = stats?.bookings_by_status || {};
  const totalBookings = stats?.total_bookings || 0;

  const propertyCityData = stats?.properties_by_city || {};
  const totalProperties = stats?.total_properties || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Detailed breakdown of platform activity and distribution.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Booking Distribution */}
        <Card className="border-black/5 dark:border-white/5 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Booking Status Distribution
            </CardTitle>
            <CardDescription>Breakdown of all viewing bookings by their current state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(bookingStatusData).map(([status, count]: [string, any]) => {
              const percentage = totalBookings > 0 ? (count / totalBookings) * 100 : 0;
              return (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="capitalize">{status.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        status === 'confirmed' || status === 'completed' ? 'bg-green-500' : 
                        status === 'pending' ? 'bg-amber-500' : 'bg-slate-400'
                      }`} 
                      style={{ width: `${percentage}%` }} 
                    />
                  </div>
                </div>
              );
            })}
            {totalBookings === 0 && (
                <p className="text-center text-muted-foreground py-10">No booking data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card className="border-black/5 dark:border-white/5 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Geographic Distribution
            </CardTitle>
            <CardDescription>Properties listed by city.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(propertyCityData).map(([city, count]: [string, any]) => {
              const percentage = totalProperties > 0 ? (count / totalProperties) * 100 : 0;
              return (
                <div key={city} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{city}</span>
                    <span className="text-muted-foreground">{count} listings</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all" 
                      style={{ width: `${percentage}%` }} 
                    />
                  </div>
                </div>
              );
            })}
            {totalProperties === 0 && (
                <p className="text-center text-muted-foreground py-10">No property data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-50 dark:bg-slate-900/50 border-none">
        <CardContent className="p-6 flex items-start gap-4">
          <Info className="w-6 h-6 text-primary shrink-0 mt-1" />
          <div className="space-y-1">
            <h4 className="font-bold">About Platform Data</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These statistics are aggregated in real-time from the production database. 
              Booking distribution helps monitor landlord response times and tenant engagement, 
              while geographic data identifies target areas for future expansion.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
