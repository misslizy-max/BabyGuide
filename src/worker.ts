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

function bindingStatus(env: Env) {
  return {
    apiKeyConfigured: Boolean(env?.FISH_AUDIO_API_KEY?.trim()),
    referenceIdConfigured: Boolean(env?.FISH_AUDIO_REFERENCE_ID?.trim()),
  };
}

async function voice(request: Request, env: Env): Promise<Response> {
  const status = bindingStatus(env);
  if (!status.apiKeyConfigured) {
    return json({ error: "Fish Audio API key is not configured", ...status }, 503);
  }
  if (!status.referenceIdConfigured) {
    return json({ error: "Fish Audio voice reference is not configured", ...status }, 503);
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
        Authorization: `Bearer ${env.FISH_AUDIO_API_KEY!.trim()}`,
        "Content-Type": "application/json",
        model: "s2.1-pro-free",
      },
      body: JSON.stringify({
        text,
        reference_id: env.FISH_AUDIO_REFERENCE_ID!.trim(),
        format: "mp3",
        sample_rate: 44100,
        mp3_bitrate: 128,
        latency: "balanced",
        prosody: {
          speed: 1,
          volume: 0,
          normalize_loudness: true,
        },
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      console.error("Fish Audio TTS failed", upstream.status, detail.slice(0, 500));
      return json(
        {
          error: "Voice generation failed",
          providerStatus: upstream.status,
          bindings: status,
        },
        502,
      );
    }

    const audio = await upstream.arrayBuffer();
    if (!audio.byteLength) {
      return json({ error: "Fish Audio returned empty audio", bindings: status }, 502);
    }

    return new Response(audio, {
      status: 200,
      headers: {
        "content-type": upstream.headers.get("content-type") || "audio/mpeg",
        "content-length": String(audio.byteLength),
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Voice endpoint exception", error);
    return json({ error: "Voice service is temporarily unavailable", bindings: status }, 502);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);

      // Safe diagnostics: confirms bindings exist without ever exposing their values.
      if (url.pathname === "/api/voice/status") {
        return json({ ok: true, ...bindingStatus(env) });
      }

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
