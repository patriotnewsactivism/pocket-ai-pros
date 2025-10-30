import type { ComponentType, SVGProps } from "react";

import { Activity, BarChart2, Gauge, MessageSquare, Users } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";

import { useBots } from "@/hooks/use-bots";
import { useAnalyticsSummary } from "@/hooks/use-analytics";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SummaryCard = ({
  title,
  value,
  caption,
  icon: Icon
}: {
  title: string;
  value: string;
  caption: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}) => (
  <Card className="border-primary/20 bg-card/60 backdrop-blur">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-5 w-5 text-primary" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-semibold text-foreground">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{caption}</p>
    </CardContent>
  </Card>
);

const AnalyticsOverview = () => {
  const { data: summaryData, isLoading: summaryLoading } = useAnalyticsSummary();
  const { data: botsData, isLoading: botsLoading } = useBots();

  const summary = summaryData?.summary;
  const bots = botsData?.bots ?? [];

  const chartData = bots.map((bot) => ({
    name: bot.name,
    messages: bot.metrics.messagesHandled,
    csat: bot.metrics.csat,
    conversions: bot.metrics.conversionRate
  }));

  return (
    <section id="analytics" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
            Evidence-Based Reporting
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold">
            Operational Insights at
            <span className="bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
              {" "}
              a Glance
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track adoption, satisfaction, and conversion impact with live metrics sourced from the BuildMyBot data
            engine.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {summaryLoading ? (
            Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 w-full" />)
          ) : summary ? (
            <>
              <SummaryCard
                title="Bots live"
                value={`${summary.activeBots}/${summary.totalBots}`}
                caption="Active assistants ready to respond"
                icon={Activity}
              />
              <SummaryCard
                title="Monthly messages"
                value={summary.monthlyMessageVolume.toLocaleString()}
                caption="Interactions handled in the last 30 days"
                icon={MessageSquare}
              />
              <SummaryCard
                title="Average CSAT"
                value={`${summary.averageCsat.toFixed(1)}%`}
                caption="Customer happiness across all bots"
                icon={Users}
              />
              <SummaryCard
                title="Automation coverage"
                value={`${summary.automationCoverage.toFixed(1)}%`}
                caption="Conversations resolved without human hand-offs"
                icon={Gauge}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Analytics data is not available right now.</p>
          )}
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          <Card className="border-muted">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary" />
                Engagement & conversion impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                {botsLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : bots.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-10} dy={10} />
                      <RechartsTooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          borderRadius: "0.75rem",
                          border: "1px solid hsl(var(--border))"
                        }}
                      />
                      <Area type="monotone" dataKey="messages" stroke="hsl(var(--primary))" fill="url(#colorMessages)" />
                      <Area
                        type="monotone"
                        dataKey="conversions"
                        stroke="hsl(var(--accent))"
                        fill="url(#colorConversion)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    Add a bot to see conversion insights.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                Top performing assistants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {botsLoading && <Skeleton className="h-40 w-full" />}
              {!botsLoading && bots.length === 0 && (
                <p className="text-sm text-muted-foreground">No assistants yet. Launch one to start tracking impact.</p>
              )}
              {!botsLoading &&
                bots.slice(0, 4).map((bot) => (
                  <div key={bot.id} className="rounded-xl border bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{bot.name}</p>
                        <p className="text-xs text-muted-foreground">{bot.industry}</p>
                      </div>
                      <Badge variant="outline" className="border-primary/30 text-xs">
                        {bot.metrics.csat}% CSAT
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <p className="font-medium text-foreground">{bot.metrics.messagesHandled.toLocaleString()}</p>
                        <p>messages handled</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{bot.metrics.costSavingsUsd.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</p>
                        <p>cost saved annually</p>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsOverview;
