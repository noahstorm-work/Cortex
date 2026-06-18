import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-helper";
import { projectCreateSchema } from "@/lib/validation/schemas";
import { checkRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`project-create:${ip}`, API_RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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

  const parsed = projectCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { name, description } = parsed.data;

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: name.trim(),
      description: (description || "").trim(),
    })
    .select()
    .single();

  if (error) {
    console.error("Project create error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }

  return NextResponse.json(data);
}
