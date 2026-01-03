const express = require("express");
const router = express.Router();

// In-memory cache to avoid remapping the same headers
const mappingCache = new Map();

// Utility: fast exact-match pre-mapping
const autoMap = (headers, schema) => {
  const schemaMap = Object.fromEntries(
    schema.map(f => [f.label.toLowerCase(), f.key])
  );

  return headers.reduce((acc, h) => {
    const match = schemaMap[h.toLowerCase()];
    if (match) acc[h] = match;
    return acc;
  }, {});
};

// POST /api/auto-map
router.post("/api/auto-map", async (req, res) => {
  const { headers, schema } = req.body;

  if (!headers || !schema) {
    return res.status(400).json({ error: "Missing headers or schema" });
  }

  const cacheKey = JSON.stringify({ headers, schema });
  if (mappingCache.has(cacheKey)) {
    return res.json({ mapping: mappingCache.get(cacheKey) });
  }

  const initialMapping = autoMap(headers, schema);
  const mappedKeys = Object.values(initialMapping);
  const missingKeys = schema
    .map(f => f.key)
    .filter(key => !mappedKeys.includes(key));

  if (missingKeys.length === 0) {
    mappingCache.set(cacheKey, initialMapping);
    return res.json({ mapping: initialMapping });
  }


  const prompt = `
You are a multilingual data import assistant.

Map each uploaded column header to the most relevant internal field key from the schema.

Rules:
- Translate headers to English if needed
- Use synonyms and meaning to find the best match
- Use only internal field keys (not labels) as values
- Keep uploaded headers exactly as-is
- Skip headers that don’t clearly match
- Respond ONLY with a valid JSON object — no explanations

Valid internal keys:
${schema.map(f => `- ${f.key}`).join("\n")}

Uploaded headers: 
${headers.map(h => `- ${h}`).join("\n")}

Example:
{
  "Entreprise": "companyName",
  "courriel": "email",
  "Nom Complet": "fullName"
}
`;

  try {
    const ollamaRes = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama2:7b",
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    });

    const data = await ollamaRes.json();
    const content = data.message?.content;

    console.log("🟦 Prompt sent to Ollama:\n", prompt);
    console.log("🟨 Ollama raw response:\n", content);

    if (!content) {
      return res.status(500).json({ error: "Ollama returned no content" });
    }

    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "No valid JSON object found in Ollama response" });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const aiMapping = parsed["Uploaded Header"] && typeof parsed["Uploaded Header"] === "object"
      ? parsed["Uploaded Header"]
      : parsed;

    const finalMapping = { ...initialMapping, ...aiMapping };
    mappingCache.set(cacheKey, finalMapping);
    return res.json({ mapping: finalMapping });

  } catch (err) {
    console.error("🟥 Ollama mapping error:", err.message);
    return res.status(500).json({ error: "Failed to generate mapping" });
  }
});

module.exports = router;
