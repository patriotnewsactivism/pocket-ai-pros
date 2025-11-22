import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { getSupabaseAdminClient, type SupabaseAdminClient } from "../_shared/supabaseClient.ts";
import type { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const rateLimitState = new Map<string, { count: number; resetAt: number }>();

const baseSessionId = z.string().min(1).max(255);
const isoDateString = z.string().datetime({ offset: true }).optional();

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("start_session"),
    payload: z.object({
      sessionId: baseSessionId,
      businessType: z.string().min(2).max(50),
      startedAt: isoDateString,
    }),
  }),
  z.object({
    action: z.literal("log_message"),
    payload: z.object({
      sessionId: baseSessionId,
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1).max(4000).trim(),
      timestamp: isoDateString,
      metadata: z.record(z.string(), z.unknown()).optional(),
    }),
  }),
  z.object({
    action: z.literal("capture_lead"),
    payload: z.object({
      sessionId: baseSessionId,
      email: z.string().email().max(255),
      businessType: z.string().min(2).max(50),
      capturedAt: isoDateString,
    }),
  }),
  z.object({
    action: z.literal("update_visitor"),
    payload: z.object({
      sessionId: baseSessionId,
      visitorName: z.string().min(1).max(255).optional(),
      visitorEmail: z.string().email().max(255).optional(),
      lastMessageAt: isoDateString,
    }),
  }),
  z.object({
    action: z.literal("close_session"),
    payload: z.object({
      sessionId: baseSessionId,
      lastMessageAt: isoDateString,
    }),
  }),
]);

type ActionPayload = z.infer<typeof actionSchema>;

type JsonBody<T> = {
  success: boolean;
  error?: string;
  details?: unknown;
  userId?: string | null;
} & T;

const jsonResponse = <T>(
  body: JsonBody<T>,
  init: Omit<ResponseInit, "body"> & { status?: number } = {},
): Response =>
  new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function getRateLimitKey(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip");
  return forwardedFor?.split(",")[0].trim() ?? "global";
}

function checkRateLimit(identifier: string): Response | null {
  const now = Date.now();
  const current = rateLimitState.get(identifier);

  if (!current || current.resetAt < now) {
    rateLimitState.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return jsonResponse(
      { success: false, error: "Rate limit exceeded. Please slow down." },
      { status: 429 },
    );
  }

  current.count += 1;
  rateLimitState.set(identifier, current);
  return null;
}

async function validateAuthorization(
  req: Request,
  supabaseClient: SupabaseAdminClient,
): Promise<{ userId: string | null } | Response> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ success: false, error: "Missing authorization token" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  let userId: string | null = null;

  try {
    const { data, error } = await supabaseClient.auth.getUser(token);
    if (!error && data.user) {
      userId = data.user.id;
    }
  } catch (authError) {
    console.error("[chat-session] Auth validation error", authError);
  }

  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!userId && (!anonKey || token !== anonKey)) {
    return jsonResponse({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return { userId };
}

async function handleStartSession(
  supabaseClient: SupabaseAdminClient,
  payload: Extract<ActionPayload, { action: "start_session" }>['payload'],
) {
  const now = new Date().toISOString();
  const sessionPayload: TablesInsert<"chat_sessions"> = {
    session_id: payload.sessionId,
    business_type: payload.businessType,
    status: "active",
    started_at: payload.startedAt ?? now,
    last_message_at: payload.startedAt ?? now,
  };

  const { error } = await supabaseClient
    .from("chat_sessions")
    .upsert(sessionPayload, { onConflict: "session_id" });

  if (error) {
    throw error;
  }
}

async function handleLogMessage(
  supabaseClient: SupabaseAdminClient,
  payload: Extract<ActionPayload, { action: "log_message" }>['payload'],
) {
  const sanitizedContent = payload.content.slice(0, 4000);
  const messagePayload: TablesInsert<"chat_messages"> = {
    session_id: payload.sessionId,
    role: payload.role,
    content: sanitizedContent,
    timestamp: payload.timestamp ?? new Date().toISOString(),
    metadata: payload.metadata ?? null,
  };

  const { error } = await supabaseClient.from("chat_messages").insert(messagePayload);
  if (error) {
    throw error;
  }

  const sessionUpdate: TablesUpdate<"chat_sessions"> = {
    last_message_at: messagePayload.timestamp,
  };

  const { error: updateError } = await supabaseClient
    .from("chat_sessions")
    .update(sessionUpdate)
    .eq("session_id", payload.sessionId);

  if (updateError) {
    throw updateError;
  }
}

async function handleCaptureLead(
  supabaseClient: SupabaseAdminClient,
  payload: Extract<ActionPayload, { action: "capture_lead" }>['payload'],
) {
  const leadPayload: TablesInsert<"chat_leads"> = {
    session_id: payload.sessionId,
    email: payload.email,
    business_type: payload.businessType,
    captured_at: payload.capturedAt ?? new Date().toISOString(),
  };

  const { error } = await supabaseClient.from("chat_leads").insert(leadPayload);
  if (error) {
    throw error;
  }
}

async function handleUpdateVisitor(
  supabaseClient: SupabaseAdminClient,
  payload: Extract<ActionPayload, { action: "update_visitor" }>['payload'],
) {
  const visitorUpdate: TablesUpdate<"chat_sessions"> = {
    visitor_name: payload.visitorName,
    visitor_email: payload.visitorEmail,
    last_message_at: payload.lastMessageAt ?? new Date().toISOString(),
  };

  const { error } = await supabaseClient
    .from("chat_sessions")
    .update(visitorUpdate)
    .eq("session_id", payload.sessionId);

  if (error) {
    throw error;
  }
}

async function handleCloseSession(
  supabaseClient: SupabaseAdminClient,
  payload: Extract<ActionPayload, { action: "close_session" }>['payload'],
) {
  const sessionUpdate: TablesUpdate<"chat_sessions"> = {
    status: "closed",
    last_message_at: payload.lastMessageAt ?? new Date().toISOString(),
  };

  const { error } = await supabaseClient
    .from("chat_sessions")
    .update(sessionUpdate)
    .eq("session_id", payload.sessionId);

  if (error) {
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  const rateKey = getRateLimitKey(req);
  const rateLimitResponse = checkRateLimit(rateKey);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const supabaseClient = getSupabaseAdminClient();
  const authResult = await validateAuthorization(req, supabaseClient);
  if (authResult instanceof Response) {
    return authResult;
  }

  let payload: ActionPayload;
  try {
    const body = await req.json();
    const validation = actionSchema.safeParse(body);
    if (!validation.success) {
      return jsonResponse({ success: false, error: "Invalid request payload", details: validation.error.issues }, {
        status: 400,
      });
    }
    payload = validation.data;
  } catch (parseError) {
    console.error("[chat-session] Failed to parse request", parseError);
    return jsonResponse({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    switch (payload.action) {
      case "start_session":
        await handleStartSession(supabaseClient, payload.payload);
        break;
      case "log_message":
        await handleLogMessage(supabaseClient, payload.payload);
        break;
      case "capture_lead":
        await handleCaptureLead(supabaseClient, payload.payload);
        break;
      case "update_visitor":
        await handleUpdateVisitor(supabaseClient, payload.payload);
        break;
      case "close_session":
        await handleCloseSession(supabaseClient, payload.payload);
        break;
      default:
        return jsonResponse({ success: false, error: "Unsupported action" }, { status: 400 });
    }

    return jsonResponse({ success: true, userId: authResult.userId });
  } catch (error) {
    console.error("[chat-session] Handler error", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return jsonResponse({ success: false, error: message }, { status: 500 });
  }
});
