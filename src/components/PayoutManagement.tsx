import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PayoutDetails {
  id: string;
  reseller_id: string;
  amount: number;
  status: string;
  payout_method: string;
  payout_email: string;
  requested_at: string;
  reviewed_at: string | null;
  paid_at: string | null;
  review_notes: string | null;
  transaction_id: string | null;
  reseller_email: string;
  reseller_name: string;
  reseller_total_earnings: number;
  reseller_clients_count: number;
  reseller_commission_rate: number;
}

interface ActionDialogState {
  open: boolean;
  type: "approve" | "reject" | "paid" | null;
  payout: PayoutDetails | null;
  notes: string;
  transactionId: string;
  loading: boolean;
}

export default function PayoutManagement() {
  const [payouts, setPayouts] = useState<PayoutDetails[]>([]);
  const [filteredPayouts, setFilteredPayouts] = useState<PayoutDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({
    open: false,
    type: null,
    payout: null,
    notes: "",
    transactionId: "",
    loading: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPayouts();
  }, []);

  useEffect(() => {
    filterPayouts();
  }, [payouts, searchTerm, statusFilter]);

  const loadPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_payout_dashboard")
        .select("*");

      if (error) throw error;

      setPayouts(data || []);
    } catch (error) {
      console.error("Error loading payouts:", error);
      toast({
        title: "Error",
        description: "Failed to load payouts. Make sure you have admin privileges.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPayouts = () => {
    let filtered = payouts;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Filter by search term (email, name, or transaction ID)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.reseller_email.toLowerCase().includes(term) ||
          p.reseller_name?.toLowerCase().includes(term) ||
          p.transaction_id?.toLowerCase().includes(term)
      );
    }

    setFilteredPayouts(filtered);
  };

  const handleAction = async () => {
    const { type, payout, notes, transactionId } = actionDialog;
    if (!type || !payout) return;

    setActionDialog((prev) => ({ ...prev, loading: true }));

    try {
      let error;

      if (type === "approve") {
        const result = await supabase.rpc("approve_payout", {
          p_payout_id: payout.id,
          p_notes: notes || null,
        });
        error = result.error;
      } else if (type === "reject") {
        const result = await supabase.rpc("reject_payout", {
          p_payout_id: payout.id,
          p_notes: notes || "Rejected by admin",
        });
        error = result.error;
      } else if (type === "paid") {
        const result = await supabase.rpc("mark_payout_paid", {
          p_payout_id: payout.id,
          p_transaction_id: transactionId,
          p_notes: notes || null,
        });
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Payout ${type === "approve" ? "approved" : type === "reject" ? "rejected" : "marked as paid"} successfully.`,
      });

      setActionDialog({
        open: false,
        type: null,
        payout: null,
        notes: "",
        transactionId: "",
        loading: false,
      });

      loadPayouts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Action failed";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      setActionDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const openActionDialog = (
    type: "approve" | "reject" | "paid",
    payout: PayoutDetails
  ) => {
    setActionDialog({
      open: true,
      type,
      payout,
      notes: "",
      transactionId: "",
      loading: false,
    });
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

  const stats = {
    pending: payouts.filter((p) => p.status === "pending").length,
    approved: payouts.filter((p) => p.status === "approved").length,
    totalPending: payouts
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amount), 0),
    totalPaid: payouts
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + Number(p.amount), 0),
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payout Management</CardTitle>
          <CardDescription>Review and process reseller payout requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading payouts...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved (Not Paid)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${stats.totalPending.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalPaid.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
          <CardDescription>
            {filteredPayouts.length} of {payouts.length} requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredPayouts.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payouts Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No payout requests yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reseller</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payout.reseller_name || "N/A"}</div>
                          <div className="text-sm text-muted-foreground">
                            {payout.reseller_email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {payout.reseller_clients_count} clients •{" "}
                            {payout.reseller_commission_rate}% rate
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${Number(payout.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{formatPayoutMethod(payout.payout_method)}</div>
                          {payout.payout_email && (
                            <div className="text-xs text-muted-foreground">
                              {payout.payout_email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell>
                        {format(new Date(payout.requested_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {payout.status === "paid" && payout.paid_at && (
                            <div className="text-green-600">
                              Paid: {format(new Date(payout.paid_at), "MMM d, yyyy")}
                            </div>
                          )}
                          {payout.transaction_id && (
                            <div className="text-xs text-muted-foreground">
                              TX: {payout.transaction_id}
                            </div>
                          )}
                          {payout.review_notes && (
                            <div className="text-xs text-muted-foreground max-w-xs truncate">
                              Note: {payout.review_notes}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {payout.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => openActionDialog("approve", payout)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openActionDialog("reject", payout)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {payout.status === "approved" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => openActionDialog("paid", payout)}
                            >
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !actionDialog.loading && setActionDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === "approve" && "Approve Payout Request"}
              {actionDialog.type === "reject" && "Reject Payout Request"}
              {actionDialog.type === "paid" && "Mark Payout as Paid"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.payout && (
                <div className="mt-2 space-y-1">
                  <div>Reseller: {actionDialog.payout.reseller_name} ({actionDialog.payout.reseller_email})</div>
                  <div className="font-semibold">Amount: ${Number(actionDialog.payout.amount).toFixed(2)}</div>
                  <div>Method: {formatPayoutMethod(actionDialog.payout.payout_method)}</div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {actionDialog.type === "paid" && (
              <div>
                <label htmlFor="transactionId" className="text-sm font-medium">
                  Transaction ID *
                </label>
                <Input
                  id="transactionId"
                  placeholder="Enter transaction/reference ID"
                  value={actionDialog.transactionId}
                  onChange={(e) =>
                    setActionDialog((prev) => ({ ...prev, transactionId: e.target.value }))
                  }
                  disabled={actionDialog.loading}
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="notes" className="text-sm font-medium">
                Notes {actionDialog.type === "reject" ? "*" : "(optional)"}
              </label>
              <Textarea
                id="notes"
                placeholder={
                  actionDialog.type === "reject"
                    ? "Please provide a reason for rejection"
                    : "Add any additional notes"
                }
                value={actionDialog.notes}
                onChange={(e) =>
                  setActionDialog((prev) => ({ ...prev, notes: e.target.value }))
                }
                disabled={actionDialog.loading}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog((prev) => ({ ...prev, open: false }))}
              disabled={actionDialog.loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={
                actionDialog.loading ||
                (actionDialog.type === "paid" && !actionDialog.transactionId) ||
                (actionDialog.type === "reject" && !actionDialog.notes)
              }
            >
              {actionDialog.loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Confirm</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
