import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResellerApplication } from "@/hooks/useApi";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ResellerDialogProps {
  trigger?: React.ReactNode;
}

export function ResellerDialog({ trigger }: ResellerDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    experience: "",
    expectedClients: "",
  });

  const { mutate: applyReseller, isPending } = useResellerApplication();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyReseller(
      {
        ...formData,
        expectedClients: formData.expectedClients
          ? Number(formData.expectedClients)
          : undefined,
      },
      {
        onSuccess: () => {
          setFormData({
            name: "",
            email: "",
            company: "",
            phone: "",
            experience: "",
            expectedClients: "",
          });
          setOpen(false);
        },
      }
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="hero" size="xl">
            Apply for Reseller Program
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reseller Program Application</DialogTitle>
          <DialogDescription>
            Join our reseller program and start earning recurring commissions. We'll review your application within 2 business days.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reseller-name">Full Name *</Label>
              <Input
                id="reseller-name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reseller-email">Email Address *</Label>
              <Input
                id="reseller-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@company.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reseller-company">Company Name *</Label>
              <Input
                id="reseller-company"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                placeholder="Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reseller-phone">Phone Number</Label>
              <Input
                id="reseller-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reseller-clients">
              Expected Number of Clients
            </Label>
            <Input
              id="reseller-clients"
              name="expectedClients"
              type="number"
              min="1"
              value={formData.expectedClients}
              onChange={handleChange}
              placeholder="10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reseller-experience">
              Your Experience & Why You'd Be a Great Partner
            </Label>
            <Textarea
              id="reseller-experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Tell us about your experience in sales, your existing client base, and why you're interested in partnering with us..."
              rows={5}
            />
          </div>
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
      </DialogContent>
    </Dialog>
  );
}
