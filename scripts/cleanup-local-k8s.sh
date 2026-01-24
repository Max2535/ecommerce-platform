#!/bin/bash

echo "🧹 Cleaning up local Kubernetes deployment..."

kubectl delete namespace local --ignore-not-found

echo "✅ Cleanup complete!"
