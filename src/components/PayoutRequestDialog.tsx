import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DollarSign, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  payoutRequestSchema,
  type PayoutRequestFormValues,
  PAYOUT_METHODS,
  MINIMUM_PAYOUT,
} from "@/lib/schemas/payout";
import { supabase } from "@/integrations/supabase/client";

interface PayoutRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableEarnings: number;
  onPayoutRequested: () => void;
}

export default function PayoutRequestDialog({
  open,
  onOpenChange,
  availableEarnings,
  onPayoutRequested,
}: PayoutRequestDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PayoutRequestFormValues>({
    resolver: zodResolver(payoutRequestSchema),
    defaultValues: {
      amount: Math.floor(availableEarnings),
      payout_method: "paypal",
      payout_email: "",
    },
  });

  const selectedMethod = form.watch("payout_method");

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Call the request_payout database function
      const { data, error } = await supabase.rpc("request_payout", {
        p_amount: values.amount,
        p_payout_method: values.payout_method,
        p_payout_email: values.payout_email || null,
        p_payout_details: values.payout_details || {},
      });

      if (error) throw error;

      toast({
        title: "Payout Requested!",
        description: `Your payout request for $${values.amount.toFixed(2)} has been submitted and will be reviewed within 2-3 business days.`,
      });

      form.reset();
      onOpenChange(false);
      onPayoutRequested();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to request payout";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Request Payout
          </DialogTitle>
          <DialogDescription>
            Request a payout from your available earnings. Minimum payout amount is $
            {MINIMUM_PAYOUT}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Available Earnings</span>
                <span className="text-2xl font-bold text-primary">
                  ${availableEarnings.toFixed(2)}
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="amount">Payout Amount *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min={MINIMUM_PAYOUT}
                        max={availableEarnings}
                        className="pl-7"
                        disabled={loading}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter amount between ${MINIMUM_PAYOUT} and ${availableEarnings.toFixed(2)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payout_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="payout_method">Payout Method *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger id="payout_method">
                        <SelectValue placeholder="Select payout method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYOUT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{method.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {method.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(selectedMethod === "paypal" || selectedMethod === "stripe") && (
              <FormField
                control={form.control}
                name="payout_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="payout_email">
                      {selectedMethod === "paypal" ? "PayPal" : "Stripe"} Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="payout_email"
                        type="email"
                        placeholder="your@email.com"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Email associated with your{" "}
                      {selectedMethod === "paypal" ? "PayPal" : "Stripe"} account
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedMethod === "wire" && (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Wire Transfer:</strong> Our team will contact you for bank details
                  after approval.
                </p>
              </div>
            )}

            {selectedMethod === "check" && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Check by Mail:</strong> Allow 7-10 business days for delivery after
                  approval.
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || availableEarnings < MINIMUM_PAYOUT}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
