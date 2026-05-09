import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2,
  Calendar as CalendarIcon,
  Info
} from "lucide-react";
import { 
  format, 
  addMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay,
  isToday,
  startOfToday
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/calendar")({
  component: AdminCalendar,
});

function AdminCalendar() {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const { data: blockedDates, isLoading: loadingBlocked } = useQuery({
    queryKey: ["admin-blocked-dates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_dates")
        .select("*");
      if (error) throw error;
      return data;
    }
  });

  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ["admin-bookings-calendar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("check_in, check_out, guest_name, status")
        .neq("status", "cancelled");
      if (error) throw error;
      return data;
    }
  });

  const blockMutation = useMutation({
    mutationFn: async ({ date, reason }: { date: string, reason: string }) => {
      const { error } = await supabase
        .from("blocked_dates")
        .insert({ blocked_date: date, reason });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blocked-dates"] });
      toast.success("Date blocked");
      setReason("");
      setSelectedDate(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to block date");
    }
  });

  const unblockMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blocked_dates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blocked-dates"] });
      toast.success("Date unblocked");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to unblock date");
    }
  });

  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month)
  });

  const pad = startOfMonth(month).getDay();

  const dateKey = (d: Date) => format(d, "yyyy-MM-dd");

  const isBlocked = (d: Date) => {
    const key = dateKey(d);
    return blockedDates?.find(b => b.blocked_date === key);
  };

  const isBooked = (d: Date) => {
    const key = dateKey(d);
    return bookings?.find(b => {
      const start = b.check_in;
      const end = b.check_out;
      // If it's a same-day booking (Day Visit), it should show up on that day
      if (start === end) return key === start;
      // For night stays, it occupies from check-in up to (but not including) check-out morning
      return key >= start && key < end;
    });
  };

  const today = startOfToday();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-forest">Calendar Management</h1>
        <p className="text-muted-foreground">Block dates or view occupancy at a glance.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-forest">{format(month, "MMMM yyyy")}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setMonth(addMonths(month, -1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setMonth(addMonths(month, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-4 flex gap-4 text-xs">
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Available</div>
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-rose-500" /> Booked</div>
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-slate-800" /> Blocked</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-xs font-bold text-muted-foreground py-2">{d}</div>
            ))}
            {Array.from({ length: pad }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map(d => {
              const blocked = isBlocked(d);
              const booked = isBooked(d);
              const selected = selectedDate && isSameDay(d, selectedDate);
              
              let classes = "aspect-square rounded-lg border flex flex-col items-center justify-center text-sm font-medium transition-all cursor-pointer ";
              
              if (blocked) {
                classes += "bg-slate-800 text-white border-slate-900";
              } else if (booked) {
                classes += "bg-rose-500 text-white border-rose-600";
              } else {
                classes += "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200";
              }

              if (selected) classes += " ring-2 ring-terra ring-offset-2 scale-95";
              if (isToday(d)) classes += " ring-1 ring-forest";

              return (
                <button 
                  key={d.toString()} 
                  className={classes}
                  onClick={() => setSelectedDate(d)}
                >
                  {format(d, "d")}
                  {booked && <div className="text-[8px] truncate max-w-full px-1">{booked.guest_name}</div>}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manage Date</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Selected Date</Label>
                <div className="mt-1 text-sm font-semibold">
                  {selectedDate ? format(selectedDate, "PPP") : "No date selected"}
                </div>
              </div>

              {selectedDate && (
                <>
                  {isBlocked(selectedDate) ? (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-slate-100 p-3 text-xs text-slate-700 border border-slate-200">
                        <p className="font-bold">Date is blocked</p>
                        <p className="mt-1">Reason: {isBlocked(selectedDate)?.reason || "No reason provided"}</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        disabled={unblockMutation.isPending}
                        onClick={() => unblockMutation.mutate(isBlocked(selectedDate)!.id)}
                      >
                        {unblockMutation.isPending ? "Unblocking..." : "Unblock Date"}
                      </Button>
                    </div>
                  ) : isBooked(selectedDate) ? (
                    <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                      <p className="font-bold">Date is booked</p>
                      <p className="mt-1">Guest: {isBooked(selectedDate)?.guest_name}</p>
                      <p className="mt-1 capitalize">Status: {isBooked(selectedDate)?.status}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="reason">Blocking Reason</Label>
                        <Input 
                          id="reason" 
                          placeholder="Maintenance, personal use..." 
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </div>
                      <Button 
                        className="w-full bg-forest text-cream"
                        disabled={blockMutation.isPending}
                        onClick={() => blockMutation.mutate({ 
                          date: dateKey(selectedDate), 
                          reason 
                        })}
                      >
                        {blockMutation.isPending ? "Blocking..." : "Block this Date"}
                      </Button>
                    </div>
                  )}
                </>
              )}
              {!selectedDate && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <CalendarIcon className="mb-2 h-8 w-8 opacity-20" />
                  <p className="text-xs">Click a date on the calendar to manage it.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booked Days</span>
                <span className="font-semibold">{bookings?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Blocked Days</span>
                <span className="font-semibold">{blockedDates?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
