import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Trash2,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookings,
});

function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Booking status updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    }
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ payment_status: status, status: "confirmed" })
        .eq("id", id);
      if (error) throw error;
      
      // Fetch the booking details to send the WhatsApp message
      const { data } = await supabase.from("bookings").select("*").eq("id", id).single();
      return data;
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Payment confirmed and booking updated");
      
      if (booking) {
        const msg = encodeURIComponent(
          `Hello ${booking.guest_name}! 🌿\n\nYour payment of ₹${Number(booking.total_amount).toLocaleString("en-IN")} has been received and your booking at *Breezy Corner* is now officially CONFIRMED! ✅\n\n📅 Date: ${format(new Date(booking.check_in), "dd MMM yyyy")}\n⏰ Check-in: ${booking.check_in_time}\n\nWe look forward to welcoming you! 🏠`
        );
        const phone = booking.whatsapp_number || booking.guest_phone;
        const cleanPhone = phone.replace(/\D/g, "");
        const finalPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
        
        window.open(`https://wa.me/${finalPhone}?text=${msg}`, "_blank");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update payment");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Booking deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete booking");
    }
  });

  const filteredBookings = bookings?.filter(b => 
    b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.guest_phone.includes(searchTerm)
  );

  if (isLoading) return <div className="animate-pulse space-y-4">
    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white/50 rounded-lg" />)}
  </div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest">Bookings</h1>
          <p className="text-muted-foreground">View and manage all guest reservations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button size="sm" className="bg-forest text-cream">
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name or phone..." 
          className="border-none shadow-none focus-visible:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings?.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div className="font-medium">{booking.guest_name}</div>
                  <div className="text-xs text-muted-foreground">{booking.guest_phone}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(booking.check_in), "dd MMM")} - {format(new Date(booking.check_out), "dd MMM")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {booking.check_in_time} - {booking.check_out_time}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {booking.package_type.replace("_", " ")}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {booking.guests} guests
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold">₹{Number(booking.total_amount).toLocaleString("en-IN")}</div>
                  <Badge variant={booking.payment_status === "paid" ? "default" : "secondary"} className="text-[10px] h-4">
                    {booking.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={booking.status} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => updatePaymentMutation.mutate({ id: booking.id, status: "paid" })}>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Confirm Payment
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "confirmed" })}>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" /> Confirm Booking
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "cancelled" })}>
                        <XCircle className="mr-2 h-4 w-4 text-rose-500" /> Cancel Booking
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const msg = encodeURIComponent(`Hello ${booking.guest_name}, regarding your booking at Breezy Corner...`);
                        const phone = booking.whatsapp_number || booking.guest_phone;
                        const cleanPhone = phone.replace(/\D/g, "");
                        const finalPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
                        window.open(`https://wa.me/${finalPhone}?text=${msg}`, "_blank");
                      }}>
                        <MessageSquare className="mr-2 h-4 w-4 text-sky-500" /> Contact WhatsApp
                      </DropdownMenuItem>
                      <hr className="my-1" />
                      <DropdownMenuItem className="text-destructive" onClick={() => {
                        if (confirm("Are you sure you want to delete this booking?")) {
                          deleteMutation.mutate(booking.id);
                        }
                      }}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredBookings?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Confirmed</Badge>;
    case "cancelled":
      return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">Cancelled</Badge>;
    case "pending":
    default:
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Pending</Badge>;
  }
}
