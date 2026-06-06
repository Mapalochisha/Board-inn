'use client';

import { useState, useEffect } from 'react';
import { Building2, Users, Calendar, Home, Loader2, PlusCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
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
        toast.error("Failed to load dashboard stats");
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

  const statCards = [
    { title: "Total Properties", value: stats?.total_properties || 0, icon: Building2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Active Users", value: stats?.active_users || 0, icon: Users, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
    { title: "Total Bookings", value: stats?.total_bookings || 0, icon: Calendar, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { title: "Available Beds", value: stats?.available_beds || 0, icon: Home, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Console</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time overview of the Board-inn platform.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-slate-400 mt-1 font-medium">Updated just now</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-black/5 dark:border-white/5 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl" asChild>
                <Link href="/admin/users">
                    <Users className="w-6 h-6 text-primary" />
                    <span>Manage Users</span>
                </Link>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl" asChild>
                <Link href="/admin/properties">
                    <Building2 className="w-6 h-6 text-primary" />
                    <span>Audit Listings</span>
                </Link>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl" asChild>
                <Link href="/admin/settings">
                    <ExternalLink className="w-6 h-6 text-primary" />
                    <span>Site Settings</span>
                </Link>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl" asChild>
                <Link href="/admin/hero">
                    <PlusCircle className="w-6 h-6 text-primary" />
                    <span>Hero Carousel</span>
                </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-black/5 dark:border-white/5 shadow-sm">
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>Database and API status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium">Supabase API</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">OPERATIONAL</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium">Authentication</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">OPERATIONAL</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium">Cloudinary Storage</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">OPERATIONAL</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
