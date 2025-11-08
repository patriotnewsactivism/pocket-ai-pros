import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNewsletterSubscription } from "@/hooks/useApi";
import {
  NewsletterSubscriptionFormValues,
  newsletterSubscriptionSchema,
} from "@/lib/schemas/newsletter";
import { trackEvent } from "./Analytics";

const Newsletter = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { mutate: subscribe, isPending } = useNewsletterSubscription();

  const form = useForm<NewsletterSubscriptionFormValues>({
    resolver: zodResolver(newsletterSubscriptionSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    subscribe(values.email, {
      onSuccess: () => {
        setIsSubscribed(true);
        trackEvent("newsletterSignup");
        form.reset();
        setTimeout(() => {
          setIsSubscribed(false);
        }, 3000);
      },
    });
  });

  return (
    <section className="py-16 bg-gradient-to-br from-primary/90 via-primary to-primary/80 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" aria-hidden="true" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-2xl mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Stay Ahead of the AI Curve
          </h2>

          <p className="text-xl text-white/90 mb-8">
            Get the latest AI insights, product updates, and exclusive tips
            delivered to your inbox every week
          </p>

          {!isSubscribed ? (
            <Form {...form}>
              <form
                onSubmit={onSubmit}
                noValidate
                className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email"
                          className="flex-1 bg-white/95 backdrop-blur border-white/20 h-12 text-base"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage className="text-left" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold px-8 h-12"
                  disabled={isPending}
                >
                  Subscribe Free
                </Button>
              </form>
            </Form>
          ) : (
            <div className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur rounded-xl px-6 py-4 max-w-xl mx-auto">
              <CheckCircle2 className="w-6 h-6 text-white" />
              <span className="text-white font-semibold text-lg">
                Thanks for subscribing!
              </span>
            </div>
          )}

          <p className="text-white/80 text-sm mt-6">
            Join 10,000+ subscribers. No spam, unsubscribe anytime.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mt-10 text-white/90">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-sm">Subscribers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">Weekly</div>
              <div className="text-sm">Updates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">0%</div>
              <div className="text-sm">Spam Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
