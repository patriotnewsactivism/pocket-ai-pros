import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, LogOut, Bot, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';
import PayoutRequestDialog from '@/components/PayoutRequestDialog';
import PayoutHistory from '@/components/PayoutHistory';
import { MINIMUM_PAYOUT } from '@/lib/schemas/payout';

interface ResellerData {
  commission_rate: number;
  total_earnings: number;
  clients_count: number;
  status: string;
  referral_code?: string;
  paid_earnings?: number;
  pending_earnings?: number;
}

interface ResellerClient {
  id: string;
  email: string;
  full_name: string;
  plan: string;
  created_at: string;
}

export default function ResellerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [reseller, setReseller] = useState<ResellerData | null>(null);
  const [clients, setClients] = useState<ResellerClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const { toast} = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkReseller();
  }, []);

  const checkReseller = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    setUser(user);

    // Get user's referral code
    const { data: userData } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', user.id)
      .single();

    // Check if user is a reseller
    const { data, error } = await supabase
      .from('resellers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      navigate('/dashboard');
      return;
    }

    setReseller({ ...data, referral_code: userData?.referral_code });

    // Load referred clients
    const { data: clientsData } = await supabase
      .from('users')
      .select('id, email, full_name, plan, created_at')
      .eq('referred_by', user.id)
      .order('created_at', { ascending: false });

    if (clientsData) {
      setClients(clientsData);
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const refreshResellerData = () => {
    checkReseller();
  };

  const availableEarnings = reseller
    ? (reseller.total_earnings || 0) - (reseller.paid_earnings || 0) - (reseller.pending_earnings || 0)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading reseller dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Reseller Portal</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              My Bots
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Total Earnings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Earnings</CardTitle>
              <CardDescription>All-time commission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ${reseller?.total_earnings?.toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>

          {/* Available Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Balance</CardTitle>
              <CardDescription>Ready for payout</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${availableEarnings.toFixed(2)}
              </div>
              <Button
                className="w-full mt-3"
                size="sm"
                disabled={availableEarnings < MINIMUM_PAYOUT}
                onClick={() => setPayoutDialogOpen(true)}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Request Payout
              </Button>
            </CardContent>
          </Card>

          {/* Clients Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Clients</CardTitle>
              <CardDescription>Clients you've referred</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reseller?.clients_count || 0}</div>
            </CardContent>
          </Card>

          {/* Commission Rate Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Commission Rate</CardTitle>
              <CardDescription>Your earning rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {reseller?.commission_rate || 40}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Breakdown Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Earnings Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
                <p className="text-2xl font-bold">${reseller?.total_earnings?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Paid Out</p>
                <p className="text-2xl font-bold text-blue-600">${reseller?.paid_earnings?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">${reseller?.pending_earnings?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            {availableEarnings < MINIMUM_PAYOUT && availableEarnings > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Minimum payout amount is ${MINIMUM_PAYOUT}. You need $
                  {(MINIMUM_PAYOUT - availableEarnings).toFixed(2)} more to request a payout.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Earning Potential
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Free Plan (per client):</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Starter ($29/mo):</span>
                <span className="font-semibold">${(29 * (reseller?.commission_rate || 40) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Professional ($99/mo):</span>
                <span className="font-semibold">${(99 * (reseller?.commission_rate || 40) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Executive ($199/mo):</span>
                <span className="font-semibold">${(199 * (reseller?.commission_rate || 40) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enterprise ($399/mo):</span>
                <span className="font-semibold">${(399 * (reseller?.commission_rate || 40) / 100).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  <span>Share your unique referral link with potential clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  <span>Earn {reseller?.commission_rate}% commission on all paid plans</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  <span>Commissions paid monthly via your preferred method</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  <span>Lifetime commissions - earn as long as they subscribe</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>Share this link to earn commissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/auth?ref=${reseller?.referral_code || user?.id}`}
                className="flex-1 px-4 py-2 border rounded-lg bg-muted"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/auth?ref=${reseller?.referral_code || user?.id}`);
                  toast({
                    title: 'Copied!',
                    description: 'Referral link copied to clipboard',
                  });
                }}
              >
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payout History */}
        <div className="mb-8">
          <PayoutHistory />
        </div>

        {/* Clients List Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Clients</CardTitle>
            <CardDescription>
              {clients.length} total client{clients.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No clients yet. Share your referral link to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{client.full_name || client.email}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold capitalize">
                        {client.plan === 'free' ? (
                          <span className="text-muted-foreground">Free Plan</span>
                        ) : (
                          <span className="text-primary">{client.plan}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(client.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Payout Request Dialog */}
      <PayoutRequestDialog
        open={payoutDialogOpen}
        onOpenChange={setPayoutDialogOpen}
        availableEarnings={availableEarnings}
        onPayoutRequested={refreshResellerData}
      />
    </div>
  );
}
