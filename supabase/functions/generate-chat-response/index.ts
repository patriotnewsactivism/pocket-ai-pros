import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ChatHistoryItem {
  role: "user" | "assistant" | "system";
  content: string;
}

interface GenerateChatRequest {
  message: string;
  businessType?: string;
  history?: ChatHistoryItem[];
  template?: {
    name: string;
    capabilities: string[];
    knowledgeBase?: Record<string, string>;
    greeting?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured." }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const request = (await req.json()) as GenerateChatRequest;
    const { message, businessType, history = [], template } = request;

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required." }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const sanitizedHistory = history.slice(-10).map((item) => ({
      role: item.role,
      content: item.content,
    }));

    const knowledgeBaseSummary = template?.knowledgeBase
      ? Object.entries(template.knowledgeBase)
          .map(([key, value]) => `- ${key}: ${value}`)
          .join("\n")
      : undefined;

    const systemPrompt = `You are ${template?.name ?? "an AI assistant"} for a ${
      businessType ?? "business"
    } organization.
Provide concise, friendly, and professional responses.
Focus on helping the user achieve their goals using the following capabilities:
${(template?.capabilities ?? []).map((capability) => `- ${capability}`).join("\n")}
${knowledgeBaseSummary ? `\nRelevant knowledge base entries:\n${knowledgeBaseSummary}` : ""}
If you are unsure about an answer, recommend connecting with a human agent.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...sanitizedHistory.map((item) => ({ role: item.role, content: item.content })),
          { role: "user", content: message },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const completion = await openaiResponse.json();
    const content = completion?.choices?.[0]?.message?.content?.trim();

    return new Response(
      JSON.stringify({
        response:
          content ??
          "I'm sorry, but I couldn't generate a response right now. Please try again in a moment.",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("generate-chat-response error", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unexpected error occurred.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
