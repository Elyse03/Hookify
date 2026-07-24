export async function POST(req) {
  try {
    const { sujet, hookAngle } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // Vérification si la clé existe dans Vercel
    if (!apiKey) {
      return new Response(JSON.stringify({ script: "Erreur : La clé GEMINI_API_KEY n'est pas configurée dans Vercel." }), { status: 500 });
    }

    const systemInstruction = `Tu es un Ghostwriter & Expert en Algorithmes pour formats courts (TikTok, Reels, Shorts).
Rédige une fiche de tournage courte sous forme de liste fluide :
⏱️ [Timing] - 🗣️ Texte à dire - 🎥 Visuel & B-roll.
Garde un ton direct, dynamique et percutant.`;

    const userPrompt = `Génère une fiche de tournage pour :
- Sujet : ${sujet}
- Style d'accroche (Hook) : ${hookAngle}`;

    // Appel à l'API Gemini 1.5 Flash (v1beta)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ script: `Erreur Google AI Studio : ${data.error.message}` }), { status: 200 });
    }

    const scriptText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Aucun script n'a pu être généré.";

    return new Response(JSON.stringify({ script: scriptText }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ script: "Erreur serveur : " + err.message }), { status: 500 });
  }
}
