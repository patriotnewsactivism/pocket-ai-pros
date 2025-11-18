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

    // Get OpenAI API key
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      logStep("ERROR: OPENAI_API_KEY not configured");
      return new Response(
        JSON.stringify({
          error: "AI service not configured. Please set OPENAI_API_KEY in Supabase Edge Functions settings."
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    // Build system prompt from bot configuration with human-like personality
    const systemPrompt = bot.training_data ||
      `You are ${bot.name}, ${bot.description || 'a helpful AI assistant'}.

PERSONALITY & COMMUNICATION STYLE:
- Respond naturally like a real human customer service representative
- Use conversational language with appropriate warmth and empathy
- Show genuine interest and enthusiasm when appropriate
- Use contractions (I'm, you're, we'll) to sound more natural
- Vary your sentence structure and length for natural flow
- Add brief personal touches without being overly casual
- Express empathy for customer concerns ("I understand that can be frustrating...")
- Show excitement when helpful ("Great question!", "I'd be happy to help!")

RESPONSE GUIDELINES:
- Keep responses concise but personable (2-4 sentences typically)
- Ask clarifying questions when needed
- Acknowledge what the customer said before responding
- Use transitional phrases ("Absolutely!", "I see", "That makes sense")
- Avoid robotic or templated language
- Don't use excessive emojis - one occasionally is fine
- Be professional but approachable
- If you don't know something, admit it honestly and offer alternatives

AVOID:
- Starting every response the same way
- Overly formal or stiff language
- Corporate jargon unless necessary
- Being too wordy or repetitive
- Apologizing excessively
- Generic phrases like "How may I assist you further?"

Remember: You're a helpful human representative, not an AI assistant. Be natural, genuine, and conversational.`;

    logStep("Calling OpenAI API", { model: "gpt-4o-mini" });

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Cost-effective and fast
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
          { role: "user", content: message },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("OpenAI API error", { status: response.status, error: errorText });

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid OpenAI API key. Please contact support." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402 || response.status === 403) {
        return new Response(
          JSON.stringify({ error: "OpenAI quota exceeded. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service error", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Streaming response from OpenAI");

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