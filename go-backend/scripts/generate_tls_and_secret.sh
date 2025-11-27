
#!/bin/bash
set -e
CRT=./tls.crt
KEY=./tls.key
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $KEY -out $CRT -subj "/CN=neuroedge.local"
echo "Created $CRT and $KEY"
echo "To create k8s secret run:"
echo "kubectl create secret tls neuroedge-tls --cert=$CRT --key=$KEY"
