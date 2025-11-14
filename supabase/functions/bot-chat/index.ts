import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const requestSchema = z.object({
  botId: z.string().uuid("Invalid bot ID format"),
  message: z.string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message is too long (max 2000 characters)")
    .trim(),
  conversationId: z.string().uuid("Invalid conversation ID format").optional(),
});

const logStep = (step: string, details?: unknown) => {
  console.log(`[BOT-CHAT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Request received");
    const body = await req.json();
    
    // Validate and sanitize input
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      logStep("Validation failed", validation.error.issues);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request data",
          details: validation.error.issues 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { botId, message, conversationId } = validation.data;
    logStep("Input validated", { botId, messageLength: message.length });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get bot configuration
    const { data: bot } = await supabase
      .from("bots")
      .select("*")
      .eq("id", botId)
      .single();

    if (!bot) {
      return new Response(
        JSON.stringify({ error: "Bot not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get conversation history if conversationId provided
    let messages: any[] = [];
    if (conversationId) {
      const { data: conversation } = await supabase
        .from("conversations")
        .select("messages")
        .eq("id", conversationId)
        .single();

      if (conversation?.messages) {
        messages = conversation.messages as any[];
      }
    }

    // Build system prompt from bot configuration
    const systemPrompt = bot.training_data || 
      `You are ${bot.name}, ${bot.description || 'a helpful AI assistant'}. Be friendly, helpful, and concise in your responses.`;

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
          { role: "user", content: message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return the stream directly
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("bot-chat error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});