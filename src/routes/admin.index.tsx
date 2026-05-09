import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  CalendarCheck, 
  IndianRupee, 
  TrendingUp,
  Clock
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*");

      if (!bookings) return null;

      const totalBookings = bookings.length;
      const pendingBookings = bookings.filter(b => b.status === "pending").length;
      const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
      const totalRevenue = bookings
        .filter(b => b.status === "confirmed" && b.payment_status === "paid")
        .reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
      
      const estimatedRevenue = bookings
        .filter(b => b.status !== "cancelled")
        .reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

      // Simple chart data (last 7 days or similar)
      const chartData = [
        { name: "Mon", bookings: 2 },
        { name: "Tue", bookings: 5 },
        { name: "Wed", bookings: 3 },
        { name: "Thu", bookings: 8 },
        { name: "Fri", bookings: 12 },
        { name: "Sat", bookings: 15 },
        { name: "Sun", bookings: 10 },
      ];

      return {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        totalRevenue,
        estimatedRevenue,
        chartData
      };
    }
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 rounded-xl bg-white/50" />
        ))}
      </div>
      <div className="h-96 rounded-xl bg-white/50" />
    </div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-forest">Dashboard Overview</h1>
        <p className="text-muted-foreground">Manage your farmhouse bookings and revenue.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Bookings" 
          value={stats?.totalBookings || 0} 
          icon={CalendarCheck} 
          description="Lifetime bookings"
        />
        <StatCard 
          title="Pending" 
          value={stats?.pendingBookings || 0} 
          icon={Clock} 
          description="Awaiting approval"
          className="text-amber-600"
        />
        <StatCard 
          title="Revenue (Paid)" 
          value={`₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`} 
          icon={IndianRupee} 
          description="Confirmed & Paid"
          className="text-emerald-600"
        />
        <StatCard 
          title="Est. Revenue" 
          value={`₹${(stats?.estimatedRevenue || 0).toLocaleString("en-IN")}`} 
          icon={TrendingUp} 
          description="Total active bookings"
          className="text-terra"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="var(--terra)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="var(--forest)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, description, className }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", className)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
