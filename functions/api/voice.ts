interface Env {
  FISH_AUDIO_API_KEY: string;
  FISH_AUDIO_REFERENCE_ID: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.FISH_AUDIO_API_KEY) return json({ error: "Fish Audio API key is not configured" }, 503);
  if (!env.FISH_AUDIO_REFERENCE_ID) return json({ error: "Fish Audio voice reference is not configured" }, 503);

  let body: { text?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 1200) return json({ error: "Text must contain 1–1200 characters" }, 400);

  const upstream = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.FISH_AUDIO_API_KEY}`,
      "Content-Type": "application/json",
      model: "s2.1-pro-free",
    },
    body: JSON.stringify({ text, reference_id: env.FISH_AUDIO_REFERENCE_ID, format: "mp3" }),
  });

  if (!upstream.ok) {
    console.error("Fish Audio TTS failed", upstream.status, await upstream.text());
    return json({ error: "Voice generation failed" }, 502);
  }

  return new Response(upstream.body, {
    status: 200,
    headers: { "content-type": "audio/mpeg", "cache-control": "private, no-store" },
  });
};
