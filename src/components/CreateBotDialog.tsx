import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Bot, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createBotSchema, type CreateBotFormValues } from "@/lib/schemas/create-bot";
import { supabase } from "@/integrations/supabase/client";
import { getAllTemplates, getTemplate } from "@/templates/business-templates";

const templateLibrary = getAllTemplates();
const DEFAULT_TEMPLATE_ID = templateLibrary[0]?.id ?? "support";

interface CreateBotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBotCreated: () => void;
}

export default function CreateBotDialog({
  open,
  onOpenChange,
  onBotCreated,
}: CreateBotDialogProps) {
  const [loading, setLoading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(() => getTemplate(DEFAULT_TEMPLATE_ID));
  const { toast } = useToast();

  const form = useForm<CreateBotFormValues>({
    resolver: zodResolver(createBotSchema),
    defaultValues: {
      name: "",
      description: "",
      templateId: DEFAULT_TEMPLATE_ID,
    },
  });

  const descriptionValue = form.watch("description") ?? "";
  const descriptionLength = descriptionValue.length;

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const templateConfiguration = getTemplate(values.templateId);

      const { error } = await supabase.from("bots").insert({
        user_id: user.id,
        name: values.name,
        description: values.description ?? null,
        status: "active",
        conversations_count: 0,
        configuration: {
          templateId: templateConfiguration.id,
          industry: templateConfiguration.industry,
          brandColors: templateConfiguration.brandColors,
          hero: templateConfiguration.hero,
          features: templateConfiguration.features,
          chatbot: templateConfiguration.chatbot,
        },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your bot has been created successfully.",
      });

      setActiveTemplate(getTemplate(DEFAULT_TEMPLATE_ID));
      form.reset({ name: "", description: "", templateId: DEFAULT_TEMPLATE_ID });
      onOpenChange(false);
      onBotCreated();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create bot";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Create New Bot
          </DialogTitle>
          <DialogDescription>
            Create a new AI chatbot for your business. Pick a template to auto-load the right tone and flows.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Bot Name *</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder="e.g., Customer Support Bot"
                      maxLength={100}
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="templateId">Starting Template *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const template = getTemplate(value);
                      setActiveTemplate(template);
                      field.onChange(value);
                    }}
                    value={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger id="templateId">
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templateLibrary.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {activeTemplate && (
              <div className="rounded-xl border border-primary/10 bg-muted/30 p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{activeTemplate.name}</p>
                    <p className="text-muted-foreground text-sm">{activeTemplate.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activeTemplate.industry}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Focus areas</p>
                    <p className="text-sm text-foreground">
                      {activeTemplate.features
                        .slice(0, 2)
                        .map((feature) => feature.title)
                        .join(" • ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick replies</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {activeTemplate.chatbot.quickReplies.slice(0, 3).map((reply) => (
                        <Badge key={reply} variant="secondary" className="text-xs">
                          {reply}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Greeting: <span className="italic text-foreground">{activeTemplate.chatbot.greeting}</span>
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      id="description"
                      placeholder="Describe what this bot will do..."
                      rows={4}
                      maxLength={500}
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">{descriptionLength}/500 characters</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Bot"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
