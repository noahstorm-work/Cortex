import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-helper";
import { searchHistoryCreateSchema } from "@/lib/validation/schemas";
import { checkRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit";
import { addRateLimitHeaders } from "@/lib/rate-limit-headers";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed, remaining, resetAt } = checkRateLimit(`search-history:${ip}`, API_RATE_LIMIT);
  if (!allowed) {
    return addRateLimitHeaders(
      NextResponse.json({ error: "Too many requests" }, { status: 429 }),
      remaining,
      API_RATE_LIMIT.max,
      resetAt
    );
  }

  const auth = await requireAuth();
  if (auth.response) return auth.response;
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("search_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Search history fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch search history" }, { status: 500 });
  }

  return addRateLimitHeaders(NextResponse.json(data), remaining, API_RATE_LIMIT.max, resetAt);
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed, remaining, resetAt } = checkRateLimit(
    `search-history-create:${ip}`,
    API_RATE_LIMIT
  );
  if (!allowed) {
    return addRateLimitHeaders(
      NextResponse.json({ error: "Too many requests" }, { status: 429 }),
      remaining,
      API_RATE_LIMIT.max,
      resetAt
    );
  }

  const auth = await requireAuth();
  if (auth.response) return auth.response;
  const { supabase, user } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = searchHistoryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { query, result_summary, source_count } = parsed.data;

  const { error } = await supabase.from("search_history").insert({
    user_id: user.id,
    query,
    result_summary: result_summary || null,
    source_count: source_count || 0,
  });

  if (error) {
    console.error("Search history insert error:", error);
    return NextResponse.json({ error: "Failed to save search history" }, { status: 500 });
  }

  return addRateLimitHeaders(
    NextResponse.json({ success: true }),
    remaining,
    API_RATE_LIMIT.max,
    resetAt
  );
}

export async function DELETE(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed, remaining, resetAt } = checkRateLimit(
    `search-history-delete:${ip}`,
    API_RATE_LIMIT
  );
  if (!allowed) {
    return addRateLimitHeaders(
      NextResponse.json({ error: "Too many requests" }, { status: 429 }),
      remaining,
      API_RATE_LIMIT.max,
      resetAt
    );
  }

  const auth = await requireAuth();
  if (auth.response) return auth.response;
  const { supabase, user } = auth;

  const { error } = await supabase.from("search_history").delete().eq("user_id", user.id);

  if (error) {
    console.error("Search history delete error:", error);
    return NextResponse.json({ error: "Failed to clear search history" }, { status: 500 });
  }

  return addRateLimitHeaders(
    NextResponse.json({ success: true }),
    remaining,
    API_RATE_LIMIT.max,
    resetAt
  );
}
