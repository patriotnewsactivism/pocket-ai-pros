import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Bot } from "lucide-react";

import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { signInSchema, signUpSchema, type SignInValues, type SignUpValues } from "@/lib/schemas/auth";

export default function Auth() {
  const [isSignInLoading, setIsSignInLoading] = useState(false);
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const referralId = searchParams.get("ref");
  const { toast } = useToast();
  const navigate = useNavigate();

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      company: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (referralId) {
      localStorage.setItem("referral_id", referralId);
    }
  }, [referralId]);

  const handleSignUp = signUpForm.handleSubmit(async (values) => {
    setIsSignUpLoading(true);

    if (!isSupabaseConfigured) {
      toast({
        title: "Authentication not configured",
        description: "Please contact the administrator to set up Supabase authentication keys (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).",
        variant: "destructive",
      });
      setIsSignUpLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: values.fullName,
            company: values.company ?? "",
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Check if email confirmation is required
        // If user.email_confirmed_at is null, Supabase requires email confirmation
        const emailConfirmationRequired = !authData.user.email_confirmed_at;

        if (emailConfirmationRequired) {
          // Email confirmation is enabled - user needs to verify email
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link. Please check your inbox and click the link to activate your account.",
          });
          setIsSignUpLoading(false);
          return;
        }

        // If email confirmation is not required or already confirmed, proceed with setup
        // Link user to referrer if they signed up via referral link
        const storedReferralId = localStorage.getItem("referral_id");

        if (storedReferralId) {
          // Find the referrer by their referral code
          const { data: referrer } = await supabase
            .from("users")
            .select("id")
            .eq("referral_code", storedReferralId)
            .single();

          if (referrer) {
            // Update the new user with the referrer's ID
            await supabase
              .from("users")
              .update({ referred_by: referrer.id })
              .eq("id", authData.user.id);
          }

          localStorage.removeItem("referral_id");
        }

        toast({
          title: "Account created!",
          description: "Welcome to BuildMyBot. Redirecting to your dashboard...",
        });

        setTimeout(() => navigate("/dashboard"), 1000);
      }
    } catch (error: unknown) {
      let message = "Please try again";
      if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes("Failed to execute 'fetch' on 'Window'") ||
            error.message.includes("Failed to fetch") ||
            error.name === "TypeError" && error.message.includes("fetch")) {
          message = "Authentication service is not properly configured. Please ensure valid Supabase credentials are set up.";
        } else {
          // Clean up the error message to be more user-friendly
          message = error.message
            .replace(/Supabase is not configured.*?Attempted to access.*?on the disabled client\.?/i, "Authentication service is not configured. Please contact support.")
            .replace(/Please provide VITE_SUPABASE_URL.*?key\.?/i, "Authentication service is not configured.");
        }
      }
      toast({
        title: "Sign up failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSignUpLoading(false);
    }
  });

  const handleSignIn = signInForm.handleSubmit(async (values) => {
    setIsSignInLoading(true);

    if (!isSupabaseConfigured) {
      toast({
        title: "Authentication not configured",
        description: "Please contact the administrator to set up Supabase authentication keys (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).",
        variant: "destructive",
      });
      setIsSignInLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "Redirecting to your dashboard...",
      });

      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error: unknown) {
      let message = "Please try again";
      if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes("Failed to execute 'fetch' on 'Window'") ||
            error.message.includes("Failed to fetch") ||
            error.name === "TypeError" && error.message.includes("fetch")) {
          message = "Authentication service is not properly configured. Please ensure valid Supabase credentials are set up.";
        } else {
          // Clean up the error message to be more user-friendly
          message = error.message
            .replace(/Supabase is not configured.*?Attempted to access.*?on the disabled client\.?/i, "Authentication service is not configured. Please contact support.")
            .replace(/Please provide VITE_SUPABASE_URL.*?key\.?/i, "Authentication service is not configured.");
        }
      }
      toast({
        title: "Sign in failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSignInLoading(false);
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/10 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl">BuildMyBot</CardTitle>
          <CardDescription>Get started with your AI chatbot platform</CardDescription>
          {!isSupabaseConfigured && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
              <p className="text-destructive font-medium">Authentication Service Not Configured</p>
              <p className="text-muted-foreground text-xs mt-1">
                Please set up Supabase keys to enable sign-in and account creation.
              </p>
            </div>
          )}
        </CardHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Form {...signInForm}>
              <form onSubmit={handleSignIn} className="space-y-4">
                <CardContent className="space-y-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="signin-email">Email</FormLabel>
                        <FormControl>
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="you@example.com"
                            disabled={isSignInLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="signin-password">Password</FormLabel>
                        <FormControl>
                          <Input
                            id="signin-password"
                            type="password"
                            placeholder="••••••••"
                            disabled={isSignInLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSignInLoading}>
                    {isSignInLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="signup">
            <Form {...signUpForm}>
              <form onSubmit={handleSignUp} className="space-y-4">
                <CardContent className="space-y-4">
                  <FormField
                    control={signUpForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="signup-name">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            id="signup-name"
                            placeholder="John Doe"
                            disabled={isSignUpLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="signup-company">Company (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            id="signup-company"
                            placeholder="Acme Inc"
                            disabled={isSignUpLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="signup-email">Email</FormLabel>
                        <FormControl>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            disabled={isSignUpLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="signup-password">Password</FormLabel>
                        <FormControl>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            disabled={isSignUpLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSignUpLoading}>
                    {isSignUpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <div className="p-6 pt-0 text-center text-sm text-muted-foreground">
          <a href="/" className="hover:text-primary">
            Back to home
          </a>
        </div>
      </Card>
    </div>
  );
}
