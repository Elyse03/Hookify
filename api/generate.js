export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ script: "Méthode non autorisée. Utilise POST." });
  }

  try {
    const { sujet, hookAngle } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ script: "Erreur : La clé GEMINI_API_KEY n'est pas configurée dans Vercel." });
    }

    const systemInstruction = `Tu es un Ghostwriter & Expert en Algorithmes pour formats courts (TikTok, Reels, Shorts).
Rédige une fiche de tournage courte sous forme de liste fluide :
⏱️ [Timing] - 🗣️ Texte à dire - 🎥 Visuel & B-roll.
Garde un ton direct, dynamique et percutant. Fais très court (< 120 mots).`;

    const userPrompt = `Génère une fiche de tournage pour :
- Sujet : ${sujet || 'Sujet par défaut'}
- Style d'accroche (Hook) : ${hookAngle || 'mythe'}`;

    // Utilisation de gemini-1.5-flash (Ultra rapide, économique et gratuit)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          maxOutputTokens: 350, // Bloque la longueur pour préserver ton quota gratuit
          temperature: 0.7
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ script: `Erreur API Gemini : ${data.error.message}` });
    }

    const scriptText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Aucun script n'a été généré.";

    return res.status(200).json({ script: scriptText });

  } catch (err) {
    return res.status(500).json({ script: "Erreur serveur : " + err.message });
  }
}
