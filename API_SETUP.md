# Decido API Setup

Decido can run without any external setup, but these optional environment variables unlock richer live data and AI help.

## Optional env vars

- `EXPO_PUBLIC_COINGECKO_DEMO_KEY`
  Used for CoinGecko demo-rate access when available.

- `EXPO_PUBLIC_DECIDO_AI_PROXY_URL`
  Your own backend endpoint that accepts a POST body with:
  - `language`
  - `decisions`

  And returns:
  - `title`
  - `body`

## Recommended production setup

- Keep API keys on your own backend, not inside the app.
- Use the AI proxy to summarize recent decisions and return short coach insights.
- Cache finance and learn cards server-side as well if traffic grows.

## Current live sources

- FX: Frankfurter
- Crypto: CoinGecko
- Learn card: Wikipedia summary API
- AI coach: optional custom proxy, with local fallback if unset
