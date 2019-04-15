#!/usr/bin/env bash

sed -i "s~#{image}~$ARTIFACT_IMAGE~g" atlas-api-deployment.json

if [ -z $KUBE_TOKEN ]; then
  echo "FATAL: Environment Variable KUBE_TOKEN must be specified."
  exit ${2:-1}
fi

if [ -z $NAMESPACE ]; then
  echo "FATAL: Environment Variable NAMESPACE must be specified."
  exit ${2:-1}
fi

if [ -z $KUBERNETES_SERVICE_HOST ]; then
  echo "FATAL: Environment Variable KUBERNETES_SERVICE_HOST must be specified."
  exit ${2:-1}
fi

if [ -z $KUBERNETES_PORT_443_TCP_PORT ]; then
  echo "FATAL: Environment Variable KUBERNETES_PORT_443_TCP_PORT must be specified."
  exit ${2:-1}
fi

echo
echo "Namespace $NAMESPACE"

status_code=$(curl -sSk -H "Authorization: Bearer $KUBE_TOKEN" \
    "https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_PORT_443_TCP_PORT/apis/apps/v1beta2/namespaces/$NAMESPACE/deployments/atlas-api-deployment" \
    -X GET -o /dev/null -w "%{http_code}")

if [ $status_code == 200 ]; then
  echo
  echo "Updating deployment"
  curl --fail -H 'Content-Type: application/strategic-merge-patch+json' -sSk -H "Authorization: Bearer $KUBE_TOKEN" \
    "https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_PORT_443_TCP_PORT/apis/apps/v1beta2/namespaces/$NAMESPACE/deployments/atlas-api-deployment" \
    -X PATCH -d @atlas-api-deployment.json
else
 echo
 echo "Creating deployment"
 curl --fail -H 'Content-Type: application/json' -sSk -H "Authorization: Bearer $KUBE_TOKEN" \
    "https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_PORT_443_TCP_PORT/apis/apps/v1beta2/namespaces/$NAMESPACE/deployments" \
    -X POST -d @atlas-api-deployment.json
fi

status_code=$(curl -sSk -H "Authorization: Bearer $KUBE_TOKEN" \
    "https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_PORT_443_TCP_PORT/api/v1/namespaces/$NAMESPACE/services/atlas-api-service" \
    -X GET -o /dev/null -w "%{http_code}")

if [ $status_code == 404 ]; then
 echo
 echo "Creating service"
 curl --fail -H 'Content-Type: application/json' -sSk -H "Authorization: Bearer $KUBE_TOKEN" \
    "https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_PORT_443_TCP_PORT/api/v1/namespaces/$NAMESPACE/services" \
    -X POST -d @atlas-api-service.json
fi

status_code=$(curl -sSk -H "Authorization: Bearer $KUBE_TOKEN" \
    "https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_PORT_443_TCP_PORT/apis/extensions/v1beta1/namespaces/$NAMESPACE/ingresses/atlas-api-ingress" \
    -X GET -o /dev/null -w "%{http_code}")

if [ $status_code == 404 ]; then
 echo
 echo "Creating ingress"
 curl --fail -H 'Content-Type: application/json' -sSk -H "Authorization: Bearer $KUBE_TOKEN" \
    "https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_PORT_443_TCP_PORT/apis/extensions/v1beta1/namespaces/$NAMESPACE/ingresses" \
    -X POST -d @atlas-api-ingress.json