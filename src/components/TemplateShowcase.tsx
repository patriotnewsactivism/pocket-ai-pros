import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { BUSINESS_TEMPLATES } from "@/templates/business-templates";

const templates = Object.values(BUSINESS_TEMPLATES);

const TemplateShowcase = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/40 to-background" id="templates">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Ready-to-Deploy Templates
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold">
            Launch Faster with
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              {" "}
              Business Blueprints
            </span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Every industry comes with a pre-programmed, conversion-ready experience. Pick a template, plug in your content, and
            your AI agent responds like a real teammate from day one.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {templates.map(template => (
            <Card key={template.id} className="h-full bg-card/80 backdrop-blur border-muted/60">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <CardTitle className="text-2xl">{template.name}</CardTitle>
                  <Badge variant="outline" className="text-xs tracking-wide uppercase">
                    {template.industry}
                  </Badge>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{template.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl bg-muted/50 p-4 border border-border/60">
                  <p className="text-sm font-semibold text-foreground/80 mb-2">Signature Experience</p>
                  <p className="text-base text-foreground/90">{template.hero.headline}</p>
                  <p className="text-sm text-foreground/70">{template.hero.subheadline}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground/80">Built-in flows</p>
                  <div className="flex flex-wrap gap-2">
                    {template.chatbot.quickReplies.slice(0, 4).map(reply => (
                      <span key={reply} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {reply}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground/80">High-impact automations</p>
                  <ul className="space-y-2">
                    {template.features.slice(0, 3).map(feature => (
                      <li key={feature.title} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                        <span>{feature.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full" variant="secondary">
                  Deploy {template.name} Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TemplateShowcase;
