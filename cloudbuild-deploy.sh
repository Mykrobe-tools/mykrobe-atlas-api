#!/bin/bash

TOKEN=$(cat ehk-token.txt)
curl -XPATCH 'https://45.86.170.176:6443/apis/apps/v1beta2/namespaces/mykrobe-dev/deployments/atlas-api-deployment' -H "Authorization: Bearer $TOKEN" -H 'Content-type: application/json-patch+json' -d "[{ \"op\": \"replace\", \"path\": \"/spec/template/spec/containers/0/image\", \"value\": \"$IMAGE\" }]" --insecure