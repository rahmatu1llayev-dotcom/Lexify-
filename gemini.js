module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: { message: "Method not allowed" } });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: { message: "Server API kaliti sozlanmagan (GEMINI_API_KEY)" } });
    return;
  }

  const { system, parts, maxOutputTokens } = req.body || {};
  if (!parts) {
    res.status(400).json({ error: { message: "parts maydoni kerak" } });
    return;
  }

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system || "" }] },
          contents: [{ role: "user", parts }],
          generationConfig: { maxOutputTokens: maxOutputTokens || 1000 },
        }),
      }
    );
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(500).json({ error: { message: e.message || "Server xatosi" } });
  }
};
