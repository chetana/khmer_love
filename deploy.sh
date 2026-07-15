#!/usr/bin/env bash
# Déploiement khmer-love → Scaleway Serverless Container.
# build → push → update image → deploy → vérifie. Tag image = nombre de commits git.
# Usage : bash deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

CID=07325b73-5ede-4ed7-b6b4-f6b1129f65b4
REG=rg.fr-par.scw.cloud/chetana-apps/khmer-love
URL=https://kh.chetana.fr
TAG=$(git rev-list --count HEAD)

echo "→ build $REG:$TAG"
docker --context default build -t "$REG:$TAG" .
echo "→ push"
docker --context default push "$REG:$TAG"
echo "→ deploy Scaleway (préserve env/secrets : on ne passe QUE image=)"
scw container container update "$CID" image="$REG:$TAG" >/dev/null
scw container container deploy "$CID" >/dev/null

st=""
for i in $(seq 1 40); do
  st=$(scw container container get "$CID" -o json | node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(0)).status)')
  [ "$st" = "ready" ] && break
  sleep 6
done
echo "→ container : $st"
code=$(curl -s -o /dev/null -w "%{http_code}" "$URL/" --max-time 20)
echo "→ $URL : $code"
echo "✅ khmer-love déployé ($REG:$TAG)"
