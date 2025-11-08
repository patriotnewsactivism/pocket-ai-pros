import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useResellerApplication } from "@/hooks/useApi";
import {
  resellerApplicationSchema,
  type ResellerApplicationValues,
} from "@/lib/schemas/reseller";

interface ResellerDialogProps {
  trigger?: React.ReactNode;
}

interface ResellerApplicationFormProps {
  onSubmitted?: () => void;
}

export function ResellerApplicationForm({ onSubmitted }: ResellerApplicationFormProps) {
  const { mutate: applyReseller, isPending } = useResellerApplication();
  const form = useForm<ResellerApplicationValues>({
    resolver: zodResolver(resellerApplicationSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      experience: "",
      expectedClients: undefined,
    },
  });

  useEffect(() => {
    if (!isPending) {
      form.clearErrors();
    }
  }, [isPending, form]);

  const onSubmit = form.handleSubmit((values) => {
    applyReseller(values, {
      onSuccess: () => {
        form.reset({
          name: "",
          email: "",
          company: "",
          phone: "",
          experience: "",
          expectedClients: undefined,
        });
        onSubmitted?.();
      },
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="reseller-name">Full Name *</FormLabel>
                <FormControl>
                  <Input
                    id="reseller-name"
                    placeholder="John Doe"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="reseller-email">Email Address *</FormLabel>
                <FormControl>
                  <Input
                    id="reseller-email"
                    type="email"
                    placeholder="john@company.com"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="reseller-company">Company Name *</FormLabel>
                <FormControl>
                  <Input
                    id="reseller-company"
                    placeholder="Acme Inc."
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="reseller-phone">Phone Number</FormLabel>
                <FormControl>
                  <Input
                    id="reseller-phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="expectedClients"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="reseller-clients">Expected Number of Clients</FormLabel>
              <FormControl>
                <Input
                  id="reseller-clients"
                  type="number"
                  min={1}
                  placeholder="10"
                  disabled={isPending}
                  value={field.value === undefined ? "" : String(field.value)}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "") {
                      field.onChange(undefined);
                      return;
                    }
                    const nextValue = Number(value);
                    field.onChange(Number.isNaN(nextValue) ? undefined : nextValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="reseller-experience">
                Your Experience &amp; Why You'd Be a Great Partner
              </FormLabel>
              <FormControl>
                <Textarea
                  id="reseller-experience"
                  placeholder="Tell us about your experience in sales, your existing client base, and why you're interested in partnering with us..."
                  rows={5}
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting Application...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </form>
    </Form>
  );
}

export function ResellerDialog({ trigger }: ResellerDialogProps) {
  const [open, setOpen] = useState(false);

  const triggerContent = useMemo(
    () =>
      trigger || (
        <Button variant="hero" size="xl">
          Apply for Reseller Program
        </Button>
      ),
    [trigger]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerContent}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reseller Program Application</DialogTitle>
          <DialogDescription>
            Join our reseller program and start earning recurring commissions. We'll review your application within 2 business days.
          </DialogDescription>
        </DialogHeader>
        <ResellerApplicationForm onSubmitted={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
