#!/bin/bash

# Script to upload environment variables from .env.local to Vercel

echo "Uploading environment variables to Vercel production..."

while IFS='=' read -r key value || [ -n "$key" ]; do
  # Skip empty lines and comments
  if [[ -z "$key" ]] || [[ "$key" =~ ^#.* ]]; then
    continue
  fi

  # Remove leading/trailing whitespace
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)

  # Remove quotes from value if present
  value="${value#\"}"
  value="${value%\"}"

  # Skip VERCEL_OIDC_TOKEN as it's auto-generated
  if [[ "$key" == "VERCEL_OIDC_TOKEN" ]]; then
    echo "Skipping $key (auto-generated)"
    continue
  fi

  echo "Adding $key..."
  echo "$value" | vercel env add "$key" production --yes > /dev/null 2>&1

done < .env.local

echo "Done! Now redeploying..."
vercel --prod --yes
