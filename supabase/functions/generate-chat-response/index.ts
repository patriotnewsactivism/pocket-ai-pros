import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ConversationMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
};

type GenerateChatRequest = {
  userMessage: unknown;
  systemPrompt?: unknown;
  conversation?: unknown;
};

const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful AI assistant representing BuildMyBot. Provide concise, professional responses and escalate to a human agent when necessary.";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      },
    );
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OpenAI API key not configured" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 503,
      },
    );
  }

  let payload: GenerateChatRequest;
  try {
    payload = await req.json();
  } catch (_error) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }

  const userMessage = typeof payload.userMessage === "string" ? payload.userMessage.trim() : "";
  if (!userMessage) {
    return new Response(
      JSON.stringify({ error: "userMessage is required" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }

  const systemPrompt = typeof payload.systemPrompt === "string" && payload.systemPrompt.trim()
    ? payload.systemPrompt.trim()
    : DEFAULT_SYSTEM_PROMPT;

  const conversationMessages: ConversationMessage[] = Array.isArray(payload.conversation)
    ? payload.conversation
        .filter((item): item is ConversationMessage =>
          item && typeof item.role === "string" && typeof item.content === "string"
        )
        .map((item) => ({
          role: item.role as ConversationMessage["role"],
          content: item.content,
        }))
        .slice(-10)
    : [];

  const messages: ConversationMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversationMessages,
    { role: "user", content: userMessage },
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate AI response" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status,
        },
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "OpenAI did not return a response" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 502,
        },
      );
    }

    return new Response(
      JSON.stringify({ content }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("generate-chat-response error:", error);
    return new Response(
      JSON.stringify({ error: "Unexpected error generating response" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
