import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Bot, MessageSquare, LogOut, Plus, TrendingUp, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { User } from '@supabase/supabase-js';
import CreateBotDialog from '@/components/CreateBotDialog';

interface UserProfile {
  full_name: string;
  company: string;
  plan: string;
  conversations_used: number;
  conversations_limit: number;
  bots_limit: number;
}

interface BotData {
  id: string;
  name: string;
  description: string;
  conversations_count: number;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bots, setBots] = useState<BotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createBotOpen, setCreateBotOpen] = useState(false);
  const [isReseller, setIsReseller] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    setLoading(true);

    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        toast({
          title: 'Session expired',
          description: 'Please sign in again to access your dashboard.',
          variant: 'destructive',
          action: (
            <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
              Re-authenticate
            </Button>
          ),
        });
        setUser(null);
        setProfile(null);
        setBots([]);
        setIsReseller(false);
        return;
      }

      setUser(user);

      // Parallelize database queries for better performance
      await Promise.all([
        loadProfile(user.id),
        loadBots(user.id),
        checkResellerStatus(user.id)
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load dashboard';
      toast({
        title: 'Error loading dashboard',
        description: message,
        variant: 'destructive',
        action: (
          <Button variant="outline" size="sm" onClick={() => void checkUser()}>
            Retry
          </Button>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const checkResellerStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('resellers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      setIsReseller(!!data);
    } catch (error) {
      const status = typeof error === 'object' && error !== null ? (error as { status?: number }).status : undefined;
      const unauthorized = status === 401 || status === 403;
      toast({
        title: unauthorized ? 'Session expired' : 'Error checking reseller status',
        description: unauthorized
          ? 'Please sign in again to continue.'
          : (error instanceof Error ? error.message : 'Failed to verify reseller status.'),
        variant: 'destructive',
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => (unauthorized ? navigate('/auth') : void checkResellerStatus(userId))}
          >
            {unauthorized ? 'Re-authenticate' : 'Retry'}
          </Button>
        ),
      });
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      const status = typeof error === 'object' && error !== null ? (error as { status?: number }).status : undefined;
      const unauthorized = status === 401 || status === 403;
      toast({
        title: unauthorized ? 'Session expired' : 'Error loading profile',
        description: unauthorized
          ? 'Please sign in again to continue.'
          : (error instanceof Error ? error.message : 'Failed to load profile.'),
        variant: 'destructive',
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => (unauthorized ? navigate('/auth') : void loadProfile(userId))}
          >
            {unauthorized ? 'Re-authenticate' : 'Retry'}
          </Button>
        ),
      });
    }
  };

  const loadBots = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setBots(data || []);
    } catch (error) {
      const status = typeof error === 'object' && error !== null ? (error as { status?: number }).status : undefined;
      const unauthorized = status === 401 || status === 403;
      toast({
        title: unauthorized ? 'Session expired' : 'Error loading bots',
        description: unauthorized
          ? 'Please sign in again to continue.'
          : (error instanceof Error ? error.message : 'Failed to load bots.'),
        variant: 'destructive',
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => (unauthorized ? navigate('/auth') : void loadBots(userId))}
          >
            {unauthorized ? 'Re-authenticate' : 'Retry'}
          </Button>
        ),
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleCreateBot = () => {
    if (!profile) return;

    if (bots.length >= profile.bots_limit) {
      toast({
        title: 'Bot limit reached',
        description: 'Upgrade your plan to create more bots.',
        variant: 'destructive',
        action: (
          <Button variant="outline" size="sm" onClick={() => navigate('/#pricing')}>
            View Plans
          </Button>
        ),
      });
      return;
    }

    setCreateBotOpen(true);
  };

  const handleDeleteBot = async (botId: string) => {
    if (!confirm('Are you sure you want to delete this bot? This action cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('bots')
      .delete()
      .eq('id', botId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete bot',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Bot deleted successfully',
    });

    if (user) {
      await loadBots(user.id);
    }
  };

  const handleUpgradePlan = async (plan: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in again to manage your subscription.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    try {
      const normalizedPlan = plan.toLowerCase();
      const { data, error } = await supabase.functions.invoke<{ url?: string }>(
        'create-checkout-session',
        {
          body: { plan: normalizedPlan },
        }
      );

      if (error) {
        throw new Error(error.message || 'Failed to start checkout session');
      }

      const checkoutUrl = data?.url;
      if (!checkoutUrl) {
        throw new Error('No checkout URL returned. Please try again.');
      }

      const checkoutWindow = window.open(checkoutUrl, '_blank', 'noopener');
      if (!checkoutWindow) {
        throw new Error('Unable to open checkout window. Please allow pop-ups and try again.');
      }

      toast({
        title: 'Complete your upgrade',
        description: 'Finish the checkout in the newly opened tab to activate your plan.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start checkout session';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const conversationPercentage = profile
    ? (profile.conversations_used / profile.conversations_limit) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">BuildMyBot</h1>
              <p className="text-sm text-muted-foreground">
                {profile?.full_name || user?.email}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isReseller && (
              <Button variant="outline" onClick={() => navigate('/reseller')}>
                Reseller Portal
              </Button>
            )}
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Plan</CardTitle>
              <CardDescription>
                {profile?.plan?.toUpperCase() || 'FREE'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.plan === 'free' ? (
                <Button className="w-full" onClick={() => navigate('/#pricing')}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  Active subscription
                </p>
              )}
            </CardContent>
          </Card>

          {/* Conversations Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
              <CardDescription>
                {profile?.conversations_used || 0} of {profile?.conversations_limit || 60} used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={conversationPercentage} className="mb-2" />
              <p className="text-xs text-muted-foreground">
                {conversationPercentage.toFixed(0)}% used this month
              </p>
            </CardContent>
          </Card>

          {/* Bots Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Bots</CardTitle>
              <CardDescription>
                {bots.length} of {profile?.bots_limit || 1} bots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleCreateBot}>
                <Plus className="w-4 h-4 mr-2" />
                Create Bot
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bots List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Bots</CardTitle>
            <CardDescription>
              Manage your AI chatbots
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bots.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bots yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first AI chatbot to get started
                </p>
                <Button onClick={handleCreateBot}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Bot
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bots.map((bot) => (
                  <div
                    key={bot.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
                        <Bot className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{bot.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {bot.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="w-4 h-4" />
                          {bot.conversations_count} conversations
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/bot/${bot.id}/chat`)}
                        >
                          Chat
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteBot(bot.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <CreateBotDialog
        open={createBotOpen}
        onOpenChange={setCreateBotOpen}
        onBotCreated={() => {
          if (user) {
            loadBots(user.id);
          }
        }}
      />
    </div>
  );
}
