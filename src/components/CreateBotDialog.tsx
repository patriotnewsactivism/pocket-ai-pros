import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const botSchema = z.object({
  name: z.string()
    .min(3, 'Bot name must be at least 3 characters')
    .max(100, 'Bot name must not exceed 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .optional(),
});

type BotFormData = z.infer<typeof botSchema>;

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<BotFormData>({
    resolver: zodResolver(botSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const description = watch('description') || '';

  const onSubmit = async (data: BotFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase.from('bots').insert({
        user_id: user.id,
        name: data.name,
        description: data.description || null,
        status: 'active',
        conversations_count: 0,
        configuration: {},
      });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your bot has been created successfully.',
      });

      reset();
      onOpenChange(false);
      onBotCreated();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create bot';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Create New Bot
          </DialogTitle>
          <DialogDescription>
            Create a new AI chatbot for your business. Give it a name and description.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bot Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Customer Support Bot"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this bot will do..."
              {...register('description')}
              rows={4}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
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
                'Create Bot'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}