#!/bin/bash
set -e

PROJECT_ID="cykt-399216"
REGION="europe-west1"
SERVICE="khmer-love-translator"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE"

# Load GEMINI_API_KEY from .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$GEMINI_API_KEY" ]; then
  echo "❌ GEMINI_API_KEY is not set. Add it to .env or export it."
  exit 1
fi

echo "🔨 Building Docker image..."
gcloud builds submit \
  --tag "$IMAGE" \
  --substitutions "_GEMINI_API_KEY=$GEMINI_API_KEY" \
  --project "$PROJECT_ID"

# Note: Cloud Build substitutions don't pass build args directly.
# We use a cloudbuild.yaml for that. See below.
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --allow-unauthenticated \
  --project "$PROJECT_ID"

echo "✅ Done! Service URL:"
gcloud run services describe "$SERVICE" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --format="value(status.url)"
