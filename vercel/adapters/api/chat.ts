// Vercel API Route: POST /api/chat
// Handles OpenRouter API calls with round-robin key rotation

import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_BASE =
  process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

// In-memory key rotation (resets on serverless cold start)
let keyIndex = 0;

function getKeys(): string[] {
  return (process.env.OPENROUTER_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

function nextKey(): string | null {
  const keys = getKeys();
  if (keys.length === 0) return null;
  const key = keys[keyIndex % keys.length];
  keyIndex++;
  return key;
}

export async function POST(request: NextRequest) {
  const apiKey = nextKey();

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "No OpenRouter API keys configured. Set OPENROUTER_KEYS env var.",
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { ok: false, error: "Invalid request: 'messages' must be an array" },
        { status: 400 }
      );
    }

    if (!body.model) {
      return NextResponse.json(
        { ok: false, error: "Missing 'model' field" },
        { status: 400 }
      );
    }

    const payload = {
      model: body.model,
      messages: body.messages,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.maxTokens ?? 2048,
      stream: true,
    };

    const upstream = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      return NextResponse.json(
        {
          ok: false,
          error: `OpenRouter error (${upstream.status}): ${errorText}`,
        },
        { status: upstream.status }
      );
    }

    // Pass through the streaming response
    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-API-Key-Index": String(keyIndex - 1),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/models - returns available models
export async function GET() {
  return NextResponse.json({
    ok: true,
    data: {
      models: [
        // Models will be fetched from the frontend's shared/models.ts
      ],
    },
  });
}