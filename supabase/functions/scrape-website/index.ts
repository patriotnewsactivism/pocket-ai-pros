import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { getSupabaseAdminClient } from "../_shared/supabaseClient.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const requestSchema = z.object({
  url: z.string().url().max(2048),
  maxPages: z.number().int().min(1).max(25).optional(),
  maxDepth: z.number().int().min(0).max(4).optional(),
  includeSubdomains: z.boolean().optional(),
  maxChars: z.number().int().min(1000).max(200000).optional(),
});

type ScrapeRequest = z.infer<typeof requestSchema>;

type ScrapedPage = {
  url: string;
  title: string;
  text: string;
  textLength: number;
  linksFound: number;
};

const USER_AGENT =
  "BuildMyBotScraper/1.0 (+https://buildmybot.app)";

const HTML_ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": "\"",
  "&#39;": "'",
};

const stripHtml = (html: string): string => {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  for (const [entity, value] of Object.entries(HTML_ENTITY_MAP)) {
    text = text.replaceAll(entity, value);
  }

  return text.replace(/\s+/g, " ").trim();
};

const extractTitle = (html: string): string => {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return "Untitled Page";
};

const extractLinks = (html: string, baseUrl: string): string[] => {
  const links: string[] = [];
  const regex = /href\s*=\s*["']([^"']+)["']/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw || raw.startsWith("#")) {
      continue;
    }
    if (raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:")) {
      continue;
    }
    try {
      const resolved = new URL(raw, baseUrl);
      if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
        continue;
      }
      resolved.hash = "";
      links.push(resolved.toString());
    } catch (_error) {
      continue;
    }
  }

  return links;
};

const normalizeUrl = (input: string): string | null => {
  try {
    const parsed = new URL(input);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    parsed.hash = "";
    parsed.pathname = parsed.pathname || "/";
    return parsed.toString();
  } catch (_error) {
    return null;
  }
};

const isAllowedHost = (hostname: string, baseHost: string, includeSubdomains: boolean): boolean => {
  if (hostname === baseHost) {
    return true;
  }
  if (!includeSubdomains) {
    return false;
  }
  return hostname.endsWith(`.${baseHost}`);
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Missing authorization token" }, 401);
  }

  const supabaseClient = getSupabaseAdminClient();
  const token = authHeader.replace("Bearer ", "");
  const { data: authData, error: authError } = await supabaseClient.auth.getUser(token);

  if (authError || !authData?.user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const userId = authData.user.id;
  const { data: userRow, error: userError } = await supabaseClient
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (userError || !userRow?.is_admin) {
    return jsonResponse({ error: "Admin access required" }, 403);
  }

  let payload: ScrapeRequest;
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse({ error: "Invalid payload", details: parsed.error.issues }, 400);
    }
    payload = parsed.data;
  } catch (_error) {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  const startUrl = normalizeUrl(payload.url);
  if (!startUrl) {
    return jsonResponse({ error: "Invalid URL provided" }, 400);
  }

  const maxPages = payload.maxPages ?? 6;
  const maxDepth = payload.maxDepth ?? 2;
  const includeSubdomains = payload.includeSubdomains ?? false;
  const maxChars = payload.maxChars ?? 60000;

  const start = Date.now();
  const baseHost = new URL(startUrl).hostname;
  const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
  const visited = new Set<string>([startUrl]);
  const pages: ScrapedPage[] = [];
  const errors: Array<{ url: string; message: string }> = [];

  while (queue.length > 0 && pages.length < maxPages) {
    const { url, depth } = queue.shift()!;

    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
      });

      if (!response.ok) {
        errors.push({ url, message: `HTTP ${response.status}` });
        continue;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("text/html")) {
        continue;
      }

      const html = await response.text();
      const title = extractTitle(html);
      const text = stripHtml(html);
      const limitedText = text.slice(0, maxChars);
      const links = extractLinks(html, url);

      pages.push({
        url,
        title,
        text: limitedText,
        textLength: limitedText.length,
        linksFound: links.length,
      });

      if (depth < maxDepth) {
        for (const link of links) {
          const normalized = normalizeUrl(link);
          if (!normalized || visited.has(normalized)) {
            continue;
          }
          const host = new URL(normalized).hostname;
          if (!isAllowedHost(host, baseHost, includeSubdomains)) {
            continue;
          }
          visited.add(normalized);
          queue.push({ url: normalized, depth: depth + 1 });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push({ url, message });
    }
  }

  const totalChars = pages.reduce((sum, page) => sum + page.textLength, 0);
  const durationMs = Date.now() - start;

  return jsonResponse({
    pages,
    errors,
    summary: {
      pagesScraped: pages.length,
      totalChars,
      durationMs,
      truncated: pages.some((page) => page.textLength >= maxChars),
    },
  });
});
