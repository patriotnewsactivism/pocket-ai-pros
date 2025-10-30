import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowUpRight, BrainCircuit, Loader2, MessageSquare, Sparkles, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useBots, useConversation, useSendMessage } from "@/hooks/use-bots";
import { useToast } from "@/hooks/use-toast";
import { Bot, ConversationMessage } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const providerCopy: Record<string, string> = {
  openai: "Response generated live with GPT-4o-mini",
  "knowledge-base": "Response generated from knowledge base"
};

type AssistantMetadata = {
  provider?: string;
  usedKnowledge?: Array<{ id: string; title: string }>;
};

const formatMetric = (value: number, suffix = "") => `${value.toLocaleString()}${suffix}`;

const MessageBubble = ({ message }: { message: ConversationMessage }) => {
  const isAssistant = message.role === "assistant";
  const metadata = (message.metadata ?? {}) as AssistantMetadata;
  const provider = metadata.provider ? providerCopy[metadata.provider] ?? metadata.provider : undefined;

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-2xl border px-4 py-3 text-sm shadow-sm ${
          isAssistant
            ? "bg-card/80 backdrop-blur border-primary/20"
            : "bg-gradient-to-r from-primary to-accent text-primary-foreground border-transparent"
        }`}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
          <span className="flex items-center gap-1 font-medium">
            {isAssistant ? <BrainCircuit className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            {isAssistant ? "Assistant" : "You"}
          </span>
          <span>·</span>
          <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
        </div>
        <p className="mt-2 leading-relaxed whitespace-pre-wrap">{message.content}</p>
        {isAssistant && provider && (
          <p className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            {provider}
          </p>
        )}
        {isAssistant && metadata.usedKnowledge && metadata.usedKnowledge.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {metadata.usedKnowledge.map((item) => (
              <Badge key={item.id} variant="outline" className="border-primary/40 text-xs">
                {item.title}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const BotMetrics = ({ bot }: { bot: Bot }) => (
  <div className="grid grid-cols-2 gap-4">
    <Card className="bg-muted/40 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground font-medium">Messages handled</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-foreground">{formatMetric(bot.metrics.messagesHandled)}</p>
        <p className="text-xs text-muted-foreground mt-1">Lifetime volume</p>
      </CardContent>
    </Card>
    <Card className="bg-muted/40 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground font-medium">CSAT</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-secondary">{formatMetric(bot.metrics.csat, "%")}</p>
        <p className="text-xs text-muted-foreground mt-1">Customer satisfaction</p>
      </CardContent>
    </Card>
    <Card className="bg-muted/40 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground font-medium">Conversion lift</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-accent">{formatMetric(bot.metrics.conversionRate, "%")}</p>
        <p className="text-xs text-muted-foreground mt-1">Attributed conversions</p>
      </CardContent>
    </Card>
    <Card className="bg-muted/40 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground font-medium">Automation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-primary">
          {formatMetric(Math.round(bot.metrics.automationCoverage * 100), "%")}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Requests resolved without humans</p>
      </CardContent>
    </Card>
  </div>
);

const LiveDemo = () => {
  const { data: botsData, isLoading: botsLoading, error: botsError } = useBots();
  const bots = useMemo(() => botsData?.bots ?? [], [botsData]);
  const [selectedBotId, setSelectedBotId] = useState<string>();
  const { toast } = useToast();

  useEffect(() => {
    if (!selectedBotId && bots.length) {
      setSelectedBotId(bots[0].id);
    }
  }, [bots, selectedBotId]);

  const selectedBot = useMemo(() => bots.find((bot) => bot.id === selectedBotId), [bots, selectedBotId]);

  const { data: conversationData, isLoading: conversationLoading } = useConversation(selectedBotId, 40);
  const sendMessage = useSendMessage(selectedBotId, 40);

  const [message, setMessage] = useState("");

  const messages = (conversationData?.messages ?? []).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim() || !selectedBotId) {
      return;
    }

    sendMessage.mutate(message.trim(), {
      onSuccess: () => {
        setMessage("");
      },
      onError: (error) => {
        toast({
          title: "Unable to send message",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <section id="live-demo" className="py-24 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            Real-time AI Workspace
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold">
            Test Drive Your Bot Before
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              {" "}
              Launch
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Switch between production-ready assistants, send messages, and watch BuildMyBot synthesize answers
            using the same knowledge routing your customers will experience.
          </p>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-8 items-start">
          <div className="space-y-6">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Choose a bot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {botsLoading && <Skeleton className="h-10 w-full" />}
                {botsError && (
                  <p className="text-sm text-destructive">
                    {botsError.message || "Unable to load bots. Please refresh and try again."}
                  </p>
                )}
                {!botsLoading && !botsError && (
                  <Select value={selectedBotId} onValueChange={setSelectedBotId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a bot" />
                    </SelectTrigger>
                    <SelectContent>
                      {bots.map((bot) => (
                        <SelectItem key={bot.id} value={bot.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{bot.name}</span>
                            <span className="text-xs text-muted-foreground">{bot.industry}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {selectedBot && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Persona</p>
                      <p className="text-sm text-foreground mt-1">{selectedBot.persona.tagline}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Tone</p>
                      <Badge variant="secondary" className="mt-1">
                        {selectedBot.tone}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Strengths</p>
                      <ul className="mt-2 space-y-2">
                        {selectedBot.persona.strengths.map((strength) => (
                          <li key={strength} className="text-sm text-muted-foreground flex gap-2">
                            <Sparkles className="h-4 w-4 text-primary shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedBot && (
              <Card className="border-muted shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Performance snapshot</CardTitle>
                </CardHeader>
                <CardContent>
                  <BotMetrics bot={selectedBot} />
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="bg-card/70 backdrop-blur border-primary/20 shadow-xl">
            <CardHeader className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Conversation stream</CardTitle>
                  <p className="text-sm text-muted-foreground">Every answer is powered by real knowledge routing.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                {conversationLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/30 backdrop-blur-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                <ScrollArea className="h-[420px] pr-2">
                  <div className="flex flex-col gap-4">
                    {messages.length === 0 && !conversationLoading && (
                      <div className="text-center text-sm text-muted-foreground py-12">
                        Send a message to see how BuildMyBot responds in real time.
                      </div>
                    )}
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    {sendMessage.isPending && (
                      <div className="flex justify-start">
                        <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Crafting response…
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={selectedBot ? `Ask ${selectedBot.name} anything…` : "Select a bot to start chatting"}
                  className="min-h-[120px]"
                />
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-muted-foreground">
                    BuildMyBot routes requests to the right knowledge source and citations automatically.
                  </p>
                  <Button type="submit" variant="hero" disabled={!selectedBotId || sendMessage.isPending || !message.trim()}>
                    {sendMessage.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending
                      </>
                    ) : (
                      <>
                        Send message
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LiveDemo;
