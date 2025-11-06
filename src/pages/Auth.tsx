import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bot } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const referralId = searchParams.get('ref');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Store referral ID in localStorage if present
    if (referralId) {
      localStorage.setItem('referral_id', referralId);
    }
  }, [referralId]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const company = formData.get('company') as string || '';

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            company: company,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Check if email confirmation is required
        const session = authData.session;

        if (!session) {
          // Email confirmation required
          toast({
            title: 'Check your email!',
            description: 'We sent you a confirmation link. Please verify your email before signing in.',
          });
          setLoading(false);
          return;
        }

        // Get referral ID from localStorage if it exists
        const storedReferralId = localStorage.getItem('referral_id');

        if (storedReferralId) {
          // Track the referral - increment client count for reseller
          const { data: reseller } = await supabase
            .from('resellers')
            .select('clients_count')
            .eq('user_id', storedReferralId)
            .single();

          if (reseller) {
            await supabase
              .from('resellers')
              .update({ clients_count: (reseller.clients_count || 0) + 1 })
              .eq('user_id', storedReferralId);
          }

          localStorage.removeItem('referral_id');
        }

        toast({
          title: 'Account created!',
          description: 'Welcome to BuildMyBot. Redirecting to your dashboard...',
        });

        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Welcome back!',
        description: 'Redirecting to your dashboard...',
      });

      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
        </CardHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    name="fullName"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-company">Company (Optional)</Label>
                  <Input
                    id="signup-company"
                    name="company"
                    placeholder="Acme Inc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </CardFooter>
            </form>
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
