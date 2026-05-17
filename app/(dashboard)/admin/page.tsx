import { Building2, Users, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Properties", value: "124", icon: Building2, change: "+12%" },
    { title: "Active Users", value: "1,240", icon: Users, change: "+5.4%" },
    { title: "Bookings This Month", value: "482", icon: Calendar, change: "+18%" },
    { title: "Revenue (ZMW)", value: "45,200", icon: TrendingUp, change: "+10%" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Console</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back. Here's what's happening across the platform.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-black/5 dark:border-white/5 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.title}</CardTitle>
              <stat.icon className="w-4 h-4 text-green-600 dark:text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600 dark:text-green-500 font-medium mt-1">
                {stat.change} <span className="text-slate-400 font-normal">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-black/5 dark:border-white/5 shadow-sm">
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl m-4">
            <p className="text-slate-400 text-sm">Analytics chart placeholder</p>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-black/5 dark:border-white/5 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center gap-4 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">New user registered</p>
                    <p className="text-xs text-slate-400">2 minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
