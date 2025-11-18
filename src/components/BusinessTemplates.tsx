import { getAllTemplates } from "@/templates/business-templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const templates = getAllTemplates();

const BusinessTemplates = () => {
  return (
    <section id="templates" className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <p className="uppercase tracking-[0.3em] text-xs text-primary font-semibold">Template Library</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-balance">
            Predesigned chatbots for every business type
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-balance">
            Launch faster with curated, pre-programmed assistants. Every template includes industry-specific workflows,
            default knowledge, and a natural tone so your AI feels like a real team member.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="flex h-full flex-col border-primary/5 bg-card/80 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
            >
              <CardHeader className="space-y-3">
                <Badge variant="secondary" className="w-fit text-xs font-semibold tracking-wide">
                  {template.industry}
                </Badge>
                <CardTitle className="text-2xl text-balance">{template.name}</CardTitle>
                <CardDescription className="text-balance text-base">
                  {template.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capabilities</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    {template.features.slice(0, 3).map((feature) => (
                      <li key={feature.title} className="leading-snug">
                        <span className="font-semibold text-foreground">{feature.title}:</span> {feature.description}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-dashed border-muted bg-muted/40 p-4 text-sm">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Greeting</p>
                  <p className="mt-1 italic text-foreground">{template.chatbot.greeting}</p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {template.chatbot.quickReplies.slice(0, 3).map((reply) => (
                    <Badge key={reply} variant="outline" className="text-xs">
                      {reply}
                    </Badge>
                  ))}
                </div>
                <Button className="w-full" variant="default">
                  Deploy {template.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessTemplates;
