export async function POST(req) {
  try {
    const { sujet, hookAngle, ton } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Clé API non configurée" }), { status: 500 });
    }

    const systemInstruction = `Tu es un Ghostwriter et Expert en Algorithmes pour formats courts (TikTok, Reels, Shorts).
Ta mission est de rédiger une fiche de tournage ultra-court (<60s) optimisée pour la rétention et la viralité.

RÈGLES DE RÉDACTION STRICTES :
1. HOOK (00:00 - 00:03) : Doit capter l'attention direct, moins de 3s. Pas de salutations ni de présentation.
2. CORPS DU SCRIPT (00:03 - 00:45) : Phrases courtes et percutantes.
3. CALL-TO-ACTION (00:45 - 00:50) : Incite à commenter ou sauvegarder.
4. FORMAT : Réponds uniquement sous forme de liste étape par étape, fluide pour lecture mobile :
   - Temps (ex: 00:00 - 00:03)
   - [Texte à dire]
   - [Visuel & B-roll]
Calculé pour faire 100 à 120 mots max.`;

    let consigneAngle = "";
    if (hookAngle === "contrariant") {
      consigneAngle = "Attaque une idée reçue ou une mauvaise habitude courante (ex: 'Arrête de faire X si tu veux Y...').";
    } else if (hookAngle === "chiffre") {
      consigneAngle = "Utilise un chiffre choc ou une preuve directe (ex: 'Comment j'ai fait X en Y jours...').";
    } else {
      consigneAngle = "Crée de la curiosité urgente / FOMO (ex: 'La plupart des gens ignorent ce secret...').";
    }

    const userPrompt = `Génère une fiche de tournage courte pour cette vidéo :
- Sujet : ${sujet}
- Ton : ${ton || 'Direct & Dynamique'}
- Consigne Hook : ${consigneAngle}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erreur lors de la génération.";

    return new Response(JSON.stringify({ script: generatedText }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Erreur serveur" }), { status: 500 });
  }
}
