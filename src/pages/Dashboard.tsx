import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Bot, MessageSquare, LogOut, Plus, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { User } from '@supabase/supabase-js';

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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    setUser(user);
    await loadProfile(user.id);
    await loadBots(user.id);
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    setProfile(data);
  };

  const loadBots = async (userId: string) => {
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading bots:', error);
      return;
    }

    setBots(data || []);
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
      });
      return;
    }

    toast({
      title: 'Bot creation coming soon',
      description: 'Bot builder is under development.',
    });
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
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
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
              <Button className="w-full" onClick={() => navigate('/#pricing')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
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
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
