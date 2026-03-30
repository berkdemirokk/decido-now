import http from 'node:http';

const port = process.env.PORT || 8787;
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('OPENAI_API_KEY is required.');
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let rawBody = '';
  for await (const chunk of req) {
    rawBody += chunk;
  }

  try {
    const { language = 'en', decisions = [] } = JSON.parse(rawBody || '{}');
    const compact = decisions.slice(0, 12).map((decision) => ({
      goal: decision.context?.goal,
      friction: decision.context?.friction,
      category: decision.selectedSuggestion?.category,
      completion: decision.completion,
      resultScore: decision.resultScore,
      minutes: decision.selectedSuggestion?.minutes,
      reflection: decision.reflection,
    }));

    const prompt =
      language === 'tr'
        ? `Sen Decido isimli mobil uygulamanin kisa koç katmanisin. Kullanici gecmis karar verilerine bakip tek bir net baslik ve en fazla iki cumlelik yol gosterici bir ozet ver. Cevap JSON olsun: {"title":"...","body":"..."}. Veriler: ${JSON.stringify(compact)}`
        : `You are the short-form coach layer for a mobile app called Decido. Look at the user's recent decision records and return one crisp title and a body of at most two sentences. Reply as JSON only: {"title":"...","body":"..."}. Data: ${JSON.stringify(compact)}`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.2',
        input: prompt,
        text: {
          format: {
            type: 'json_schema',
            name: 'coach_insight',
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                title: { type: 'string' },
                body: { type: 'string' },
              },
              required: ['title', 'body'],
            },
          },
        },
      }),
    });

    const payload = await response.json();
    const outputText = payload.output_text || '{}';
    const parsed = JSON.parse(outputText);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(parsed));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    );
  }
});

server.listen(port, () => {
  console.log(`Decido AI proxy listening on http://localhost:${port}`);
});
