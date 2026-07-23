#!/usr/bin/env bash
# One-command deploy to Vercel production. Requires the Vercel CLI: npm i -g vercel
set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "Install the Vercel CLI first:  npm i -g vercel"
  exit 1
fi

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "Deploying interactively (run 'vercel login' first if needed)..."
  vercel --prod
else
  vercel --prod --token "$VERCEL_TOKEN"
fi

echo "Done. Add your custom domain in the Vercel dashboard → Settings → Domains."
