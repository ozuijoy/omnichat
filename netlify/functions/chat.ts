// Netlify Edge Function: POST /.netlify/functions/chat
// Handles OpenRouter API calls with round-robin key rotation + SSE streaming

const OPENROUTER_BASE =
  process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

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

export async function handler(event: {
  httpMethod: string;
  body?: string;
  headers: Record<string, string>;
}): Promise<Response> {
  if (event.httpMethod !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  const apiKey = nextKey();

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "No OpenRouter API keys configured. Set OPENROUTER_KEYS env var.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = JSON.parse(event.body || "{}");

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Invalid request: 'messages' must be an array",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!body.model) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing 'model' field" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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
      return new Response(
        JSON.stringify({
          ok: false,
          error: `OpenRouter error (${upstream.status}): ${errorText}`,
        }),
        { status: upstream.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create streaming response using ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-API-Key-Index": String(keyIndex - 1),
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}