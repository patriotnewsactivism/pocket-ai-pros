import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bot, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  CreateBotFormValues,
  createBotSchema,
} from "@/lib/schemas/create-bot";

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
  const { toast } = useToast();

  const form = useForm<CreateBotFormValues>({
    resolver: zodResolver(createBotSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const descriptionLength = form.watch("description").length;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase.from("bots").insert({
        user_id: user.id,
        name: values.name,
        description: values.description ? values.description : null,
        status: "active",
        conversations_count: 0,
        configuration: {},
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your bot has been created successfully.",
      });

      form.reset();
      onOpenChange(false);
      onBotCreated();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create bot";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Create New Bot
          </DialogTitle>
          <DialogDescription>
            Create a new AI chatbot for your business. Give it a name and
            description.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Customer Support Bot"
                      maxLength={100}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe what this bot will do..."
                      rows={4}
                      maxLength={500}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {descriptionLength}/500 characters
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
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
