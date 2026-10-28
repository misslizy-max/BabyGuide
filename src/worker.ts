interface Env {
  FISH_AUDIO_API_KEY?: string;
  FISH_AUDIO_REFERENCE_ID?: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

async function voice(request: Request, env: Env): Promise<Response> {
  if (!env?.FISH_AUDIO_API_KEY) {
    return json({ error: "Fish Audio API key is not configured" }, 503);
  }
  if (!env?.FISH_AUDIO_REFERENCE_ID) {
    return json({ error: "Fish Audio voice reference is not configured" }, 503);
  }

  let body: { text?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 1200) {
    return json({ error: "Text must contain 1–1200 characters" }, 400);
  }

  try {
    const upstream = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.FISH_AUDIO_API_KEY}`,
        "Content-Type": "application/json",
        model: "s2.1-pro-free",
      },
      body: JSON.stringify({
        text,
        reference_id: env.FISH_AUDIO_REFERENCE_ID,
        format: "mp3",
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      console.error("Fish Audio TTS failed", upstream.status, detail.slice(0, 500));
      return json({ error: "Voice generation failed" }, 502);
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "content-type": upstream.headers.get("content-type") || "audio/mpeg",
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Voice endpoint exception", error);
    return json({ error: "Voice service is temporarily unavailable" }, 502);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (url.pathname !== "/api/voice") {
        return json({ error: "Not found" }, 404);
      }
      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
      }
      return await voice(request, env);
    } catch (error) {
      console.error("Worker exception", error);
      return json({ error: "Internal server error" }, 500);
    }
  },
};
