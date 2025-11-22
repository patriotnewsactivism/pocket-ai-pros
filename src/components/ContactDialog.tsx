import { useEffect, useMemo, useRef, useState } from "react";
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
import { useContactForm } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { contactFormSchema, type ContactFormValues } from "@/lib/schemas/contact";

interface ContactDialogProps {
  trigger?: React.ReactNode;
  defaultPlan?: string;
}

interface ContactFormProps {
  defaultMessage: string;
  onSubmitted?: () => void;
}

export function ContactForm({ defaultMessage, onSubmitted }: ContactFormProps) {
  const { mutate: submitContact, isPending } = useContactForm();
  const { toast } = useToast();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: defaultMessage,
    },
  });

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    form.reset({
      name: "",
      email: "",
      company: "",
      message: defaultMessage,
    });
  }, [defaultMessage, form]);

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors();
    setSuccessMessage(null);
    setStatusMessage("Submitting your request...");
    submitContact({
      name: values.name || "",
      email: values.email || "",
      company: values.company,
      message: values.message || "",
    }, {
      onSuccess: (data) => {
        const confirmationMessage =
          (data as { message?: string })?.message || "Thanks! Your request has been received.";
        toast({
          title: "Request received",
          description: confirmationMessage,
        });
        setSuccessMessage(confirmationMessage);
        setStatusMessage("");
        form.reset({
          name: "",
          email: "",
          company: "",
          message: defaultMessage,
        });
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
        }
        closeTimerRef.current = setTimeout(() => {
          onSubmitted?.();
          setSuccessMessage(null);
        }, 1200);
      },
      onError: (error) => {
        const errorMessage =
          (error as { message?: string })?.message || "Failed to submit form. Please try again.";
        toast({
          title: "Submission failed",
          description: errorMessage,
          variant: "destructive",
        });
        setStatusMessage("");
        form.setError("root", { message: errorMessage });
      },
      onSettled: () => {
        setStatusMessage("");
      },
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="sr-only" aria-live="polite">
          {isPending
            ? "Submitting your request..."
            : successMessage || statusMessage || "Ready to submit the contact form."}
        </p>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name">Full Name *</FormLabel>
              <FormControl>
                <Input id="name" placeholder="John Doe" disabled={isPending} {...field} />
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
              <FormLabel htmlFor="email">Email Address *</FormLabel>
              <FormControl>
                <Input
                  id="email"
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
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="company">Company Name</FormLabel>
              <FormControl>
                <Input
                  id="company"
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
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="message">Tell us about your needs</FormLabel>
              <FormControl>
                <Textarea
                  id="message"
                  placeholder="I'm looking to build an AI bot for..."
                  rows={4}
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root?.message && (
          <p className="text-sm text-destructive" role="alert" aria-live="assertive">
            {form.formState.errors.root.message}
          </p>
        )}
        {successMessage && (
          <p className="text-sm text-green-600" role="status" aria-live="polite">
            {successMessage}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Request"
          )}
        </Button>
      </form>
    </Form>
  );
}

export function ContactDialog({ trigger, defaultPlan }: ContactDialogProps) {
  const [open, setOpen] = useState(false);

  const defaultMessage = useMemo(
    () => (defaultPlan ? `I'm interested in the ${defaultPlan} plan.` : ""),
    [defaultPlan]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="hero">Get Started Free</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Get Started with BuildMyBot</DialogTitle>
          <DialogDescription>
            Fill out the form below and we'll get you set up with your AI bot in no time.
          </DialogDescription>
        </DialogHeader>
        <ContactForm defaultMessage={defaultMessage} onSubmitted={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
