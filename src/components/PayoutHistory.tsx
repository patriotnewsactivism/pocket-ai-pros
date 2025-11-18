import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Payout {
  id: string;
  amount: number;
  status: string;
  payout_method: string;
  payout_email: string;
  requested_at: string;
  reviewed_at: string | null;
  paid_at: string | null;
  review_notes: string | null;
  transaction_id: string | null;
}

export default function PayoutHistory() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("payouts")
        .select("*")
        .eq("reseller_id", user.id)
        .order("requested_at", { ascending: false });

      if (error) throw error;

      setPayouts(data || []);
    } catch (error) {
      console.error("Error loading payouts:", error);
      toast({
        title: "Error",
        description: "Failed to load payout history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayout = async (payoutId: string) => {
    if (!confirm("Are you sure you want to cancel this payout request?")) {
      return;
    }

    try {
      const { error } = await supabase.rpc("cancel_payout_request", {
        p_payout_id: payoutId,
      });

      if (error) throw error;

      toast({
        title: "Payout Cancelled",
        description: "Your payout request has been cancelled.",
      });

      loadPayouts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to cancel payout";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <AlertCircle className="w-4 h-4" />;
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      paid: "default",
      rejected: "destructive",
      cancelled: "outline",
    };

    return (
      <Badge variant={variants[status] || "outline"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const formatPayoutMethod = (method: string) => {
    const methods: Record<string, string> = {
      paypal: "PayPal",
      stripe: "Stripe",
      wire: "Wire Transfer",
      check: "Check",
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Your payout requests and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (payouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Your payout requests and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payouts Yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't requested any payouts. Request a payout when you have sufficient
              earnings.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout History</CardTitle>
        <CardDescription>
          Your payout requests and payment history ({payouts.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Requested</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">
                    {format(new Date(payout.requested_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${payout.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{formatPayoutMethod(payout.payout_method)}</TableCell>
                  <TableCell>{getStatusBadge(payout.status)}</TableCell>
                  <TableCell>
                    {payout.status === "paid" && payout.paid_at && (
                      <div className="text-sm">
                        <div className="text-muted-foreground">
                          Paid: {format(new Date(payout.paid_at), "MMM d, yyyy")}
                        </div>
                        {payout.transaction_id && (
                          <div className="text-xs text-muted-foreground">
                            ID: {payout.transaction_id}
                          </div>
                        )}
                      </div>
                    )}
                    {payout.status === "approved" && payout.reviewed_at && (
                      <div className="text-sm text-muted-foreground">
                        Approved: {format(new Date(payout.reviewed_at), "MMM d, yyyy")}
                      </div>
                    )}
                    {(payout.status === "rejected" || payout.status === "cancelled") &&
                      payout.review_notes && (
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {payout.review_notes}
                        </div>
                      )}
                  </TableCell>
                  <TableCell className="text-right">
                    {payout.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelPayout(payout.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
