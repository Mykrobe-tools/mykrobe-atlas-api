#!/bin/bash

TOKEN=$(cat /workspace/ehk-token.txt)
VERSION=$(cat /workspace/version.txt)
curl -XPATCH 'https://45.86.170.176:6443/apis/apps/v1beta2/namespaces/mykrobe-dev/deployments/atlas-api-deployment' -H "Authorization: Bearer $TOKEN" -H 'Content-type: application/json-patch+json' -d "[{ \"op\": \"replace\", \"path\": \"/spec/template/spec/containers/0/image\", \"value\": \"$VERSION\" }]" --insecure